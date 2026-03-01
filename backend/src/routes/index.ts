import { Router, Request, Response } from 'express';
import teachersRoutes from './teachers.routes';
import studentsRoutes from './students.routes';
import attendanceRoutes from './attendance.routes';
import configRoutes from './config.routes';
import statusRoutes from './status.routes';
import configController from '../controllers/config.controller';
import { asyncHandler } from '../middleware/error-handler';
import { ApiResponse } from '../models/api-response.model';
import excelService from '../services/excel.service';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check if Excel file is accessible
    const lastBackup = await excelService.getMetadata('LastBackup');
    
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        excelFileAccessible: true,
        lastBackup: lastBackup || 'No backups yet',
        serverUptime: process.uptime(),
      },
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      data: {
        status: 'unhealthy',
        excelFileAccessible: false,
      },
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
      },
      timestamp: new Date().toISOString(),
    };
    
    res.status(503).json(response);
  }
});

/**
 * Get available programs
 */
router.get('/programs', asyncHandler(configController.getPrograms.bind(configController)));

/**
 * Get levels for a program
 */
router.get('/programs/:programId/levels', asyncHandler(configController.getProgramLevels.bind(configController)));

// Mount route modules
router.use('/teachers', teachersRoutes);
router.use('/students', studentsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/config', configRoutes);
router.use('/status', statusRoutes);

export default router;
