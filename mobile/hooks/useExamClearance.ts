import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useExamClearances = () => {
  return useQuery({
    queryKey: ['exam-clearances'],
    queryFn: () => api.examClearance.list(),
  });
};

export const useExamClearance = (id: string) => {
  return useQuery({
    queryKey: ['exam-clearance', id],
    queryFn: () => api.examClearance.get(id),
    enabled: !!id,
  });
};

export const useCalculateAllClearance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.examClearance.calculateAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useGenerateClearance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.examClearance.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useApproveClearance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.examClearance.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
      queryClient.invalidateQueries({ queryKey: ['exam-clearance', id] });
    },
  });
};

export const useRejectClearance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.examClearance.reject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
      queryClient.invalidateQueries({ queryKey: ['exam-clearance', id] });
    },
  });
};

export const useExamClearanceReport = () => {
  return useQuery({
    queryKey: ['exam-clearance', 'report'],
    queryFn: () => api.examClearance.getReport(),
  });
};

export const useExamClearanceCertificate = (id: string) => {
  return useQuery({
    queryKey: ['exam-clearance', id, 'certificate'],
    queryFn: () => api.examClearance.getCertificate(id),
    enabled: !!id,
  });
};
