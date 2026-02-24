import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const lecturerService = {
  getDashboard: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LECTURER_DASHBOARD);
  },
  getActivity: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ACTIVITY);
  },
  getStats: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.STATS);
  },
  getAlerts: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ALERTS);
  },
  getLogs: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.LOGS);
  },
};
