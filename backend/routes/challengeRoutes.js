const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
// const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', challengeController.getAllChallenges);
router.get('/:id', challengeController.getChallengeById);

module.exports = router;