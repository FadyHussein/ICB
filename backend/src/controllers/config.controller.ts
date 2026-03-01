import { Request, Response } from 'express';
import excelService from '../services/excel.service';
import backupService from '../services/backup.service';
import { ApiResponse } from '../models/api-response.model';
import { getCurrentSunday, formatDate, parseDate, getWeekNumber } from '../utils/date-utils';

/**
 * Configuration controller
 */
export class ConfigController {
  /**
   * GET /api/v1/config/current-week
   */
  async getCurrentWeek(req: Request, res: Response): Promise<void> {
    const currentWeek = formatDate(getCurrentSunday());
    const schoolYearStart = await excelService.getMetadata('SchoolYearStart');

    let weekNumber = 1;
    if (schoolYearStart) {
      const startDate = parseDate(schoolYearStart);
      weekNumber = getWeekNumber(getCurrentSunday(), startDate);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        currentWeek,
        schoolYearStart: schoolYearStart || 'Not set',
        weekNumber,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * POST /api/v1/config/backup
   */
  async createBackup(req: Request, res: Response): Promise<void> {
    const backupPath = await backupService.createBackup();
    const backupFileName = backupPath.split(/[/\\]/).pop() || '';

    const response: ApiResponse = {
      success: true,
      data: {
        backupFile: backupFileName,
        backupPath,
        timestamp: new Date().toISOString(),
      },
      message: 'Backup created successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * GET /api/v1/config/backups
   */
  async listBackups(req: Request, res: Response): Promise<void> {
    const backups = await backupService.listBackups();

    const response: ApiResponse = {
      success: true,
      data: backups,
      count: backups.length,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * GET /api/v1/programs
   */
  async getPrograms(req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      data: [
        { id: 'iqra', name: 'Iqra', levels: ['K', '1', '2', '3', '4', '5', '6', 'Quran'] },
        { id: 'islamic-studies', name: 'Islamic Studies', levels: ['1', '2', '3', '4', '5', '6'] },
      ],
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  /**
   * GET /api/v1/programs/:programId/levels
   */
  async getProgramLevels(req: Request, res: Response): Promise<void> {
    const { programId } = req.params;

    let levels: Array<{ id: string; displayName: string }> = [];
    if (programId === 'iqra') {
      levels = [
        { id: 'K', displayName: 'Kindergarten' },
        { id: '1', displayName: 'Level 1' },
        { id: '2', displayName: 'Level 2' },
        { id: '3', displayName: 'Level 3' },
        { id: '4', displayName: 'Level 4' },
        { id: '5', displayName: 'Level 5' },
        { id: '6', displayName: 'Level 6' },
        { id: 'Quran', displayName: 'Quran' },
      ];
    } else if (programId === 'islamic-studies') {
      levels = [
        { id: '1', displayName: 'Level 1' },
        { id: '2', displayName: 'Level 2' },
        { id: '3', displayName: 'Level 3' },
        { id: '4', displayName: 'Level 4' },
        { id: '5', displayName: 'Level 5' },
        { id: '6', displayName: 'Level 6' },
      ];
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Program not found',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: levels,
      count: levels.length,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }
}

export default new ConfigController();
