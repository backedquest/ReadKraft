import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema({
    name  : {
        type : String,
        required : [true,"Provide Name"]
    },
    author  : {
        type : String,
        required : [true,"Provide Name"]
    },
    size  : {
        type : Number,
        required : [true,"Provide Name"]
    },
    price: { 
        type: Number, 
        default: 0  
    },
    cover  : {
        type : String,
        default : ""
    },
    numberofusers : {
        type : Number,
        default : 0
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category"
    },
    synopsis  : {
        type : String,
        required : [true,"Provide Synopsis"]
    }

},
{
    timestamps : true
})

const bookModel = mongoose.model("books",bookSchema)
export default bookModel