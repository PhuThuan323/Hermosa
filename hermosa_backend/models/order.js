const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderID: String,
    status: { type: String, enum:["pending","confirm","deliver", "done"]},
    doneIn: Date,
    userID: {type: String, ref: "User", required: true},
    totalInvoice: {type: Number, default: 0},
    products: [],
    createAt: {type: Date, default: Date.now},

    paymentMethod: {type: String,enum:["momo", "cash", "vnpay"]},
    paymentStatus: {type: String,enum:["not_done", "done"]},
    payingIn: Date,

    deliver: {type: Boolean, default: false},
    deliverAddress: {type: String, default: null},
    deliverIn: Date,
    tipsforDriver: {type: Number, default: 0},
    note: {type: String, default:null},

    reviewofOrder: String,
    reviewofProduct: [{
        userID: {type: String, ref: "User"},
        name: {type:String, ref:"User"},
        rating: Number,
        comment: String,
        date: Date,
    }]
});

module.exports = mongoose.model('Order', orderSchema);