import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const sessionsService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.SESSIONS.LIST);
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.SESSIONS.CREATE, data);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.SESSIONS.GET(id));
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.SESSIONS.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.SESSIONS.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.SESSIONS.DELETE(id));
  },
  checkIn: async (sessionId: string, data: any) => {
    return apiClient.post(API_ENDPOINTS.SESSIONS.CHECK_IN(sessionId), data);
  },
  end: async (sessionId: string) => {
    return apiClient.post(API_ENDPOINTS.SESSIONS.END(sessionId));
  },
  // Legacy support
  getActive: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LIVE_SESSIONS);
  },
  getUpcoming: async () => {
    return apiClient.get(API_ENDPOINTS.SESSIONS.LIST, { status: 'upcoming' });
  },
};
