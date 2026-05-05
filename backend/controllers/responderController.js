const Responder = require('../models/responderModel');

// @desc    Register as first responder
// @route   POST /api/responders/register
// @access  Private
const registerResponder = async (req, res) => {
  try {
    const existing = await Responder.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered as a responder' });
    }

    const {
      name, phone, responderType, skills,
      certifications, location, responseRadius,
    } = req.body;

    const responder = await Responder.create({
      user: req.user._id,
      name, phone, responderType,
      skills:         skills || [],
      certifications: certifications || [],
      location,
      responseRadius: responseRadius || 5,
    });

    res.status(201).json(responder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my responder profile
// @route   GET /api/responders/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const responder = await Responder.findOne({ user: req.user._id });
    if (!responder) return res.status(404).json({ message: 'Responder profile not found' });
    res.json(responder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle availability status
// @route   PUT /api/responders/availability
// @access  Private
const toggleAvailability = async (req, res) => {
  try {
    const responder = await Responder.findOne({ user: req.user._id });
    if (!responder) return res.status(404).json({ message: 'Responder profile not found' });

    responder.isAvailable = !responder.isAvailable;
    await responder.save();

    res.json({
      message: `You are now ${responder.isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: responder.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update response radius
// @route   PUT /api/responders/radius
// @access  Private
const updateRadius = async (req, res) => {
  try {
    const responder = await Responder.findOne({ user: req.user._id });
    if (!responder) return res.status(404).json({ message: 'Responder profile not found' });

    const { responseRadius } = req.body;
    responder.responseRadius = Number(responseRadius) || 5;
    await responder.save();

    res.json({ message: 'Response radius updated', responseRadius: responder.responseRadius });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit verification documents
// @route   POST /api/responders/documents
// @access  Private
const submitDocuments = async (req, res) => {
  try {
    const responder = await Responder.findOne({ user: req.user._id });
    if (!responder) return res.status(404).json({ message: 'Responder profile not found' });

    const { documents } = req.body;
    if (!documents || !documents.length) {
      return res.status(400).json({ message: 'No documents provided' });
    }

    documents.forEach((doc) => {
      responder.verificationDocuments.push({
        docName: doc.docName,
        docNote: doc.docNote || '',
      });
    });

    await responder.save();
    res.json({ message: 'Documents submitted for verification' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available responders (public)
// @route   GET /api/responders
// @access  Public
const getAllResponders = async (req, res) => {
  try {
    const { division, district, responderType } = req.query;
    const query = { isAvailable: true };

    if (division)      query['location.division'] = division;
    if (district)      query['location.district'] = district;
    if (responderType) query.responderType = responderType;

    const responders = await Responder.find(query)
      .select('-verificationDocuments -responseHistory')
      .sort({ totalResponses: -1 });

    res.json({ count: responders.length, responders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerResponder,
  getMyProfile,
  toggleAvailability,
  updateRadius,
  submitDocuments,
  getAllResponders,
};