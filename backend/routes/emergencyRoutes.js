const express = require('express');
const router = express.Router();
const {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  respondToEmergency,
  updateEmergencyStatus,
  getMyEmergencies,
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEmergencies);
router.get('/:id', getEmergencyById);

// Private routes
router.post('/create', protect, createEmergency);
router.post('/:id/respond', protect, respondToEmergency);
router.put('/:id/status', protect, updateEmergencyStatus);
router.get('/user/mine', protect, getMyEmergencies);

module.exports = router;