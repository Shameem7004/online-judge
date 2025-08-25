const { Queue } = require('bullmq');

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined, // For Upstash, set REDIS_TLS=true
};

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