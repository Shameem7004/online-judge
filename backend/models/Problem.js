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
  },
  points: {
    type: Number,
    required: true,
  },
  topics: [{
    type: String,
    trim: true
  }],
  constraints: {
    timeLimit: { type: Number, default: 1000 },
    memoryLimit: { type: Number, default: 256 },
    custom: String
  },
  tags: {
    type: [String],
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inputFormat: {
    type: String,
    required: true,
    trim: true
  },
  outputFormat: {
    type: String,
    required: true,
    trim: true
  },
  testCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Testcase',
  }],
}, {
  timestamps: true
});


module.exports = mongoose.model('Problem', problemSchema);
