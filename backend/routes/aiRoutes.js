const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { analyzeSubmission } = require('../controllers/aiController');

// The submissionId parameter will be in the URL
router.post('/:submissionId/analyze', auth, analyzeSubmission);

module.exports = router;