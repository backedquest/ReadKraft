import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
 userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : [true,"Provide ID"]
    },
book : {
 type : mongoose.Schema.Types.ObjectId,
        ref : "books",
        required : [true,"Provide Name"]
},
amount : {
        type : Number,
         required : [true,"Provide Amount"]
},
paymentmethod : {
        type : String,
        enum : ["UPI","DEBIT CARD","CREDIT CARD","NET BANKING","FREE"],
        required : [true,"Provide it"]
},
status : {
    type : String,
    enum : ["Completed","Pending","Cancelled"],
    default : "Pending"
}
},
{
    timestamps : true
}
)
const transactionModel = mongoose.model("transactions",transactionSchema)
export default transactionModel