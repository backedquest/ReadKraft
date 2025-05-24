import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
 userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        require : [true,"Provide ID"]
    },
book : {
 type : mongoose.Schema.Types.ObjectId,
        ref : "book",
        require : [true,"Provide Name"]
},
amount : {
        type : Number,
         require : [true,"Provide Amount"]
},
paymentmethod : {
        type : String,
        enum : ["UPI","DEBIT CARD","CREDIT CARD","NET BANKING"],
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
const transactionModel = mongoose.Model("transactions",transactionSchema)
export default transactionModel