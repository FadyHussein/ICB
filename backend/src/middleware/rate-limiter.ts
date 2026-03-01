import rateLimit from 'express-rate-limit';
import { serverConfig } from '../config/server.config';
import { ApiResponse, ErrorCode } from '../models/api-response.model';

/**
 * General rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later.',
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Attendance submission rate limiter
 */
export const attendanceLimiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.attendanceMax,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many attendance submissions, please try again later.',
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Bulk update rate limiter
 */
export const bulkLimiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.bulkMax,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many bulk updates, please try again later.',
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});
