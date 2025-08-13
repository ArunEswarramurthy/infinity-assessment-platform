const express = require('express');
const router = express.Router();
const codeTestController = require('../controllers/codeTestController');

// Test code execution
router.post('/test', codeTestController.testCode);

// Get compiler status
router.get('/compilers', codeTestController.getCompilerStatus);

module.exports = router;