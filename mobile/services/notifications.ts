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
  registerDevice: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data);
  },
  deactivateDevice: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.DEACTIVATE_DEVICE(id));
  },
};
