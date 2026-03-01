const Donor = require('../models/donorModel');

// @desc    Register as a donor
// @route   POST /api/donors/register
// @access  Private
const registerDonor = async (req, res) => {
  try {
    const existingDonor = await Donor.findOne({ user: req.user._id });
    if (existingDonor) {
      return res.status(400).json({ message: 'You are already registered as a donor' });
    }

    const {
      bloodType, rhFactor, weight, age,
      phone, location, lastDonationDate, medicalConditions,
    } = req.body;

    const donor = await Donor.create({
      user: req.user._id,
      name: req.user.name,
      bloodType,
      rhFactor,
      weight,
      age,
      phone,
      location,
      lastDonationDate: lastDonationDate || null,
      medicalConditions,
    });

    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's donor profile
// @route   GET /api/donors/me
// @access  Private
const getMyDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donor availability
// @route   PUT /api/donors/availability
// @access  Private
const updateAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
    donor.isAvailable = req.body.isAvailable;
    await donor.save();
    res.json({ message: 'Availability updated', isAvailable: donor.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Find matching donors by blood type and location
// @route   GET /api/donors/find
// @access  Public
const findDonors = async (req, res) => {
  try {
    const { bloodType, division, district } = req.query;

    const query = { isAvailable: true };
    if (bloodType) query.bloodType = bloodType;
    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;

    const donors = await Donor.find(query).select(
      'name bloodType rhFactor location phone isAvailable lastDonationDate totalDonations'
    );

    // Filter only eligible donors
    const eligibleDonors = donors.filter((d) => d.isEligible);

    res.json({
      count: eligibleDonors.length,
      donors: eligibleDonors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/update
// @access  Private
const updateDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const fields = ['weight', 'age', 'phone', 'location',
                    'lastDonationDate', 'medicalConditions'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) donor[field] = req.body[field];
    });

    await donor.save();
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerDonor,
  getMyDonorProfile,
  updateAvailability,
  findDonors,
  updateDonorProfile,
};