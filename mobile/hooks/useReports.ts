import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => api.reports.list(),
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }: { type: string; data: any }) => api.reports.generate(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ type, data }: { type: string; data: any }) => api.reports.export(type, data),
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (id: string) => api.reports.download(id),
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.reports.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: ['reports', 'scheduled'],
    queryFn: () => api.reports.listScheduled(),
  });
};

export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.reports.createScheduled(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
};

export const useToggleScheduledReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.reports.toggleScheduled(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
};
