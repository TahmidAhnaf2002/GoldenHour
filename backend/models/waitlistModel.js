const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    hospitalName: { type: String, required: true },
    hospitalLocation: {
      division: String,
      district: String,
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['General Bed', 'ICU', 'CCU', 'Ventilator', 'Oxygen Bed'],
    },
    urgency: {
      type: String,
      enum: ['Critical', 'Urgent', 'Normal'],
      default: 'Urgent',
    },
    patientName: { type: String, required: true },
    patientAge: { type: Number },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Waiting', 'Notified', 'Admitted', 'Cancelled'],
      default: 'Waiting',
    },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Waitlist', waitlistSchema);