const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
    razorpay_payment_id : {
        type : String,
    },
    name : {
        type : String,
    },
    email : {
        type : String,
    },
    mobile : {
        type : String,
    },
    event_id : {
        type : String,
    },
    event : {
        type : String,
    },
    registration_fee : {
        type : Number,
    },
},
{ timestamps: true }
)

module.exports = mongoose.model('Transaction', TransactionSchema)