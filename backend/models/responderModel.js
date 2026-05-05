const mongoose = require('mongoose');

const responderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name:        { type: String, required: true },
    phone:       { type: String, required: true },
    responderType: {
      type: String,
      enum: ['Doctor', 'Nurse', 'Paramedic', 'First Aid Volunteer', 'Medical Student', 'Other'],
      required: true,
    },
    skills: [{ type: String }],
    certifications: [
      {
        certName:   String,
        certNote:   String,
        issuedYear: String,
      },
    ],
    verificationDocuments: [
      {
        docName:     String,
        docNote:     String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area:     { type: String, default: '' },
    },
    responseRadius: { type: Number, default: 5 },   // in km
    isAvailable:    { type: Boolean, default: true },
    isVerified:     { type: Boolean, default: false },
    responseHistory: [
      {
        emergencyType: String,
        respondedAt:   { type: Date, default: Date.now },
        outcome:       String,
      },
    ],
    totalResponses:    { type: Number, default: 0 },
    successfulResponses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Responder', responderSchema);