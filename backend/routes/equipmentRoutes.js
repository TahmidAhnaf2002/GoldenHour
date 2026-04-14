const express = require('express');
const router = express.Router();
const {
  addEquipment,
  searchEquipment,
  getMyListings,
  updateEquipment,
  deleteEquipment,
  bookEquipment,
  getMyBookings,
  updateBookingStatus,
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/search', searchEquipment);

// Private
router.post('/add', protect, addEquipment);
router.get('/mine', protect, getMyListings);
router.get('/bookings/mine', protect, getMyBookings);
router.put('/:id', protect, updateEquipment);
router.delete('/:id', protect, deleteEquipment);
router.post('/:id/book', protect, bookEquipment);
router.put('/:id/bookings/:bookingId/status', protect, updateBookingStatus);

module.exports = router;