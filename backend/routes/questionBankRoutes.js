const express = require('express');
const router = express.Router();
const questionBankController = require('../controllers/questionBankController');

router.post('/save-to-bank', questionBankController.saveToBank);
router.get('/get-from-bank', questionBankController.getFromBank);

module.exports = router;