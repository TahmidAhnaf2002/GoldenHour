const Hospital = require('../models/hospitalModel');

// ── Reliability helpers ────────────────────────────────────────────────────
const computeReliability = (hospital) => {
  const hoursSinceUpdate =
    (new Date() - new Date(hospital.lastUpdated)) / (1000 * 60 * 60);

  let score = 100;
  if (hoursSinceUpdate > 48) score -= 40;
  else if (hoursSinceUpdate > 24) score -= 20;
  else if (hoursSinceUpdate > 12) score -= 10;

  const unresolvedReports = hospital.reports.filter((r) => !r.resolved).length;
  score -= unresolvedReports * 5;

  if (hospital.updateCount > 20) score = Math.min(score + 5, 100);

  return Math.max(score, 0);
};

const checkAndFlag = async (hospital) => {
  const hoursSinceUpdate =
    (new Date() - new Date(hospital.lastUpdated)) / (1000 * 60 * 60);
  if (hoursSinceUpdate > 48 && !hospital.isFlagged) {
    hospital.isFlagged = true;
    hospital.flaggedAt = new Date();
    await hospital.save();
  }
};

// @desc    Register hospital
// @route   POST /api/hospitals/register
// @access  Private
const registerHospital = async (req, res) => {
  try {
    const existing = await Hospital.findOne({ registeredBy: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a hospital registered' });
    }

    const {
      name, hospitalType, address, location,
      contactNumber, emergencyNumber, specialties,
    } = req.body;

    const hospital = await Hospital.create({
      registeredBy: req.user._id,
      name, hospitalType, address, location,
      contactNumber, emergencyNumber,
      specialties: specialties || [],
    });

    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my hospital
// @route   GET /api/hospitals/me
// @access  Private
const getMyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ registeredBy: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'No hospital found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update capacity
// @route   PUT /api/hospitals/capacity
// @access  Private
const updateCapacity = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ registeredBy: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const { capacity } = req.body;
    const fields = ['generalBeds', 'icuBeds', 'ccuBeds', 'ventilators', 'oxygenBeds'];

    fields.forEach((field) => {
      if (capacity[field] !== undefined) {
        hospital.capacity[field].total = Number(capacity[field].total) || 0;
        hospital.capacity[field].available = Number(capacity[field].available) || 0;
      }
    });

    hospital.lastUpdated = new Date();
    // ✅ 3 new lines added here
    hospital.updateCount += 1;
    hospital.isFlagged = false;
    hospital.reliabilityScore = computeReliability(hospital);
    await hospital.save();

    res.json({ message: 'Capacity updated', capacity: hospital.capacity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hospital info
// @route   PUT /api/hospitals/info
// @access  Private
const updateInfo = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ registeredBy: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const fields = ['contactNumber', 'emergencyNumber', 'address', 'specialties'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) hospital[f] = req.body[f];
    });

    await hospital.save();
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all hospitals (public)
// @route   GET /api/hospitals
// @access  Public
const getAllHospitals = async (req, res) => {
  try {
    const { division, district, hospitalType, resource } = req.query;
    const query = {};

    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;
    if (hospitalType) query.hospitalType = hospitalType;

    let hospitals = await Hospital.find(query).sort({ name: 1 });

    // ✅ Auto-flag stale hospitals
    await Promise.all(hospitals.map((h) => checkAndFlag(h)));
    hospitals = await Hospital.find(query).sort({ reliabilityScore: -1, name: 1 });
    hospitals = hospitals.map((h) => ({
      ...h.toObject(),
      reliabilityScore: computeReliability(h),
    }));

    // filter by resource availability
    if (resource) {
      const resourceMap = {
        generalBeds: 'capacity.generalBeds.available',
        icuBeds: 'capacity.icuBeds.available',
        ccuBeds: 'capacity.ccuBeds.available',
        ventilators: 'capacity.ventilators.available',
        oxygenBeds: 'capacity.oxygenBeds.available',
      };
      if (resourceMap[resource]) {
        hospitals = hospitals.filter((h) => h.capacity[resource]?.available > 0);
      }
    }

    res.json({ count: hospitals.length, hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit verification documents
// @route   POST /api/hospitals/documents/submit
// @access  Private
const submitDocuments = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ registeredBy: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const { documents } = req.body;
    if (!documents || !documents.length) {
      return res.status(400).json({ message: 'No documents provided' });
    }

    documents.forEach((doc) => {
      hospital.verificationDocuments.push({
        docName: doc.docName,
        docNote: doc.docNote || '',
      });
    });

    await hospital.save();
    res.json({ message: 'Documents submitted for verification' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report incorrect hospital data
// @route   POST /api/hospitals/:id/report
// @access  Private
const reportHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const { issue, resourceType } = req.body;

    hospital.reports.push({
      reportedBy: req.user._id,
      reporterName: req.user.name,
      issue,
      resourceType: resourceType || 'General',
    });

    hospital.reliabilityScore = computeReliability(hospital);
    await hospital.save();

    res.json({ message: 'Report submitted. Thank you for helping keep data accurate.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ER wait time
// @route   PUT /api/hospitals/waittime/update
// @access  Private
const updateWaitTime = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ registeredBy: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const { currentWait, hasER, erSpecialties } = req.body;

    hospital.erWaitTime.currentWait = Number(currentWait) || 0;
    hospital.erWaitTime.hasER = hasER ?? hospital.erWaitTime.hasER;
    hospital.erWaitTime.erSpecialties = erSpecialties || hospital.erWaitTime.erSpecialties;
    hospital.erWaitTime.lastUpdated = new Date();

    // Keep last 24 history entries
    hospital.waitTimeHistory.push({ waitMinutes: Number(currentWait) || 0 });
    if (hospital.waitTimeHistory.length > 24) {
      hospital.waitTimeHistory = hospital.waitTimeHistory.slice(-24);
    }

    await hospital.save();
    res.json({ message: 'Wait time updated', erWaitTime: hospital.erWaitTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all ER wait times (public)
// @route   GET /api/hospitals/waittime/all
// @access  Public
const getAllWaitTimes = async (req, res) => {
  try {
    const { division, district } = req.query;
    const query = { 'erWaitTime.hasER': true };

    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;

    const hospitals = await Hospital.find(query)
      .select('name location contactNumber erWaitTime waitTimeHistory specialties hospitalType')
      .sort({ 'erWaitTime.currentWait': 1 });

    res.json({ count: hospitals.length, hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerHospital,
  getMyHospital,
  updateCapacity,
  updateInfo,
  submitDocuments,   // new
  reportHospital,
  updateWaitTime,
  getAllWaitTimes,    // new
  getAllHospitals,
  getHospitalById,
};