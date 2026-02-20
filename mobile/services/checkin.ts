import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const checkInService = {
  get: async (code: string) => {
    return apiClient.get(API_ENDPOINTS.CHECK_IN.GET(code));
  },
  mark: async (code: string, data: any) => {
    return apiClient.post(API_ENDPOINTS.CHECK_IN.MARK(code), data);
  },
};
