const express = require('express');
const router = express.Router();
const cleanupController = require('../controllers/cleanupController');

// Get database statistics
router.get('/stats', cleanupController.getDataStats);

// Clear all test data (use with caution)
router.delete('/clear-all', cleanupController.clearAllTestData);

module.exports = router;