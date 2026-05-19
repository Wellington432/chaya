const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnv = [
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'WAHA_API_URL',
  'WAHA_API_KEY',
  'GLPI_URL',
  'GLPI_APP_TOKEN',
  'GLPI_USER_TOKEN'
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  groqApiUrl: process.env.GROQ_API_URL || 'https://api.groq.com/v1',
  groqApiKey: process.env.GROQ_API_KEY,
  wahaApiUrl: process.env.WAHA_API_URL,
  wahaApiKey: process.env.WAHA_API_KEY,
  glpiUrl: process.env.GLPI_URL,
  glpiAppToken: process.env.GLPI_APP_TOKEN,
  glpiUserToken: process.env.GLPI_USER_TOKEN,
  isProduction: process.env.NODE_ENV === 'production'
};
