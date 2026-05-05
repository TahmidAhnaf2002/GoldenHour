const Hospital = require('../models/hospitalModel');
const { runDataQualityCheck, generateComplianceReport } = require('../services/dataQualityService');

const hoursSince = (date) => (new Date() - new Date(date)) / (1000 * 60 * 60);

// @desc    Get data quality overview
// @route   GET /api/quality/overview
// @access  Private
const getQualityOverview = async (req, res) => {
  try {
    const hospitals = await Hospital.find({})
      .select('name location isVerified isFlagged flaggedAt lastUpdated reliabilityScore updateCount reports');

    const overview = hospitals.map((h) => {
      const hrs = hoursSince(h.lastUpdated);
      let status = 'Good';
      if (hrs > 48)      status = 'Hidden';
      else if (hrs > 24) status = 'Flagged';
      else if (hrs > 12) status = 'Warning';

      return {
        _id:              h._id,
        name:             h.name,
        district:         h.location.district,
        division:         h.location.division,
        isVerified:       h.isVerified,
        isFlagged:        h.isFlagged,
        lastUpdated:      h.lastUpdated,
        hoursSinceUpdate: Math.round(hrs),
        reliabilityScore: h.reliabilityScore ?? 100,
        updateCount:      h.updateCount,
        totalReports:     h.reports?.length || 0,
        unresolvedReports:h.reports?.filter((r) => !r.resolved).length || 0,
        status,
      };
    });

    const stats = {
      total:   overview.length,
      good:    overview.filter((h) => h.status === 'Good').length,
      warning: overview.filter((h) => h.status === 'Warning').length,
      flagged: overview.filter((h) => h.status === 'Flagged').length,
      hidden:  overview.filter((h) => h.status === 'Hidden').length,
      avgScore: overview.length > 0
        ? Math.round(overview.reduce((sum, h) => sum + h.reliabilityScore, 0) / overview.length)
        : 100,
    };

    res.json({ stats, hospitals: overview.sort((a, b) => a.reliabilityScore - b.reliabilityScore) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually trigger data quality check
// @route   POST /api/quality/run-check
// @access  Private/Admin
const triggerQualityCheck = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const result = await runDataQualityCheck();
    res.json({ message: 'Quality check complete', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate compliance report
// @route   GET /api/quality/compliance-report
// @access  Private/Admin
const getComplianceReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const report = await generateComplianceReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stale hospitals (not updated in 12+ hours)
// @route   GET /api/quality/stale
// @access  Private
const getStaleHospitals = async (req, res) => {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const hospitals = await Hospital.find({ lastUpdated: { $lt: twelveHoursAgo } })
      .select('name location lastUpdated isFlagged reliabilityScore')
      .sort({ lastUpdated: 1 });

    res.json({ count: hospitals.length, hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQualityOverview,
  triggerQualityCheck,
  getComplianceReport,
  getStaleHospitals,
};