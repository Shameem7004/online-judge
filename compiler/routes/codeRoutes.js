const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/codeController');

// route to run
router.post('/run', runCode);

module.exports = router;
