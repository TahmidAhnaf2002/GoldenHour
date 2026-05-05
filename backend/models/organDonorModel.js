const mongoose = require('mongoose');

const organDonorSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:      { type: String, required: true },
    dateOfBirth:{ type: String, required: true },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
    phone:     { type: String, required: true },
    address:   { type: String, default: '' },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
    },
    organs: [
      {
        type: String,
        enum: [
          'Heart', 'Kidneys', 'Liver', 'Lungs', 'Pancreas',
          'Intestines', 'Corneas', 'Skin', 'Bone Marrow',
          'Heart Valves', 'Blood Vessels',
        ],
      },
    ],
    isActive:        { type: Boolean, default: true },
    revokedAt:       { type: Date, default: null },
    revokeReason:    { type: String, default: '' },
    familyConsent: {
      given:       { type: Boolean, default: false },
      contactName: { type: String, default: '' },
      contactPhone:{ type: String, default: '' },
      docName:     { type: String, default: '' },
    },
    emergencyContact: {
      name:  { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    pledgedAt:   { type: Date, default: Date.now },
    donorCardId: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate donor card ID
organDonorSchema.pre('save', function (next) {
  if (!this.donorCardId) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.donorCardId = `GH-OD-${rand}`;
  }
  next();
});

module.exports = mongoose.model('OrganDonor', organDonorSchema);