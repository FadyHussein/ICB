import { Request, Response } from 'express';
import { ApiResponse } from '../models/api-response.model';
import lockService from '../services/lock.service';
import backupService from '../services/backup.service';
import excelService from '../services/excel.service';
import fs from 'fs';
import { excelConfig } from '../config/excel.config';

/**
 * System status and health check controller
 */
export class StatusController {
  /**
   * GET /api/v1/status/health
   * Comprehensive health check endpoint
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    const healthData: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: {}
    };

    try {
      // Check Excel file accessibility
      healthData.system.excelFile = {
        exists: fs.existsSync(excelConfig.filePath),
        path: excelConfig.filePath
      };

      if (healthData.system.excelFile.exists) {
        const stats = fs.statSync(excelConfig.filePath);
        healthData.system.excelFile.size = stats.size;
        healthData.system.excelFile.modified = stats.mtime.toISOString();
      }

      // Check lock status
      healthData.system.lockStatus = {
        isLocked: await lockService.isLocked(),
        lockOptions: {
          staleTimeout: excelConfig.lockOptions.stale,
          retries: excelConfig.lockOptions.retries.retries
        }
      };

      // Check backup system
      const backups = await backupService.listBackups();
      healthData.system.backups = {
        count: backups.length,
        maxBackups: excelConfig.maxBackups,
        backupDir: excelConfig.backupDir,
        latest: backups.length > 0 ? backups[0] : null
      };

      // Overall status determination
      if (!healthData.system.excelFile.exists) {
        healthData.status = 'unhealthy';
        healthData.error = 'Excel file not found';
      } else if (healthData.system.backups.count > excelConfig.maxBackups * 1.2) {
        healthData.status = 'degraded';
        healthData.warning = 'Backup count exceeds recommended limit';
      }

    } catch (error: any) {
      healthData.status = 'unhealthy';
      healthData.error = error.message;
    }

    const statusCode = healthData.status === 'healthy' ? 200 : 
                       healthData.status === 'degraded' ? 200 : 503;

    const response: ApiResponse = {
      success: healthData.status !== 'unhealthy',
      data: healthData,
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  }

  /**
   * GET /api/v1/status/metrics
   * Performance and operational metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        process: {
          uptime: process.uptime(),
          memory: {
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
          },
          cpu: process.cpuUsage()
        },
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid
        }
      };

      const response: ApiResponse = {
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * GET /api/v1/status/backups
   * List available backups
   */
  async getBackups(req: Request, res: Response): Promise<void> {
    try {
      const backups = await backupService.listBackups();
      const backupDetails = await Promise.all(
        backups.slice(0, 10).map(async (backup) => {
          const info = await backupService.getBackupInfo(backup);
          return {
            filename: backup,
            size: info ? `${(info.size / 1024).toFixed(2)} KB` : 'Unknown',
            created: info ? info.created.toISOString() : 'Unknown'
          };
        })
      );

      const response: ApiResponse = {
        success: true,
        data: {
          total: backups.length,
          maxBackups: excelConfig.maxBackups,
          backups: backupDetails
        },
        count: backupDetails.length,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'BACKUP_LIST_ERROR',
          message: error.message
        },
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }
}

export default new StatusController();
