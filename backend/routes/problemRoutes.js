const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); 
const {
  createProblem,
  getAllProblems,
  getProblemById
} = require('../controllers/problemController');

// Create a problem 
router.post('/createProblems', auth, createProblem);

// Get all problems
router.get('/getAllProblems', getAllProblems);

// Get problem by ID or slug
router.get('/getProblem/:id', getProblemById);

module.exports = router;
