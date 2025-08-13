const express = require('express');
const router = express.Router();
const testSessionController = require('../controllers/testSessionController');
const { enforceOneTimeTestRestriction, enforceTestSessionRestriction } = require('../middlewares/oneTimeTestMiddleware');

// Check if student can take a test
router.get('/:testId/:studentId/eligibility', enforceOneTimeTestRestriction, testSessionController.checkTestEligibility);

// Start a new test session - CRITICAL: Protected by one-time restriction middleware
router.post('/start', enforceTestSessionRestriction, testSessionController.startTestSession);

// Get current section for student
router.get('/:testId/:studentId/current', testSessionController.getCurrentSection);

// Submit current section
router.post('/:testId/:studentId/submit', testSessionController.submitSection);

// Get test results
router.get('/:testId/:studentId/results', testSessionController.getTestResults);

module.exports = router;