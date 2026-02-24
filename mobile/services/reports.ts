import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const reportsService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.REPORTS.LIST);
  },
  generate: async (type: string, data: any) => {
    return apiClient.post(API_ENDPOINTS.REPORTS.GENERATE(type), data);
  },
  export: async (type: string, data: any) => {
    return apiClient.post(API_ENDPOINTS.REPORTS.EXPORT(type), data);
  },
  download: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.REPORTS.DOWNLOAD(id));
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.REPORTS.DELETE(id));
  },
  listScheduled: async () => {
    return apiClient.get(API_ENDPOINTS.REPORTS.SCHEDULED);
  },
  createScheduled: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.REPORTS.CREATE_SCHEDULED, data);
  },
  toggleScheduled: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.REPORTS.TOGGLE_SCHEDULED(id));
  },
};
