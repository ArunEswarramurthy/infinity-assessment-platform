const express = require('express');
const router = express.Router();
const adminTestController = require('../controllers/adminTestController');

// Create and assign test
router.post('/create-and-assign', adminTestController.createAndAssignTest);

// Get test overview
router.get('/overview/:testId', adminTestController.getTestOverview);

// Auto-generate reports
router.post('/auto-generate-reports', adminTestController.autoGenerateReports);

// Live test monitoring
router.get('/live-monitoring', adminTestController.getLiveTestMonitoring);

module.exports = router;