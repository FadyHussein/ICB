import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const serverConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    attendanceMax: parseInt(process.env.RATE_LIMIT_ATTENDANCE_MAX || '30', 10),
    bulkMax: parseInt(process.env.RATE_LIMIT_BULK_MAX || '10', 10),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE,
  },
};
