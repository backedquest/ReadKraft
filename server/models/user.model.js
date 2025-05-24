import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name  : {
        type : String,
        require : [true,"Provide Name"]
    },
    email : {
        type : String,
        require :[true,"Provide Email"],
        unique : true
    },
    password : {
        type : String,
        require : [true,"Provide password"]
    },
    preferredGenre : [{
        type :mongoose.Schema.Types.ObjectId,
        ref : 'category',
        default : ""
    }],
    refreshToken : {
        type : String,
        default :""
    },
    role : {
        type : String,
        enum : ["Admin","User"],
        default : "User"
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    readingHistory :[{
        books :{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'books'
        },
        lastPageRead :{
            type : Number,
            default : 1
        },
        progress : {
            type : float,
            default : 0
        } , 
        lastReadDate : {
            type : Date,
            default : Date.now
        }
    }],
    library :[{
        books : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'books'
        },
        purchaseDate : {
            type : Date,
            default : Date.now
        }
    }],
    wishlist : [{
        books : {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'books'
        }
    }]
        
},{
    timestamps : true
})

const userModel = mongoose.Model("user",userSchema)
export default userModel