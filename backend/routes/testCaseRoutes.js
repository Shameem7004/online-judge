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
router.post('/createTestCase/:problemId', auth, createTestcase);

// Get all test cases for a specific problem
router.get('/getAllTestCases/:problemId', getTestcasesByProblem);

// Delete a test case by ID
router.delete('/deleteTestCase/:testcaseId', auth, deleteTestcase);

// Update a test case by ID
router.put('/updateTestCase/:testcaseId', auth, updateTestcase);

module.exports = router;