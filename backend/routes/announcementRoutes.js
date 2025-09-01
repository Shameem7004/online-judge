const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');

// Public route
router.get('/active', getActiveAnnouncements);

// Admin routes
router.route('/')
    .get(adminAuth, getAllAnnouncements)
    .post(adminAuth, createAnnouncement);

router.route('/:id')
    .put(adminAuth, updateAnnouncement)
    .delete(adminAuth, deleteAnnouncement);

module.exports = router;