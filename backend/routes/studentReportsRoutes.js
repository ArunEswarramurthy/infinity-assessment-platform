const express = require('express');
const router = express.Router();
const studentReportsController = require('../controllers/studentReportsController');

// Get comprehensive student reports
router.get('/reports/:studentId', studentReportsController.getStudentReports);

// Get student test history
router.get('/test-history/:studentId', studentReportsController.getStudentTestHistory);

// Download individual test report
router.get('/download-report/:sessionId', studentReportsController.downloadTestReport);

// Download overall performance report
router.get('/overall-report/:studentId', studentReportsController.downloadOverallReport);

module.exports = router;