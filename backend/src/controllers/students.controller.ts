import { Request, Response } from 'express';
import studentService from '../services/student.service';
import { ApiResponse } from '../models/api-response.model';

/**
 * Students controller
 */
export class StudentsController {
  /**
   * GET /api/v1/students
   */
  async getStudents(req: Request, res: Response): Promise<void> {
    const { program, level, activeOnly } = req.query;

    const students = await studentService.getStudents(
      program as string | undefined,
      level as string | undefined,
      activeOnly !== 'false'
    );

    const response: ApiResponse = {
      success: true,
      data: students,
      count: students.length,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * GET /api/v1/students/:id
   */
  async getStudentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const student = await studentService.getStudentById(id);

    if (!student) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student not found',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: student,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * POST /api/v1/students
   */
  async createStudent(req: Request, res: Response): Promise<void> {
    const student = await studentService.createStudent(req.body);

    const response: ApiResponse = {
      success: true,
      data: student,
      message: 'Student created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  }
}

export default new StudentsController();
