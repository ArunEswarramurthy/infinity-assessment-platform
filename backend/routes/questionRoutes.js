const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Get all questions
router.get('/', questionController.getAllQuestions);

// Update question
router.put('/:id', questionController.updateQuestion);

// Delete question
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;