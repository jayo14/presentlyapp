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
  // Get student dashboard data
  getDashboard: async (): Promise<StudentDashboardData> => {
    const response = await apiClient.get('/analytics/dashboard/student/');
    return response.data;
  },

  // Get enrolled courses
  getEnrolledCourses: async (): Promise<EnrolledCourse[]> => {
    const response = await apiClient.get('/course-enrollments/');
    return response.data;
  },

  // Get available courses for enrollment (by student's department)
  getAvailableCourses: async (): Promise<AvailableCourse[]> => {
    const response = await apiClient.get('/courses/available/');
    return response.data.courses || response.data;
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
    return response.data;
  },

  // Get student analytics
  getAnalytics: async (): Promise<StudentAnalytics> => {
    const response = await apiClient.get('/analytics/student/');
    return response.data;
  },

  // Get attendance history
  getAttendanceHistory: async (filters?: {
    course?: number;
    status?: string;
    limit?: number;
  }): Promise<any[]> => {
    const response = await apiClient.get('/attendances/', { params: filters });
    return response.data;
  },
};
