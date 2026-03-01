import { Router } from 'express';
import { body } from 'express-validator';
import teachersController from '../controllers/teachers.controller';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

/**
 * GET /api/v1/teachers
 * Get all teachers with optional filtering
 */
router.get('/', asyncHandler(teachersController.getTeachers.bind(teachersController)));

/**
 * GET /api/v1/teachers/:id
 * Get a specific teacher by ID
 */
router.get('/:id', asyncHandler(teachersController.getTeacherById.bind(teachersController)));

/**
 * POST /api/v1/teachers
 * Create a new teacher
 */
router.post(
  '/',
  validate([
    body('teacherName').notEmpty().withMessage('Teacher name is required'),
    body('program').isIn(['Iqra', 'Islamic Studies', 'Both']).withMessage('Invalid program'),
    body('levels').isArray().withMessage('Levels must be an array'),
  ]),
  asyncHandler(teachersController.createTeacher.bind(teachersController))
);

export default router;
