import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';
import { queryKeys } from '../services/api/queryClient';

// Types
interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface FCMDevice {
  id: number;
  registration_token: string;
  device_type: 'ANDROID' | 'IOS' | 'WEB';
  device_name?: string;
  is_active: boolean;
}

interface NotificationPreferences {
  attendance_reminders: boolean;
  session_alerts: boolean;
  absence_warnings: boolean;
  exam_clearance_updates: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
}

// Queries
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/');
      return response.data;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/unread-count/');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useFCMDevices = () => {
  return useQuery({
    queryKey: ['fcm-devices'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/devices/');
      return response.data;
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/preferences/');
      return response.data;
    },
  });
};

// Mutations
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiClient.post(`/notifications/${notificationId}/read/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/notifications/mark-all-read/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useRegisterFCMDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      registration_token: string;
      device_type: 'ANDROID' | 'IOS' | 'WEB';
      device_name?: string;
      browser?: string;
    }) => {
      const response = await apiClient.post('/notifications/devices/register/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fcm-devices'] });
    },
  });
};

export const useDeactivateFCMDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deviceId: number) => {
      const response = await apiClient.post(`/notifications/devices/${deviceId}/deactivate/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fcm-devices'] });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const response = await apiClient.patch('/notifications/preferences/', preferences);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};

export const useSendNotification = () => {
  return useMutation({
    mutationFn: async (data: {
      user_ids: string[];
      title: string;
      message: string;
      notification_type: string;
      data?: any;
    }) => {
      const response = await apiClient.post('/notifications/send/', data);
      return response.data;
    },
  });
};

export const useBroadcastNotification = () => {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      message: string;
      notification_type: string;
      target_role?: string;
      data?: any;
    }) => {
      const response = await apiClient.post('/notifications/broadcast/', data);
      return response.data;
    },
  });
};
