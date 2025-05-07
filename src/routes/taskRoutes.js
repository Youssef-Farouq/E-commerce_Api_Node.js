const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(authenticateToken);

// Task routes
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', validateRequest('createTask'), taskController.createTask);

module.exports = router; 