const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Import Mongoose models
const Submission = require('./models/Submission');
const Testcase = require('./models/Testcase');
const Problem = require('./models/Problem');
const User = require('./models/User');

// Import DB connection function
const { DBConnection } = require('./database/db');

// Redis connection configuration (must match the queue's config)
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

// The main processing function for each job
const processSubmission = async (job) => {
  const { submissionId } = job.data;
  console.log(`Processing submission: ${submissionId}`);

  try {
    // 1. Fetch submission details from the database
    const submission = await Submission.findById(submissionId).populate('problem');
    if (!submission) {
      throw new Error('Submission not found');
    }

    const problem = submission.problem;
    const testcases = await Testcase.find({ problem: problem._id });
    if (!testcases || testcases.length === 0) {
        await Submission.findByIdAndUpdate(submissionId, { verdict: 'System Error', testCaseResults: [{ passed: false, userOutput: 'No test cases found for this problem.' }] });
        throw new Error(`No test cases for problem ${problem._id}`);
    }

    let finalVerdict = 'Accepted';
    const finalResults = [];

    // 2. Loop through each test case and execute
    for (const testcase of testcases) {
      let result = { 
        passed: false, 
        input: testcase.input, 
        expectedOutput: testcase.output,
        testCaseNumber: finalResults.length + 1
      };

      try {
        const compilerResponse = await axios.post(`${process.env.COMPILER_URL}/compiler/api/run`, {
          code: submission.code,
          language: submission.language,
          input: testcase.input
        }, { timeout: 15000 });

        const userOutput = compilerResponse.data.output?.trim() || '';
        const expectedOutput = testcase.output?.trim() || '';
        
        result.userOutput = userOutput;
        result.executionTime = compilerResponse.data.executionTime;
        result.passed = userOutput === expectedOutput;

        if (!result.passed) {
          finalVerdict = 'Wrong Answer';
        }
      } catch (err) {
        result.passed = false;
        if (err.code === 'ECONNABORTED') {
          finalVerdict = 'Time Limit Exceeded';
          result.userOutput = 'Execution timed out.';
        } else if (err.response?.data?.errorType === 'compilation') {
          finalVerdict = 'Compilation Error';
          result.userOutput = err.response.data.error;
        } else {
          finalVerdict = 'Runtime Error';
          result.userOutput = err.response?.data?.error || err.message;
        }
      }

      finalResults.push(result);

      // NEW: persist each test result immediately so SSE can stream it
      await Submission.findByIdAndUpdate(submissionId, {
        $push: { testCaseResults: result }
      });

      // Stop on first non-accepted verdict and persist verdict now
      if (finalVerdict !== 'Accepted') {
        await Submission.findByIdAndUpdate(submissionId, { verdict: finalVerdict });
        break;
      }
    }

    // 4. Finalize verdict (for full pass path)
    await Submission.findByIdAndUpdate(submissionId, {
      verdict: finalVerdict
      // testCaseResults were already pushed incrementally
    });

    // 5. Update user points if accepted and first time solving
    if (finalVerdict === 'Accepted') {
        const alreadySolved = await Submission.findOne({ 
            user: submission.user, 
            problem: problem._id, 
            verdict: 'Accepted', 
            _id: { $ne: submissionId } 
        });
        if (!alreadySolved) {
            await User.findByIdAndUpdate(submission.user, { $inc: { totalPoints: problem.points || 100 } });
        }
    }

    console.log(`Finished processing submission ${submissionId} with verdict: ${finalVerdict}`);
    return { success: true, verdict: finalVerdict };

  } catch (error) {
    console.error(`Error processing job ${job.id} for submission ${submissionId}:`, error);
    // Mark submission as failed in DB
    await Submission.findByIdAndUpdate(submissionId, { verdict: 'System Error', testCaseResults: [{ passed: false, userOutput: error.message }] });
    throw error; // Re-throw to let BullMQ handle the job failure and retries
  }
};

// The main function to start the worker
const startWorker = async () => {
  await DBConnection(); // Connect to MongoDB

  const worker = new Worker('submissionQueue', processSubmission, {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs at a time
    limiter: {
      max: 20, // Max 20 jobs
      duration: 1000, // per 1 second
    },
  });

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} has failed with ${err.message}`);
  });

  console.log('🚀 Submission worker is ready and waiting for jobs...');
};

startWorker();