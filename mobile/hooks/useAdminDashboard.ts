import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => api.admin.getDashboardStats(),
  });
};

export const useSystemStats = () => {
  return useQuery({
    queryKey: ['admin', 'system-stats'],
    queryFn: () => api.admin.getSystemStats(),
  });
};

export const useSystemActivity = () => {
  return useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: () => api.admin.getActivity(),
  });
};

export const useSystemAlerts = () => {
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => api.admin.getAlerts(),
  });
};

export const useAttendanceOverview = () => {
  return useQuery({
    queryKey: ['admin', 'attendance-overview'],
    queryFn: () => api.admin.getAttendanceOverview(),
  });
};

export const useAttendanceTrends = () => {
  return useQuery({
    queryKey: ['admin', 'attendance-trends'],
    queryFn: () => api.admin.getAttendanceTrends(),
  });
};

export const useCourseStatistics = () => {
  return useQuery({
    queryKey: ['admin', 'course-statistics'],
    queryFn: () => api.admin.getCourseStatistics(),
  });
};

export const useAttendancePredictions = () => {
  return useQuery({
    queryKey: ['admin', 'predictions', 'attendance'],
    queryFn: () => api.admin.getAttendancePredictions(),
  });
};

export const useDropoutPredictions = () => {
  return useQuery({
    queryKey: ['admin', 'predictions', 'dropouts'],
    queryFn: () => api.admin.getDropoutPredictions(),
  });
};
