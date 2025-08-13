const express = require('express');
const router = express.Router();
const testStartController = require('../controllers/testStartController');
const { enforceOneTimeTestRestriction } = require('../middlewares/oneTimeTestMiddleware');

// Start test with restrictions
router.post('/start', enforceOneTimeTestRestriction, testStartController.startTest);

module.exports = router;