const express = require('express');
const router = express.Router();
const adminReportsController = require('../controllers/adminReportsController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

// Get all test reports
router.get('/test-reports', adminReportsController.getTestReports);

// Get admin dashboard
router.get('/dashboard', adminReportsController.getAdminDashboard);

// Get test report details
router.get('/test-reports/:testId/details', adminReportsController.getTestReportDetails);

// Generate test report
router.post('/test-reports/:testId/generate', adminReportsController.generateTestReport);

// Download test report
router.get('/test-reports/:testId/download', adminReportsController.downloadTestReport);

// Regenerate all reports for a test
router.post('/test-reports/:testId/regenerate', adminReportsController.regenerateTestReports);

// Legacy compatibility routes
router.get('/tests/:testId/report', adminReportsController.getTestReportDetails);
router.get('/:testId/report', adminReportsController.getTestReportDetails);

module.exports = router;
