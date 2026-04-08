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
  // PRD-required fields
  matric_number: string;
  full_name: string;
  total_sessions: number;
  sessions_attended: number;
  attendance_rate: number;
  status: 'Present' | 'Absent';
  // Legacy fields (backward-compat)
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
  lecturer?: string;
  total_sessions: number;
  students: StudentAnalytics[];
  avg_attendance: number;
  at_risk_count: number;
  good_standing_count: number;
  benchmark: number;
  date_from?: string | null;
  date_to?: string | null;
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

  // Get course attendance analytics (returns PRD-required table format, sorted by matric)
  getCourseAttendance: async (
    courseId: number,
    params?: { benchmark?: number; date_from?: string; date_to?: string; department_id?: number; college_id?: number }
  ): Promise<CourseAttendanceAnalytics> => {
    const response = await apiClient.get(`/analytics/attendance/course/${courseId}/`, { params });
    return response.data;
  },

  // Export course attendance table as file (csv | excel | pdf)
  exportCourseAttendance: (
    courseId: number,
    fmt: 'csv' | 'excel' | 'pdf',
    params?: { date_from?: string; date_to?: string }
  ) => {
    const base = apiClient.defaults.baseURL ?? '';
    const queryStr = params
      ? '?' + Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&')
      : '';
    const url = `${base}/analytics/attendance/course/${courseId}/export/${fmt}/${queryStr}`;
    window.open(url, '_blank');
  },
};
