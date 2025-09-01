const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getSubmissionsGroupedByUser,
    deleteUser,
    toggleUserFlag,
    deleteSubmission,
    toggleSubmissionFlag,
} = require('../controllers/adminController');

// FIX: Import the single, reliable adminAuth middleware
const adminAuth = require('../middlewares/adminAuth');

// All routes in this file are protected and require admin access
router.use(adminAuth);

// Define the specific routes
router.get('/dashboard-stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/flag', toggleUserFlag);

// Submission management
router.get('/submissions/grouped', getSubmissionsGroupedByUser);
router.delete('/submissions/:id', deleteSubmission);
router.put('/submissions/:id/flag', toggleSubmissionFlag);


module.exports = router;