const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facilityName: { type: String, required: true },
    facilityType: {
      type: String,
      enum: ['Hospital', 'Pharmacy', 'Clinic'],
      required: true,
    },
    contactNumber: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    medicineName: { type: String, required: true },
    genericName: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    disease: { type: String, default: '' },
    dosage: { type: String, default: '' },
    pricePerUnit: { type: Number, required: true, min: 0 },
    stockUnits: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    reservations: [
      {
        reservedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reservedByName: String,
        contactNumber: String,
        unitsReserved: { type: Number, default: 1 },
        status: {
          type: String,
          enum: ['Pending', 'Confirmed', 'Picked Up', 'Cancelled'],
          default: 'Pending',
        },
        reservedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
medicineSchema.index({
  medicineName: 'text',
  genericName: 'text',
  disease: 'text',
  manufacturer: 'text',
});

module.exports = mongoose.model('Medicine', medicineSchema);