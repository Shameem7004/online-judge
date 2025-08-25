const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContestLeaderboardSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    totalTime: { // Total time in seconds from contest start
        type: Number,
        default: 0,
    },
    problemsSolved: [{
        problem: {
            type: Schema.Types.ObjectId,
            ref: 'Problem',
        },
        submissionTime: { // Seconds from contest start
            type: Number,
        },
        penalty: { // Penalty in seconds
            type: Number,
            default: 0,
        }
    }]
}, { _id: false });

const ContestSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem',
    }],
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    leaderboard: [ContestLeaderboardSchema],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Contest', ContestSchema);