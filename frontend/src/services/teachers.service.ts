import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { Teacher } from '../types/teacher.types';

export const teachersService = {
  async getTeachers(program?: string, level?: string): Promise<Teacher[]> {
    const params: any = {};
    if (program) params.program = program;
    if (level) params.level = level;
    
    const response = await apiClient.get<ApiResponse<Teacher[]>>('/teachers', { params });
    return response.data.data || [];
  },

  async getTeacherById(id: string): Promise<Teacher> {
    const response = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    return response.data.data!;
  },
};
