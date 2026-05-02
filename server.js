require('dotenv').config()
const app = require('./src/app.js')
const connectDB = require('./src/config/db.js')

const PORT = process.env.PORT


const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
  console.log(`🚀 CapstoneTrack API running on port ${PORT}`)
})
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1) 
  }
}

startServer()
// ── Start Server ─────────────────────────
