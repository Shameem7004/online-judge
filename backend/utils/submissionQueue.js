const { Queue } = require('bullmq');

// This is the connection to your Redis server.
// It will automatically use the details from your .env file if they exist,
// otherwise it defaults to the standard localhost port.
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

// Create and export the queue. We'll name it 'submissionQueue'.
const submissionQueue = new Queue('submissionQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5s before first retry, 10s for second, etc.
    },
  },
});

module.exports = submissionQueue;