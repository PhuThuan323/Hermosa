const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userID: {type: String, ref: "User", required: true},
  totalMoney: {type: Number},
  items: {
    type: [
      {
        productID: {type: String, ref: "Menu",required: true },
        name: {type: String, ref:"Menu", required: true},
        quantity: { type: Number, default: 1 },
        size: {type: String, enum:["small","medium","large"], default: "medium"},
        topping: [String],
        note: {type: String},
        subtotal: Number
      }
    ],
  }
});

module.exports = mongoose.model('Cart', cartSchema);