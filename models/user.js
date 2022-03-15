const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const passportLocalMongoose = require('passport-local-mongoose')
const event = require('./event');

const UserSchema = new Schema({
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
    level : {
        type : String,
        required: false
    },
    wishlist : [
        {
            type: Schema.Types.ObjectId,
            ref : 'event'
        }
    ],
    events : [
        {
            type : Schema.Types.ObjectId,
            ref: 'event'
        }
    ],
    ended : [
        {
            type : Schema.Types.ObjectId,
            ref: 'event'
        }
    ]
})

// UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)