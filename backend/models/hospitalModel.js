const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    hospitalType: {
      type: String,
      enum: ['Government', 'Private', 'Clinic', 'Specialized', 'NGO'],
      required: true,
    },
    address: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    contactNumber: { type: String, required: true },
    emergencyNumber: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    capacity: {
      generalBeds:  { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      icuBeds:      { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      ccuBeds:      { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      ventilators:  { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      oxygenBeds:   { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    },
    specialties: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);