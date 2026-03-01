import { Router } from 'express';
import configController from '../controllers/config.controller';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

/**
 * GET /api/v1/config/current-week
 * Get current week information
 */
router.get('/current-week', asyncHandler(configController.getCurrentWeek.bind(configController)));

/**
 * POST /api/v1/config/backup
 * Create a manual backup
 */
router.post('/backup', asyncHandler(configController.createBackup.bind(configController)));

/**
 * GET /api/v1/config/backups
 * List available backups
 */
router.get('/backups', asyncHandler(configController.listBackups.bind(configController)));

export default router;
