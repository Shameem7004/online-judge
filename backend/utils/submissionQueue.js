const { Queue, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const submissionQueue = new Queue('submissionQueue', { connection });
new QueueScheduler('submissionQueue', { connection });

module.exports = { submissionQueue, connection };