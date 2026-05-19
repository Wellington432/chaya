const app = require('./src/app');
const config = require('./src/config');
const { connectRedis } = require('./src/integrations/redisClient');
const { startEscalationJob } = require('./src/jobs/escalationJob');
const logger = require('./src/utils/logger');

const start = async () => {
  try {
    await connectRedis();
    startEscalationJob();

    app.listen(config.port, () => {
      logger.info(`Servidor YARI IA GLPI rodando na porta ${config.port}`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor', error);
    process.exit(1);
  }
};

start();
