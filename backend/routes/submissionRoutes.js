const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); 
const {
  createSubmission,
  getAllSubmissions,
  getSubmissionById
} = require('../controllers/submissionController');


// Create a new submission
router.post('/createSubmission', auth, createSubmission);

// Get all submissions
router.get('/getAllSubmissions', getAllSubmissions);

// Get specific submission
router.get('/getSubmission/:id', getSubmissionById);

module.exports = router;
