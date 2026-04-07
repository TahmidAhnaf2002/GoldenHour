const BloodBank = require('../models/bloodBankModel');


// Maps display name <-> model key
const bloodTypeMap = {
  'A+': 'Apos', 'A-': 'Aneg',
  'B+': 'Bpos', 'B-': 'Bneg',
  'AB+': 'ABpos', 'AB-': 'ABneg',
  'O+': 'Opos', 'O-': 'Oneg',
};


const keyToDisplay = Object.fromEntries(
  Object.entries(bloodTypeMap).map(([k, v]) => [v, k])
);


// @desc    Register blood bank
// @route   POST /api/bloodbanks/register
// @access  Private
const registerBloodBank = async (req, res) => {
  try {
    const existing = await BloodBank.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a blood bank registered' });
    }


    const { name, licenseNumber, address, location, contactNumber } = req.body;


    const bloodBank = await BloodBank.create({
      user: req.user._id,
      name,
      licenseNumber,
      address,
      location,
      contactNumber,
    });


    res.status(201).json(bloodBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get my blood bank profile
// @route   GET /api/bloodbanks/me
// @access  Private
const getMyBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ user: req.user._id });
    if (!bloodBank) {
      return res.status(404).json({ message: 'No blood bank profile found' });
    }
    res.json(bloodBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all blood banks (public)
// @route   GET /api/bloodbanks
// @access  Public
const getAllBloodBanks = async (req, res) => {
  try {
    const { division, bloodType } = req.query;
    const query = {};
    if (division) query['location.division'] = division;


    let banks = await BloodBank.find(query).sort({ name: 1 });


    // filter by blood type availability if requested
    if (bloodType && bloodTypeMap[bloodType]) {
      const key = bloodTypeMap[bloodType];
      banks = banks.filter((b) => b.stock[key] > 0);
    }


    res.json({ count: banks.length, bloodBanks: banks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get single blood bank
// @route   GET /api/bloodbanks/:id
// @access  Public
const getBloodBankById = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) {
      return res.status(404).json({ message: 'Blood bank not found' });
    }
    res.json(bloodBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update stock
// @route   PUT /api/bloodbanks/stock
// @access  Private
const updateStock = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ user: req.user._id });
    if (!bloodBank) {
      return res.status(404).json({ message: 'Blood bank profile not found' });
    }


    const { stock } = req.body; // { 'A+': 10, 'B+': 5, ... }


    Object.entries(stock).forEach(([displayType, units]) => {
      const key = bloodTypeMap[displayType];
      if (key !== undefined) {
        bloodBank.stock[key] = Math.max(0, Number(units));
      }
    });


    bloodBank.stockLastUpdated = new Date();
    await bloodBank.save();


    res.json({ message: 'Stock updated successfully', stock: bloodBank.stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Request transfer from another blood bank
// @route   POST /api/bloodbanks/:id/transfer-request
// @access  Private
const requestTransfer = async (req, res) => {
  try {
    const targetBank = await BloodBank.findById(req.params.id);
    if (!targetBank) {
      return res.status(404).json({ message: 'Blood bank not found' });
    }


    const myBank = await BloodBank.findOne({ user: req.user._id });
    if (!myBank) {
      return res.status(400).json({ message: 'You must register a blood bank first' });
    }


    if (myBank._id.toString() === targetBank._id.toString()) {
      return res.status(400).json({ message: 'Cannot request transfer from yourself' });
    }


    const { bloodType, unitsRequested } = req.body;


    targetBank.transferRequests.push({
      fromBank: myBank._id,
      fromBankName: myBank.name,
      bloodType,
      unitsRequested: Number(unitsRequested),
    });


    await targetBank.save();


    res.json({ message: 'Transfer request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Respond to transfer request
// @route   PUT /api/bloodbanks/transfer/:requestId/respond
// @access  Private
const respondToTransfer = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ user: req.user._id });
    if (!bloodBank) {
      return res.status(404).json({ message: 'Blood bank not found' });
    }


    const request = bloodBank.transferRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }


    request.status = req.body.status; // 'Accepted' or 'Declined'
    await bloodBank.save();


    res.json({ message: 'Transfer request updated', status: request.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerBloodBank,
  getMyBloodBank,
  getAllBloodBanks,
  getBloodBankById,
  updateStock,
  requestTransfer,
  respondToTransfer,
};
