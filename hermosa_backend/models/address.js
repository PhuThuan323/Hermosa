const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userID: {type: String, require: true, ref: "User"},
  deliverInformation: [
    {
      name: String,
      addressID: String,
       addressDetail: {
        street: { type: String },

        ward: { type: String },
        district: { type: String },
        province: { type: String }, 
        country: { type: String },

        ghn: {
          provinceID: { type: Number },
          districtID: { type: Number }, 
          wardCode: { type: String }
        }
      },
      phone: String,
      type: {type: String, enum: ['home', 'work', 'other'], default: 'home' }
    }
  ],
});

module.exports = mongoose.model('Address', addressSchema);