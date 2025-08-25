const express = require('express');
const router = express.Router({ mergeParams: true }); 
const testCaseController = require('../controllers/testCaseController');
const adminAuth = require('../middlewares/adminAuth');

// Get all testcases for a problem
router.get('/', adminAuth, testCaseController.getTestcases);

// Add a testcase to a problem
router.post('/', adminAuth, testCaseController.createTestcase);

// Update a testcase
router.put('/:testcaseId', adminAuth, testCaseController.updateTestcase);

// Delete a testcase
router.delete('/:testcaseId', adminAuth, testCaseController.deleteTestcase);

module.exports = router;