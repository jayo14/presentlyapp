import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const adminService = {
  getDashboardStats: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD);
  },
  getSystemStats: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.STATS);
  },
  getActivity: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ACTIVITY);
  },
  getAlerts: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ALERTS);
  },
  getAttendanceOverview: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
  },
  getAttendanceTrends: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.TRENDS);
  },
  getCourseStatistics: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STATISTICS);
  },
  getAttendancePredictions: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_ATTENDANCE);
  },
  getDropoutPredictions: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_DROPOUTS);
  },
};
