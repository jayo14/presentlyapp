import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.courses.list(),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => api.courses.get(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.courses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.courses.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.courses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCourseEnrolledStudents = (id: string) => {
  return useQuery({
    queryKey: ['course', id, 'students'],
    queryFn: () => api.courses.getEnrolledStudents(id),
    enabled: !!id,
  });
};

export const useCourseAttendance = (id: string) => {
  return useQuery({
    queryKey: ['course', id, 'attendance'],
    queryFn: () => api.analytics.getCourseAttendance(id),
    enabled: !!id,
  });
};

export const useCourseComparison = () => {
  return useQuery({
    queryKey: ['courses', 'comparison'],
    queryFn: () => api.analytics.getComparison(),
  });
};
