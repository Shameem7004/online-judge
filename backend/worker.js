const { Worker } = require('bullmq');
const dotenv = require('dotenv');
dotenv.config();

const { DBConnection } = require('./database/db');
const Submission = require('./models/Submission');
const Testcase = require('./models/Testcase');
const User = require('./models/User');
const axios = require('axios');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {} // Upstash uses TLS
});

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
        // FIX: Update URL to match your compiler service route
        const compilerResponse = await axios.post(`${process.env.COMPILER_URL}/api/run`, {
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

// Start
(async () => {
  await DBConnection();

  const worker = new Worker('submissionQueue', processSubmission, {
    connection,
    concurrency: 5,
    limiter: { max: 20, duration: 1000 }
  });

  worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed: ${err.message}`));

  console.log('Worker started');
})();