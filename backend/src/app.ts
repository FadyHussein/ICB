import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { serverConfig } from './config/server.config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { generalLimiter } from './middleware/rate-limiter';
import logger from './utils/logger';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: serverConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use(generalLimiter);

  // API routes
  app.use('/api/v1', routes);

  // Serve static files (placeholder for future frontend)
  app.use(express.static('public'));

  // 404 handler
  app.use(notFoundHandler);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
