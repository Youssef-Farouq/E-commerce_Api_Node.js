const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const itemRoutes = require('./itemRoutes');

// Auth routes
router.use('/auth', authRoutes);

// Item routes
router.use('/api', itemRoutes);

module.exports = router; 