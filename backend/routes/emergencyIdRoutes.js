const express = require('express');
const router = express.Router();
const { saveProfile, getMyProfile, scanProfile, toggleActive } = require('../controllers/emergencyIdController');
const { protect } = require('../middleware/authMiddleware');

router.get('/scan/:emergencyId', scanProfile); // Public — no auth
router.post('/save', protect, saveProfile);
router.get('/me', protect, getMyProfile);
router.put('/toggle', protect, toggleActive);

module.exports = router;