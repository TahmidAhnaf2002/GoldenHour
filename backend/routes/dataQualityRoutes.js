const express = require('express');
const router  = express.Router();
const {
  getQualityOverview,
  triggerQualityCheck,
  getComplianceReport,
  getStaleHospitals,
} = require('../controllers/dataQualityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview',            protect, getQualityOverview);
router.get('/stale',               protect, getStaleHospitals);
router.post('/run-check',          protect, triggerQualityCheck);
router.get('/compliance-report',   protect, getComplianceReport);

module.exports = router;