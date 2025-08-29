// backend/controllers/userController.js

const User = require('../models/User');
const Submission = require('../models/Submission');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Resgisteration part
const registerUser = async (req, res) => {

    console.log("I m inside register controller in bacnkend")
    try{
        const { firstname, lastname, email, password, username } = req.body;
        if(!(firstname && lastname && email && password && username)) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if(existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }
       
       
        //hashing the password in userSchema using pre-save hook, so that I can validate the password before saving it.
        //Hash Password
        // const saltRounds = 12;
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            firstname,
            lastname,
            email,
            password, 
            username
        });

        const token = jwt.sign(
            {
            id: user._id, 
            email: user.email,
            },
            // CHANGE: Use the correct environment variable name from your .env file
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '24h'
            }
        );

        const userResponse = {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            role: user.role, // <-- FIX: Add the role property
            createdAt: user.createdAt
        };

        return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            user: userResponse,
            token
        });

    } catch(error){
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
};

// Login Part
const loginUser = async (req, res) => {
    try{
        const { email, password, username } = req.body;
        
        if(!password){
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }
        
        let user;
        if(email){
            user = await User.findOne({email: email.toLowerCase()});
        } else if(username){
            user = await User.findOne({ username: username.trim()});
        } else {
            return res.status(400).json({
                success: false,
                message: 'Please provide either email or username'
            });
        }

        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        const userResponse = {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            role: user.role, // <-- FIX: Add the role property
            createdAt: user.createdAt
        };

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }).status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: userResponse
        });

    } catch(error){
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};

// Logout part
const logoutUser = (req, res) => {
    // ... (Your logout code is perfect, no changes needed)
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Corrected '==' to '===' for strict equality
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
        // PREVIOUSLY: The logic was trying to read from req.body and was missing a check for req.user
        // CHANGE: The auth middleware already attaches the user to `req.user`. We just need to use it.
        // This is much simpler and more secure.

        // The auth middleware has already found the user and attached it to req.user.
        const user = req.user;

        // We create a safe response object without the password.
        const userResponse = {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            role: user.role
        };

        res.status(200).json({
            success: true,
            user: userResponse
        });

    } catch(error){
        console.error("Error in fetching user's detail", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


// GET Leaderboard
const getLeaderboard = async (req, res) => {
    try {
        // FIX: Use an aggregation pipeline to calculate stats
        const leaderboard = await User.aggregate([
            // Start with all users
            { $match: {} },
            // Get the number of contests each user has participated in
            {
                $lookup: {
                    from: 'contests',
                    localField: '_id',
                    foreignField: 'participants',
                    as: 'attendedContests'
                }
            },
            // Sort by totalPoints in descending order
            { $sort: { totalPoints: -1 } },
            // Limit to the top 100 users for performance
            { $limit: 100 },
            // Shape the final output
            {
                $project: {
                    _id: 1,
                    username: 1,
                    totalPoints: 1,
                    contestsAttended: { $size: '$attendedContests' } // Calculate the size of the array
                }
            }
        ]);

        res.status(200).json({ success: true, leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Register a new admin user
// @route   POST /api/users/register-admin
// @access  Private (requires secret key)
const registerAdmin = async (req, res) => {
    const { firstname, lastname, email, password, username, adminSecretKey } = req.body;

    // 1. Validate the secret key
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: 'Not authorized to create an admin.' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Admin with this email already exists.' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user with 'admin' role
    const user = await User.create({
        firstname,
        lastname,
        email,
        username,
        password: hashedPassword,
        role: 'admin' // Assign the admin role
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            message: 'Admin user created successfully.'
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get a user's public profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -email'); // Exclude sensitive fields

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch submission stats
        const totalSubmissions = await Submission.countDocuments({ user: user._id });
        const acceptedSubmissions = await Submission.countDocuments({ user: user._id, verdict: 'Accepted' });

        // Find unique problems solved
        const solvedProblems = await Submission.distinct('problem', { user: user._id, verdict: 'Accepted' });

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                createdAt: user.createdAt,
                stats: {
                    totalSubmissions,
                    acceptedSubmissions,
                    problemsSolved: solvedProblems.length
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// to update the user's profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        // We only allow updating these specific fields for security
        const { firstname, lastname, bio, location, website, github, linkedin } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstname, lastname, bio, location, website, github, linkedin },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        ).select('-password'); // Exclude the password from the returned object

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: 'Server error while updating profile' });
    }
};


// REMOVE any getMySubmissions or getSubmissionsForUser logic from here
// Only keep user-related logic
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