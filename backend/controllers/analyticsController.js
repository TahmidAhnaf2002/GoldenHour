const Emergency = require('../models/emergencyModel');
const Donor     = require('../models/donorModel');
const Hospital  = require('../models/hospitalModel');
const Medicine  = require('../models/medicineModel');
const SOS       = require('../models/sosModel');
const Alert     = require('../models/alertModel');
const User      = require('../models/userModel');

// @desc    Get full analytics data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {

    // ── 1. Emergency requests over time (last 30 days) ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const emergencyOverTime = await Emergency.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── 2. Most requested blood types ──
    const bloodTypeRequests = await Emergency.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 3. Emergency requests by division ──
    const emergencyByDivision = await Emergency.aggregate([
      { $group: { _id: '$location.division', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 4. Hospital capacity overview ──
    const hospitals = await Hospital.find({}).select('name capacity location isVerified reliabilityScore');
    const capacityStats = {
      totalGeneralBeds:  0, availGeneralBeds:  0,
      totalICU:          0, availICU:          0,
      totalCCU:          0, availCCU:          0,
      totalVentilators:  0, availVentilators:  0,
      totalOxygenBeds:   0, availOxygenBeds:   0,
    };
    hospitals.forEach((h) => {
      capacityStats.totalGeneralBeds  += h.capacity.generalBeds?.total     || 0;
      capacityStats.availGeneralBeds  += h.capacity.generalBeds?.available || 0;
      capacityStats.totalICU          += h.capacity.icuBeds?.total         || 0;
      capacityStats.availICU          += h.capacity.icuBeds?.available     || 0;
      capacityStats.totalCCU          += h.capacity.ccuBeds?.total         || 0;
      capacityStats.availCCU          += h.capacity.ccuBeds?.available     || 0;
      capacityStats.totalVentilators  += h.capacity.ventilators?.total     || 0;
      capacityStats.availVentilators  += h.capacity.ventilators?.available || 0;
      capacityStats.totalOxygenBeds   += h.capacity.oxygenBeds?.total      || 0;
      capacityStats.availOxygenBeds   += h.capacity.oxygenBeds?.available  || 0;
    });

    // ── 5. Most searched medicines ──
    const topMedicines = await Medicine.aggregate([
      { $group: { _id: '$medicineName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // ── 6. SOS emergency types breakdown ──
    const sosTypeBreakdown = await SOS.aggregate([
      { $group: { _id: '$emergencyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 7. SOS by division (heatmap data) ──
    const sosByDivision = await SOS.aggregate([
      { $group: { _id: '$location.division', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 8. Donor stats by blood type ──
    const donorsByBloodType = await Donor.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 9. Alert severity breakdown ──
    const alertsBySeverity = await Alert.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 10. Platform summary counts ──
    const [
      totalUsers, totalDonors, totalHospitals,
      totalEmergencies, totalSOS, totalAlerts,
    ] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      Hospital.countDocuments(),
      Emergency.countDocuments(),
      SOS.countDocuments(),
      Alert.countDocuments({ status: 'Approved' }),
    ]);

    res.json({
      summary: { totalUsers, totalDonors, totalHospitals, totalEmergencies, totalSOS, totalAlerts },
      emergencyOverTime,
      bloodTypeRequests,
      emergencyByDivision,
      capacityStats,
      topMedicines,
      sosTypeBreakdown,
      sosByDivision,
      donorsByBloodType,
      alertsBySeverity,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };