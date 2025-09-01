const Appeal = require('../models/Appeal');
const asyncHandler = require('express-async-handler');

// @desc    Create a new appeal
// @route   POST /appeals
// @access  Private (Flagged Users)
const createAppeal = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const user = req.user;

    if (!user.isFlagged) {
        res.status(400);
        throw new Error('Only flagged users can submit an appeal.');
    }

    const existingAppeal = await Appeal.findOne({ user: user._id, status: 'pending' });
    if (existingAppeal) {
        res.status(400);
        throw new Error('You already have a pending appeal.');
    }

    const appeal = await Appeal.create({ user: user._id, reason });
    res.status(201).json({ success: true, message: 'Appeal submitted successfully.', appeal });
});

// @desc    Get the current user's appeal status
// @route   GET /appeals/status
// @access  Private
const getMyAppealStatus = asyncHandler(async (req, res) => {
    const appeal = await Appeal.findOne({ user: req.user._id, status: 'pending' });
    res.json({ success: true, hasPendingAppeal: !!appeal });
});

module.exports = { createAppeal, getMyAppealStatus };