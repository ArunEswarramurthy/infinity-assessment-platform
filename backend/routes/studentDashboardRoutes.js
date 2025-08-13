const express = require('express');
const router = express.Router();
const studentDashboardController = require('../controllers/studentDashboardController');

// Get dashboard data for a student
router.get('/dashboard/:studentId', studentDashboardController.getStudentDashboard);

module.exports = router;