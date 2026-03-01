import { Request, Response } from 'express';
import attendanceService from '../services/attendance.service';
import { ApiResponse } from '../models/api-response.model';
import { formatDate, getCurrentSunday } from '../utils/date-utils';

/**
 * Attendance controller
 */
export class AttendanceController {
  /**
   * GET /api/v1/attendance
   */
  async getAttendance(req: Request, res: Response): Promise<void> {
    const { program, level, date } = req.query;

    if (!program || !level) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Program and level are required',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const attendance = await attendanceService.getAttendance(
      program as string,
      level as string,
      date as string | undefined
    );

    const response: ApiResponse = {
      success: true,
      data: attendance,
      count: attendance.records.length,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * POST /api/v1/attendance/submit
   */
  async submitAttendance(req: Request, res: Response): Promise<void> {
    const result = await attendanceService.submitAttendance(req.body);

    const response: ApiResponse = {
      success: true,
      data: {
        ...result,
        weekDate: req.body.weekDate,
        timestamp: new Date().toISOString(),
      },
      message: 'Attendance submitted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * POST /api/v1/attendance/bulk-update
   */
  async bulkUpdate(req: Request, res: Response): Promise<void> {
    const result = await attendanceService.bulkUpdate(req.body);

    const response: ApiResponse = {
      success: true,
      data: {
        ...result,
        pageNumber: req.body.pageNumber,
        timestamp: new Date().toISOString(),
      },
      message: 'Bulk update completed successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * GET /api/v1/attendance/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    const { program, level, date } = req.query;

    if (!program || !level || !date) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Program, level, and date are required',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const stats = await attendanceService.getAttendanceStats(
      program as string,
      level as string,
      date as string
    );

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }
}

export default new AttendanceController();
