import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const enrollmentsService = {
  list: async (params?: any): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ENROLLMENTS.LIST, params);
  },
  create: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.ENROLLMENTS.CREATE, data);
  },
  get: async (id: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ENROLLMENTS.GET(id));
  },
  update: async (id: string, data: any): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.ENROLLMENTS.UPDATE(id), data);
  },
  delete: async (id: string): Promise<any> => {
    return apiClient.delete(API_ENDPOINTS.ENROLLMENTS.DELETE(id));
  },
  enroll: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.ENROLLMENTS.ENROLL, data);
  },
  drop: async (id: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.ENROLLMENTS.DROP(id));
  },
};
