require('dotenv').config()
const app = require('./src/app.js')

const PORT = process.env.PORT || 5000


// ── Start Server ─────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CapstoneTrack API running on port ${PORT}`)
})