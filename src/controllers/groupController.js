import Student from "../models/student.js"
import Team from "../models/team.js"
import TeamMember from "../models/teamMember.js"


// ── Fisher-Yates Shuffle ──────────────────
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// ── Generate Groups ───────────────────────
const generateGroups = async (req, res) => {
  const {cohort} = req.body

  try {
    const existing = await Team.findOne({ cohort })
if (existing) {
  return res.status(400).json({
    message: 'Groups already generated for this cohort'
  })
}
    
    // Step 1 — Get qualified students
    const students = await Student.find({ qualified: true })

    if (students.length === 0) {
      return res.status(400).json({ 
        message: 'No qualified students found' 
      })
    }

    // Step 2 — Group by track (ONE consistent name)
    const studentsByTrack = students.reduce((groups, student) => {
      const track = student.track
      if (!groups[track]) groups[track] = []
      groups[track].push(student)
      return groups
    }, {})

    // Step 3 — Shuffle each track
    Object.keys(studentsByTrack).forEach(track => {
      studentsByTrack[track] = shuffleArray(studentsByTrack[track])
    })

    // Step 4 — Find number of balanced groups
    const trackSizes = Object.values(studentsByTrack).map(arr => arr.length)
    const numberOfGroups = Math.min(...trackSizes)

    if (numberOfGroups === 0) {
      return res.status(400).json({ 
        message: 'Not enough students to form groups' 
      })
    }

    // Step 5 — Build groups
    const createdGroups = []

    for (let i = 0; i < numberOfGroups; i++) {
      // Capital Team — no conflict with loop variables
      const newTeam = await Team.create({
        name: `Group ${i + 1}`,
        cohort: cohort        // ← use what admin sent
})


      const members = []

      for (const track of Object.keys(studentsByTrack)) {
        const student = studentsByTrack[track][i]

        await TeamMember.create({
          teamId: newTeam._id,
          studentId: student._id,
          name: student.name,
          track: student.track
        })

        members.push({
          name: student.name,
          email: student.email,
          track: student.track,
          githubUsername: student.githubUsername
        })
      }

      createdGroups.push({
        groupName: newTeam.name,
        teamId: newTeam._id,
        members
      })
    }

    // Step 6 — Handle unassigned students
    const unassignedStudents = []
    Object.keys(studentsByTrack).forEach(track => {
      const leftovers = studentsByTrack[track].slice(numberOfGroups)
      leftovers.forEach(student => {
        unassignedStudents.push({
          name: student.name,
          email: student.email,
          track: student.track,
          githubUsername: student.githubUsername
        })
      })
    })

    res.status(201).json({
      message: 'Groups generated successfully',
      totalGroups: createdGroups.length,
      groups: createdGroups,
      unassignedCount: unassignedStudents.length,
      unassigned: unassignedStudents
    })

  } catch (err) {
    console.error('Group generation error:', err)
    res.status(500).json({ message: 'Error generating groups' })
  }
}


// ── Get All Groups ────────────────────────
const getAllGroups = async (req, res) => {
  try {
    const teams = await Team.find()   // 'teams' plural

    const groups = await Promise.all(
      teams.map(async (team) => {     // 'teams' plural here too
        const members = await TeamMember.find({
          teamId: team._id
        }).populate('studentId', 'name email track githubUsername')

        return {
          groupName: team.name,
          teamId: team._id,
          members: members.map(m => ({
            name: m.studentId.name,
            email: m.studentId.email,
            track: m.track,
            githubUsername: m.studentId.githubUsername
          }))
        }
      })
    )

    res.status(200).json({
      totalGroups: groups.length,
      groups
    })

  } catch (err) {
    console.error('Get groups error:', err)
    res.status(500).json({ message: 'Error fetching groups' })
  }
}

export {generateGroups, getAllGroups}