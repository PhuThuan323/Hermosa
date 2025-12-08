const mongoose = require('mongoose');
const { picture } = require('../config/cloudinary');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    name: String,
    productID: String,
    price: {type: Number, require: true},
    picture: String,
    backgroundHexacode: String,
    description: String,
    category: String,
    sumofFavorites: { type: Number, default: 0 },
    sumofRatings: { type: Number, default: 0 },
    sumofReviews: [
        {
            userID: { type: String, ref: 'User', required: true }, 
            username: { type: String }, 
            rating: { type: Number, min: 1, max: 5, required: true }, 
            comment: { type: String },
            date: { type: Date, default: Date.now } 
        }
    ]
});
module.exports = mongoose.model('Menu', menuSchema);