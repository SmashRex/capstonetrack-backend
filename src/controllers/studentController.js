import Student from '../models/student.js'
import { parse } from 'csv-parse/sync'

const studentUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      message: 'No file uploaded' 
    })
  }

  // Validate required fields
  if (!req.body.cohort) {
    return res.status(400).json({ 
      message: 'Cohort is required' 
    })
  }

  if (req.body.examPassMark === undefined) {
    return res.status(400).json({ 
      message: 'examPassMark is required. Send 0 if all students should qualify' 
    })
  }

  try {
    const records = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true
    })

    const qualifiedStudents = []
    const rejectedStudents = []

    // ✅ Use actual threshold with fallback
   const passMark = req.body.examPassMark !== undefined 
         ? parseFloat(req.body.examPassMark) 
         : 80;

    const cohort = req.body.cohort

    for (const row of records) {
      const score = parseFloat(row.examScore)

      if (score >= passMark) {
        qualifiedStudents.push({
          name: row.name,
          email: row.email,
          track: row.track,
          examScore: score,
          githubUserName: row.githubUsername,
          qualified: true,
          cohort        
        })
      } else {
        rejectedStudents.push({
          name: row.name,
          email: row.email,
          track: row.track,
          reason: `Exam score below ${passMark}`  
        })
      }
    }

    let savedStudents = []
    if (qualifiedStudents.length > 0) {
      savedStudents = await Student.insertMany(
        qualifiedStudents, 
        { ordered: false }
      )
    }

    res.status(200).json({
      message: 'File processed successfully',
      cohort,
      examPassMark: passMark,
      qualifiedCount: qualifiedStudents.length,
      rejectedCount: rejectedStudents.length,
      qualifiedStudents: savedStudents,
      rejectedStudents
    })

  } catch (err) {
    console.error('Error processing file:', err)
    res.status(500).json({ 
      message: 'Error processing file' 
    })
  }
}

const getTrackCounts = async (req, res) => {
  const { cohort } = req.query

  try {
    if (!cohort) {
      return res.status(400).json({
        message: 'Cohort is required. Example: /api/students/tracks?cohort=cohort-1'
      })
    }

    const students = await Student.find({
      qualified: true,
      cohort
    })

    if (students.length === 0) {
      return res.status(404).json({
        message: `No qualified students found for cohort: ${cohort}`
      })
    }

    const trackCounts = students.reduce((counts, student) => {
      const track = student.track
      counts[track] = (counts[track] || 0) + 1
      return counts
    }, {})

    res.status(200).json({
      cohort,
      tracks: trackCounts,
      totalQualified: students.length
    })

  } catch (err) {
    console.error('Get track counts error:', err)
    res.status(500).json({
      message: 'Error fetching track counts'
    })
  }
}

export { studentUpload, getTrackCounts }