import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    genre : {
        type : String,
        unique : true,
        required : true
    },
    bookCount : {
        type : Number,
        default : 0
    }
})

const categoryModel = mongoose.model('category',categorySchema)
export default categoryModel