const { Timestamp } = require('bson');
const { timeStamp } = require('console');
const mongoose = require('mongoose');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least of 2 characters."],
        maxlength: [50, "First name cannot exceed 50 characters."]
    },
    lastname: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [2, "Last name must be at least of 2 characters."],
        maxlength: [50, "Last name cannot exceed 50 characters."]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowecase: true,
        trim: true,
        validate: {
            validator: function(email){
                // Email validation using regex
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: "Please enter a valid email address."
            }
        },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        validate: {
            validator: function(password){
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password);    
            },
            message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
        }
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true
    },

    // for role-based authorization
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }

    // will implemet in later stage
    
    // solvedProblems: [{
    
    // }],

    // totalPoints: {

    // },

    // streak: {

    // },

    // Add timestamp fields for tracking when user was created/updated
    }, {
        timestamps: true

});

module.exports = mongoose.model('User', userSchema);