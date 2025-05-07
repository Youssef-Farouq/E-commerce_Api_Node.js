const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', validateRequest('register'), authController.register);
router.post('/login', validateRequest('login'), authController.login);
router.post('/refresh-token', validateRequest('refreshToken'), authController.refreshToken);
router.post('/revoke-token', validateRequest('revokeToken'), authController.revokeToken);
router.post('/forgot-password', validateRequest('forgotPassword'), authController.forgotPassword);
router.post('/reset-password', validateRequest('resetPassword'), authController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, validateRequest('changePassword'), authController.changePassword);

module.exports = router; 