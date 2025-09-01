const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    reason: {
        type: String,
        required: [true, "An appeal reason is required."],
        trim: true,
        minlength: [20, "Your reason must be at least 20 characters long."],
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending',
        index: true,
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

module.exports = mongoose.model('Appeal', appealSchema);