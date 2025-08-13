const express = require('express');
const router = express.Router();
const testTimerController = require('../controllers/testTimerController');

// Get countdown timer for test
router.get('/countdown/:testId', testTimerController.getCountdown);

// Check if reports can be generated
router.get('/report-availability/:testId', testTimerController.checkReportAvailability);

module.exports = router;