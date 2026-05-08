const mongoose = require('mongoose');

const studentSchema = new  mongoose.Schema({
name: {
    type: String,
    required: true
},
email: {
    type:String,
    required: true,
    unique: true
},
track:{
    type:String,
    required: true,
    enum: ['backend', 'frontend', 'ui/ux', 'cybersecurity', 'project management', 'data analytics']
},
examScore: {
    type: Number,
    required: true
},

githubUserName: {
    type: String,
    required: false
},

qualified : {
    type: Boolean,
    required: true
},

cohort : {
    type:String,
},

}, { timestamps: true })

module.exports = mongoose.model('Student', studentSchema);