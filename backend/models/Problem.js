const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  statement: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true
  },
  points: {
    type: Number,
    default: 100,
    min: [0, "Points cannot be negative"]
  },
  topics: [{
    type: String,
    trim: true
  }],
  hints: [{
    text: String,
    pointsRequired: { type: Number, min: 0 }
  }],
  constraints: {
    timeLimit: { type: Number, default: 1000 },
    memoryLimit: { type: Number, default: 256 },
    custom: String
  },
  samples: [{
    input: String,
    output: String,
    explanation: String
  }],
  tags: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submissions: {
    total: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Problem', problemSchema);
