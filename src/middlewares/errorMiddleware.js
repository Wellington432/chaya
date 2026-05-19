const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.path, method: req.method });
  const status = err.statusCode || 500;
  const message = err.message || 'Erro interno no servidor.';
  res.status(status).json({ status: 'error', message });
};
