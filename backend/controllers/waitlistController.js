const Waitlist  = require('../models/waitlistModel');
const Hospital  = require('../models/hospitalModel');

// Priority score — lower = higher priority in queue
const priorityScore = { Critical: 1, Urgent: 2, Normal: 3 };

// Compute position of each entry within a hospital+resource queue
const attachPositions = (entries) => {
  const sorted = [...entries].sort((a, b) => {
    const pa = priorityScore[a.urgency] || 3;
    const pb = priorityScore[b.urgency] || 3;
    if (pa !== pb) return pa - pb;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  return sorted.map((e, i) => ({ ...e.toObject(), position: i + 1 }));
};

// @desc    Join a waitlist
// @route   POST /api/waitlist/join
// @access  Private
const joinWaitlist = async (req, res) => {
  try {
    const {
      hospitalId, resourceType, urgency,
      patientName, patientAge, contactNumber, note,
    } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    // Check if already on this waitlist for same resource
    const existing = await Waitlist.findOne({
      user: req.user._id,
      hospital: hospitalId,
      resourceType,
      status: 'Waiting',
    });
    if (existing) {
      return res.status(400).json({
        message: 'You are already on the waitlist for this resource at this hospital',
      });
    }

    const entry = await Waitlist.create({
      user: req.user._id,
      userName: req.user.name,
      contactNumber,
      hospital: hospitalId,
      hospitalName: hospital.name,
      hospitalLocation: {
        division: hospital.location.division,
        district: hospital.location.district,
      },
      resourceType,
      urgency,
      patientName,
      patientAge: patientAge || null,
      note: note || '',
    });

    res.status(201).json({ message: 'Added to waitlist', entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my waitlist entries with live positions
// @route   GET /api/waitlist/mine
// @access  Private
const getMyWaitlist = async (req, res) => {
  try {
    const myEntries = await Waitlist.find({
      user: req.user._id,
      status: { $in: ['Waiting', 'Notified'] },
    });

    // For each entry get its position in the full queue
    const result = await Promise.all(
      myEntries.map(async (entry) => {
        const fullQueue = await Waitlist.find({
          hospital: entry.hospital,
          resourceType: entry.resourceType,
          status: { $in: ['Waiting', 'Notified'] },
        });

        const withPositions = attachPositions(fullQueue);
        const myPos = withPositions.find(
          (e) => e._id.toString() === entry._id.toString()
        );

        return {
          ...entry.toObject(),
          position: myPos?.position || 1,
          totalInQueue: fullQueue.length,
        };
      })
    );

    result.sort((a, b) => {
      const pa = priorityScore[a.urgency] || 3;
      const pb = priorityScore[b.urgency] || 3;
      return pa - pb;
    });

    res.json({ count: result.length, waitlist: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full waitlist for a hospital (for hospital staff)
// @route   GET /api/waitlist/hospital/:hospitalId
// @access  Private
const getHospitalWaitlist = async (req, res) => {
  try {
    const { resourceType } = req.query;
    const query = {
      hospital: req.params.hospitalId,
      status: { $in: ['Waiting', 'Notified'] },
    };
    if (resourceType) query.resourceType = resourceType;

    const entries = await Waitlist.find(query);
    const withPositions = attachPositions(entries);

    res.json({ count: withPositions.length, waitlist: withPositions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel waitlist entry
// @route   PUT /api/waitlist/:id/cancel
// @access  Private
const cancelWaitlist = async (req, res) => {
  try {
    const entry = await Waitlist.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    entry.status = 'Cancelled';
    await entry.save();

    res.json({ message: 'Removed from waitlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark as admitted
// @route   PUT /api/waitlist/:id/admit
// @access  Private
const markAdmitted = async (req, res) => {
  try {
    const entry = await Waitlist.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    entry.status = 'Admitted';
    await entry.save();

    res.json({ message: 'Marked as admitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Notify top waitlist entries when bed becomes available
// @route   PUT /api/waitlist/notify
// @access  Private (hospital staff)
const notifyWaitlist = async (req, res) => {
  try {
    const { hospitalId, resourceType } = req.body;

    // Get top Critical entry, fallback to Urgent, fallback to Normal
    const top = await Waitlist.findOne({
      hospital: hospitalId,
      resourceType,
      status: 'Waiting',
    }).sort({ 'urgency': 1, createdAt: 1 });

    if (!top) {
      return res.json({ message: 'No one on waitlist for this resource' });
    }

    // Sort: Critical first
    const sorted = await Waitlist.find({
      hospital: hospitalId,
      resourceType,
      status: 'Waiting',
    }).sort({ createdAt: 1 });

    const prioritized = sorted.sort(
      (a, b) => (priorityScore[a.urgency] || 3) - (priorityScore[b.urgency] || 3)
    );

    const topEntry = prioritized[0];
    topEntry.status = 'Notified';
    topEntry.notifiedAt = new Date();
    await topEntry.save();

    res.json({
      message: `Notified ${topEntry.userName} (${topEntry.patientName})`,
      notified: topEntry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get waitlist stats for a hospital
// @route   GET /api/waitlist/stats/:hospitalId
// @access  Public
const getWaitlistStats = async (req, res) => {
  try {
    const resourceTypes = ['General Bed', 'ICU', 'CCU', 'Ventilator', 'Oxygen Bed'];

    const stats = await Promise.all(
      resourceTypes.map(async (rt) => {
        const count = await Waitlist.countDocuments({
          hospital: req.params.hospitalId,
          resourceType: rt,
          status: { $in: ['Waiting', 'Notified'] },
        });
        return { resourceType: rt, waiting: count };
      })
    );

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  joinWaitlist,
  getMyWaitlist,
  getHospitalWaitlist,
  cancelWaitlist,
  markAdmitted,
  notifyWaitlist,
  getWaitlistStats,
};