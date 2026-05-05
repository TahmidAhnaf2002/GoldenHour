const express = require('express');
const router = express.Router();
const {
  registerHospital,
  getMyHospital,
  updateCapacity,
  updateInfo,
  submitDocuments,
  reportHospital,
  updateWaitTime,
  getAllWaitTimes,
  getAllHospitals,
  getHospitalById,
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllHospitals);
router.get('/:id', getHospitalById);
router.get('/waittime/all', getAllWaitTimes); 

// Private
router.post('/register', protect, registerHospital);
router.get('/user/me', protect, getMyHospital);
router.put('/capacity/update', protect, updateCapacity);
router.put('/info/update', protect, updateInfo);
router.post('/documents/submit', protect, submitDocuments);
router.post('/:id/report', protect, reportHospital);
router.put('/waittime/update', protect, updateWaitTime); 

module.exports = router;