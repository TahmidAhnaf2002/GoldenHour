const mongoose = require('mongoose');

const campSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizerName: {
      type: String,
      required: true,
    },
    campName: {
      type: String,
      required: [true, 'Camp name is required'],
    },
    date: {
      type: Date,
      required: [true, 'Camp date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
    },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String },
    },
    targetDonors: {
      type: Number,
      required: true,
      min: 1,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    registrations: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        donorName: String,
        phone: String,
        bloodType: String,
        checkedIn: {
          type: Boolean,
          default: false,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Camp', campSchema);