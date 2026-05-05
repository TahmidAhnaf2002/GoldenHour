const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName:   { type: String, required: true },
    requesterPhone:  { type: String, required: true },
    emergencyType: {
      type: String,
      enum: ['Cardiac Arrest', 'Accident / Trauma', 'Choking', 'Unconscious Person',
             'Snake Bite', 'Burns', 'Childbirth', 'Seizure', 'Other'],
      required: true,
    },
    description: { type: String, default: '' },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area:     { type: String, default: '' },
      address:  { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Active', 'Responded', 'Resolved', 'Cancelled'],
      default: 'Active',
    },
    responses: [
      {
        responder:     { type: mongoose.Schema.Types.ObjectId, ref: 'Responder' },
        responderName: String,
        responderType: String,
        phone:         String,
        status: {
          type: String,
          enum: ['Accepted', 'Declined', 'En Route', 'Arrived'],
          default: 'Accepted',
        },
        respondedAt:   { type: Date, default: Date.now },
        etaMinutes:    { type: Number, default: null },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SOS', sosSchema);