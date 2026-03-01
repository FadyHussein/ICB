import ExcelJS from 'exceljs';
import fs from 'fs';
import { excelConfig } from '../config/excel.config';
import lockService from './lock.service';
import backupService from './backup.service';
import logger from '../utils/logger';
import { formatDate } from '../utils/date-utils';

/**
 * Excel service for reading and writing to the master workbook
 */
class ExcelService {
  private workbook: ExcelJS.Workbook | null = null;
  private lastLoaded: Date | null = null;
  private readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Load the Excel workbook
   */
  private async loadWorkbook(forceReload = false): Promise<ExcelJS.Workbook> {
    const now = new Date();
    
    // Return cached workbook if recent
    if (
      !forceReload &&
      this.workbook &&
      this.lastLoaded &&
      now.getTime() - this.lastLoaded.getTime() < this.CACHE_TTL
    ) {
      return this.workbook;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      
      // Check if file exists
      if (!fs.existsSync(excelConfig.filePath)) {
        throw new Error('Excel file not found');
      }

      await workbook.xlsx.readFile(excelConfig.filePath);
      
      this.workbook = workbook;
      this.lastLoaded = now;
      
      logger.debug('Workbook loaded successfully');
      return workbook;
    } catch (error) {
      logger.error('Failed to load workbook', { error });
      throw new Error('Failed to read Excel file');
    }
  }

  /**
   * Save the workbook to file
   */
  private async saveWorkbook(workbook: ExcelJS.Workbook): Promise<void> {
    try {
      await workbook.xlsx.writeFile(excelConfig.filePath);
      this.workbook = null; // Invalidate cache
      this.lastLoaded = null;
      logger.debug('Workbook saved successfully');
    } catch (error) {
      logger.error('Failed to save workbook', { error });
      throw new Error('Failed to write Excel file');
    }
  }

  /**
   * Get a worksheet by name
   */
  private getWorksheet(workbook: ExcelJS.Workbook, sheetName: string): ExcelJS.Worksheet {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      throw new Error(`Worksheet '${sheetName}' not found`);
    }
    return worksheet;
  }

  /**
   * Read all data from a sheet as array of objects
   */
  async readSheet(sheetName: string): Promise<any[]> {
    const workbook = await this.loadWorkbook();
    const worksheet = this.getWorksheet(workbook, sheetName);

    const data: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Header row
        row.eachCell((cell) => {
          headers.push(cell.value?.toString() || '');
        });
      } else {
        // Data rows
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = cell.value;
          }
        });
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * Read specific cell value
   */
  async readCell(sheetName: string, cellAddress: string): Promise<any> {
    const workbook = await this.loadWorkbook();
    const worksheet = this.getWorksheet(workbook, sheetName);
    const cell = worksheet.getCell(cellAddress);
    return cell.value;
  }

  /**
   * Write data to a specific cell
   */
  async writeCell(sheetName: string, cellAddress: string, value: any): Promise<void> {
    const operationId = `writeCell-${Date.now()}`;
    logger.info('Excel write operation queued', { operationId, sheetName, cellAddress });
    
    const startTime = Date.now();
    await lockService.withLock(async () => {
      const lockAcquiredTime = Date.now();
      logger.info('Lock acquired for write operation', { 
        operationId, 
        waitTime: lockAcquiredTime - startTime 
      });

      try {
        // Create backup before writing
        await backupService.createBackup();

        const workbook = await this.loadWorkbook(true);
        const worksheet = this.getWorksheet(workbook, sheetName);
        
        const cell = worksheet.getCell(cellAddress);
        cell.value = value;

        await this.saveWorkbook(workbook);
        
        const totalTime = Date.now() - startTime;
        logger.info('Write operation completed', { 
          operationId, 
          totalTime, 
          lockTime: lockAcquiredTime - startTime,
          writeTime: totalTime - (lockAcquiredTime - startTime)
        });
      } catch (error) {
        logger.error('Write operation failed', { operationId, error });
        throw error;
      }
    });
  }

  /**
   * Write multiple cells in a sheet
   */
  async writeCells(sheetName: string, updates: { cell: string; value: any }[]): Promise<void> {
    const operationId = `writeCells-${Date.now()}`;
    logger.info('Excel batch write operation queued', { 
      operationId, 
      sheetName, 
      cellCount: updates.length 
    });
    
    const startTime = Date.now();
    await lockService.withLock(async () => {
      const lockAcquiredTime = Date.now();
      logger.info('Lock acquired for batch write', { 
        operationId, 
        waitTime: lockAcquiredTime - startTime 
      });

      try {
        // Create backup before writing
        await backupService.createBackup();

        const workbook = await this.loadWorkbook(true);
        const worksheet = this.getWorksheet(workbook, sheetName);

        for (const update of updates) {
          const cell = worksheet.getCell(update.cell);
          cell.value = update.value;
        }

        await this.saveWorkbook(workbook);
        
        const totalTime = Date.now() - startTime;
        logger.info('Batch write operation completed', { 
          operationId, 
          cellCount: updates.length,
          totalTime, 
          lockWaitTime: lockAcquiredTime - startTime
        });
      } catch (error) {
        logger.error('Batch write operation failed', { operationId, error });
        throw error;
      }
    });
  }

  /**
   * Add a new row to a sheet
   */
  async addRow(sheetName: string, rowData: any[]): Promise<void> {
    const operationId = `addRow-${Date.now()}`;
    logger.info('Excel add row operation queued', { operationId, sheetName });
    
    const startTime = Date.now();
    await lockService.withLock(async () => {
      const lockAcquiredTime = Date.now();
      logger.info('Lock acquired for add row', { 
        operationId, 
        waitTime: lockAcquiredTime - startTime 
      });

      try {
        await backupService.createBackup();

        const workbook = await this.loadWorkbook(true);
        const worksheet = this.getWorksheet(workbook, sheetName);

        worksheet.addRow(rowData);

        await this.saveWorkbook(workbook);
        
        const totalTime = Date.now() - startTime;
        logger.info('Add row operation completed', { 
          operationId, 
          totalTime 
        });
      } catch (error) {
        logger.error('Add row operation failed', { operationId, error });
        throw error;
      }
    });
  }

  /**
   * Update a row by matching criteria
   */
  async updateRow(
    sheetName: string,
    matchColumn: number,
    matchValue: any,
    updates: { [column: number]: any }
  ): Promise<boolean> {
    const operationId = `updateRow-${Date.now()}`;
    logger.info('Excel update row operation queued', { 
      operationId, 
      sheetName, 
      matchColumn, 
      matchValue 
    });
    
    let updated = false;
    const startTime = Date.now();

    await lockService.withLock(async () => {
      const lockAcquiredTime = Date.now();
      logger.info('Lock acquired for update row', { 
        operationId, 
        waitTime: lockAcquiredTime - startTime 
      });

      try {
        await backupService.createBackup();

        const workbook = await this.loadWorkbook(true);
        const worksheet = this.getWorksheet(workbook, sheetName);

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header

          const cellValue = row.getCell(matchColumn).value;
          if (cellValue === matchValue) {
            Object.entries(updates).forEach(([col, value]) => {
              row.getCell(parseInt(col, 10)).value = value;
            });
            updated = true;
          }
        });

        if (updated) {
          await this.saveWorkbook(workbook);
        }
        
        const totalTime = Date.now() - startTime;
        logger.info('Update row operation completed', { 
          operationId, 
          updated, 
          totalTime 
        });
      } catch (error) {
        logger.error('Update row operation failed', { operationId, error });
        throw error;
      }
    });

    return updated;
  }

  /**
   * Find row index by matching column value
   */
  async findRowIndex(sheetName: string, matchColumn: number, matchValue: any): Promise<number | null> {
    const workbook = await this.loadWorkbook();
    const worksheet = this.getWorksheet(workbook, sheetName);

    let foundRow: number | null = null;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const cellValue = row.getCell(matchColumn).value;
      if (cellValue === matchValue) {
        foundRow = rowNumber;
      }
    });

    return foundRow;
  }

  /**
   * Get column index by header name
   */
  async getColumnIndex(sheetName: string, headerName: string): Promise<number | null> {
    const workbook = await this.loadWorkbook();
    const worksheet = this.getWorksheet(workbook, sheetName);

    const headerRow = worksheet.getRow(1);
    let columnIndex: number | null = null;

    headerRow.eachCell((cell, colNumber) => {
      if (cell.value?.toString() === headerName) {
        columnIndex = colNumber;
      }
    });

    return columnIndex;
  }

  /**
   * Check if a sheet exists
   */
  async sheetExists(sheetName: string): Promise<boolean> {
    try {
      const workbook = await this.loadWorkbook();
      return workbook.getWorksheet(sheetName) !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Create a new sheet with headers
   */
  async createSheet(sheetName: string, headers: string[]): Promise<void> {
    await lockService.withLock(async () => {
      await backupService.createBackup();

      const workbook = await this.loadWorkbook(true);
      
      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.addRow(headers);

      await this.saveWorkbook(workbook);
    });
  }

  /**
   * Update metadata value
   */
  async updateMetadata(key: string, value: string): Promise<void> {
    await lockService.withLock(async () => {
      await backupService.createBackup();

      const workbook = await this.loadWorkbook(true);
      const worksheet = this.getWorksheet(workbook, 'Metadata');

      let updated = false;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const keyCell = row.getCell(1);
        if (keyCell.value === key) {
          row.getCell(2).value = value;
          updated = true;
        }
      });

      if (!updated) {
        worksheet.addRow([key, value, '']);
      }

      await this.saveWorkbook(workbook);
    });
  }

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<string | null> {
    const workbook = await this.loadWorkbook();
    const worksheet = this.getWorksheet(workbook, 'Metadata');

    let value: string | null = null;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const keyCell = row.getCell(1);
      if (keyCell.value === key) {
        value = row.getCell(2).value?.toString() || null;
      }
    });

    return value;
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.workbook = null;
    this.lastLoaded = null;
    logger.debug('Cache invalidated');
  }
}

export default new ExcelService();
