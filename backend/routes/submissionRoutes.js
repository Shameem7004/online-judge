const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); 
const {
  createSubmission,
  getAllSubmissions,
  getSubmissionById
} = require('../controllers/submissionController');


// Create a new submission
router.post('/', auth, createSubmission);

// Get all submissions
router.get('/', getAllSubmissions);

// Get specific submission
router.get('/:id', getSubmissionById);

module.exports = router;
