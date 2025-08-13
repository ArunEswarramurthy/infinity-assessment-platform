const express = require('express');
const router = express.Router();
const testCompletionController = require('../controllers/testCompletionController');

// Complete test with auto report generation
router.post('/complete', testCompletionController.completeTest);

module.exports = router;