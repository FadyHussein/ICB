import { Router } from 'express';
import { body } from 'express-validator';
import attendanceController from '../controllers/attendance.controller';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/error-handler';
import { attendanceLimiter, bulkLimiter } from '../middleware/rate-limiter';

const router = Router();

/**
 * GET /api/v1/attendance
 * Get attendance records
 */
router.get('/', asyncHandler(attendanceController.getAttendance.bind(attendanceController)));

/**
 * POST /api/v1/attendance/submit
 * Submit attendance records
 */
router.post(
  '/submit',
  attendanceLimiter,
  validate([
    body('program').notEmpty().withMessage('Program is required'),
    body('level').notEmpty().withMessage('Level is required'),
    body('teacherId').notEmpty().withMessage('Teacher ID is required'),
    body('weekDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Invalid date format (YYYY-MM-DD)'),
    body('records').isArray().withMessage('Records must be an array'),
    body('records.*.studentId').notEmpty().withMessage('Student ID is required'),
    body('records.*.status').isIn(['present', 'absent']).withMessage('Invalid status'),
  ]),
  asyncHandler(attendanceController.submitAttendance.bind(attendanceController))
);

/**
 * POST /api/v1/attendance/bulk-update
 * Bulk update page numbers
 */
router.post(
  '/bulk-update',
  bulkLimiter,
  validate([
    body('program').notEmpty().withMessage('Program is required'),
    body('level').notEmpty().withMessage('Level is required'),
    body('weekDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Invalid date format (YYYY-MM-DD)'),
    body('studentIds').isArray().withMessage('Student IDs must be an array'),
    body('pageNumber').isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  ]),
  asyncHandler(attendanceController.bulkUpdate.bind(attendanceController))
);

/**
 * GET /api/v1/attendance/stats
 * Get attendance statistics
 */
router.get('/stats', asyncHandler(attendanceController.getStats.bind(attendanceController)));

export default router;
