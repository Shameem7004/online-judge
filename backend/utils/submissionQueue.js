const Bull = require('bull');

// Create Bull queue using the single Redis URL from environment variables.
// This is the only Redis client needed for the queue.
const submissionQueue = new Bull('submissionQueue', process.env.REDIS_URL);

module.exports = { submissionQueue };