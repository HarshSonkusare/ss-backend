const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    hosted_by : {
        type: String,
        required: true
    },
    price : {
        type: Number,
        required : true
    },
    start_date : {
        type: Date,
        required: true
    },
    end_date : {
        type: Date,
        required : true
    }
})

module.exports = mongoose.model('Events', EventSchema)
