const express = require('express');
const router = express.Router();
const { registerDonor, getMyDonorProfile, updateDonorProfile, updateAvailability, findDonors, logDonation } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');


// Public routes
router.get('/find', findDonors);


// Private routes (must be logged in)
router.post('/register', protect, registerDonor);
router.get('/me', protect, getMyDonorProfile);
router.put('/availability', protect, updateAvailability);
router.put('/update', protect, updateDonorProfile);
router.post('/log-donation', protect, logDonation);

module.exports = router;