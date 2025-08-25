const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth'); // Ensure adminAuth is imported
const {
    createContest,
    getAllContests,
    getContestDetails,
    registerForContest,
    getContestLeaderboard,
    updateContest, // 1. Import update
    deleteContest  // 2. Import delete
} = require('../controllers/contestController');

// 2. Change 'auth' to 'adminAuth' to secure this route
router.post('/', adminAuth, createContest);
router.get('/', getAllContests);
router.get('/:id', getContestDetails);
router.post('/:id/register', auth, registerForContest);

// 2. Add the new public route for the leaderboard
router.get('/:id/leaderboard', getContestLeaderboard);

// 3. Add the new admin-only routes
router.put('/:id', adminAuth, updateContest);
router.delete('/:id', adminAuth, deleteContest);

module.exports = router;