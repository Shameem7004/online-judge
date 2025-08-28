const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { submissionQueue } = require('../utils/submissionQueue'); 

// This function now creates a submission and adds a job to the queue.
const initiateSubmission = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    if (!problemId || !language || !code) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const submission = await Submission.create({
      user: userId,
      problem: problemId,
      code,
      language,
      verdict: 'Pending',
      testCaseResults: []
    });

    await submissionQueue.add('processSubmission', { submissionId: submission._id.toString() });

    return res.status(202).json({
      success: true,
      message: 'Submission received and queued.',
      submissionId: submission._id
    });
  } catch (err) {
    console.error('Error initiating submission:', err);
    return res.status(500).json({ success: false, message: 'Failed to initiate submission', error: err.message });
  }
};

// This function now polls the database for results and streams them.
const streamSubmissionResults = async (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Critical for CORS - make sure these match your frontend
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Keep connection alive with periodic comments
  const keepAliveInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 20000); // Send a ping every 20 seconds

  let sentTestCasesCount = 0; // Keep track of what we've already sent

  try {
    const pollInterval = setInterval(async () => {
      try {
        const submission = await Submission.findById(id).lean();
        if (!submission) {
          res.write(`event: error\ndata: ${JSON.stringify({ message: 'Not found' })}\n\n`);
          throw new Error('Submission not found');
        }

        const currentCount = submission.testCaseResults.length;

        // Send new test case results
        if (currentCount > sentTestCasesCount) {
          const newlyAdded = submission.testCaseResults.slice(sentTestCasesCount);
            newlyAdded.forEach(r => {
              res.write(`event: testcase\ndata: ${JSON.stringify(r)}\n\n`);
            });
            sentTestCasesCount = currentCount;
        }

        const terminal = [
          'Accepted',
          'Wrong Answer',
          'Time Limit Exceeded',
          'Runtime Error',
          'Compilation Error',
          'Memory Limit Exceeded'
        ];

        const isTerminal = terminal.includes(submission.verdict);
        const done =
          isTerminal &&
          (
            submission.verdict === 'Compilation Error' ||
            currentCount === submission.testCaseResults.length
          );

        if (done) {
          res.write(`event: verdict\ndata: ${JSON.stringify({
            verdict: submission.verdict,
            total: submission.testCaseResults.length,
            passed: submission.testCaseResults.filter(r => r.passed).length
          })}\n\n`);
          clearInterval(pollInterval);
          clearInterval(keepAliveInterval);
          return res.end();
        }
      } catch (e) {
        console.error('SSE stream error:', e.message);
        clearInterval(pollInterval);
        clearInterval(keepAliveInterval);
        try { res.write(`event: error\ndata: ${JSON.stringify({ message: e.message })}\n\n`); } catch {}
        return res.end();
      }
    }, 1000); // Poll every 1 second

    req.on('close', () => {
      clearInterval(pollInterval);
      clearInterval(keepAliveInterval);
    });

  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'A server error occurred' })}\n\n`);
    res.end();
  }
};

// Efficient: Use aggregation to group submissions by problem
const getAllSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;

    const submissionsByProblem = await Submission.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$problem",
          submissions: { $push: "$$ROOT" },
          latestSubmissionTime: { $first: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemDetails"
        }
      },
      { $sort: { latestSubmissionTime: -1 } },
      {
        $project: {
          _id: 0,
          problem: { $first: "$problemDetails" },
          submissions: "$submissions"
        }
      }
    ]);

    res.status(200).json({ success: true, submissions: submissionsByProblem });
  } catch (err) {
    console.error('Error fetching all submissions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const submission = await Submission.findById(submissionId)
      .populate('user', 'username email')
      .populate('problem', 'name slug');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.status(200).json({ success: true, submission });
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'name slug difficulty')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitCode = async (req, res) => {
  try { // ADDED: try block
    const { problemId, code, language } = req.body;
    const userId = req.user.id;

    const submission = await Submission.create({
      problemId,
      userId,
      code,
      language,
      status: 'Pending',
    });

    await submissionQueue.add('processSubmission', { submissionId: submission._id });

    res.status(201).json({ message: 'Submission received and queued!', submissionId: submission._id });

  } catch (error) { // ADDED: catch block
    console.error("Error in submitCode controller:", error);
    res.status(500).json({ message: "Internal server error during submission.", error: error.message });
  }
};

module.exports = { 
    initiateSubmission,
    streamSubmissionResults,
    getAllSubmissions,
    getSubmissionById,
    getMySubmissions,
    submitCode
};