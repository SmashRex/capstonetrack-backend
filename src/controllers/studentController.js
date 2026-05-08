// 1. Receive the uploaded file from multer
// 2. Parse the CSV rows
// 3. For each row — check if examScore >= 80
// 4. Save qualified students to MongoDB
// 5. Return summary

const Student = require('../models/student');
const csv = require('csv-parse/sync')

const studentUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded, please upload a CSV file' });
    }

    try {
        const records = csv.parse(req.file.buffer, {
            columns: true,
            skip_empty_lines: true
        });

        const qualifiedStudents = [];
        const rejectedStudents = [];

        for (const row of records) {
            const score = parseFloat(row.examScore);
            if (score >= 80) {
                qualifiedStudents.push({
                    name: row.name,
                    email: row.email,
                    track: row.track,
                    examScore: score,
                    githubUserName: row.githubUsername,
                    qualified: true,
                });
            } else {
                rejectedStudents.push({
                    name: row.name,
                    email: row.email,
                    track: row.track,
                    reason: 'Exam score below 80'
                });
            }
        }

        let savedStudents = [];
        if (qualifiedStudents.length > 0) {
            savedStudents = await Student.insertMany(qualifiedStudents, { ordered: false });
        }

        res.status(200).json({
            message: 'File processed successfully',
            qualifiedCount: qualifiedStudents.length,
            rejectedCount: rejectedStudents.length,
            qualifiedStudents: savedStudents,
            rejectedStudents
        });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ message: 'Error processing file, please try again' });
    }
};

module.exports = { studentUpload }