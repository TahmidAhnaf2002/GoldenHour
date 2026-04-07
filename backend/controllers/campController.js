const Camp = require('../models/campModel');
const Donor = require('../models/donorModel');

// @desc    Create a donation camp
// @route   POST /api/camps/create
// @access  Private
const createCamp = async (req, res) => {
  try {
    const {
      campName, date, venue, location,
      targetDonors, contactNumber, description,
    } = req.body;

    const camp = await Camp.create({
      organizer: req.user._id,
      organizerName: req.user.name,
      campName,
      date,
      venue,
      location,
      targetDonors,
      contactNumber,
      description,
    });

    res.status(201).json(camp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
const getCamps = async (req, res) => {
  try {
    const { division, status } = req.query;
    const query = {};
    if (division) query['location.division'] = division;
    query.status = status || 'Upcoming';

    const camps = await Camp.find(query).sort({ date: 1 });
    res.json({ count: camps.length, camps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single camp
// @route   GET /api/camps/:id
// @access  Public
const getCampById = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for a camp
// @route   POST /api/camps/:id/register
// @access  Private
const registerForCamp = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    if (camp.status !== 'Upcoming' && camp.status !== 'Ongoing') {
      return res.status(400).json({ message: 'Registration is closed for this camp' });
    }

    if (camp.registrations.length >= camp.targetDonors) {
      return res.status(400).json({ message: 'Camp is full' });
    }

    const alreadyRegistered = camp.registrations.find(
      (r) => r.donor.toString() === req.user._id.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this camp' });
    }

    const donorProfile = await Donor.findOne({ user: req.user._id });
    if (!donorProfile) {
      return res.status(400).json({ message: 'You must be registered as a donor to join a camp' });
    }

    camp.registrations.push({
      donor: req.user._id,
      donorName: req.user.name,
      phone: donorProfile.phone,
      bloodType: donorProfile.bloodType,
    });

    await camp.save();

    res.json({
      message: 'Successfully registered for camp',
      totalRegistrations: camp.registrations.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check in a donor on camp day (organizer only)
// @route   PUT /api/camps/:id/checkin/:donorId
// @access  Private
const checkInDonor = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    if (camp.organizer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only the organizer can check in donors' });
    }

    const registration = camp.registrations.find(
      (r) => r.donor.toString() === req.params.donorId
    );
    if (!registration) {
      return res.status(404).json({ message: 'Donor not found in registrations' });
    }

    registration.checkedIn = true;
    await camp.save();

    res.json({ message: 'Donor checked in successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update camp status (organizer only)
// @route   PUT /api/camps/:id/status
// @access  Private
const updateCampStatus = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    if (camp.organizer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    camp.status = req.body.status;
    await camp.save();

    res.json({ message: 'Camp status updated', status: camp.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my organized camps
// @route   GET /api/camps/mine
// @access  Private
const getMyCamps = async (req, res) => {
  try {
    const camps = await Camp.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: camps.length, camps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCamp,
  getCamps,
  getCampById,
  registerForCamp,
  checkInDonor,
  updateCampStatus,
  getMyCamps,
};