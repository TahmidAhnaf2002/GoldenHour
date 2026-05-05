const express = require('express');
const router  = express.Router();
const {
  createSOS,
  respondToSOS,
  getMySOS,
  getActiveSOSList,
  cancelSOS,
} = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');

router.get('/active',        protect, getActiveSOSList);
router.get('/mine',          protect, getMySOS);
router.post('/create',       protect, createSOS);
router.post('/:id/respond',  protect, respondToSOS);
router.put('/:id/cancel',    protect, cancelSOS);

module.exports = router;