const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/items', itemController.listItems);
router.get('/items/:id', itemController.getItemDetails);

// Protected routes
router.post('/items/search', authenticateToken, validateRequest('aiSearch'), itemController.aiSearch);

module.exports = router; 