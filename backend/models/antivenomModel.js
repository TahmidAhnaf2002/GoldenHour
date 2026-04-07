const mongoose = require('mongoose');

const antivenomSchema = new mongoose.Schema(
  {
    hospital: {
      type: String,
      required: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    stock: [
      {
        antivenomType: {
          type: String,
          required: true,
          enum: [
            'Polyvalent Snake Antivenom',
            'King Cobra Antivenom',
            'Krait Antivenom',
            'Viper Antivenom',
            'Sea Snake Antivenom',
          ],
        },
        units: { type: Number, default: 0, min: 0 },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Antivenom', antivenomSchema);