const express = require('express');
const router = express.Router();
const {
  addMedicine,
  searchMedicines,
  getMyListings,
  updateMedicine,
  deleteMedicine,
  reserveMedicine,
  getMyReservations,
  updateReservationStatus,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/search', searchMedicines);

// Private
router.post('/add', protect, addMedicine);
router.get('/mine', protect, getMyListings);
router.get('/reservations/mine', protect, getMyReservations);
router.put('/:id', protect, updateMedicine);
router.delete('/:id', protect, deleteMedicine);
router.post('/:id/reserve', protect, reserveMedicine);
router.put('/:id/reservations/:resId/status', protect, updateReservationStatus);

module.exports = router;