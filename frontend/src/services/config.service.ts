import apiClient from './api';
import type { ApiResponse, ProgramConfig, LevelConfig } from '../types/api.types';

export const configService = {
  async getPrograms(): Promise<ProgramConfig[]> {
    const response = await apiClient.get<ApiResponse<ProgramConfig[]>>('/programs');
    return response.data.data || [];
  },

  async getLevels(programId: string): Promise<LevelConfig[]> {
    const response = await apiClient.get<ApiResponse<LevelConfig[]>>(`/programs/${programId}/levels`);
    return response.data.data || [];
  },

  async getCurrentWeek(): Promise<any> {
    const response = await apiClient.get<ApiResponse>('/config/current-week');
    return response.data.data;
  },
};
