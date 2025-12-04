const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderID: String,
    status: { type: String, enum:["pending","confirm","deliver", "done"]},
    
    userID: {type: String, ref: "User", required: true},

    //Giá tiền sau khi áp dụng voucher 
    discountAmount: {type: Number, default: 0},
    voucherCodeApply: {type: String, default: null},

    //Giá tiền sau khi cộng tiền phí vận chuyển
    deliveryFee: {type: Number, default: 0},
    tipsforDriver: {type: Number, default: 0},

    //Giao hàng
    deliverAddress: {type: String, default: null},
    deliverIn: {type: Date, default:null},

    //Sản phẩm có trong giỏ hàng
    products: [],
    totalInvoice: {type: Number, default: 0},

    //Thời gian các trạng thái đơn hàng
    doneIn: {type: Date, default: null},
    createAt: {type: Date, default: Date.now},

    //Phương thức thanh toán
    paymentMethod: {type: String,enum:["momo", "cash", "vnpay"], default: "cash"},
    paymentStatus: {type: String,enum:["not_done", "done"]},
    payingIn: {type: Date, default:null},

    //Tổng tiền 
    finalTotal: {type:Number,default: null},

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