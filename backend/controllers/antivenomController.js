const Antivenom = require('../models/antivenomModel');

// @desc    Register hospital antivenom stock
// @route   POST /api/antivenom/register
// @access  Private
const registerStock = async (req, res) => {
  try {
    const existing = await Antivenom.findOne({ registeredBy: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a stock entry. Use update instead.' });
    }

    const { hospital, contactNumber, location, stock } = req.body;

    const entry = await Antivenom.create({
      hospital,
      registeredBy: req.user._id,
      contactNumber,
      location,
      stock,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update antivenom stock
// @route   PUT /api/antivenom/update
// @access  Private
const updateStock = async (req, res) => {
  try {
    const entry = await Antivenom.findOne({ registeredBy: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'No stock entry found. Register first.' });
    }

    const { stock } = req.body;
    entry.stock = stock;
    entry.lastUpdated = new Date();
    await entry.save();

    res.json({ message: 'Stock updated', stock: entry.stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my antivenom stock entry
// @route   GET /api/antivenom/me
// @access  Private
const getMyStock = async (req, res) => {
  try {
    const entry = await Antivenom.findOne({ registeredBy: req.user._id });
    if (!entry) return res.status(404).json({ message: 'No entry found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search hospitals by antivenom type
// @route   GET /api/antivenom/search
// @access  Public
const searchByAntivenom = async (req, res) => {
  try {
    const { antivenomType, division } = req.query;

    let entries = await Antivenom.find().sort({ hospital: 1 });

    if (division) {
      entries = entries.filter((e) => e.location.division === division);
    }

    if (antivenomType) {
      entries = entries
        .map((e) => {
          const match = e.stock.find(
            (s) => s.antivenomType === antivenomType && s.units > 0
          );
          return match ? { ...e.toObject(), matchedStock: match } : null;
        })
        .filter(Boolean);
    }

    res.json({ count: entries.length, hospitals: entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all hospitals with any antivenom
// @route   GET /api/antivenom
// @access  Public
const getAllStocks = async (req, res) => {
  try {
    const { division } = req.query;
    const query = {};
    if (division) query['location.division'] = division;

    const entries = await Antivenom.find(query).sort({ hospital: 1 });
    res.json({ count: entries.length, hospitals: entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerStock,
  updateStock,
  getMyStock,
  searchByAntivenom,
  getAllStocks,
};