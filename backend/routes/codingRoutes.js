const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');

// Dry run code with sample test cases
router.post('/dry-run', codingController.dryRunCode);

// Submit code for evaluation
router.post('/submit', codingController.submitCode);

// Get submission results
router.get('/submission/:submissionId', codingController.getSubmissionResults);

// Get student submissions for a test
router.get('/submissions/:testId/:studentId', codingController.getStudentSubmissions);

// Execute code with custom input
router.post('/execute-custom', codingController.executeWithCustomInput);

// Check compiler availability
router.get('/check-compilers', codingController.checkCompilers);

module.exports = router;