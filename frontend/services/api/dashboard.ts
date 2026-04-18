import apiClient from './client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryClient';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  courses_count: number;
  overall_attendance: number;
  active_sessions_count: number;
}

export interface DashboardActiveSession {
  id: number;
  course: number;
  course_name?: string;
  course_code?: string;
  venue_name?: string;
  venue_code?: string;
  session_code: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  attendee_count?: number;
}

export interface DashboardTimetableEntry {
  id: number;
  course: number;
  course_code?: string;
  course_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue_name?: string;
  semester?: string;
  is_active: boolean;
}

export interface DashboardAttendanceRecord {
  id: number;
  session: number;
  student: string;
  course_code?: string;
  checked_in_at: string;
  status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
  location_verified: boolean;
  distance_from_venue?: number;
}

export interface StudentDashboardSummary {
  success: boolean;
  data: {
    overview: DashboardOverview;
    active_sessions: DashboardActiveSession[];
    upcoming_classes: DashboardTimetableEntry[];
    recent_attendance: DashboardAttendanceRecord[];
  };
}

export interface LecturerDashboardStats {
  total_courses: number;
  total_students: number;
  active_sessions: number;
  todays_sessions: number;
}

export interface LecturerDashboardSummary {
  success: boolean;
  data: {
    stats: LecturerDashboardStats;
    active_sessions: DashboardActiveSession[];
    recent_sessions: DashboardActiveSession[];
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * Fetch the aggregated Student Dashboard summary.
   * Endpoint: GET /dashboard/student/
   */
  getStudentSummary: async (): Promise<StudentDashboardSummary> => {
    const response = await apiClient.get('/dashboard/student/');
    return response.data;
  },

  /**
   * Fetch the aggregated Lecturer Dashboard summary. 
   * Endpoint: GET /dashboard/lecturer/
   */
  getLecturerSummary: async (): Promise<LecturerDashboardSummary> => {
    const response = await apiClient.get('/dashboard/lecturer/');
    return response.data;
  },

  /**
   * Backwards-compatible alias for the lecturer dashboard summary endpoint.
   */
  getLecturerDashboard: async (): Promise<LecturerDashboardSummary> => {
    return dashboardApi.getLecturerSummary();
  },

  /**
   * Export attendance report as a file download.
   * Endpoint: GET /reports/export/attendance/{format}/?course_id={id}
   * @param format - 'csv' | 'excel' | 'pdf'
   * @param courseId - The course ID to export attendance for
   */
  exportAttendance: async (format: 'csv' | 'excel' | 'pdf', courseId: number): Promise<Blob> => {
    const response = await apiClient.get(`/reports/export/attendance/${format}/`, {
      params: { course_id: courseId },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Upload a digital signature image.
   * Endpoint: POST /institutions/auth/upload-signature/
   */
  uploadSignature: async (file: File): Promise<{ success: boolean; signature_url: string }> => {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await apiClient.post('/institutions/auth/upload-signature/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Manually mark a student's attendance (lecturer only).
   * Endpoint: POST /sessions/{sessionId}/manual_mark/
   */
  manualMark: async (
    sessionId: number,
    studentIdentifier: string,
    status: string,
    fullName?: string
  ): Promise<any> => {
    const normalizedIdentifier = studentIdentifier.trim().toUpperCase();
    const response = await apiClient.post(`/sessions/${sessionId}/manual_mark/`, {
      student_id: normalizedIdentifier,
      matric_number: normalizedIdentifier,
      full_name: fullName?.trim(),
      status,
    });
    return response.data;
  },
};

export const useLecturerDashboard = () =>
  useQuery({
    queryKey: [...queryKeys.currentUser, 'lecturer-dashboard'],
    queryFn: dashboardApi.getLecturerDashboard,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchInterval: 60 * 1000,
  });
