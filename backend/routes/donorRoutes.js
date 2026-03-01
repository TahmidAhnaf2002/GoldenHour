const express = require('express');
const router = express.Router();
const {
  registerDonor,
  getMyDonorProfile,
  updateAvailability,
  findDonors,
  updateDonorProfile,
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/find', findDonors);

// Private routes (must be logged in)
router.post('/register', protect, registerDonor);
router.get('/me', protect, getMyDonorProfile);
router.put('/availability', protect, updateAvailability);
router.put('/update', protect, updateDonorProfile);

module.exports = router;