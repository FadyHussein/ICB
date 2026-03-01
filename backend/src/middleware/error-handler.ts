import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorCode } from '../models/api-response.model';
import logger from '../utils/logger';

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default error response
  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let details = undefined;

  // Handle specific error types
  if (err.message.includes('not found')) {
    statusCode = 404;
    errorCode = ErrorCode.NOT_FOUND;
    message = err.message;
  } else if (err.message.includes('validation') || err.message.includes('Invalid')) {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = err.message;
  } else if (err.message.includes('lock')) {
    statusCode = 503;
    errorCode = ErrorCode.FILE_LOCK_ERROR;
    message = 'Resource is currently locked. Please try again.';
  } else if (err.message.includes('Excel') || err.message.includes('read') || err.message.includes('write')) {
    statusCode = 500;
    errorCode = err.message.includes('read') ? ErrorCode.EXCEL_READ_ERROR : ErrorCode.EXCEL_WRITE_ERROR;
    message = err.message;
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
