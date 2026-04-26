const express = require('express');
const router = express.Router();
const {
  joinWaitlist,
  getMyWaitlist,
  getHospitalWaitlist,
  cancelWaitlist,
  markAdmitted,
  notifyWaitlist,
  getWaitlistStats,
} = require('../controllers/waitlistController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/stats/:hospitalId', getWaitlistStats);

// Private
router.post('/join', protect, joinWaitlist);
router.get('/mine', protect, getMyWaitlist);
router.get('/hospital/:hospitalId', protect, getHospitalWaitlist);
router.put('/:id/cancel', protect, cancelWaitlist);
router.put('/:id/admit', protect, markAdmitted);
router.put('/notify', protect, notifyWaitlist);

module.exports = router;