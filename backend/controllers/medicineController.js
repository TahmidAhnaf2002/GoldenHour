const Medicine = require('../models/medicineModel');

// @desc    Add medicine listing
// @route   POST /api/medicines/add
// @access  Private
const addMedicine = async (req, res) => {
  try {
    const {
      facilityName, facilityType, contactNumber,
      location, medicineName, genericName, manufacturer,
      disease, dosage, pricePerUnit, stockUnits,
    } = req.body;

    const medicine = await Medicine.create({
      registeredBy: req.user._id,
      facilityName,
      facilityType,
      contactNumber,
      location,
      medicineName,
      genericName,
      manufacturer,
      disease,
      dosage,
      pricePerUnit,
      stockUnits,
      isAvailable: stockUnits > 0,
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Public
const searchMedicines = async (req, res) => {
  try {
    const { q, division, district, maxPrice, facilityType } = req.query;

    const query = {};

    if (q) {
      query.$or = [
        { medicineName: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } },
        { disease: { $regex: q, $options: 'i' } },
        { manufacturer: { $regex: q, $options: 'i' } },
      ];
    }

    if (division) query['location.division'] = division;
    if (district) query['location.district'] = district;
    if (facilityType) query.facilityType = facilityType;
    if (maxPrice) query.pricePerUnit = { $lte: Number(maxPrice) };

    const medicines = await Medicine.find(query)
      .sort({ isAvailable: -1, pricePerUnit: 1 })
      .limit(50);

    res.json({ count: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my medicine listings
// @route   GET /api/medicines/mine
// @access  Private
const getMyListings = async (req, res) => {
  try {
    const medicines = await Medicine.find({ registeredBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ count: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update medicine listing
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Listing not found' });

    if (medicine.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const fields = ['stockUnits', 'pricePerUnit', 'isAvailable', 'dosage'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) medicine[f] = req.body[f];
    });

    if (req.body.stockUnits !== undefined) {
      medicine.isAvailable = Number(req.body.stockUnits) > 0;
    }

    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medicine listing
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Listing not found' });

    if (medicine.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await medicine.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reserve medicine
// @route   POST /api/medicines/:id/reserve
// @access  Private
const reserveMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    if (!medicine.isAvailable || medicine.stockUnits === 0) {
      return res.status(400).json({ message: 'This medicine is currently out of stock' });
    }

    const alreadyReserved = medicine.reservations.find(
      (r) =>
        r.reservedBy.toString() === req.user._id.toString() &&
        ['Pending', 'Confirmed'].includes(r.status)
    );
    if (alreadyReserved) {
      return res.status(400).json({ message: 'You already have an active reservation for this medicine' });
    }

    const { unitsReserved, contactNumber } = req.body;
    const units = Number(unitsReserved) || 1;

    if (units > medicine.stockUnits) {
      return res.status(400).json({
        message: `Only ${medicine.stockUnits} units available`,
      });
    }

    medicine.reservations.push({
      reservedBy: req.user._id,
      reservedByName: req.user.name,
      contactNumber,
      unitsReserved: units,
    });

    // Hold the stock
    medicine.stockUnits -= units;
    if (medicine.stockUnits === 0) medicine.isAvailable = false;

    await medicine.save();

    res.json({ message: 'Reservation created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my reservations
// @route   GET /api/medicines/reservations/mine
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      'reservations.reservedBy': req.user._id,
    });

    const reservations = [];
    medicines.forEach((med) => {
      med.reservations
        .filter((r) => r.reservedBy.toString() === req.user._id.toString())
        .forEach((r) => {
          reservations.push({
            reservationId: r._id,
            status: r.status,
            unitsReserved: r.unitsReserved,
            reservedAt: r.reservedAt,
            medicine: {
              id: med._id,
              medicineName: med.medicineName,
              genericName: med.genericName,
              pricePerUnit: med.pricePerUnit,
              facilityName: med.facilityName,
              facilityType: med.facilityType,
              contactNumber: med.contactNumber,
              location: med.location,
            },
          });
        });
    });

    reservations.sort((a, b) => new Date(b.reservedAt) - new Date(a.reservedAt));
    res.json({ count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reservation status (facility owner)
// @route   PUT /api/medicines/:id/reservations/:resId/status
// @access  Private
const updateReservationStatus = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    if (medicine.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const reservation = medicine.reservations.id(req.params.resId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // If cancelling, restore stock
    if (req.body.status === 'Cancelled' && ['Pending', 'Confirmed'].includes(reservation.status)) {
      medicine.stockUnits += reservation.unitsReserved;
      medicine.isAvailable = true;
    }

    reservation.status = req.body.status;
    await medicine.save();

    res.json({ message: 'Reservation status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMedicine,
  searchMedicines,
  getMyListings,
  updateMedicine,
  deleteMedicine,
  reserveMedicine,
  getMyReservations,
  updateReservationStatus,
};