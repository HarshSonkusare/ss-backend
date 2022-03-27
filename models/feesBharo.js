const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const feesBharoSchema = new Schema({
    registration_fee : {
        type : Number,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    key : {
        type : String,
        required : true
    },
    registered_users : {
        type : Array
    }
});
module.exports = mongoose.model('feesBharo', feesBharoSchema);
