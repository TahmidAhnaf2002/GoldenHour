const express = require('express');
const router  = express.Router();
const {
  registerDonor, getMyProfile, updateDonor,
  revokePledge, restorePledge, getAllDonors, getStats,
} = require('../controllers/organDonorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats',    getStats);
router.get('/',         protect, getAllDonors);
router.post('/register',protect, registerDonor);
router.get('/me',       protect, getMyProfile);
router.put('/update',   protect, updateDonor);
router.put('/revoke',   protect, revokePledge);
router.put('/restore',  protect, restorePledge);

module.exports = router;