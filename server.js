require('dotenv').config()

const express = require('express')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.get('/api/health', (req, res) => {
    res.status(200).json({
        "status" : "Ok",
        "message" : "Server is Running Dey wi me na",
        "timestamp" : new Date()
    })
})

app.get('/api/user', (req, res)=> {
    res.status(200).json({
        "name" : "Smash",
        "role" : "Backend Developer",
        "goal" : "Build Capstone Project"
    })
})

app.get('/api/time', (req, res) => {
    res.status(200).json({
        "time" : new Date().toLocaleTimeString()
    })
})



app.use((req,res)=>{
    res.status(404).json({
        "message" : "Route not found wetin you dey find",
        "timestamp" : new Date()
    })
})

app.listen(PORT, ()=>{
    console.log(`Server is runing on port ${PORT}`);
    
})