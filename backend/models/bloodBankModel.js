const mongoose = require('mongoose');


const bloodBankSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    contactNumber: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    stock: {
      Apos:  { type: Number, default: 0, min: 0 },
      Aneg:  { type: Number, default: 0, min: 0 },
      Bpos:  { type: Number, default: 0, min: 0 },
      Bneg:  { type: Number, default: 0, min: 0 },
      ABpos: { type: Number, default: 0, min: 0 },
      ABneg: { type: Number, default: 0, min: 0 },
      Opos:  { type: Number, default: 0, min: 0 },
      Oneg:  { type: Number, default: 0, min: 0 },
    },
    transferRequests: [
      {
        fromBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
        fromBankName: String,
        bloodType: String,
        unitsRequested: Number,
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Declined'],
          default: 'Pending',
        },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    stockLastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


module.exports = mongoose.model('BloodBank', bloodBankSchema);
