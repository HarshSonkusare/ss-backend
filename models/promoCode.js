const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const promoCodeSchema = new Schema({
    value : {
        type : Number,
        required : true
    },
    count : {
        type : Number,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    code : {
        type : String,
        required : true
    },
    expiry : {
        type : Date,
    }

});
module.exports = mongoose.model('PromoCode', promoCodeSchema);
