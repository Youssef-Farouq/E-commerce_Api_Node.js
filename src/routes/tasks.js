const express = require('express');
const router = express.Router();
const { createTask } = require('../controllers/tasksController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// Create a new task
router.post('/', createTask);

module.exports = router; 