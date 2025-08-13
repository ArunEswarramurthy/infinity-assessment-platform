const express = require('express');
const router = express.Router();
const autoSaveController = require('../controllers/autoSaveController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Save test answers
router.post('/save', authenticateUser, autoSaveController.saveAnswers);

// Start auto-save for a test session
router.post('/start', authenticateUser, autoSaveController.startAutoSave);

// Stop auto-save for a test session
router.post('/stop', authenticateUser, autoSaveController.stopAutoSave);

// Get last saved state for a test session
router.get('/state/:sessionId', authenticateUser, autoSaveController.getLastSavedState);

module.exports = router;
