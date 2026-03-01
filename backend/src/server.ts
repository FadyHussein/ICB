import { createApp } from './app';
import { serverConfig } from './config/server.config';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';
import { excelConfig } from './config/excel.config';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Check if Excel file exists
    if (!fs.existsSync(excelConfig.filePath)) {
      logger.warn('Excel file not found. Please create the master-data.xlsx file.');
      logger.info(`Expected path: ${excelConfig.filePath}`);
    }

    // Ensure backup directory exists
    if (!fs.existsSync(excelConfig.backupDir)) {
      fs.mkdirSync(excelConfig.backupDir, { recursive: true });
      logger.info('Created backup directory');
    }

    // Create Express app
    const app = createApp();

    // Start listening on all interfaces (0.0.0.0) - required for Render.com and cloud deployment
    // Binding to 0.0.0.0 allows external access instead of localhost only
    const server = app.listen(serverConfig.port, '0.0.0.0', () => {
      logger.info(`Server started successfully`);
      logger.info(`Environment: ${serverConfig.nodeEnv}`);
      logger.info(`Port: ${serverConfig.port}`);
      logger.info(`Listening on: 0.0.0.0:${serverConfig.port}`);
      logger.info(`Excel file: ${excelConfig.filePath}`);
      logger.info(`API available at: http://localhost:${serverConfig.port}/api/v1`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();
