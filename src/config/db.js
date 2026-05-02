const mongoose = require('mongoose')

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)  
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
   
  }
}