const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postedByName:{ type: String, required: true },
    type: {
      type: String,
      enum: ['Official Alert', 'Outbreak Report', 'Vaccination Camp', 'Health Advisory'],
      required: true,
    },
    title:       { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
      default: 'Medium',
    },
    disease:     { type: String, default: '' },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area:     { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    // For Vaccination Camp type
    campDate:    { type: Date, default: null },
    campVenue:   { type: String, default: '' },
    campCapacity:{ type: Number, default: 0 },
    registrations: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName:  String,
        userPhone: String,
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    // For subscriptions
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reportCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);