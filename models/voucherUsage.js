const moongoose = require('mongoose');
const Schema = moongoose.Schema;
const voucherUsageSchema = new Schema({
    userID: {type: String},
    voucherUse: [
        {
            voucherCode: {type: String},
            usedAt: { type: Date, default: Date.now }
        }
    ]
    
});
module.exports = moongoose.model('voucherUsage', voucherUsageSchema);