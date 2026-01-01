import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';

// Types
interface DashboardAnalytics {
  total_students?: number;
  total_courses?: number;
  total_sessions?: number;
  average_attendance?: number;
  recent_activities?: any[];
}

interface AttendanceOverview {
  total_sessions: number;
  attended_sessions: number;
  attendance_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface AttendanceTrend {
  date: string;
  attendance_count: number;
  total_students: number;
  percentage: number;
}

interface SessionAnalytics {
  session_id: number;
  total_students: number;
  present: number;
  late: number;
  absent: number;
  attendance_rate: number;
}

// Dashboard Analytics
export const useStudentDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', 'student'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard/student/');
      return response.data as DashboardAnalytics;
    },
  });
};

export const useLecturerDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', 'lecturer'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard/lecturer/');
      return response.data as DashboardAnalytics;
    },
  });
};

export const useAdminDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', 'admin'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard/admin/');
      return response.data as DashboardAnalytics;
    },
  });
};

// Attendance Analytics
export const useAttendanceOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'attendance', 'overview'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/attendance/overview/');
      return response.data as AttendanceOverview;
    },
  });
};

export const useAttendanceTrends = (params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'attendance', 'trends', params],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/attendance/trends/', { params });
      return response.data as AttendanceTrend[];
    },
  });
};

export const useCourseAttendanceAnalytics = (courseId: number) => {
  return useQuery({
    queryKey: ['analytics', 'course', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/attendance/course/${courseId}/`);
      return response.data;
    },
    enabled: !!courseId,
  });
};

export const useStudentAttendanceAnalytics = (studentId: string) => {
  return useQuery({
    queryKey: ['analytics', 'student', studentId],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/attendance/student/${studentId}/`);
      return response.data;
    },
    enabled: !!studentId,
  });
};

// Session Analytics
export const useSessionStatistics = () => {
  return useQuery({
    queryKey: ['analytics', 'sessions', 'statistics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/sessions/statistics/');
      return response.data;
    },
  });
};

export const useSessionAnalytics = (sessionId: number) => {
  return useQuery({
    queryKey: ['analytics', 'session', sessionId],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/sessions/${sessionId}/analytics/`);
      return response.data as SessionAnalytics;
    },
    enabled: !!sessionId,
  });
};

export const useLiveSessionAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'sessions', 'live'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/sessions/live/');
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live data
  });
};

// Student Analytics
export const useAtRiskStudents = () => {
  return useQuery({
    queryKey: ['analytics', 'students', 'at-risk'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/students/at-risk/');
      return response.data;
    },
  });
};

export const useStudentPerformance = (params?: { course_id?: number; department_id?: number }) => {
  return useQuery({
    queryKey: ['analytics', 'students', 'performance', params],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/students/performance/', { params });
      return response.data;
    },
  });
};

export const useStudentEngagement = () => {
  return useQuery({
    queryKey: ['analytics', 'students', 'engagement'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/students/engagement/');
      return response.data;
    },
  });
};

// Course Analytics
export const useCourseStatistics = () => {
  return useQuery({
    queryKey: ['analytics', 'courses', 'statistics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/courses/statistics/');
      return response.data;
    },
  });
};

export const useCourseComparison = (courseIds: number[]) => {
  return useQuery({
    queryKey: ['analytics', 'courses', 'comparison', courseIds],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/courses/comparison/', {
        params: { course_ids: courseIds.join(',') },
      });
      return response.data;
    },
    enabled: courseIds.length > 0,
  });
};

// Department/College Analytics
export const useDepartmentAnalytics = (departmentId: number) => {
  return useQuery({
    queryKey: ['analytics', 'department', departmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/department/${departmentId}/analytics/`);
      return response.data;
    },
    enabled: !!departmentId,
  });
};

export const useCollegeAnalytics = (collegeId: number) => {
  return useQuery({
    queryKey: ['analytics', 'college', collegeId],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/college/${collegeId}/analytics/`);
      return response.data;
    },
    enabled: !!collegeId,
  });
};

// Predictive Analytics
export const useAttendancePrediction = (params?: { student_id?: string; course_id?: number }) => {
  return useQuery({
    queryKey: ['analytics', 'predictions', 'attendance', params],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/predictions/attendance/', { params });
      return response.data;
    },
  });
};

export const useDropoutPrediction = () => {
  return useQuery({
    queryKey: ['analytics', 'predictions', 'dropouts'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/predictions/dropouts/');
      return response.data;
    },
  });
};
