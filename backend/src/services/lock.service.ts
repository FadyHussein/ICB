import lockfile from 'proper-lockfile';
import { excelConfig } from '../config/excel.config';
import logger from '../utils/logger';

/**
 * File locking service to prevent concurrent Excel file access
 */
class LockService {
  private lockFilePath: string;

  constructor() {
    this.lockFilePath = excelConfig.filePath;
  }

  /**
   * Acquire an exclusive lock on the Excel file
   */
  async acquireLock(): Promise<() => Promise<void>> {
    try {
      logger.info('Attempting to acquire lock on Excel file');
      const release = await lockfile.lock(this.lockFilePath, excelConfig.lockOptions);
      logger.info('Lock acquired successfully');
      return release;
    } catch (error) {
      logger.error('Failed to acquire lock', { error });
      throw new Error('Unable to acquire file lock. File may be in use.');
    }
  }

  /**
   * Check if the file is currently locked
   */
  async isLocked(): Promise<boolean> {
    try {
      return await lockfile.check(this.lockFilePath);
    } catch (error) {
      logger.error('Error checking lock status', { error });
      return false;
    }
  }

  /**
   * Execute an operation with automatic lock management
   */
  async withLock<T>(operation: () => Promise<T>): Promise<T> {
    const release = await this.acquireLock();
    try {
      const result = await operation();
      return result;
    } finally {
      await release();
      logger.info('Lock released');
    }
  }
}

export default new LockService();
