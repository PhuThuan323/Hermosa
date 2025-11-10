const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const toppingSchema = new Schema({
    name: {type: String},
    toppingID: String,
    price: {type: Number},
    out_of_service: {type:Boolean, default:false}
});

module.exports = mongoose.model('Topping', toppingSchema);