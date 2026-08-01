import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const attendancesService = {
  list: async (params?: any): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ATTENDANCES.LIST, params);
  },
  get: async (id: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ATTENDANCES.GET(id));
  },
  create: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.ATTENDANCES.CREATE, data);
  },
  update: async (id: string, data: any): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.ATTENDANCES.UPDATE(id), data);
  },
  delete: async (id: string): Promise<any> => {
    return apiClient.delete(API_ENDPOINTS.ATTENDANCES.DELETE(id));
  },
};
