const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    userID: String,
    favoriteProduct: {type: [String], default:[]},
    avatar: String,
    otp:String,
    otp_expire: Date,
    is_verified: {type: Boolean, default: "false"},
    fcmToken: {type: String, default: null}
})

module.exports = mongoose.model('User', userSchema);