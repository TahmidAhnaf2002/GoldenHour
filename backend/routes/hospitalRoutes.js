const express = require('express');
const router = express.Router();
const {
  registerHospital,
  getMyHospital,
  updateCapacity,
  updateInfo,
  getAllHospitals,
  getHospitalById,
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllHospitals);
router.get('/:id', getHospitalById);

// Private
router.post('/register', protect, registerHospital);
router.get('/user/me', protect, getMyHospital);
router.put('/capacity/update', protect, updateCapacity);
router.put('/info/update', protect, updateInfo);

module.exports = router;