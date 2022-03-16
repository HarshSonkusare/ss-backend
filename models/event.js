const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user');

const EventSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    hosted_by : {
        type: String,
        required: true
    },
    poster: {
        type: String,
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
    },
    registered_users : {
        type: Array,
        default: [],
    }
},
{ timestamps: true }
)

module.exports = mongoose.model('Event', EventSchema)
