const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  initiateSubmission,
  streamSubmissionResults,
  getAllSubmissions,
  getSubmissionById,
  getMySubmissions
} = require('../controllers/submissionController');

//  This route now only initiates the submission
router.post('/', auth, initiateSubmission);

// NEW: This route streams the results
router.get('/stream/:id', auth, streamSubmissionResults);

// Get all submissions for the logged-in user
router.get('/', auth, getAllSubmissions);

// Get all submissions for the logged-in user (alternative route)
router.get('/me', auth, getMySubmissions);

// Get a specific submission by its ID
router.get('/:id', auth, getSubmissionById);

module.exports = router;