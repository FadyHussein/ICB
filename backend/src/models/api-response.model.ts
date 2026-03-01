/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  count?: number;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FILE_LOCK_ERROR = 'FILE_LOCK_ERROR',
  EXCEL_READ_ERROR = 'EXCEL_READ_ERROR',
  EXCEL_WRITE_ERROR = 'EXCEL_WRITE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
}
