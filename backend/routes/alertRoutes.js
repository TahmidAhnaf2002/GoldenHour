const express = require('express');
const router  = express.Router();
const {
  createAlert,
  getAlerts,
  getPendingAlerts,
  moderateAlert,
  subscribeToArea,
  registerForCamp,
  getMyAlerts,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getAlerts);

// Private
router.post('/create',          protect, createAlert);
router.get('/mine',             protect, getMyAlerts);
router.get('/pending',          protect, getPendingAlerts);
router.put('/:id/moderate',     protect, moderateAlert);
router.post('/subscribe',       protect, subscribeToArea);
router.post('/:id/register',    protect, registerForCamp);

module.exports = router;