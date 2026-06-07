import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 60000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.notifications.read(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useSendNotification = () => {
  return useMutation({
    mutationFn: (data: any) => api.notifications.send(data),
  });
};

export const useBroadcastNotification = () => {
  return useMutation({
    mutationFn: (data: any) => api.notifications.broadcast(data),
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => api.notifications.getPreferences(),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.notifications.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

export const useNotificationDevices = () => {
  return useQuery({
    queryKey: ['notifications', 'devices'],
    queryFn: () => api.notifications.getDevices(),
  });
};

export const useRegisterNotificationDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.notifications.registerDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'devices'] });
    },
  });
};
