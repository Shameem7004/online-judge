const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  createTestcase,
  getTestcasesByProblem,
  deleteTestcase,
  updateTestcase
} = require('../controllers/testCaseController');

// Create a test case for a specific problem
router.post('/:problemId', auth, createTestcase);

// Get all test cases for a specific problem
router.get('/:problemId', getTestcasesByProblem);

// Delete a test case by ID
router.delete('/:testcaseId', auth, deleteTestcase);

// Update a test case by ID
router.put('/:testcaseId', auth, updateTestcase);

module.exports = router;