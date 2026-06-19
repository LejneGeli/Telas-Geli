const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,
  maxRetriesPerRequest: 2
});

let connected = false;

async function connectRedis() {
  if (connected) return redis;
  try {
    await redis.connect();
    connected = true;
    return redis;
  } catch (error) {
    console.warn('Redis indisponível. A API seguirá sem cache:', error.message);
    return null;
  }
}

module.exports = { redis, connectRedis };
