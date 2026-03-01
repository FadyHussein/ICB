import excelService from './excel.service';
import { Student, CreateStudentDTO } from '../models/student.model';
import { generateStudentId } from '../utils/id-generator';
import { normalizeProgram, normalizeLevel } from '../utils/excel-utils';
import { formatDate } from '../utils/date-utils';
import logger from '../utils/logger';

/**
 * Student service for managing student data
 */
class StudentService {
  private readonly SHEET_NAME = 'Students';

  /**
   * Get all students with optional filtering
   */
  async getStudents(program?: string, level?: string, activeOnly = true): Promise<Student[]> {
    try {
      const data = await excelService.readSheet(this.SHEET_NAME);

      let students: Student[] = data.map((row: any) => ({
        studentId: row.StudentID,
        firstName: row.FirstName,
        lastName: row.LastName,
        fullName: `${row.FirstName} ${row.LastName}`,
        program: row.Program,
        level: row.Level,
        active: row.Active === true || row.Active === 'TRUE',
        dateEnrolled: row.DateEnrolled,
        parentName: row.ParentName || '',
        parentPhone: row.ParentPhone || '',
      }));

      // Filter by active status
      if (activeOnly) {
        students = students.filter((s) => s.active);
      }

      // Filter by program if specified
      if (program) {
        const normalizedProgram = normalizeProgram(program);
        students = students.filter((s) => s.program === normalizedProgram);
      }

      // Filter by level if specified
      if (level) {
        const normalizedLevel = normalizeLevel(level);
        students = students.filter((s) => s.level === normalizedLevel);
      }

      return students;
    } catch (error) {
      logger.error('Failed to get students', { error });
      throw error;
    }
  }

  /**
   * Get a specific student by ID
   */
  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const students = await this.getStudents(undefined, undefined, false);
      return students.find((s) => s.studentId === studentId) || null;
    } catch (error) {
      logger.error('Failed to get student by ID', { error, studentId });
      throw error;
    }
  }

  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentDTO): Promise<Student> {
    try {
      // Get existing students to generate new ID
      const existingData = await excelService.readSheet(this.SHEET_NAME);
      const existingIds = existingData.map((row: any) => row.StudentID);
      const newId = generateStudentId(existingIds);

      const today = formatDate(new Date());

      // Add new row to sheet
      await excelService.addRow(this.SHEET_NAME, [
        newId,
        data.firstName,
        data.lastName,
        data.program,
        data.level,
        data.active !== false,
        today,
        data.parentName || '',
        data.parentPhone || '',
      ]);

      const newStudent: Student = {
        studentId: newId,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        program: data.program,
        level: data.level,
        active: data.active !== false,
        dateEnrolled: today,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
      };

      logger.info('Student created', { studentId: newId });
      return newStudent;
    } catch (error) {
      logger.error('Failed to create student', { error });
      throw error;
    }
  }

  /**
   * Update student information
   */
  async updateStudent(studentId: string, updates: Partial<CreateStudentDTO>): Promise<Student> {
    try {
      const student = await this.getStudentById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const rowUpdates: { [column: number]: any } = {};

      if (updates.firstName) rowUpdates[2] = updates.firstName;
      if (updates.lastName) rowUpdates[3] = updates.lastName;
      if (updates.program) rowUpdates[4] = updates.program;
      if (updates.level) rowUpdates[5] = updates.level;
      if (updates.active !== undefined) rowUpdates[6] = updates.active;
      if (updates.parentName) rowUpdates[8] = updates.parentName;
      if (updates.parentPhone) rowUpdates[9] = updates.parentPhone;

      const updated = await excelService.updateRow(this.SHEET_NAME, 1, studentId, rowUpdates);

      if (!updated) {
        throw new Error('Failed to update student');
      }

      logger.info('Student updated', { studentId });
      
      // Return updated student
      return await this.getStudentById(studentId) as Student;
    } catch (error) {
      logger.error('Failed to update student', { error, studentId });
      throw error;
    }
  }

  /**
   * Deactivate a student
   */
  async deactivateStudent(studentId: string): Promise<void> {
    try {
      await excelService.updateRow(this.SHEET_NAME, 1, studentId, { 6: false });
      logger.info('Student deactivated', { studentId });
    } catch (error) {
      logger.error('Failed to deactivate student', { error, studentId });
      throw error;
    }
  }
}

export default new StudentService();
