const mongoose = require('mongoose');

const lendingSchema = new mongoose.Schema(
  {
    // ── Lender ──
    lender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lenderName:   { type: String, required: true },
    lenderPhone:  { type: String, required: true },

    // ── Equipment details ──
    equipmentType: {
      type: String,
      required: true,
      enum: [
        'Wheelchair', 'Hospital Bed', 'Oxygen Cylinder', 'Crutches',
        'Walker / Zimmer Frame', 'Nebulizer', 'Blood Pressure Monitor',
        'Pulse Oximeter', 'Thermometer', 'Suction Machine',
        'Infusion Pump', 'ECG Machine', 'Other',
      ],
    },
    equipmentName:  { type: String, required: true },
    description:    { type: String, default: '' },
    condition:      { type: String, enum: ['Excellent', 'Good', 'Fair'], default: 'Good' },
    depositAmount:  { type: Number, default: 0 },
    maxDurationDays:{ type: Number, default: 30 },
    isAvailable:    { type: Boolean, default: true },

    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area:     { type: String, default: '' },
    },

    // ── Borrow requests ──
    requests: [
      {
        borrower:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        borrowerName:  String,
        borrowerPhone: String,
        purpose:       String,
        durationDays:  { type: Number, default: 1 },
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Active', 'ReturnRequested', 'Returned', 'Rejected', 'Cancelled'],
          default: 'Pending',
        },
        depositPaid:       { type: Boolean, default: false },
        depositReturned:   { type: Boolean, default: false },
        lenderConfirmed:   { type: Boolean, default: false },
        borrowerConfirmed: { type: Boolean, default: false },
        borrowerRating:    { type: Number, default: null },
        lenderRating:      { type: Number, default: null },
        requestedAt:       { type: Date, default: Date.now },
        approvedAt:        { type: Date, default: null },
        returnedAt:        { type: Date, default: null },
      },
    ],

    // ── Stats ──
    totalLends:    { type: Number, default: 0 },
    averageRating: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lending', lendingSchema);