import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logLevel = process.env.LOG_LEVEL || 'info';

// Create logger instance with console transport
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
    // Console transport (always enabled)
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

// Optionally add file transport in production if LOG_FILE is set and directory exists
if (process.env.NODE_ENV === 'production' && process.env.LOG_FILE) {
  try {
    const logFilePath = process.env.LOG_FILE;
    const logDir = path.dirname(logFilePath);
    
    // Check if directory exists, if not try to create it
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Only add file transport if we can write to the directory
    logger.add(
      new winston.transports.File({
        filename: logFilePath,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
    
    logger.info('File logging enabled', { logFile: logFilePath });
  } catch (error) {
    // If file logging fails, just continue with console logging
    // This happens on Render.com if persistent disk isn't mounted yet
    logger.warn('File logging could not be initialized, using console only', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export default logger;
