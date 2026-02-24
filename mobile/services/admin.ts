import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export interface AdminDashboardStats {
  total_institutions: number;
  institution_trend?: string;
  total_colleges: number;
  active_sessions: number;
  attendance_rate: number;
}

export interface SystemActivity {
  type: string;
  title: string;
  description: string;
  time?: string;
  timestamp?: string;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    return apiClient.get<AdminDashboardStats>(API_ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD);
  },
  getSystemStats: async () => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.STATS);
  },
  getActivity: async (): Promise<SystemActivity[]> => {
    return apiClient.get<SystemActivity[]>(API_ENDPOINTS.SYSTEM.ACTIVITY);
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
