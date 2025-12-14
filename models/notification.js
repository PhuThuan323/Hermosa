const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSchema = new Schema({
    notiID: { type: String, required: true},
    userIDlist: [
        {
            userID:{ type: String, ref: 'User' },
        },
    ],
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    scheduleAt: {type: Date, default: null},
    sent: { type: Boolean, default: false }
})
module.exports = mongoose.model('Notification', notificationSchema);