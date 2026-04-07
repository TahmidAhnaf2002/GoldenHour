const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      required: [true, 'Blood type is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
             'A1+', 'A1-', 'A2+', 'A2-', 'Bombay O'],
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    urgencyLevel: {
      type: String,
      enum: ['Critical', 'Urgent', 'Normal'],
      default: 'Urgent',
    },
    hospital: {
      type: String,
      required: true,
    },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String },
    },
    contactNumber: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Fulfilled', 'Cancelled'],
      default: 'Active',
    },
    responses: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        donorName: String,
        phone: String,
        bloodType: String,
        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Emergency', emergencySchema);