import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const timetablesService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.TIMETABLES.LIST);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.TIMETABLES.GET(id));
  },
};
