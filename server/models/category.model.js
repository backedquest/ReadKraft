import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    genre : {
        type : String,
        unique : true,
        require : true
    },
    bookCount : {
        type : Number,
        default : 0
    }
})

const categoryModel = mongoose.Model('category',categorySchema)
export default categoryModel