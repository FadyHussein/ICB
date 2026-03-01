import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse, ErrorCode } from '../models/api-response.model';

/**
 * Middleware to validate request using express-validator
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: errors.array(),
      },
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
  };
}
