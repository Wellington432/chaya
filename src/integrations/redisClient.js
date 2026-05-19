const { createClient } = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

const redisClient = createClient({ url: config.redisUrl });

redisClient.on('error', (error) => logger.error('Redis error', { error: error.message }));
redisClient.on('connect', () => logger.info('Redis conectado com sucesso.'));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

module.exports = { redisClient, connectRedis };
