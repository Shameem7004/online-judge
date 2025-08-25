const mongoose = require('mongoose');

const testcaseSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  // Raw, machine-readable input for the judge
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  explanation: {
    type: String
  },
  isSample: {
    type: Boolean,
    default: false
  },
  displayInput: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Testcase', testcaseSchema);