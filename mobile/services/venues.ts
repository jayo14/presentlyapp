import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const venuesService = {
  list: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.VENUES.LIST, params);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.VENUES.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.VENUES.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.VENUES.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.VENUES.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.VENUES.DELETE(id));
  },
  getSessions: async (venueId: string) => {
    return apiClient.get(API_ENDPOINTS.VENUES.SESSIONS(venueId));
  },
  getActiveSessions: async () => {
    return apiClient.get(API_ENDPOINTS.VENUES.ACTIVE_SESSIONS);
  },
};
