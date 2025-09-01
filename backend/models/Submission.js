const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    code: {
        type: String,
        required: [true, 'Code is required']
    },
    language: {
        type: String,
        enum: ['cpp', 'python', 'javascript', 'java'],
        required: [true, 'Language is required']
    },
    verdict: {
        type: String,
        enum: [
            'Pending',
            'Accepted', 
            'Wrong Answer', 
            'Time Limit Exceeded', 
            'Memory Limit Exceeded', 
            'Runtime Error', 
            'Compilation Error'
        ],
        default: 'Pending'
    },
    isFlagged: { // Add this field
        type: Boolean,
        default: false
    },
    executionTime: {
        type: Number,
        min: 0
    },
    memoryUsed: {
        type: Number,
        min: 0
    },
    testCaseResults: [{
        passed: Boolean,
        input: String,
        expectedOutput: String,
        userOutput: String,
        executionTime: {type: Number, min: 0}
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);