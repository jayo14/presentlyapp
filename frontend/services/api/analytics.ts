import apiClient from './client';

export interface LecturerDashboardAnalytics {
  total_sessions: number;
  avg_attendance_percentage: number;
  active_sessions_count: number;
  total_students?: number;
  weekly_overview: Array<{
    name: string;
    attendees: number;
  }>;
}

export interface StudentAnalytics {
  id: string;
  name: string;
  matric: string;
  department: string;
  level: string;
  attended: number;
  total: number;
  percentage: number;
}

export interface CourseAttendanceAnalytics {
  course_id: number;
  course_code: string;
  course_name: string;
  total_sessions: number;
  students: StudentAnalytics[];
  avg_attendance: number;
  at_risk_count: number;
  good_standing_count: number;
  benchmark: number;
}

export const analyticsApi = {
  // Get lecturer dashboard analytics – prefer analytics endpoint, then fall back to summary endpoint
  getLecturerDashboard: async (): Promise<LecturerDashboardAnalytics> => {
    try {
      const response = await apiClient.get('/analytics/dashboard/lecturer/');
      return response.data;
    } catch {
      // Fall through to alternate summary endpoint
    }

    const response = await apiClient.get('/institutions/dashboard/lecturer/');
    const summary = response.data;
    if (summary?.success && summary.data) {
      return {
        total_sessions: summary.data.stats?.todays_sessions ?? 0,
        avg_attendance_percentage: 0,
        active_sessions_count: summary.data.stats?.active_sessions ?? 0,
        total_students: summary.data.stats?.total_students ?? 0,
        weekly_overview: [],
        // Attach raw data for components that need it
        _raw: summary.data,
      } as any;
    }

    return {
      total_sessions: 0,
      avg_attendance_percentage: 0,
      active_sessions_count: 0,
      total_students: 0,
      weekly_overview: [],
    };
  },

  // Get course attendance analytics
  getCourseAttendance: async (courseId: number, benchmark?: number): Promise<CourseAttendanceAnalytics> => {
    const params = benchmark ? { benchmark } : {};
    const response = await apiClient.get(`/analytics/attendance/course/${courseId}/`, { params });
    return response.data;
  },
};
