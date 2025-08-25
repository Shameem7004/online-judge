const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getAllSubmissions,
} = require('../controllers/adminController');

// FIX: Import the single, reliable adminAuth middleware
const adminAuth = require('../middlewares/adminAuth');

// All routes in this file are protected and require admin access
router.use(adminAuth);

// Define the specific routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/submissions', getAllSubmissions);

module.exports = router;