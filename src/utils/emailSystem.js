


import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


const sendGroupEmail = async (studentName, studentEmail, groupName, teammates, repoLink) => {
  try {
    const mailOptions = {
      from: 'CapstoneTrack <no-reply@capstonetrack.com>',
      to: studentEmail,
      subject: `CapstoneTrack: You've been assigned to ${groupName}`,
      html: `
        <h2>Dear ${studentName},</h2>
        <p>You have been assigned to <strong>${groupName}</strong></p>
        <h3>Your Teammates:</h3>
        <ul>
          ${teammates.map(t => `<li>${t.name} - ${t.track}</li>`).join('')}
        </ul>
        <p>Your GitHub Repo: <a href="${repoLink}">Click here</a></p>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent:', result.messageId)
  } catch (err) {
    console.error('Email error:', err)
  }
}

export {sendGroupEmail, sleep}