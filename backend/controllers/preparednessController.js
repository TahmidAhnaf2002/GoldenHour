const User        = require('../models/userModel');
const Donor       = require('../models/donorModel');
const Responder   = require('../models/responderModel');
const OrganDonor  = require('../models/organDonorModel');
const Hospital    = require('../models/hospitalModel');
const SOS         = require('../models/sosModel');
const Alert       = require('../models/alertModel');
const Lending     = require('../models/lendingModel');

// ── Score actions definition ───────────────────────────────────────────────
const ACTIONS = [
  { id: 'blood_donor',        label: 'Registered as Blood Donor',        points: 20,  icon: '🩸' },
  { id: 'first_responder',    label: 'Registered as First Responder',     points: 25,  icon: '🚑' },
  { id: 'organ_donor',        label: 'Registered as Organ Donor',         points: 20,  icon: '🫀' },
  { id: 'hospital_registered',label: 'Registered a Hospital',             points: 15,  icon: '🏥' },
  { id: 'blood_type_set',     label: 'Blood Type Set in Profile',         points: 5,   icon: '🩸' },
  { id: 'sos_sent',           label: 'Used Emergency SOS System',         points: 10,  icon: '🆘' },
  { id: 'sos_responded',      label: 'Responded to an SOS Emergency',     points: 15,  icon: '🚑' },
  { id: 'alert_reported',     label: 'Reported a Health Alert',           points: 10,  icon: '🦠' },
  { id: 'equipment_lent',     label: 'Listed Equipment for Lending',      points: 10,  icon: '🤝' },
  { id: 'camp_registered',    label: 'Registered for Vaccination Camp',   points: 5,   icon: '💉' },
  { id: 'responder_verified', label: 'First Responder Verified',          points: 10,  icon: '✅' },
  { id: 'organ_family_consent',label: 'Organ Donor with Family Consent',  points: 10,  icon: '👨‍👩‍👧' },
];

const TIERS = [
  { name: 'Bronze',   minScore: 0,   maxScore: 29,  color: '#cd7f32', icon: '🥉' },
  { name: 'Silver',   minScore: 30,  maxScore: 59,  color: '#aaa',    icon: '🥈' },
  { name: 'Gold',     minScore: 60,  maxScore: 89,  color: '#f1c40f', icon: '🥇' },
  { name: 'Platinum', minScore: 90,  maxScore: 999, color: '#2980b9', icon: '💎' },
];

const getTier = (score) => TIERS.find((t) => score >= t.minScore && score <= t.maxScore) || TIERS[0];

// ── Calculate score for a user ─────────────────────────────────────────────
const calculateScore = async (userId, user) => {
  const completed = [];
  let totalScore  = 0;

  const add = (actionId) => {
    const action = ACTIONS.find((a) => a.id === actionId);
    if (action) { completed.push(actionId); totalScore += action.points; }
  };

  // Blood type set
  if (user.bloodType) add('blood_type_set');

  // Blood donor
  const donor = await Donor.findOne({ userId });
  if (donor) add('blood_donor');

  // First responder
  const responder = await Responder.findOne({ user: userId });
  if (responder) {
    add('first_responder');
    if (responder.isVerified) add('responder_verified');
  }

  // Organ donor
  const organDonor = await OrganDonor.findOne({ user: userId });
  if (organDonor && organDonor.isActive) {
    add('organ_donor');
    if (organDonor.familyConsent?.given) add('organ_family_consent');
  }

  // Hospital registered
  const hospital = await Hospital.findOne({ registeredBy: userId });
  if (hospital) add('hospital_registered');

  // SOS sent
  const sosSent = await SOS.findOne({ requester: userId });
  if (sosSent) add('sos_sent');

  // SOS responded
  const sosResponded = await SOS.findOne({ 'responses.responder': responder?._id });
  if (sosResponded) add('sos_responded');

  // Alert reported
  const alert = await Alert.findOne({ postedBy: userId });
  if (alert) add('alert_reported');

  // Equipment lent
  const lending = await Lending.findOne({ lender: userId });
  if (lending) add('equipment_lent');

  return { totalScore, completed, tier: getTier(totalScore) };
};

// @desc    Get my preparedness score
// @route   GET /api/preparedness/me
// @access  Private
const getMyScore = async (req, res) => {
  try {
    const user   = await User.findById(req.user._id);
    const result = await calculateScore(req.user._id, user);

    const allActions = ACTIONS.map((a) => ({
      ...a,
      completed: result.completed.includes(a.id),
    }));

    const maxPossible = ACTIONS.reduce((sum, a) => sum + a.points, 0);

    res.json({
      score:       result.totalScore,
      maxPossible,
      percentage:  Math.round((result.totalScore / maxPossible) * 100),
      tier:        result.tier,
      actions:     allActions,
      completed:   result.completed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get community leaderboard
// @route   GET /api/preparedness/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select('_id name bloodType').limit(100);

    const leaderboard = [];

    for (const user of users) {
      const result = await calculateScore(user._id, user);
      if (result.totalScore > 0) {
        leaderboard.push({
          userId:    user._id,
          name:      user.name,
          score:     result.totalScore,
          tier:      result.tier,
          completed: result.completed.length,
        });
      }
    }

    leaderboard.sort((a, b) => b.score - a.score);
    const top20 = leaderboard.slice(0, 20);

    // Find current user's rank
    const myRank = leaderboard.findIndex(
      (u) => u.userId.toString() === req.user._id.toString()
    ) + 1;

    res.json({ leaderboard: top20, myRank, totalParticipants: leaderboard.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform preparedness stats
// @route   GET /api/preparedness/stats
// @access  Public
const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalDonors, totalResponders, totalOrganDonors] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      Responder.countDocuments(),
      OrganDonor.countDocuments({ isActive: true }),
    ]);

    res.json({
      totalUsers, totalDonors,
      totalResponders, totalOrganDonors,
      actions: ACTIONS,
      tiers:   TIERS,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyScore, getLeaderboard, getPlatformStats };