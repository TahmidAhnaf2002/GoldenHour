const Hospital = require('../models/hospitalModel');

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
        hospital.capacity[field].total     = Number(capacity[field].total)     || 0;
        hospital.capacity[field].available = Number(capacity[field].available) || 0;
      }
    });

    hospital.lastUpdated = new Date();
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

    if (division)     query['location.division'] = division;
    if (district)     query['location.district'] = district;
    if (hospitalType) query.hospitalType = hospitalType;

    let hospitals = await Hospital.find(query).sort({ name: 1 });

    // filter by resource availability
    if (resource) {
      const resourceMap = {
        generalBeds: 'capacity.generalBeds.available',
        icuBeds:     'capacity.icuBeds.available',
        ccuBeds:     'capacity.ccuBeds.available',
        ventilators: 'capacity.ventilators.available',
        oxygenBeds:  'capacity.oxygenBeds.available',
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

module.exports = {
  registerHospital,
  getMyHospital,
  updateCapacity,
  updateInfo,
  getAllHospitals,
  getHospitalById,
};