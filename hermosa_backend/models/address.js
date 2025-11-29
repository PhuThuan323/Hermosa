const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userID: {type: String, require: true, ref: "User"},
  deliverInformation: [
    {
      name: String,
      addressID: String,
      addressDetail: [{
        street: String,
        ward: String,
        district: String,
        city: String,
        country: String
      }],  
      phone: String,
      type: {type: String, enum: ['home', 'work', 'other'], default: 'home' }
    }
  ],
});

module.exports = mongoose.model('Address', addressSchema);