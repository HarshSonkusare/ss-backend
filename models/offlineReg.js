const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OfflineUserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name : {
        type: String,
        required : true
    },
    mobile : {
        type : String,
        required: true,
        unique: true
    },
    college : {
        type: String,
        required: false
    },
    paymentMode : {
        type: String,
        required: true
    },
    transactionId : {
        type: String,
        required: true
    },
    amountPaid : {
        type: Number,
        default: 0
    },
    paidForAccomodation : {
        type: Number,
        default: 0
    },
    paidForProshow1 : {
        type: Number,
        default: 0
    },
    paidForProshow2 : {
        type: Number,
        default: 0
    },
    paidForProshow3 : {
        type: Number,
        default: 0
    },


},
{ timestamps: true }
)

module.exports = mongoose.model('OfflineUser', OfflineUserSchema)