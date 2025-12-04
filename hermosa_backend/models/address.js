const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userID: { type: String, required: true },
  deliverInformation: [
    {
      name: String,
      addressID: String,
      addressDetail: {type: String, require: true},
      ghn: {
        provinceID: Number,
        districtID: Number,
        wardCode: String,
      },
      phone: String,
      type: { type: String, enum: ['home', 'work', 'other'], default: 'home' }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
