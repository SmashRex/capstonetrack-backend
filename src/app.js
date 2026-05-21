import express from 'express'
import cors from 'cors'
import studentsRoutes from './routes/studentroutes.js'
import authRoutes from './routes/authRoutes.js'
import githubRoutes from './routes/githubRoutes.js'

const app = express()

app.use(express.json())
app.use(cors())


// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/github', githubRoutes);

// ── Health Check ─────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CapstoneTrack API is running',
    timestamp: new Date().toISOString()   
  })
})

// ── User Info ────────────────────────────
app.get('/api/user', (req, res) => {
  res.status(200).json({
    name: 'Smash',
    role: 'Backend Developer',
    goal: 'Build CapstoneTrack'
  })
})

// ── Server Time ──────────────────────────
app.get('/api/time', (req, res) => {
  res.status(200).json({
    time: new Date().toLocaleTimeString()
  })
})

// ── 404 Handler (MUST be last) ───────────
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',           
    timestamp: new Date().toISOString()   
  })
})

export default app
