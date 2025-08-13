// routes/answerRoutes.js
const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Save individual answer
router.post('/save', answerController.saveAnswer);

// Submit all test answers
router.post('/submit', answerController.submitTestAnswers);

// Get answers for a test session
router.get('/:testSessionId', answerController.getTestAnswers);

module.exports = router;