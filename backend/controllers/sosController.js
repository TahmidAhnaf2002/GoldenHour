const SOS      = require('../models/sosModel');
const Responder = require('../models/responderModel');

// @desc    Create SOS emergency broadcast
// @route   POST /api/sos/create
// @access  Private
const createSOS = async (req, res) => {
  try {
    const { emergencyType, description, location, requesterPhone } = req.body;

    const sos = await SOS.create({
      requester:     req.user._id,
      requesterName: req.user.name,
      requesterPhone,
      emergencyType,
      description:   description || '',
      location,
    });

    // Find all available responders in the same district or division
    const nearbyResponders = await Responder.find({
      isAvailable: true,
      $or: [
        { 'location.district': location.district },
        { 'location.division': location.division },
      ],
    }).select('name phone responderType responseRadius');

    res.status(201).json({
      sos,
      broadcastCount: nearbyResponders.length,
      message: `SOS broadcast sent to ${nearbyResponders.length} responder(s) in your area`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to an SOS (accept or decline)
// @route   POST /api/sos/:id/respond
// @access  Private
const respondToSOS = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: 'SOS not found' });
    if (sos.status !== 'Active') {
      return res.status(400).json({ message: 'This SOS is no longer active' });
    }

    const responder = await Responder.findOne({ user: req.user._id });
    if (!responder) {
      return res.status(403).json({ message: 'Only registered responders can respond' });
    }

    // Check if already responded
    const alreadyResponded = sos.responses.find(
      (r) => r.responder?.toString() === responder._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already responded to this SOS' });
    }

    const { status, etaMinutes } = req.body;

    sos.responses.push({
      responder:     responder._id,
      responderName: responder.name,
      responderType: responder.responderType,
      phone:         responder.phone,
      status:        status || 'Accepted',
      etaMinutes:    etaMinutes || null,
    });

    if (status === 'Accepted' || status === 'En Route') {
      sos.status = 'Responded';
    }

    await sos.save();

    // Update responder stats
    responder.totalResponses += 1;
    await responder.save();

    res.json({ message: 'Response recorded', sos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my active SOS requests
// @route   GET /api/sos/mine
// @access  Private
const getMySOS = async (req, res) => {
  try {
    const requests = await SOS.find({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active SOS broadcasts for responders
// @route   GET /api/sos/active
// @access  Private
const getActiveSOSList = async (req, res) => {
  try {
    const { division, district } = req.query;
    const query = { status: { $in: ['Active', 'Responded'] } };

    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;

    const sosList = await SOS.find(query).sort({ createdAt: -1 });
    res.json({ count: sosList.length, sosList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel my SOS
// @route   PUT /api/sos/:id/cancel
// @access  Private
const cancelSOS = async (req, res) => {
  try {
    const sos = await SOS.findOne({ _id: req.params.id, requester: req.user._id });
    if (!sos) return res.status(404).json({ message: 'SOS not found' });

    sos.status = 'Cancelled';
    await sos.save();
    res.json({ message: 'SOS cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSOS,
  respondToSOS,
  getMySOS,
  getActiveSOSList,
  cancelSOS,
};