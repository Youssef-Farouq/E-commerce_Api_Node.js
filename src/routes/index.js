const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');
const { authenticateToken } = require('../middleware/auth');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Item routes (protected)
router.get('/items/list', authenticateToken, itemController.listItems);
router.get('/items/details/:id', authenticateToken, itemController.getItemDetails);
router.post('/items/search', authenticateToken, itemController.aiSearch);

module.exports = router; 