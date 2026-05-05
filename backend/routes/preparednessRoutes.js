const express = require('express');
const router  = express.Router();
const { getMyScore, getLeaderboard, getPlatformStats } = require('../controllers/preparednessController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats',       getPlatformStats);
router.get('/me',          protect, getMyScore);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;