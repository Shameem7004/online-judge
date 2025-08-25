const express = require('express');
const router = express.Router();
const { auth, limiter } = require('../middlewares/auth.js');
const {
    registerUser, loginUser, logoutUser, getCurrentUser, getLeaderboard, getUserProfile, updateUserProfile
} = require('../controllers/userController.js');
const { getSubmissionsForUser } = require('../controllers/submissionController.js'); 

// Apply rate limiting to auth routes
router.post('/register', limiter, registerUser);
//router.post('/register-admin', limiter, registerAdmin); 

router.post('/login', limiter, loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/profile', auth, getCurrentUser);
router.get('/leaderboard', getLeaderboard);

// Update user profile
router.put('/profile', auth, updateUserProfile);

// 2. Add the new public route for user profiles
router.get('/:username', getUserProfile);

module.exports = router;