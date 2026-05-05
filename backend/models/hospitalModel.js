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

    // Feature 13 — Verification & Reliability
    verificationDocuments: [
      {
        docName: String,
        docNote: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    reliabilityScore: { type: Number, default: 100, min: 0, max: 100 },
    isFlagged: { type: Boolean, default: false },
    flaggedAt: { type: Date, default: null },
    updateCount: { type: Number, default: 0 },
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reporterName: String,
        issue: String,
        resourceType: String,
        createdAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
      },
    ],

    capacity: {
      generalBeds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      icuBeds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      ccuBeds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      ventilators: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
      oxygenBeds: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    },
    specialties: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
    // Feature 14 — ER Wait Time
    erWaitTime: {
      currentWait: { type: Number, default: 0 },   // in minutes
      hasER: { type: Boolean, default: false },
      erSpecialties: [{ type: String }],
      lastUpdated: { type: Date, default: null },
    },
    waitTimeHistory: [
      {
        waitMinutes: { type: Number },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);