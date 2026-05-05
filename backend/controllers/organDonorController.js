const OrganDonor = require('../models/organDonorModel');

// @desc    Register as organ donor
// @route   POST /api/organ-donors/register
// @access  Private
const registerDonor = async (req, res) => {
  try {
    const existing = await OrganDonor.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered as an organ donor' });
    }

    const {
      name, dateOfBirth, bloodType, phone, address,
      location, organs, familyConsent, emergencyContact,
    } = req.body;

    if (!organs || organs.length === 0) {
      return res.status(400).json({ message: 'Please select at least one organ to donate' });
    }

    const donor = await OrganDonor.create({
      user: req.user._id,
      name, dateOfBirth, bloodType, phone, address,
      location, organs,
      familyConsent:    familyConsent    || {},
      emergencyContact: emergencyContact || {},
    });

    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my donor profile
// @route   GET /api/organ-donors/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const donor = await OrganDonor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/organ-donors/update
// @access  Private
const updateDonor = async (req, res) => {
  try {
    const donor = await OrganDonor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });

    const fields = ['organs', 'phone', 'address', 'familyConsent', 'emergencyContact', 'bloodType'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) donor[f] = req.body[f];
    });

    await donor.save();
    res.json({ message: 'Profile updated', donor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke pledge
// @route   PUT /api/organ-donors/revoke
// @access  Private
const revokePledge = async (req, res) => {
  try {
    const donor = await OrganDonor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });

    donor.isActive     = false;
    donor.revokedAt    = new Date();
    donor.revokeReason = req.body.reason || '';
    await donor.save();

    res.json({ message: 'Pledge revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore pledge
// @route   PUT /api/organ-donors/restore
// @access  Private
const restorePledge = async (req, res) => {
  try {
    const donor = await OrganDonor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });

    donor.isActive     = true;
    donor.revokedAt    = null;
    donor.revokeReason = '';
    await donor.save();

    res.json({ message: 'Pledge restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active donors (for transplant hospitals)
// @route   GET /api/organ-donors
// @access  Private
const getAllDonors = async (req, res) => {
  try {
    const { organ, division, district, bloodType } = req.query;
    const query = { isActive: true };

    if (organ)     query.organs     = organ;
    if (division)  query['location.division'] = division;
    if (district)  query['location.district'] = district;
    if (bloodType) query.bloodType  = bloodType;

    const donors = await OrganDonor.find(query)
      .select('name bloodType organs location phone familyConsent donorCardId pledgedAt')
      .sort({ pledgedAt: -1 });

    res.json({ count: donors.length, donors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get registry stats
// @route   GET /api/organ-donors/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const total  = await OrganDonor.countDocuments({ isActive: true });
    const byOrgan = await OrganDonor.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$organs' },
      { $group: { _id: '$organs', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const byBloodType = await OrganDonor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ total, byOrgan, byBloodType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerDonor, getMyProfile, updateDonor,
  revokePledge, restorePledge, getAllDonors, getStats,
};