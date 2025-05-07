const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/refresh-token', validate(schemas.refreshToken), authController.refreshToken);

// Protected routes
router.post('/revoke-token', authenticateToken, validate(schemas.refreshToken), authController.revokeToken);

module.exports = router; 