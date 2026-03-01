import { Request, Response } from 'express';
import teacherService from '../services/teacher.service';
import { ApiResponse } from '../models/api-response.model';

/**
 * Teachers controller
 */
export class TeachersController {
  /**
   * GET /api/v1/teachers
   */
  async getTeachers(req: Request, res: Response): Promise<void> {
    const { program, level } = req.query;

    const teachers = await teacherService.getTeachers(
      program as string | undefined,
      level as string | undefined
    );

    const response: ApiResponse = {
      success: true,
      data: teachers,
      count: teachers.length,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * GET /api/v1/teachers/:id
   */
  async getTeacherById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const teacher = await teacherService.getTeacherById(id);

    if (!teacher) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Teacher not found',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: teacher,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * POST /api/v1/teachers
   */
  async createTeacher(req: Request, res: Response): Promise<void> {
    const teacher = await teacherService.createTeacher(req.body);

    const response: ApiResponse = {
      success: true,
      data: teacher,
      message: 'Teacher created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  }
}

export default new TeachersController();
