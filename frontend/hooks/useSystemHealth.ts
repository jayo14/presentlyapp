import { useQuery } from '@tanstack/react-query';
import { systemApi, AdminPlatformHealth, SystemHealthResponse } from '../services/api/system';

export const useSystemHealth = (enabled = true) => {
  return useQuery<SystemHealthResponse, Error, AdminPlatformHealth>({
    queryKey: ['system', 'health'],
    queryFn: systemApi.getHealth,
    select: (response) => response.platform_health,
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    enabled,
  });
};
