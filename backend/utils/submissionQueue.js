const redis = require('redis');
const Bull = require('bull');

// Create Redis client using the URL
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Create Bull queue using the Redis URL
const submissionQueue = new Bull('submission processing', process.env.REDIS_URL, {
  redis: {
    tls: {
      rejectUnauthorized: false
    }
  }
});

module.exports = { submissionQueue, redisClient };