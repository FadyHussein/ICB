import excelService from './excel.service';
import { Teacher, CreateTeacherDTO } from '../models/teacher.model';
import { generateTeacherId } from '../utils/id-generator';
import { normalizeProgram } from '../utils/excel-utils';
import { formatDate } from '../utils/date-utils';
import logger from '../utils/logger';

/**
 * Teacher service for managing teacher data
 */
class TeacherService {
  private readonly SHEET_NAME = 'Teachers';

  /**
   * Get all teachers with optional filtering
   */
  async getTeachers(program?: string, level?: string): Promise<Teacher[]> {
    try {
      const data = await excelService.readSheet(this.SHEET_NAME);

      let teachers: Teacher[] = data
        .filter((row: any) => row.Active === true || row.Active === 'TRUE')
        .map((row: any) => ({
          teacherId: row.TeacherID,
          teacherName: row.TeacherName,
          program: row.Program,
          levels: row.Level ? row.Level.split(',').map((l: string) => l.trim()) : [],
          active: true,
          dateAdded: row.DateAdded,
        }));

      // Filter by program if specified
      if (program) {
        const normalizedProgram = normalizeProgram(program);
        teachers = teachers.filter(
          (t) => t.program === normalizedProgram || t.program === 'Both'
        );
      }

      // Filter by level if specified
      if (level) {
        const normalizedLevel = level.toUpperCase();
        teachers = teachers.filter((t) => t.levels.includes(normalizedLevel));
      }

      return teachers;
    } catch (error) {
      logger.error('Failed to get teachers', { error });
      throw error;
    }
  }

  /**
   * Get a specific teacher by ID
   */
  async getTeacherById(teacherId: string): Promise<Teacher | null> {
    try {
      const teachers = await this.getTeachers();
      return teachers.find((t) => t.teacherId === teacherId) || null;
    } catch (error) {
      logger.error('Failed to get teacher by ID', { error, teacherId });
      throw error;
    }
  }

  /**
   * Create a new teacher
   */
  async createTeacher(data: CreateTeacherDTO): Promise<Teacher> {
    try {
      // Get existing teachers to generate new ID
      const existingData = await excelService.readSheet(this.SHEET_NAME);
      const existingIds = existingData.map((row: any) => row.TeacherID);
      const newId = generateTeacherId(existingIds);

      const today = formatDate(new Date());
      const levelsString = data.levels.join(',');

      // Add new row to sheet
      await excelService.addRow(this.SHEET_NAME, [
        newId,
        data.teacherName,
        data.program,
        levelsString,
        data.active !== false,
        today,
      ]);

      const newTeacher: Teacher = {
        teacherId: newId,
        teacherName: data.teacherName,
        program: data.program,
        levels: data.levels,
        active: data.active !== false,
        dateAdded: today,
      };

      logger.info('Teacher created', { teacherId: newId });
      return newTeacher;
    } catch (error) {
      logger.error('Failed to create teacher', { error });
      throw error;
    }
  }

  /**
   * Update teacher information
   */
  async updateTeacher(teacherId: string, updates: Partial<CreateTeacherDTO>): Promise<Teacher> {
    try {
      const teacher = await this.getTeacherById(teacherId);
      if (!teacher) {
        throw new Error('Teacher not found');
      }

      const rowUpdates: { [column: number]: any } = {};

      if (updates.teacherName) rowUpdates[2] = updates.teacherName;
      if (updates.program) rowUpdates[3] = updates.program;
      if (updates.levels) rowUpdates[4] = updates.levels.join(',');
      if (updates.active !== undefined) rowUpdates[5] = updates.active;

      const updated = await excelService.updateRow(this.SHEET_NAME, 1, teacherId, rowUpdates);

      if (!updated) {
        throw new Error('Failed to update teacher');
      }

      logger.info('Teacher updated', { teacherId });
      
      // Return updated teacher
      return await this.getTeacherById(teacherId) as Teacher;
    } catch (error) {
      logger.error('Failed to update teacher', { error, teacherId });
      throw error;
    }
  }

  /**
   * Deactivate a teacher
   */
  async deactivateTeacher(teacherId: string): Promise<void> {
    try {
      await excelService.updateRow(this.SHEET_NAME, 1, teacherId, { 5: false });
      logger.info('Teacher deactivated', { teacherId });
    } catch (error) {
      logger.error('Failed to deactivate teacher', { error, teacherId });
      throw error;
    }
  }
}

export default new TeacherService();
