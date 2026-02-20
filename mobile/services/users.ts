import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const usersService = {
  list: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.USERS.LIST, params);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.USERS.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },
  resetPassword: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id));
  },
};
