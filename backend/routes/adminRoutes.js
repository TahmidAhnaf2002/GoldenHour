const express = require('express');
const router  = express.Router();
const {
  getAllUsers, updateUserRole, toggleSuspend,
  getUnverifiedHospitals, verifyHospital,
  getUnverifiedResponders, verifyResponder,
  getPendingAlerts, moderateAlert,
  getPlatformStats, getHospitalReports, resolveHospitalReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats',                                      getPlatformStats);
router.get('/users',                                      getAllUsers);
router.put('/users/:id/role',                             updateUserRole);
router.put('/users/:id/suspend',                          toggleSuspend);
router.get('/verify/hospitals',                           getUnverifiedHospitals);
router.put('/verify/hospitals/:id',                       verifyHospital);
router.get('/verify/responders',                          getUnverifiedResponders);
router.put('/verify/responders/:id',                      verifyResponder);
router.get('/alerts/pending',                             getPendingAlerts);
router.put('/alerts/:id/moderate',                        moderateAlert);
router.get('/hospitals/reports',                          getHospitalReports);
router.put('/hospitals/:id/reports/:reportId/resolve',    resolveHospitalReport);

module.exports = router;