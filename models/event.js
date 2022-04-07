const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user');

const EventSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    venue : {
        type: String,
        required: true
    },
    summary : {
        type: String,
        // required: true
    },
    event_manager : {
        type: String,
        required: true
    },
    registration_fee : {
        type: Number,
        required : true
    },
    rounds : {
        type: Number,
        // required : true
    },
    prize_money : {
        type: String,
        // required : true
    },
    no_of_prizes : {
        type: Number,
        // required : true
    },
    specialEvent : {
        type: Number,
        // required : true
    },
    hide : {
        type: Number,
        // required : true
        default : 0
    },
    key : {
        type: String,
        // required : true
    },
    social_media : {
        type: String,
        // required : true
    },
    description: {
        type: String,
        required: true
    },
    structure: {
        type: String,
        // required: true
    },
    rules: {
        type: String,
        // required: true
    },
    disqualification: {
        type: String,
        // required: true
    },
    judging_criteria: {
        type: String,
        // required: true
    },
    category:{
        type: String,
    },
    poster: {
        type: String,
    },
    start_date : {
        type: Date,
        // required: true
    },
    end_date : {
        type: Date,
        // required : true
    },
    registered_users : {
        type: Array,
        default: [],
    }
},
{ timestamps: true }
)

module.exports = mongoose.model('Event', EventSchema)
