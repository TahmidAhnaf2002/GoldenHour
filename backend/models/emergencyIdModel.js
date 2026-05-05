const mongoose = require('mongoose');

const emergencyIdSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    emergencyId: { type: String, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: String, default: '' },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    weight: { type: String, default: '' },
    address: { type: String, default: '' },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{ name: String, dose: String, note: String }],
    organDonor: { type: Boolean, default: false },
    dnrOrder: { type: Boolean, default: false },
    emergencyContacts: [{ name: String, phone: String, relation: String }],
    publicFields: {
      bloodType: { type: Boolean, default: true },
      allergies: { type: Boolean, default: true },
      chronicConditions: { type: Boolean, default: true },
      currentMedications: { type: Boolean, default: true },
      emergencyContacts: { type: Boolean, default: true },
      dateOfBirth: { type: Boolean, default: false },
      weight: { type: Boolean, default: false },
      address: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    scanCount: { type: Number, default: 0 },
    lastScanned: { type: Date, default: null },
  },
  { timestamps: true }
);

emergencyIdSchema.pre('save', async function () {
  if (!this.emergencyId) {
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.emergencyId = `GH-${rand}`;
  }
});

module.exports = mongoose.model('EmergencyId', emergencyIdSchema);