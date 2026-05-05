const User      = require('../models/userModel');
const Hospital  = require('../models/hospitalModel');
const Responder = require('../models/responderModel');
const Alert     = require('../models/alertModel');

const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role)   query.role = role;
    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { role, adminRole } = req.body;
    if (role) user.role = role;
    if (adminRole !== undefined) user.adminRole = adminRole;
    await user.save();
    res.json({ message: 'User role updated', user: { _id: user._id, name: user.name, role: user.role, adminRole: user.adminRole } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isSuspended     = !user.isSuspended;
    user.suspendedReason = req.body.reason || '';
    await user.save();
    res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}`, isSuspended: user.isSuspended });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnverifiedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isVerified: false }).sort({ createdAt: -1 });
    res.json({ count: hospitals.length, hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    hospital.isVerified = req.body.approve === true;
    await hospital.save();
    res.json({ message: `Hospital ${hospital.isVerified ? 'verified' : 'rejected'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnverifiedResponders = async (req, res) => {
  try {
    const responders = await Responder.find({ isVerified: false }).sort({ createdAt: -1 });
    res.json({ count: responders.length, responders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyResponder = async (req, res) => {
  try {
    const responder = await Responder.findById(req.params.id);
    if (!responder) return res.status(404).json({ message: 'Responder not found' });
    responder.isVerified = req.body.approve === true;
    await responder.save();
    res.json({ message: `Responder ${responder.isVerified ? 'verified' : 'rejected'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const moderateAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    alert.status = req.body.status;
    await alert.save();
    res.json({ message: `Alert ${req.body.status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers, totalHospitals, verifiedHospitals,
      totalResponders, verifiedResponders,
      pendingAlerts, totalAlerts,
    ] = await Promise.all([
      User.countDocuments(),
      Hospital.countDocuments(),
      Hospital.countDocuments({ isVerified: true }),
      Responder.countDocuments(),
      Responder.countDocuments({ isVerified: true }),
      Alert.countDocuments({ status: 'Pending' }),
      Alert.countDocuments({ status: 'Approved' }),
    ]);
    const roleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    res.json({
      totalUsers, totalHospitals, verifiedHospitals,
      unverifiedHospitals: totalHospitals - verifiedHospitals,
      totalResponders, verifiedResponders,
      unverifiedResponders: totalResponders - verifiedResponders,
      pendingAlerts, totalAlerts, roleBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHospitalReports = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ 'reports.0': { $exists: true } })
      .select('name location reports reliabilityScore isFlagged');
    const allReports = [];
    hospitals.forEach((h) => {
      h.reports.forEach((r) => {
        allReports.push({
          hospitalId: h._id, hospitalName: h.name, location: h.location,
          reportId: r._id, issue: r.issue, resourceType: r.resourceType,
          reporterName: r.reporterName, createdAt: r.createdAt, resolved: r.resolved,
        });
      });
    });
    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ count: allReports.length, reports: allReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveHospitalReport = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    const report = hospital.reports.id(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.resolved = true;
    await hospital.save();
    res.json({ message: 'Report resolved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers, updateUserRole, toggleSuspend,
  getUnverifiedHospitals, verifyHospital,
  getUnverifiedResponders, verifyResponder,
  getPendingAlerts, moderateAlert,
  getPlatformStats, getHospitalReports, resolveHospitalReport,
};