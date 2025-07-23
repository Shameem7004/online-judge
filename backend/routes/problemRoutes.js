// backend/routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); 
const {
  createProblem,
  getAllProblems,
  getProblemById
} = require('../controllers/problemController');

// Create a problem 
// router.post('/', auth, createProblem);
router.post('/', auth, createProblem);

// Get all problems
router.get('/', getAllProblems);

// Get problem by ID or slug
router.get('/:id', getProblemById);

module.exports = router;
