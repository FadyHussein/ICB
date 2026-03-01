import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { ApiResponse } from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const apiError = error.response.data;
      console.error('API Error:', apiError);
      return Promise.reject(apiError);
    } else if (error.request) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server. Please check your connection.',
        },
      });
    } else {
      console.error('Error:', error.message);
      return Promise.reject({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred.',
        },
      });
    }
  }
);

export default apiClient;
