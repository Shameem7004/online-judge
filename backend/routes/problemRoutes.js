// backend/routes/problemRoutes.js

const express = require('express');
const router = express.Router();
const {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem
} = require('../controllers/problemController');
const adminAuth = require('../middlewares/adminAuth');
const testCaseRoutes = require('./testCaseRoutes');


// 1. Specific routes first
router.get('/daily', require('../controllers/dailyProblemController').getDailyProblem);
router.post('/', adminAuth, createProblem);
router.get('/', getAllProblems);

// 2. Nested routes
router.use('/:problemId/testcases', testCaseRoutes);

// 3. Dynamic routes last
router.get('/:slug', getProblemById);
router.put('/:id', adminAuth, updateProblem);
router.delete('/:id', adminAuth, deleteProblem);

module.exports = router;