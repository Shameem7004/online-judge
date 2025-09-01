// backend/controllers/userController.js

const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A helper function to create a consistent user response object with real-time stats
const createUserResponse = async (user) => {
    if (!user) return null;

    try {
        // Calculate total points from unique accepted submissions
        const acceptedSubmissions = await Submission.find({ 
            user: user._id, 
            verdict: 'Accepted' 
        }).distinct('problem');
        
        const problems = await Problem.find({ _id: { $in: acceptedSubmissions } });
        const totalPoints = problems.reduce((sum, problem) => sum + (problem.points || 0), 0);

        // Update user's totalPoints in database for consistency
        await User.findByIdAndUpdate(user._id, { totalPoints }, { new: true });

        return {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            role: user.role,
            isFlagged: user.isFlagged,
            flagReason: user.flagReason,
            createdAt: user.createdAt,
            socialLinks: user.socialLinks,
            totalPoints: totalPoints, // Real-time calculated points
        };
    } catch (error) {
        console.error('Error calculating user stats:', error);
        // Fallback to stored totalPoints if calculation fails
        return {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            role: user.role,
            isFlagged: user.isFlagged,
            flagReason: user.flagReason,
            createdAt: user.createdAt,
            socialLinks: user.socialLinks,
            totalPoints: user.totalPoints || 0,
        };
    }
};

// Registration part
const registerUser = async (req, res) => {
    try{
        const { firstname, lastname, email, password, username } = req.body;
        if(!(firstname && lastname && email && password && username)) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // FIX: Check for existing email first
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if(existingEmail) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        // FIX: Then check for existing username
        const existingUsername = await User.findOne({ username });
        if(existingUsername) {
            return res.status(400).json({ success: false, message: 'This username is already taken.' });
        }

        const user = await User.create({
            firstname,
            lastname,
            email,
            password, 
            username
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: await createUserResponse(user)
        });

    } catch(error){
        // FIX: Handle Mongoose validation errors for specific feedback (e.g., password complexity)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(' ') });
        }
        console.error('Registration error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// Login Part
const loginUser = async (req, res) => {
    try{
        const { email, username, password } = req.body;
        if(!((email || username) && password)) {
            return res.status(400).json({ success: false, message: 'Email/Username and password are required' });
        }

        const user = await User.findOne({ $or: [{ email }, { username }] });
        if(!user) {
            // FIX: Provide specific error for non-existent user
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            // FIX: Provide specific error for incorrect password
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: await createUserResponse(user)
        });

    } catch(error){
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Logout part
const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// to get info of logged in user.
const getCurrentUser = async (req, res) => {
    try{
        const user = req.user;
        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            user: await createUserResponse(user)
        });
    } catch(error){
        console.error('Get current user error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET Leaderboard - Updated to use the same calculation logic
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.aggregate([
            {
                $lookup: {
                    from: 'submissions',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'userSubmissions'
                }
            },
            { $unwind: { path: '$userSubmissions', preserveNullAndEmptyArrays: true } },
            { $match: { 'userSubmissions.verdict': 'Accepted' } },
            {
                $group: {
                    _id: {
                        userId: '$_id',
                        problemId: '$userSubmissions.problem'
                    },
                    problem: { $first: '$userSubmissions.problem' },
                    username: { $first: '$username' }
                }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: 'problem',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },
            { $unwind: '$problemDetails' },
            {
                $group: {
                    _id: '$_id.userId',
                    username: { $first: '$username' },
                    score: { $sum: '$problemDetails.points' }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 50 }
        ]);

        res.status(200).json({
            success: true,
            leaderboard: leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// to update the user's profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.firstname = req.body.firstname || user.firstname;
            user.lastname = req.body.lastname || user.lastname;
            
            if (req.body.socialLinks) {
                user.socialLinks = {
                    github: req.body.socialLinks.github || '',
                    linkedin: req.body.socialLinks.linkedin || '',
                    leetcode: req.body.socialLinks.leetcode || '',
                    codeforces: req.body.socialLinks.codeforces || '',
                    codechef: req.body.socialLinks.codechef || '',
                };
            }

            const updatedUser = await user.save();
            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: await createUserResponse(updatedUser)
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get a user's public profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: await createUserResponse(user)
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Register a new admin user
const registerAdmin = async (req, res) => {
    const { firstname, lastname, email, password, username, adminSecretKey } = req.body;

    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid admin secret key' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
        firstname,
        lastname,
        email,
        username,
        password,
        role: 'admin'
    });

    if (user) {
        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: await createUserResponse(user)
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid user data' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getLeaderboard,
    registerAdmin, 
    getUserProfile, 
    updateUserProfile
};