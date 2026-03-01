export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  timestamp: string;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ProgramConfig {
  id: string;
  name: string;
  displayName: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  displayName: string;
  program: string;
}
