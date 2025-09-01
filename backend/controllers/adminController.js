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

// @desc    Get all submissions grouped by user
// @route   GET /api/v1/admin/submissions/grouped
// @access  Private/Admin
const getSubmissionsGroupedByUser = asyncHandler(async (req, res) => {
    const submissions = await Submission.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$user",
                submissions: { $push: "$$ROOT" },
                submissionCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $project: {
                user: { $first: "$userDetails" },
                submissions: "$submissions",
                submissionCount: 1,
                _id: 0
            }
        },
        { $sort: { "user.createdAt": -1 } }
    ]);

    res.status(200).json({ success: true, data: submissions });
});


// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        // Optional: Also delete all submissions by this user
        // await Submission.deleteMany({ user: user._id });
        await user.deleteOne();
        res.json({ success: true, message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle a user's flagged status
// @route   PUT /api/v1/admin/users/:id/flag
// @access  Private/Admin
const toggleUserFlag = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.isFlagged = !user.isFlagged;
        await user.save();
        res.json({ success: true, isFlagged: user.isFlagged });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete a submission
// @route   DELETE /api/v1/admin/submissions/:id
// @access  Private/Admin
const deleteSubmission = asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id);
    if (submission) {
        await submission.deleteOne();
        res.json({ success: true, message: 'Submission removed' });
    } else {
        res.status(404);
        throw new Error('Submission not found');
    }
});

// @desc    Toggle a submission's flagged status
// @route   PUT /api/v1/admin/submissions/:id/flag
// @access  Private/Admin
const toggleSubmissionFlag = asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id);
    if (submission) {
        submission.isFlagged = !submission.isFlagged;
        await submission.save();
        res.json({ success: true, isFlagged: submission.isFlagged });
    } else {
        res.status(4404);
        throw new Error('Submission not found');
    }
});


module.exports = {
    getDashboardStats,
    getAllUsers,
    getSubmissionsGroupedByUser,
    deleteUser,
    toggleUserFlag,
    deleteSubmission,
    toggleSubmissionFlag,
};