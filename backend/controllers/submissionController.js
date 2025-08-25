const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const submissionQueue = require('../utils/submissionQueue');

// This function now creates a submission and adds a job to the queue.
const initiateSubmission = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    if (!problemId || !language || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Create the submission record in the database with a 'Pending' status.
    const submission = await Submission.create({
      user: userId,
      problem: problemId,
      code,
      language,
      verdict: 'Pending',
      testCaseResults: []
    });

    // 2. Add a job to the queue.
    // The job contains all the information our worker will need.
    await submissionQueue.add('processSubmission', {
        submissionId: submission._id.toString(),
    });

    // 3. Immediately respond to the user with the submission ID.
    res.status(202).json({
        success: true,
        message: "Submission received and is being processed.",
        submissionId: submission._id
    });

  } catch (err) {
    console.error('Error initiating submission:', err);
    res.status(500).json({ error: 'Failed to initiate submission' });
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
        const submission = await Submission.findById(id);
        if (!submission) {
          clearInterval(pollInterval);
          res.write(`event: error\ndata: ${JSON.stringify({ error: 'Submission not found' })}\n\n`);
          return res.end();
        }

        // Check if there are new test case results to send
        if (submission.testCaseResults.length > sentTestCasesCount) {
          const newResults = submission.testCaseResults.slice(sentTestCasesCount);
          newResults.forEach(result => {
            res.write(`event: testcase\ndata: ${JSON.stringify(result)}\n\n`);
          });
          sentTestCasesCount = submission.testCaseResults.length;
        }

        // If the verdict is no longer 'Pending', the process is done.
        if (submission.verdict !== 'Pending') {
          clearInterval(pollInterval);
          res.write(`event: done\ndata: ${JSON.stringify({
            verdict: submission.verdict,
            testCaseResults: submission.testCaseResults
          })}\n\n`);
          return res.end();
        }

        // If still pending, send a general progress update
        res.write(`event: progress\ndata: ${JSON.stringify({ status: 'Running test cases...' })}\n\n`);

      } catch (error) {
        clearInterval(pollInterval);
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Error checking submission status' })}\n\n`);
        res.end();
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

module.exports = { 
    initiateSubmission,
    streamSubmissionResults,
    getAllSubmissions,
    getSubmissionById,
    getMySubmissions
};