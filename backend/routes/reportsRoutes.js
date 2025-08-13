const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const downloadReportsController = require('../controllers/downloadReportsController');

// Get overview statistics
router.get('/overview', reportsController.getOverviewStats);

// Get student performance data
router.get('/student-performance', reportsController.getStudentPerformance);

// Get test analytics
router.get('/test-analytics', reportsController.getTestAnalytics);

// Get test history for admin reports
router.get('/test-history', reportsController.getTestHistory);

// Get recent reports
router.get('/recent', reportsController.getRecentReports);

// Generate new report
router.post('/generate', reportsController.generateReport);

// Get tests in date range
router.get('/tests-in-range', reportsController.getTestsInRange);

// Generate test report
router.get('/test-report/:testId', reportsController.generateTestReport);

// Get live test activity
router.get('/live-activity', reportsController.getLiveActivity);

// Get all test results for admin
router.get('/all-test-results', reportsController.getAllTestResults);

// Get test results for reports page
router.get('/test-results', reportsController.getTestResults);

// Get test results by specific test ID
router.get('/test-results/:testId', reportsController.getTestResultsByTestId);

// Download comprehensive test report
router.get('/download-test-report/:testId', reportsController.downloadTestReport);

// Download assessment report for a test (legacy format)
router.get('/download-assessment/:testId', reportsController.downloadAssessmentReport);

// Download bulk report
router.get('/download-bulk-report', reportsController.downloadBulkReport);

// Download report
router.get('/download/:reportId', reportsController.downloadReport);

// Download detailed report by session ID
router.get('/download/:sessionId/detailed', downloadReportsController.downloadDetailedReport);

// Download assessment report by session ID
router.get('/download/:sessionId/assessment', downloadReportsController.downloadAssessmentReportBySession);

module.exports = router;