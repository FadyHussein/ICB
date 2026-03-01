import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { AttendanceSubmission, AttendanceResponse } from '../types/attendance.types';

export const attendanceService = {
  async submitAttendance(submission: AttendanceSubmission): Promise<AttendanceResponse> {
    const response = await apiClient.post<ApiResponse<AttendanceResponse>>('/attendance/submit', submission);
    return response.data.data!;
  },

  async bulkUpdate(data: {
    program: string;
    level: string;
    weekDate: string;
    studentIds: string[];
    pageNumber: number;
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse>('/attendance/bulk-update', data);
    return response.data.data;
  },

  async getAttendance(program: string, level: string, date?: string): Promise<any> {
    const params: any = { program, level };
    if (date) params.date = date;
    
    const response = await apiClient.get<ApiResponse>('/attendance', { params });
    return response.data.data;
  },
};
