import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

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
};
