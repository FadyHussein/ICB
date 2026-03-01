import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_FILE ? path.dirname(process.env.LOG_FILE) : '../logs';

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'icb-sunday-school-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0 && meta.service) {
            const { service, ...rest } = meta;
            if (Object.keys(rest).length > 0) {
              msg += ` ${JSON.stringify(rest)}`;
            }
          }
          return msg;
        })
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production' && process.env.LOG_FILE) {
  logger.add(
    new winston.transports.File({
      filename: process.env.LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export default logger;
