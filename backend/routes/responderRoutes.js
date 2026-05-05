const express = require('express');
const router  = express.Router();
const {
  registerResponder,
  getMyProfile,
  toggleAvailability,
  updateRadius,
  submitDocuments,
  getAllResponders,
} = require('../controllers/responderController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllResponders);

// Private
router.post('/register',      protect, registerResponder);
router.get('/me',             protect, getMyProfile);
router.put('/availability',   protect, toggleAvailability);
router.put('/radius',         protect, updateRadius);
router.post('/documents',     protect, submitDocuments);

module.exports = router;