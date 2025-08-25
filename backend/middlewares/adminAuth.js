const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const adminAuth = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in Authorization header (for frontend API calls) or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Get user from the token and check their role
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        if (user.role !== 'admin') {
            res.status(403);
            throw new Error('Forbidden: Access denied. Requires admin privileges.');
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin auth error:', error.message);
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

module.exports = adminAuth;
