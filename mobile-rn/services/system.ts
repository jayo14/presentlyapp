import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export interface SystemLogFilters {
  search?: string;
  event_type?: string;
  level?: string;
  role?: string;
  date_from?: string;
  date_to?: string;
  ip_address?: string;
  page?: number;
}

export const systemService = {
  getStats: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.STATS);
  },

  getActivity: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ACTIVITY);
  },

  getAlerts: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.ALERTS);
  },

  getLogs: async (filters?: SystemLogFilters): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.LOGS, filters);
  },

  exportLogsCsv: async (filters?: SystemLogFilters): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.LOGS_EXPORT_CSV, filters, {
      responseType: 'blob',
    });
  },

  getConfig: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.SYSTEM.CONFIG);
  },

  updateConfig: async (data: any): Promise<any> => {
    return apiClient.patch(API_ENDPOINTS.SYSTEM.CONFIG, data);
  },
};
