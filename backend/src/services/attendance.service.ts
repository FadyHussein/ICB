import excelService from './excel.service';
import studentService from './student.service';
import { AttendanceRecord, AttendanceSubmission, BulkUpdateRequest, AttendanceHistory } from '../models/attendance.model';
import { getSheetName, formatAttendanceValue, parseAttendanceValue } from '../utils/excel-utils';
import { formatDate, getCurrentSunday, parseDate } from '../utils/date-utils';
import logger from '../utils/logger';

/**
 * Attendance service for managing attendance records
 */
class AttendanceService {
  /**
   * Get attendance records for a specific program, level, and week
   */
  async getAttendance(program: string, level: string, weekDate?: string): Promise<AttendanceHistory> {
    try {
      const sheetName = getSheetName(program, level);
      const date = weekDate || formatDate(getCurrentSunday());

      // Get students for this program/level
      const students = await studentService.getStudents(program, level);

      // Find the week column
      const columnIndex = await excelService.getColumnIndex(sheetName, `Week_${date}`);

      if (!columnIndex) {
        // Week column doesn't exist yet - return empty records
        return {
          program,
          level,
          weekDate: date,
          records: students.map(s => ({
            studentId: s.studentId,
            studentName: s.fullName,
            status: null as any,
            pageNumber: null,
          })),
        };
      }

      // Read attendance data
      const records: AttendanceRecord[] = [];
      
      for (const student of students) {
        const rowIndex = await excelService.findRowIndex(sheetName, 1, student.studentId);
        
        if (rowIndex) {
          const cellValue = await excelService.readCell(sheetName, `${this.columnToLetter(columnIndex - 1)}${rowIndex}`);
          const parsed = parseAttendanceValue(cellValue?.toString());
          
          records.push({
            studentId: student.studentId,
            studentName: student.fullName,
            status: parsed.status || 'absent',
            pageNumber: parsed.pageNumber,
          });
        } else {
          records.push({
            studentId: student.studentId,
            studentName: student.fullName,
            status: 'absent',
            pageNumber: null,
          });
        }
      }

      return {
        program,
        level,
        weekDate: date,
        records,
      };
    } catch (error) {
      logger.error('Failed to get attendance', { error, program, level, weekDate });
      throw error;
    }
  }

  /**
   * Submit attendance records for a specific week
   */
  async submitAttendance(submission: AttendanceSubmission): Promise<{
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
  }> {
    try {
      const sheetName = getSheetName(submission.program, submission.level);
      
      // Ensure the sheet exists
      const exists = await excelService.sheetExists(sheetName);
      if (!exists) {
        throw new Error(`Attendance sheet for ${submission.program} ${submission.level} does not exist`);
      }

      // Ensure week column exists
      const weekColumnName = `Week_${submission.weekDate}`;
      let columnIndex = await excelService.getColumnIndex(sheetName, weekColumnName);

      // If column doesn't exist, we need to add it
      if (!columnIndex) {
        columnIndex = await this.addWeekColumn(sheetName, submission.weekDate);
      }

      const updates: { cell: string; value: string }[] = [];
      let successful = 0;
      let failed = 0;

      // Prepare cell updates
      for (const record of submission.records) {
        try {
          const rowIndex = await excelService.findRowIndex(sheetName, 1, record.studentId);
          
          if (!rowIndex) {
            logger.warn('Student not found in attendance sheet', { studentId: record.studentId });
            failed++;
            continue;
          }

          const cellAddress = `${this.columnToLetter(columnIndex - 1)}${rowIndex}`;
          const cellValue = formatAttendanceValue(record.status, record.pageNumber);

          updates.push({ cell: cellAddress, value: cellValue });
          successful++;
        } catch (error) {
          logger.error('Failed to process attendance record', { error, record });
          failed++;
        }
      }

      // Write all updates at once
      if (updates.length > 0) {
        await excelService.writeCells(sheetName, updates);
      }

      // Update metadata
      await excelService.updateMetadata('LastAttendanceUpdate', new Date().toISOString());

      logger.info('Attendance submitted', {
        program: submission.program,
        level: submission.level,
        teacherId: submission.teacherId,
        weekDate: submission.weekDate,
        successful,
        failed,
      });

      return {
        recordsProcessed: submission.records.length,
        recordsSuccessful: successful,
        recordsFailed: failed,
      };
    } catch (error) {
      logger.error('Failed to submit attendance', { error, submission });
      throw error;
    }
  }

  /**
   * Bulk update page numbers for multiple students
   */
  async bulkUpdate(request: BulkUpdateRequest): Promise<{ studentsUpdated: number }> {
    try {
      const sheetName = getSheetName(request.program, request.level);
      const weekColumnName = `Week_${request.weekDate}`;
      const columnIndex = await excelService.getColumnIndex(sheetName, weekColumnName);

      if (!columnIndex) {
        throw new Error('Week column not found');
      }

      const updates: { cell: string; value: string }[] = [];

      for (const studentId of request.studentIds) {
        const rowIndex = await excelService.findRowIndex(sheetName, 1, studentId);
        
        if (rowIndex) {
          const cellAddress = `${this.columnToLetter(columnIndex - 1)}${rowIndex}`;
          // Check current status - only update if present
          const currentValue = await excelService.readCell(sheetName, cellAddress);
          const parsed = parseAttendanceValue(currentValue?.toString());
          
          if (parsed.status === 'present') {
            const cellValue = formatAttendanceValue('present', request.pageNumber);
            updates.push({ cell: cellAddress, value: cellValue });
          }
        }
      }

      if (updates.length > 0) {
        await excelService.writeCells(sheetName, updates);
      }

      logger.info('Bulk update completed', {
        program: request.program,
        level: request.level,
        studentsUpdated: updates.length,
      });

      return { studentsUpdated: updates.length };
    } catch (error) {
      logger.error('Failed to bulk update', { error, request });
      throw error;
    }
  }

  /**
   * Add a new week column to an attendance sheet
   */
  private async addWeekColumn(sheetName: string, weekDate: string): Promise<number> {
    try {
      logger.info('Adding new week column', { sheetName, weekDate });
      
      // Read the sheet to find the last column
      const sheetData = await excelService.readSheet(sheetName);
      if (!sheetData || sheetData.length === 0) {
        throw new Error('Sheet is empty');
      }
      
      // First row contains headers
      const headerRow = sheetData[0];
      const lastColumnIndex = Object.keys(headerRow).length;
      const newColumnIndex = lastColumnIndex + 1;
      
      // Add the new week column header
      const columnLetter = this.columnToLetter(newColumnIndex);
      const weekColumnName = `Week_${weekDate}`;
      
      await excelService.writeCell(sheetName, `${columnLetter}1`, weekColumnName);
      
      logger.info('Week column added successfully', { 
        sheetName, 
        weekDate, 
        columnIndex: newColumnIndex,
        columnLetter 
      });
      
      return newColumnIndex;
    } catch (error) {
      logger.error('Failed to add week column', { error, sheetName, weekDate });
      throw new Error(`Failed to add week column: ${error}`);
    }
  }

  /**
   * Convert column number to Excel letter (1-based)
   */
  private columnToLetter(column: number): string {
    let temp: number;
    let letter = '';
    let col = column;
    
    while (col > 0) {
      temp = (col - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      col = Math.floor((col - 1) / 26);
    }
    
    return letter;
  }

  /**
   * Get attendance statistics for a week
   */
  async getAttendanceStats(program: string, level: string, weekDate: string): Promise<{
    totalStudents: number;
    present: number;
    absent: number;
    averageProgress: number | null;
  }> {
    try {
      const attendance = await this.getAttendance(program, level, weekDate);
      
      const present = attendance.records.filter(r => r.status === 'present').length;
      const absent = attendance.records.filter(r => r.status === 'absent').length;
      
      const pageNumbers = attendance.records
        .filter(r => r.status === 'present' && r.pageNumber !== null)
        .map(r => r.pageNumber as number);
      
      const averageProgress = pageNumbers.length > 0
        ? pageNumbers.reduce((sum, num) => sum + num, 0) / pageNumbers.length
        : null;

      return {
        totalStudents: attendance.records.length,
        present,
        absent,
        averageProgress,
      };
    } catch (error) {
      logger.error('Failed to get attendance stats', { error, program, level, weekDate });
      throw error;
    }
  }

  /**
   * Initialize attendance sheet for a program/level if it doesn't exist
   */
  async initializeAttendanceSheet(program: string, level: string): Promise<void> {
    try {
      const sheetName = getSheetName(program, level);
      const exists = await excelService.sheetExists(sheetName);

      if (!exists) {
        // Create sheet with initial headers
        const headers = ['StudentID', 'StudentName'];
        await excelService.createSheet(sheetName, headers);
        
        // Add all students for this program/level
        const students = await studentService.getStudents(program, level);
        
        for (const student of students) {
          await excelService.addRow(sheetName, [student.studentId, student.fullName]);
        }

        logger.info('Attendance sheet initialized', { sheetName });
      }
    } catch (error) {
      logger.error('Failed to initialize attendance sheet', { error, program, level });
      throw error;
    }
  }
}

export default new AttendanceService();
