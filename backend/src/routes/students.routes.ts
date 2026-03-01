import { Router } from 'express';
import { body } from 'express-validator';
import studentsController from '../controllers/students.controller';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

/**
 * GET /api/v1/students
 * Get all students with optional filtering
 */
router.get('/', asyncHandler(studentsController.getStudents.bind(studentsController)));

/**
 * GET /api/v1/students/:id
 * Get a specific student by ID
 */
router.get('/:id', asyncHandler(studentsController.getStudentById.bind(studentsController)));

/**
 * POST /api/v1/students
 * Create a new student
 */
router.post(
  '/',
  validate([
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('program').isIn(['Iqra', 'Islamic Studies']).withMessage('Invalid program'),
    body('level').notEmpty().withMessage('Level is required'),
  ]),
  asyncHandler(studentsController.createStudent.bind(studentsController))
);

export default router;
