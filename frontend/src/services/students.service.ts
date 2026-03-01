import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { Student } from '../types/student.types';

export const studentsService = {
  async getStudents(program: string, level: string, activeOnly: boolean = true): Promise<Student[]> {
    const params = {
      program,
      level,
      activeOnly: activeOnly.toString(),
    };
    
    const response = await apiClient.get<ApiResponse<Student[]>>('/students', { params });
    return response.data.data || [];
  },

  async getStudentById(id: string): Promise<Student> {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data!;
  },
};
