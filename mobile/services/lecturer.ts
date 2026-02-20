import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const lecturerService = {
  getDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LECTURER_DASHBOARD);
  },
  getActivity: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ACTIVITY);
  },
  getStats: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.STATS);
  },
  getAlerts: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ALERTS);
  },
};
