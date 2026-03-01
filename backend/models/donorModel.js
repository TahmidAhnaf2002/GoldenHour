const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      required: [true, 'Blood type is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
             'A1+', 'A1-', 'A2+', 'A2-', 'Bombay O'],
    },
    rhFactor: {
      type: String,
      enum: ['Positive', 'Negative'],
      required: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [45, 'Minimum weight to donate is 45kg'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Minimum age to donate is 18'],
      max: [65, 'Maximum age to donate is 65'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String },
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    medicalConditions: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Virtual — checks if donor is eligible (3 months since last donation)
donorSchema.virtual('isEligible').get(function () {
  if (!this.lastDonationDate) return true;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return this.lastDonationDate <= threeMonthsAgo;
});

// Virtual — days until eligible
donorSchema.virtual('daysUntilEligible').get(function () {
  if (!this.lastDonationDate) return 0;
  const eligibleDate = new Date(this.lastDonationDate);
  eligibleDate.setMonth(eligibleDate.getMonth() + 3);
  const today = new Date();
  if (eligibleDate <= today) return 0;
  const diff = Math.ceil((eligibleDate - today) / (1000 * 60 * 60 * 24));
  return diff;
});

donorSchema.set('toJSON', { virtuals: true });
donorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Donor', donorSchema);