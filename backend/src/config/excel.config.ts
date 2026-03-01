import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const excelConfig = {
  filePath: process.env.EXCEL_FILE_PATH 
    ? path.resolve(process.cwd(), process.env.EXCEL_FILE_PATH)
    : path.resolve(process.cwd(), '../data/master-data.xlsx'),
  backupDir: process.env.BACKUP_DIR
    ? path.resolve(process.cwd(), process.env.BACKUP_DIR)
    : path.resolve(process.cwd(), '../data/backups'),
  backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  maxBackups: parseInt(process.env.MAX_BACKUPS || '50', 10),
  lockOptions: {
    retries: {
      retries: 10,
      minTimeout: 100,
      maxTimeout: 2000,
    },
    stale: 10000, // Lock expires after 10 seconds
  },
};
