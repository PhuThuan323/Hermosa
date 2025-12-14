const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const voucherSchema = new Schema({
    voucherCode: {type: String, required: true, unique: true},
    description: {type: String, default: null},
    discountType: {type: String, enum: ["percentage", "fixed"], required: true},
    discountValue: {type: Number, required: true},
    minPurchaseAmount: {type: Number, default: 0},
    validFrom: {type: Date, required: true},
    validTo: {type: Date, required: true},
    usageLimit: {type: Number, default: null}, // null là không có giới hạn
    createdAt: {type: Date, default: Date.now},
    totalOfUsage: {type: Number, default: 0},
});

module.exports = mongoose.model('Voucher', voucherSchema);