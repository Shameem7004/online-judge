const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {} // Upstash uses TLS
});

const submissionQueue = new Queue('submissionQueue', { connection });

module.exports = { submissionQueue, connection };