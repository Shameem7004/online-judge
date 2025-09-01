const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { createAppeal, getMyAppealStatus } = require('../controllers/appealController');

// All routes in this file require a logged-in user
router.use(auth);

router.route('/')
    .post(createAppeal);

router.route('/status')
    .get(getMyAppealStatus);

module.exports = router;