import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const notificationsService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
  },
  getUnreadCount: async () => {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  },
  markAllRead: async () => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
  read: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ(id));
  },
  send: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, data);
  },
  broadcast: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.BROADCAST, data);
  },
  getPreferences: async () => {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
  },
  updatePreferences: async (data: any) => {
    return apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, data);
  },
  registerDevice: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data);
  },
  getDevices: async () => {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.DEVICES);
  },
  deactivateDevice: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.DEACTIVATE_DEVICE(id));
  },
};
