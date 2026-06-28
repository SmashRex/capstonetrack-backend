import mongoose from "mongoose"

const teamSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    cohort:{
        type:String,
        default:"cohort-1"
    },
    project:{
        type:String,
        default: null
    },
    repoUrl: { 
        type: String, 
        default: null 
    }
},{
    timestamps:true
})

export default mongoose.model("Team", teamSchema)

