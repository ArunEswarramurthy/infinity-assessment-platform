const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Get overall leaderboard (licensed users only)
router.get('/', leaderboardController.getLeaderboard);

// Get leaderboard by department
router.get('/department/:department', leaderboardController.getLeaderboardByDepartment);

module.exports = router;