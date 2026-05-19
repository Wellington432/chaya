const { createLogger, format, transports } = require('winston');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  ],
  exceptionHandlers: [new transports.Console()]
});

module.exports = logger;
