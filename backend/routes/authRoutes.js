const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public routes
router.post('/google', authController.googleLogin);
router.post('/login', authController.standardLogin);

// Protected routes
router.get('/me', authenticateUser, authController.getMe);
router.get('/verify', authenticateUser, authController.getMe); // Alias for verify

module.exports = router;