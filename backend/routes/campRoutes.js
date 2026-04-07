const express = require('express');
const router = express.Router();
const {
  createCamp,
  getCamps,
  getCampById,
  registerForCamp,
  checkInDonor,
  updateCampStatus,
  getMyCamps,
} = require('../controllers/campController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getCamps);
router.get('/:id', getCampById);

// Private
router.post('/create', protect, createCamp);
router.post('/:id/register', protect, registerForCamp);
router.put('/:id/checkin/:donorId', protect, checkInDonor);
router.put('/:id/status', protect, updateCampStatus);
router.get('/user/mine', protect, getMyCamps);

module.exports = router;