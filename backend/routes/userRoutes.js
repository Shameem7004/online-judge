const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.js')
const {registerUser, loginUser, logoutUser, getCurrentUser} = require('../controllers/userController.js');

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', logoutUser);

// get current user
// router.get('/profile', auth, getCurrentUser);
router.get('/profile', getCurrentUser);



module.exports = router;