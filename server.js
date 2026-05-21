import 'dotenv/config'
import app from './src/app.js'
import connectDB from './src/config/db.js'

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

