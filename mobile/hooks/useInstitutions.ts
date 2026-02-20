import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// Institutions
export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => api.institutions.list(),
  });
};

export const useInstitution = (id: string) => {
  return useQuery({
    queryKey: ['institution', id],
    queryFn: () => api.institutions.get(id),
    enabled: !!id,
  });
};

export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.institutions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.institutions.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({ queryKey: ['institution', variables.id] });
    },
  });
};

export const useDeleteInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.institutions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

// Colleges
export const useColleges = () => {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: () => api.colleges.list(),
  });
};

export const useCollegeAnalytics = (id: string) => {
  return useQuery({
    queryKey: ['college', id, 'analytics'],
    queryFn: () => api.analytics.getCollegeAnalytics(id),
    enabled: !!id,
  });
};

// Departments
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.departments.list(),
  });
};

export const useDepartmentAnalytics = (id: string) => {
  return useQuery({
    queryKey: ['department', id, 'analytics'],
    queryFn: () => api.analytics.getDepartmentAnalytics(id),
    enabled: !!id,
  });
};
