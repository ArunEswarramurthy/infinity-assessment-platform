const express = require('express');
const router = express.Router();
const testStartController = require('../controllers/testStartController');
const testCompletionController = require('../controllers/testCompletionController');
const autoSaveController = require('../controllers/autoSaveController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { csrfProtection } = require('../middlewares/csrfMiddleware');
const { sanitizeForLog } = require('../utils/security');
const { TestSession } = require('../models');

// GET /api/student/tests/assigned
// Delegate to student dashboard controller via a small proxy for backward compatibility
router.get('/assigned', authenticateUser, async (req, res) => {
  try {
    // Expect authenticated user id on req.user.id
    const studentId = req.user?.id || req.query.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Missing studentId' });
    }

    // Reuse existing controller by calling studentDashboard route internally would be roundabout.
    // Instead, hit studentDashboardController directly if needed. For now, instruct clients to use
    // /api/student-dashboard/dashboard/:studentId for richer payload.
    return res.redirect(307, `/api/student-dashboard/dashboard/${studentId}`);
  } catch (error) {
    console.error('Error getting assigned tests:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to get assigned tests' });
  }
});

// POST /api/student/tests/:testId/start
router.post('/:testId/start', authenticateUser, csrfProtection, async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user?.id || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Missing studentId' });
    }

    req.body.testId = testId;
    req.body.studentId = studentId;
    return testStartController.startTest(req, res);
  } catch (error) {
    console.error('Error starting student test:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to start test' });
  }
});

// POST /api/student/tests/:testId/submit
router.post('/:testId/submit', authenticateUser, csrfProtection, async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user?.id || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Missing studentId' });
    }

    // Find the session for this (student, test)
    const session = await TestSession.findOne({ where: { testId, studentId } });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Test session not found' });
    }

    // If already completed or auto-submitted, respond idempotently
    if (['completed', 'submitted', 'auto-submitted'].includes(session.status)) {
      return res.json({
        success: true,
        message: 'Test already submitted',
        sessionId: session.id,
        totalScore: session.totalScore,
        maxScore: session.maxScore,
        status: session.status,
        completedAt: session.completedAt
      });
    }

    // Adapt body for completeTest: expects { sessionId, sectionScores, answers }
    req.body.sessionId = session.id;
    return testCompletionController.completeTest(req, res);
  } catch (error) {
    console.error('Error submitting student test:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to submit test' });
  }
});

// POST /api/student/tests/:testId/autosubmit
router.post('/:testId/autosubmit', authenticateUser, csrfProtection, async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user?.id || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Missing studentId' });
    }

    const session = await TestSession.findOne({ where: { testId, studentId } });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Test session not found' });
    }

    const result = await require('../controllers/testCompletionController').autoSubmitTest(session.id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error || 'Auto-submit failed' });
    }

    return res.json({ success: true, sessionId: session.id, totalScore: result.totalScore });
  } catch (error) {
    console.error('Error auto-submitting student test:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to auto-submit test' });
  }
});

// POST /api/attempts/:attemptId/save (alias)
router.post('/attempts/:attemptId/save', authenticateUser, csrfProtection, async (req, res) => {
  try {
    // Map attemptId -> sessionId
    req.body.sessionId = req.params.attemptId;
    return autoSaveController.saveAnswers(req, res);
  } catch (error) {
    console.error('Error saving attempt state:', sanitizeForLog(error.message));
    res.status(500).json({ success: false, error: 'Failed to save attempt state' });
  }
});

module.exports = router;
