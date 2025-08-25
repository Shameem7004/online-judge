const User = require('../models/User');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    const now = new Date();
    const activeContests = await Contest.countDocuments({
        startTime: { $lte: now },
        endTime: { $gt: now }
    });

    res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            totalProblems,
            activeContests,
            totalSubmissions,
        }
    });
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: users.length,
        users,
    });
});

// @desc    Get all submissions
// @route   GET /api/v1/admin/submissions
// @access  Private/Admin
const getAllSubmissions = asyncHandler(async (req, res) => {
    const submissions = await Submission.find({})
        .populate('user', 'username')
        .populate('problem', 'name')
        .sort({ createdAt: -1 })
        .limit(100); // Limit to recent 100 to avoid performance issues

    res.status(200).json({
        success: true,
        count: submissions.length,
        submissions,
    });
});

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllSubmissions,
};