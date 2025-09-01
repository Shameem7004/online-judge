const Submission = require('../models/Submission');
const { getCodeAnalysis } = require('../services/geminiService');

const analyzeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId).populate('problem');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // Ensure the user requesting analysis is the one who made the submission
        if (submission.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to analyze this submission.' });
        }

        if (req.user.isFlagged) {
            return res.status(403).json({
                success: false,
                message: 'AI analysis is disabled for flagged accounts.'
            });
        }

        const analysis = await getCodeAnalysis(submission.problem, submission);
        
        return res.status(200).json({ success: true, analysis });

    } catch (error) {
        console.error("AI Analysis Controller Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Failed to get AI analysis' });
    }
};

module.exports = { analyzeSubmission };