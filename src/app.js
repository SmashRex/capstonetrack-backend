const express = require('express')

const app = express()

app.use(express.json())

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

module.exports = app