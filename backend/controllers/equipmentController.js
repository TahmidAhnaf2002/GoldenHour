const Equipment = require('../models/equipmentModel');

// @desc    List equipment
// @route   POST /api/equipment/add
// @access  Private
const addEquipment = async (req, res) => {
  try {
    const {
      facilityName, facilityType, contactNumber, location,
      equipmentType, description, quantity, pricePerDay,
    } = req.body;

    const equipment = await Equipment.create({
      listedBy: req.user._id,
      facilityName, facilityType, contactNumber, location,
      equipmentType, description,
      quantity: Number(quantity),
      pricePerDay: Number(pricePerDay),
      isAvailable: Number(quantity) > 0,
    });

    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search equipment
// @route   GET /api/equipment/search
// @access  Public
const searchEquipment = async (req, res) => {
  try {
    const { equipmentType, division, district, facilityType } = req.query;
    const query = {};

    if (equipmentType) query.equipmentType = equipmentType;
    if (division)      query['location.division'] = division;
    if (district)      query['location.district'] = district;
    if (facilityType)  query.facilityType = facilityType;

    const equipment = await Equipment.find(query)
      .sort({ isAvailable: -1, pricePerDay: 1 });

    res.json({ count: equipment.length, equipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my listings
// @route   GET /api/equipment/mine
// @access  Private
const getMyListings = async (req, res) => {
  try {
    const equipment = await Equipment.find({ listedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ count: equipment.length, equipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update equipment listing
// @route   PUT /api/equipment/:id
// @access  Private
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Listing not found' });

    if (equipment.listedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const fields = ['quantity', 'pricePerDay', 'description', 'isAvailable'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) equipment[f] = req.body[f];
    });

    if (req.body.quantity !== undefined) {
      equipment.isAvailable = Number(req.body.quantity) > 0;
    }

    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete equipment listing
// @route   DELETE /api/equipment/:id
// @access  Private
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Listing not found' });

    if (equipment.listedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await equipment.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book equipment
// @route   POST /api/equipment/:id/book
// @access  Private
const bookEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    if (!equipment.isAvailable || equipment.quantity === 0) {
      return res.status(400).json({ message: 'This equipment is currently unavailable' });
    }

    const alreadyBooked = equipment.bookings.find(
      (b) =>
        b.bookedBy.toString() === req.user._id.toString() &&
        ['Pending', 'Confirmed', 'Active'].includes(b.status)
    );
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You already have an active booking for this equipment' });
    }

    const { durationDays, contactNumber, note } = req.body;
    const duration = Number(durationDays) || 1;

    equipment.bookings.push({
      bookedBy: req.user._id,
      bookedByName: req.user.name,
      contactNumber,
      durationDays: duration,
      note: note || '',
    });

    // Hold one unit
    equipment.quantity -= 1;
    if (equipment.quantity === 0) equipment.isAvailable = false;

    await equipment.save();
    res.json({ message: 'Equipment booked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my bookings
// @route   GET /api/equipment/bookings/mine
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const allEquipment = await Equipment.find({
      'bookings.bookedBy': req.user._id,
    });

    const bookings = [];
    allEquipment.forEach((eq) => {
      eq.bookings
        .filter((b) => b.bookedBy.toString() === req.user._id.toString())
        .forEach((b) => {
          bookings.push({
            bookingId: b._id,
            status: b.status,
            durationDays: b.durationDays,
            note: b.note,
            bookedAt: b.bookedAt,
            equipment: {
              id: eq._id,
              equipmentType: eq.equipmentType,
              facilityName: eq.facilityName,
              facilityType: eq.facilityType,
              contactNumber: eq.contactNumber,
              pricePerDay: eq.pricePerDay,
              location: eq.location,
              description: eq.description,
            },
          });
        });
    });

    bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (vendor only)
// @route   PUT /api/equipment/:id/bookings/:bookingId/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    if (equipment.listedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const booking = equipment.bookings.id(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const newStatus = req.body.status;

    // Restore quantity if cancelling or returning
    if (
      ['Cancelled', 'Returned'].includes(newStatus) &&
      ['Pending', 'Confirmed', 'Active'].includes(booking.status)
    ) {
      equipment.quantity += 1;
      equipment.isAvailable = true;
    }

    booking.status = newStatus;
    await equipment.save();

    res.json({ message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addEquipment,
  searchEquipment,
  getMyListings,
  updateEquipment,
  deleteEquipment,
  bookEquipment,
  getMyBookings,
  updateBookingStatus,
};