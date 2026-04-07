const Emergency = require('../models/emergencyModel');
const Donor = require('../models/donorModel');

// @desc    Create emergency blood request
// @route   POST /api/emergency/create
// @access  Private
const createEmergency = async (req, res) => {
  try {
    const {
      patientName, bloodType, unitsNeeded,
      urgencyLevel, hospital, location,
      contactNumber, note,
    } = req.body;

    const emergency = await Emergency.create({
      requester: req.user._id,
      requesterName: req.user.name,
      patientName,
      bloodType,
      unitsNeeded,
      urgencyLevel,
      hospital,
      location,
      contactNumber,
      note,
    });

    res.status(201).json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active emergencies
// @route   GET /api/emergency
// @access  Public
const getEmergencies = async (req, res) => {
  try {
    const { bloodType, division, district, status } = req.query;

    const query = {};
    if (bloodType) query.bloodType = bloodType;
    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;
    query.status = status || 'Active';

    const emergencies = await Emergency.find(query)
      .sort({ urgencyLevel: 1, createdAt: -1 });

    res.json({ count: emergencies.length, emergencies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single emergency
// @route   GET /api/emergency/:id
// @access  Public
const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }
    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to emergency as donor
// @route   POST /api/emergency/:id/respond
// @access  Private
const respondToEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }

    if (emergency.status !== 'Active') {
      return res.status(400).json({ message: 'This emergency is no longer active' });
    }

    // Check if already responded
    const alreadyResponded = emergency.responses.find(
      (r) => r.donor.toString() === req.user._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }

    // Get donor profile for blood type and phone
    const donorProfile = await Donor.findOne({ user: req.user._id });
    if (!donorProfile) {
      return res.status(400).json({
        message: 'You must be registered as a donor to respond',
      });
    }

    if (!donorProfile.isEligible) {
      return res.status(400).json({
        message: 'You are not eligible to donate at this time',
      });
    }

    emergency.responses.push({
      donor: req.user._id,
      donorName: req.user.name,
      phone: donorProfile.phone,
      bloodType: donorProfile.bloodType,
    });

    await emergency.save();

    res.json({
      message: 'Successfully responded to emergency',
      totalResponses: emergency.responses.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update emergency status
// @route   PUT /api/emergency/:id/status
// @access  Private
const updateEmergencyStatus = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency request not found' });
    }

    if (emergency.requester.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    emergency.status = req.body.status;
    await emergency.save();

    res.json({ message: 'Status updated', status: emergency.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my emergency requests
// @route   GET /api/emergency/mine
// @access  Private
const getMyEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ requester: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ count: emergencies.length, emergencies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  respondToEmergency,
  updateEmergencyStatus,
  getMyEmergencies,
};