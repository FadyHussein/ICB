import fs from 'fs';
import path from 'path';
import { excelConfig } from '../config/excel.config';
import { getTimestamp } from '../utils/date-utils';
import logger from '../utils/logger';

/**
 * Backup management service
 */
class BackupService {
  /**
   * Create a timestamped backup of the master Excel file
   */
  async createBackup(): Promise<string> {
    try {
      // Ensure backup directory exists
      if (!fs.existsSync(excelConfig.backupDir)) {
        fs.mkdirSync(excelConfig.backupDir, { recursive: true });
      }

      const timestamp = getTimestamp();
      const backupFileName = `master-data_${timestamp}.xlsx`;
      const backupPath = path.join(excelConfig.backupDir, backupFileName);

      // Copy file
      await fs.promises.copyFile(excelConfig.filePath, backupPath);

      logger.info('Backup created successfully', { backupPath });

      // Clean up old backups
      await this.cleanupOldBackups();

      return backupPath;
    } catch (error) {
      logger.error('Failed to create backup', { error });
      throw new Error('Backup creation failed');
    }
  }

  /**
   * Restore from a specific backup file
   */
  async restoreBackup(backupFileName: string): Promise<void> {
    try {
      const backupPath = path.join(excelConfig.backupDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      // Create a backup of current file before restoring
      await this.createBackup();

      // Restore from backup
      await fs.promises.copyFile(backupPath, excelConfig.filePath);

      logger.info('Backup restored successfully', { backupPath });
    } catch (error) {
      logger.error('Failed to restore backup', { error });
      throw new Error('Backup restoration failed');
    }
  }

  /**
   * Get list of available backups
   */
  async listBackups(): Promise<string[]> {
    try {
      if (!fs.existsSync(excelConfig.backupDir)) {
        return [];
      }

      const files = await fs.promises.readdir(excelConfig.backupDir);
      return files
        .filter(file => file.startsWith('master-data_') && file.endsWith('.xlsx'))
        .sort()
        .reverse();
    } catch (error) {
      logger.error('Failed to list backups', { error });
      return [];
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      // Keep only the configured number of backups
      if (backups.length > excelConfig.maxBackups) {
        const toDelete = backups.slice(excelConfig.maxBackups);
        
        for (const backup of toDelete) {
          const backupPath = path.join(excelConfig.backupDir, backup);
          await fs.promises.unlink(backupPath);
          logger.info('Old backup deleted', { backup });
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups', { error });
      // Don't throw - cleanup failure shouldn't break backup creation
    }
  }

  /**
   * Get backup file info
   */
  async getBackupInfo(backupFileName: string): Promise<{ size: number; created: Date } | null> {
    try {
      const backupPath = path.join(excelConfig.backupDir, backupFileName);
      const stats = await fs.promises.stat(backupPath);
      
      return {
        size: stats.size,
        created: stats.birthtime,
      };
    } catch (error) {
      logger.error('Failed to get backup info', { error, backupFileName });
      return null;
    }
  }
}

export default new BackupService();
