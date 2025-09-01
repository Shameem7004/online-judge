const Announcement = require('../models/Announcement');
const asyncHandler = require('express-async-handler');

// @desc    Get active announcements
// @route   GET /api/announcements/active
// @access  Public
const getActiveAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Admin
const getAllAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).populate('createdBy', 'username');
    res.json({ success: true, announcements });
});

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Admin
const createAnnouncement = asyncHandler(async (req, res) => {
    const { message, type, isActive } = req.body;
    const announcement = await Announcement.create({
        message,
        type,
        isActive,
        createdBy: req.user._id,
    });
    res.status(201).json({ success: true, announcement });
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
    const { message, type, isActive } = req.body;
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
        announcement.message = message ?? announcement.message;
        announcement.type = type ?? announcement.type;
        announcement.isActive = isActive ?? announcement.isActive;
        const updatedAnnouncement = await announcement.save();
        res.json({ success: true, announcement: updatedAnnouncement });
    } else {
        res.status(404);
        throw new Error('Announcement not found');
    }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);
    if (announcement) {
        await announcement.deleteOne();
        res.json({ success: true, message: 'Announcement removed' });
    } else {
        res.status(404);
        throw new Error('Announcement not found');
    }
});

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};