const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Create a flexible connection options object
const redisOptions = process.env.REDIS_URL 
  ? { 
      connection: new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        tls: {} // For cloud providers like Upstash
      })
    }
  : { 
      connection: new IORedis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
        // No TLS for local connection
      })
    };

const submissionQueue = new Queue('submissionQueue', redisOptions);

// Export the connection instance for the worker to use
const connection = redisOptions.connection;

submissionQueue.on('waiting', (jobId) => console.log('[QUEUE] Waiting job', jobId));
submissionQueue.on('added', (job) => console.log('[QUEUE] Added job', job.id));

module.exports = { submissionQueue, connection };