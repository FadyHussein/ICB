import { Router } from 'express';
import statusController from '../controllers/status.controller';

const router = Router();

/**
 * GET /api/v1/status/health
 * Health check endpoint
 */
router.get('/health', statusController.getHealth.bind(statusController));

/**
 * GET /api/v1/status/metrics
 * System metrics endpoint
 */
router.get('/metrics', statusController.getMetrics.bind(statusController));

/**
 * GET /api/v1/status/backups
 * List available backups
 */
router.get('/backups', statusController.getBackups.bind(statusController));

export default router;
