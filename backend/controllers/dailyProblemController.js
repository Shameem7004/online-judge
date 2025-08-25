const Problem = require('../models/Problem');

exports.getDailyProblem = async (req, res) => {
  try {
    // Example: Pick today's problem by date hash or a "daily" flag
    // Here, just pick the latest problem for demo
    const problem = await Problem.findOne().sort({ createdAt: -1 });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'No daily problem found.' });
    }
    res.status(200).json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};