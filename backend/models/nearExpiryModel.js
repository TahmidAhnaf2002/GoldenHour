const mongoose = require('mongoose');

const nearExpirySchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facilityName: { type: String, required: true },
    facilityType: {
      type: String,
      enum: ['Hospital', 'Pharmacy', 'Clinic', 'NGO'],
      default: 'Hospital',
    },
    contactNumber: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    medicineName: { type: String, required: true },
    genericName: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Available', 'Claimed', 'Picked Up', 'Expired', 'Removed'],
      default: 'Available',
    },
    claims: [
      {
        claimedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        claimedByName: String,
        claimerType: {
          type: String,
          enum: ['Patient', 'NGO', 'Other'],
          default: 'Patient',
        },
        contactNumber: String,
        unitsRequested: { type: Number, default: 1 },
        note: { type: String, default: '' },
        status: {
          type: String,
          enum: ['Pending', 'Confirmed', 'Picked Up', 'Cancelled'],
          default: 'Pending',
        },
        claimedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('NearExpiry', nearExpirySchema);