import apiClient from './client';
import { Course } from './attendance';

export interface EnrolledCourse {
  id: number;
  course: number;
  course_code: string;
  course_name: string;
  course_title: string;
  department: number;
  department_name?: string;
  semester?: string;
  level?: string;
  credit_units: number;
  lecturer_name?: string;
  is_active: boolean;
  enrolled_at: string;
  attendance_percentage?: number;
  sessions_attended?: number;
  total_sessions?: number;
  status?: 'Good' | 'Average' | 'Warning';
}

export interface StudentDashboardData {
  user: {
    id: string;
    full_name: string;
    email: string;
    matric_number?: string;
    level?: string;
    department?: string;
    college?: string;
    institution?: string;
  };
  enrolled_courses: EnrolledCourse[];
  attendance_stats: {
    average_attendance: number;
    total_present: number;
    total_late: number;
    total_absent: number;
    total_sessions: number;
  };
  next_class?: {
    id: number;
    course_code: string;
    course_name: string;
    start_time: string;
    venue_name?: string;
    venue_code?: string;
  };
  recent_activity: Array<{
    id: number;
    type: 'attendance' | 'enrollment' | 'profile_update';
    course_code?: string;
    course_name?: string;
    timestamp: string;
    status?: 'PRESENT' | 'LATE' | 'ABSENT';
    description: string;
  }>;
}

export interface TimetableEntry {
  id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  start_time: string;
  end_time: string;
  venue_id?: number;
  venue_name?: string;
  venue_code?: string;
  lecturer_name?: string;
  is_active: boolean;
}

export interface StudentAnalytics {
  weekly_attendance: Array<{
    week: string;
    attendance: number;
  }>;
  course_performance: Array<{
    course_code: string;
    course_name: string;
    attendance_percentage: number;
    sessions_attended: number;
    total_sessions: number;
    status: 'Good' | 'Average' | 'Warning';
  }>;
  status_breakdown: {
    present: number;
    late: number;
    absent: number;
  };
  overall_stats: {
    average_attendance: number;
    total_present: number;
    total_late: number;
    total_absent: number;
    total_sessions: number;
  };
}

export interface AvailableCourse extends Course {
  enrollment_count?: number;
  can_enroll: boolean;
}

export const studentApi = {
  // Get student dashboard data – try dedicated summary endpoint first, fall back to analytics
  getDashboard: async (): Promise<StudentDashboardData> => {
    try {
      const response = await apiClient.get('/dashboard/student/');
      const summary = response.data;
      // Transform the new response shape into StudentDashboardData for backwards compatibility
      if (summary?.success && summary.data && summary.data.enrolled_courses) {
        return {
          user: {} as any, 
          enrolled_courses: summary.data.enrolled_courses,
          attendance_stats: {
            average_attendance: summary.data.overview?.overall_attendance ?? 0,
            total_present: 0,
            total_late: 0,
            total_absent: 0,
            total_sessions: 0,
          },
          next_class: summary.data.upcoming_classes?.[0] ? {
            id: summary.data.upcoming_classes[0].id,
            course_code: summary.data.upcoming_classes[0].course_code || '',
            course_name: summary.data.upcoming_classes[0].course_name || '',
            start_time: summary.data.upcoming_classes[0].start_time,
            venue_name: summary.data.upcoming_classes[0].venue_name,
          } : undefined,
          recent_activity: (summary.data.recent_attendance || []).map((rec: any) => ({
            id: rec.id,
            type: 'attendance',
            course_code: rec.course_code,
            timestamp: rec.checked_in_at,
            status: rec.status,
            description: `Checked in – ${rec.status}`,
          })),
          _summary: summary.data,
        } as any;
      }
    } catch (err) {
      console.warn('Student hybrid dashboard fetch failed, falling back to legacy analytics:', err);
    }
    const response = await apiClient.get('/analytics/dashboard/student/');
    const legacyData = response.data;
    if (legacyData && !Array.isArray(legacyData.enrolled_courses)) {
      legacyData.enrolled_courses = legacyData.results || legacyData.courses || [];
    }
    return legacyData;
  },

  // Get enrolled courses
  getEnrolledCourses: async (): Promise<EnrolledCourse[]> => {
    const response = await apiClient.get('/course-enrollments/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      return data.results || data.courses || data.enrolled_courses || [];
    }
    return [];
  },

  // Get available courses for enrollment (by student's department)
  getAvailableCourses: async (): Promise<AvailableCourse[]> => {
    const response = await apiClient.get('/courses/available/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      return data.results || data.courses || data.enrolled_courses || [];
    }
    return [];
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number): Promise<EnrolledCourse> => {
    const response = await apiClient.post('/course-enrollments/enroll/', {
      course_id: courseId
    });
    return response.data.enrollment;
  },

  // Drop a course
  dropCourse: async (enrollmentId: number): Promise<void> => {
    await apiClient.delete(`/course-enrollments/${enrollmentId}/`);
  },

  // Get student timetable
  getTimetable: async (): Promise<TimetableEntry[]> => {
    const response = await apiClient.get('/timetables/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      return data.results || data.courses || data.enrolled_courses || [];
    }
    return [];
  },

  // Get student analytics
  getAnalytics: async (): Promise<StudentAnalytics> => {
    const response = await apiClient.get('/analytics/dashboard/student/');
    const data = response.data;
    // Harden internal lists
    if (data) {
      data.weekly_attendance = Array.isArray(data.weekly_attendance) ? data.weekly_attendance : [];
      data.course_performance = Array.isArray(data.course_performance) ? data.course_performance : [];
    }
    return data;
  },

  // Get attendance history
  getAttendanceHistory: async (filters?: {
    course?: number;
    status?: string;
    limit?: number;
  }): Promise<any[]> => {
    const response = await apiClient.get('/attendances/', { params: filters });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      return data.results || data.courses || data.enrolled_courses || [];
    }
    return [];
  },
};
