import apiClient from './client';

export interface LecturerDashboardAnalytics {
  total_sessions: number;
  avg_attendance_percentage: number;
  active_sessions_count: number;
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
  // Get lecturer dashboard analytics
  getLecturerDashboard: async (): Promise<LecturerDashboardAnalytics> => {
    const response = await apiClient.get('/analytics/dashboard/lecturer/');
    return response.data;
  },

  // Get course attendance analytics
  getCourseAttendance: async (courseId: number, benchmark?: number): Promise<CourseAttendanceAnalytics> => {
    const params = benchmark ? { benchmark } : {};
    const response = await apiClient.get(`/analytics/attendance/course/${courseId}/`, { params });
    return response.data;
  },
};
