const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Resgisteration part
const registerUser = async (req, res) => {
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

        //Hash Password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword, 
            username
        });

        const token = jwt.sign(
            {
            id: user._id, 
            email: user.email,
            },
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
            createdAt: user.createdAt
        };

        return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            user: userResponse,
            // token: token // in ES6 and later we don't have to write like this if object key and variable name is same.
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
            // find email
            user = await User.findOne({email: email.toLowerCase()});
        } else if(username){
            // find username
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
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: 'Wrong password'
            })
        }

        const token = jwt.sign(
            {
            id: user._id, 
            email: user.email,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '24h'
            }
        );

        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        const userResponse = {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
        };

        return res.status(200)
        .cookie("token", token, cookieOptions)
        .json({
            success: true,
            message: 'Login successful!',
            user: userResponse,
            token
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
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
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
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { _id, firstname, lastname, username, email, createdAt } = req.body;
        res.status(200).json({
            id: _id,
            firstname,
            lastname,
            username,
            email,
            createdAt
        });

    } catch(error){
        console.error("Error in fetching user's detail", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
};