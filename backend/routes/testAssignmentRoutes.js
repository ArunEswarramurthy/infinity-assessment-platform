const express = require('express');
const router = express.Router();
const testAssignmentController = require('../controllers/testAssignmentController');

// Assign test to students/departments
router.post('/assign/:testId', testAssignmentController.assignTestToStudents);

// Get assigned tests for a student
router.get('/student/:studentId', testAssignmentController.getAssignedTestsForStudent);

// Get all test assignments (admin view)
router.get('/all', testAssignmentController.getAllTestAssignments);

// Auto-generate reports for expired tests
router.post('/auto-generate-reports', testAssignmentController.autoGenerateReports);

// Remove test assignment
router.delete('/:assignmentId', testAssignmentController.removeTestAssignment);

module.exports = router;