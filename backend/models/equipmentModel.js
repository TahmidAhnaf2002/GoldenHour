const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facilityName: { type: String, required: true },
    facilityType: {
      type: String,
      enum: ['Hospital', 'Vendor', 'Clinic', 'NGO'],
      required: true,
    },
    contactNumber: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    equipmentType: {
      type: String,
      required: true,
      enum: [
        'Oxygen Cylinder',
        'Dialysis Machine',
        'NICU Bed',
        'Burn Unit Bed',
        'Wheelchair',
        'Hospital Bed',
        'Ventilator',
        'Suction Machine',
        'Infusion Pump',
        'ECG Machine',
      ],
    },
    description: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0 },
    pricePerDay: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    bookings: [
      {
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        bookedByName: String,
        contactNumber: String,
        durationDays: { type: Number, default: 1 },
        note: { type: String, default: '' },
        status: {
          type: String,
          enum: ['Pending', 'Confirmed', 'Active', 'Returned', 'Cancelled'],
          default: 'Pending',
        },
        bookedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);