const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const passportLocalMongoose = require('passport-local-mongoose')
const Event = require('./event');
const crypto = require("crypto");
const uuidv1 = require('uuid').v1;

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
    encry_password: {
        type: String,
        required: true,
      },
    salt: String,
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
    isAdmin : {
        type: Number,
        default: 0
    },
    isVerified : {
      type : Number,
      default : 1234
    },
    paidForEvent : {
        type: Number,
        default: 0
    },
    paidForHospitality : {
        type: Number,
        default: 0
    },
    paidForProshow : {
        type: Number,
        default: 0
    },
    wishlist : {
      type: Array,
      default: [],
    },
    events : {
      type: Array,
      default: [],
    },
    ended : {
      type: Array,
      default: [],
    },
},
{ timestamps: true }
)

UserSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.methods = {
  autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model('User', UserSchema)