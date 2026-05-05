const Alert = require('../models/alertModel');

// @desc    Post a new alert or outbreak report
// @route   POST /api/alerts/create
// @access  Private
const createAlert = async (req, res) => {
  try {
    const {
      type, title, description, severity,
      disease, location, campDate, campVenue, campCapacity,
    } = req.body;

    // Official alerts auto-approved if admin, else pending
    const status = req.user.role === 'admin' ? 'Approved' : 'Pending';

    const alert = await Alert.create({
      postedBy:     req.user._id,
      postedByName: req.user.name,
      type, title, description,
      severity:     severity || 'Medium',
      disease:      disease || '',
      location,
      status,
      campDate:     campDate || null,
      campVenue:    campVenue || '',
      campCapacity: Number(campCapacity) || 0,
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved alerts (public)
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
  try {
    const { division, district, severity, type } = req.query;
    const query = { status: 'Approved' };

    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;
    if (severity) query.severity = severity;
    if (type)     query.type = type;

    const alerts = await Alert.find(query).sort({ createdAt: -1 });

    // Build heatmap data: count alerts per district
    const heatmap = {};
    alerts.forEach((a) => {
      const key = `${a.location.division}__${a.location.district}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    res.json({ count: alerts.length, alerts, heatmap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending alerts (admin only)
// @route   GET /api/alerts/pending
// @access  Private/Admin
const getPendingAlerts = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    const alerts = await Alert.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject an alert (admin only)
// @route   PUT /api/alerts/:id/moderate
// @access  Private/Admin
const moderateAlert = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.status = req.body.status;
    await alert.save();
    res.json({ message: `Alert ${req.body.status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe to alerts for an area
// @route   POST /api/alerts/subscribe
// @access  Private
const subscribeToArea = async (req, res) => {
  try {
    const { division, district } = req.body;
    // Find all future alerts matching this area and add subscriber
    // We store subscription as a user preference in the alert model
    // For simplicity: subscribe user to all existing approved alerts in this area
    await Alert.updateMany(
      { 'location.division': division, 'location.district': district, status: 'Approved' },
      { $addToSet: { subscribers: req.user._id } }
    );
    res.json({ message: `Subscribed to alerts in ${district}, ${division}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for a vaccination camp
// @route   POST /api/alerts/:id/register
// @access  Private
const registerForCamp = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Camp not found' });
    if (alert.type !== 'Vaccination Camp') {
      return res.status(400).json({ message: 'This is not a vaccination camp' });
    }

    const alreadyRegistered = alert.registrations.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered' });
    }

    if (alert.campCapacity > 0 && alert.registrations.length >= alert.campCapacity) {
      return res.status(400).json({ message: 'Camp is full' });
    }

    const { userPhone } = req.body;
    alert.registrations.push({
      user:      req.user._id,
      userName:  req.user.name,
      userPhone: userPhone || '',
    });

    await alert.save();
    res.json({ message: 'Registered for vaccination camp successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my posted alerts
// @route   GET /api/alerts/mine
// @access  Private
const getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getPendingAlerts,
  moderateAlert,
  subscribeToArea,
  registerForCamp,
  getMyAlerts,
};