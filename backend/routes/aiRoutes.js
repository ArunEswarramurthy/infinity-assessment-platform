const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate-quiz', aiController.generateQuiz);
router.post('/save-as-sample', aiController.saveAsSample);

module.exports = router;