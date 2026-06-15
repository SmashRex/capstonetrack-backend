import mongoose from 'mongoose'

const teamMemberSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },

    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    track:{
        type:String,
        required:true
    }
}, {
        timestamps:true
})

export default mongoose.model("TeamMember", teamMemberSchema);