const moongoose = require('mongoose');
const Schema = moongoose.Schema;
const voucherUsageSchema = new Schema({
    userID: {type: String, required: true, ref: 'User'},
    voucherUse: [
        {
            voucherCode: {type: String, required: true, ref: 'voucher'},
            usedAt: { type: Date, default: Date.now }
        }
    ]
    
});
module.exports = moongoose.model('voucherUsage', voucherUsageSchema);