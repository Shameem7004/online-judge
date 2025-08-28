const { Worker } = require('bullmq');
const dotenv = require('dotenv');
dotenv.config();

const { DBConnection } = require('./database/db');
const Submission = require('./models/Submission');
const Testcase = require('./models/Testcase');
const Problem = require('./models/Problem'); // FIX
const User = require('./models/User');
const axios = require('axios');
const { connection } = require('./utils/submissionQueue');

const processSubmission = async (job) => {
  const { submissionId } = job.data;
  console.log(`Processing submission: ${submissionId}`);

  let finalResults = [];
  let fatalVerdict = null; // Only set for Compilation / Runtime / TLE / Memory
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.verdict = 'Pending';
    await submission.save();

    const problem = await Problem.findById(submission.problem);
    if (!problem) throw new Error('Problem not found');

    const testcases = await Testcase.find({ problem: problem._id }).sort({ createdAt: 1 });
    if (testcases.length === 0) throw new Error('No testcases found');
    console.log('Total testcases:', testcases.length);

    for (const tc of testcases) {
      const result = {
        passed: false,
        input: tc.input,
        expectedOutput: tc.output,
        userOutput: '',
        executionTime: null
      };

      try {
        // Change compilerUrl line if needed:
        // const compilerUrl = `${process.env.COMPILER_URL}/run`;
        const compilerUrl = `${process.env.COMPILER_URL}/api/run`;
        console.log('[WORKER] Calling compiler:', compilerUrl, 'lang=', submission.language);
        const { data } = await axios.post(compilerUrl, {
          code: submission.code,
          language: submission.language,
          input: tc.input
        }, { timeout: 15000 });

        const userOut = (data.output || '').trim();
        const expected = (tc.output || '').trim();
        result.userOutput = userOut;
        result.executionTime = data.executionTime;
        result.passed = userOut === expected;
      } catch (err) {
        if (err.code === 'ECONNABORTED') {
          fatalVerdict = fatalVerdict || 'Time Limit Exceeded';
          result.userOutput = 'TLE';
        } else if (err.response?.data?.errorType === 'compilation') {
          fatalVerdict = 'Compilation Error';
          result.userOutput = 'Compilation Error';
        } else {
          fatalVerdict = fatalVerdict || 'Runtime Error';
          result.userOutput = err.response?.data?.error || err.message;
        }
      }

      finalResults.push(result);

      await Submission.findByIdAndUpdate(submissionId, {
        $push: { testCaseResults: result },
        verdict: fatalVerdict || 'Pending'
      });

      if (fatalVerdict === 'Compilation Error') break; // only compilation stops early
    }

    // Recompute final verdict if no fatal verdict decided
    let finalVerdict;
    if (fatalVerdict) {
      finalVerdict = fatalVerdict;
    } else {
      const allPassed = finalResults.length > 0 && finalResults.every(r => r.passed);
      finalVerdict = allPassed ? 'Accepted' : 'Wrong Answer';
    }

    await Submission.findByIdAndUpdate(submissionId, {
      verdict: finalVerdict
    });

    // Award points only if final verdict Accepted and first AC
    if (finalVerdict === 'Accepted') {
      const existingAC = await Submission.findOne({
        user: submission.user,
        problem: problem._id,
        verdict: 'Accepted',
        _id: { $ne: submissionId }
      });
      if (!existingAC) {
        await User.findByIdAndUpdate(submission.user, { $inc: { totalPoints: problem.points || 0 } });
      }
    }

    console.log(`Finished submission ${submissionId} => ${finalVerdict}`);
    return { verdict: finalVerdict };
  } catch (error) {
    console.error(`Submission ${submissionId} failed:`, error.message);
    await Submission.findByIdAndUpdate(submissionId, { verdict: 'Runtime Error' });
    throw error;
  }
};

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