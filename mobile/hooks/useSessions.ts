import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.sessions.list(),
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => api.sessions.get(id),
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.sessions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.sessions.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.id] });
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.sessions.end(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', id] });
    },
  });
};

export const useLiveSessions = () => {
  return useQuery({
    queryKey: ['sessions', 'live'],
    queryFn: () => api.sessions.getActive(),
    refetchInterval: 30000,
  });
};

export const useSessionStatistics = () => {
  return useQuery({
    queryKey: ['sessions', 'statistics'],
    queryFn: () => api.analytics.getSessionStatistics(),
  });
};

export const useSessionAnalytics = (id: string) => {
  return useQuery({
    queryKey: ['session', id, 'analytics'],
    queryFn: () => api.analytics.getSessionAnalytics(id),
    enabled: !!id,
  });
};
