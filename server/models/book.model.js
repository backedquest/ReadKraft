import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema({
    name  : {
        type : String,
        require : [true,"Provide Name"]
    },
    author  : {
        type : String,
        require : [true,"Provide Name"]
    },
    size  : {
        type : Number,
        require : [true,"Provide Name"]
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
        require : [true,"Provide Synopsis"]
    }

},
{
    timestamps : true
})

const bookModel = mongoose.Model("books",bookSchema)
export default bookModel