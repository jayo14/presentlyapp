import apiClient from './client';

export interface Course {
  id: number;
  department: number[];
  department_name?: string;
  code: string;
  title: string;
  description?: string;
  lecturer?: number;
  lecturer_name?: string;
  credit_units: number;
  semester?: string;
  level?: string;
  is_active: boolean;
  enrolled_students_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSession {
  id: number;
  course: number;
  course_name?: string;
  course_code?: string;
  venue?: number;
  venue_name?: string;
  venue_code?: string;
  session_code: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  location_radius: number;
  attendee_count?: number;
  location_data?: {
    latitude: number;
    longitude: number;
    elevation?: number;
    boundary?: number[][];
    radius: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  session: number;
  student: string;
  student_name?: string;
  student_matric?: string;
  student_department?: string;
  course_code?: string;
  checked_in_at: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  distance_from_venue?: number;
  location_verified: boolean;
  status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
  warning?: string;
}

export interface CheckInData {
  latitude?: number;
  longitude?: number;
  elevation?: number;
  accuracy?: number;
  samples?: Array<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    isMock?: boolean;
  }>;
  visitorId?: string;
  deviceId?: string;
  webglRenderer?: string;
  motionDetected?: boolean;
  ipCity?: string;
  ipLocation?: { latitude: number; longitude: number };
  sampleCount?: number;
  isStaticGPS?: boolean;
  isDesktop?: boolean;
  isMock?: boolean;
  location_verified?: boolean;
}

// Course API
export const courseApi = {
  getAll: async (filters?: { department?: number; lecturer?: number }): Promise<Course[]> => {
    const response = await apiClient.get('/courses/', { params: filters });
    return response.data.results || response.data;
  },
  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },
  create: async (data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post('/courses/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.patch(`/courses/${id}/`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}/`);
  },
  getAllEnrollments: async (filters?: { student?: string; course?: number; active?: boolean }): Promise<any[]> => {
    const response = await apiClient.get('/course-enrollments/', { params: filters });
    return response.data.results || response.data;
  },
};

// Attendance Session API
export const sessionApi = {
  getAll: async (filters?: { course?: number; active?: boolean }): Promise<AttendanceSession[]> => {
    const response = await apiClient.get('/sessions/', { params: filters });
    return response.data.results || response.data;
  },
  getById: async (id: number): Promise<AttendanceSession> => {
    const response = await apiClient.get(`/sessions/${id}/`);
    return response.data;
  },
  create: async (data: Partial<AttendanceSession>): Promise<AttendanceSession> => {
    const response = await apiClient.post('/sessions/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<AttendanceSession>): Promise<AttendanceSession> => {
    const response = await apiClient.patch(`/sessions/${id}/`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/sessions/${id}/`);
  },
  checkIn: async (sessionId: number, data: CheckInData): Promise<Attendance> => {
    const response = await apiClient.post(`/sessions/${sessionId}/check_in/`, data, { 
      _skipGlobalErrorHandler: true 
    } as any);
    return response.data.attendance;
  },
  checkInByCode: async (code: string, data: CheckInData): Promise<Attendance> => {
    const response = await apiClient.post(`/check-in/${code}/`, data, {
      _skipGlobalErrorHandler: true
    } as any);
    return response.data.attendance || response.data;
  },
  end: async (sessionId: number): Promise<AttendanceSession> => {
    const response = await apiClient.post(`/sessions/${sessionId}/end/`);
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  getAll: async (filters?: { session?: number; student?: string, lecturer_only?: boolean }): Promise<Attendance[]> => {
    const response = await apiClient.get('/attendances/', { params: filters });
    return response.data.results || response.data;
  },
  getById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get(`/attendances/${id}/`);
    return response.data;
  },
  getSessions: async (filters?: { lecturer_only?: boolean }): Promise<AttendanceSession[]> => {
    const response = await apiClient.get('/sessions/', { params: filters });
    return response.data.results || response.data;
  },
  getAttendanceStats: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/dashboard/student/');
    return response.data;
  }
};

// Student API Wrapper
export const studentApi = {
  getDashboardData: async () => {
    const response = await apiClient.get('/dashboard/student/');
    return response.data.data;
  },
  getEnrolledCourses: async () => {
    const response = await apiClient.get('/course-enrollments/');
    return response.data.results || response.data;
  },
  dropCourse: async (id: number) => {
    await apiClient.delete(`/course-enrollments/${id}/`);
  },
  getAttendanceStats: async () => {
    const response = await apiClient.get('/analytics/dashboard/student/');
    return response.data;
  }
};

// Lecturer API Wrapper
export const lecturerApi = {
  getLecturerDashboard: async () => {
    const response = await apiClient.get('/dashboard/lecturer/');
    return response.data.data;
  },
  getLecturerCourses: async () => {
    const response = await apiClient.get('/courses/', { params: { lecturer_only: true } });
    return response.data.results || response.data;
  },
  getCourseAnalytics: async (courseId: string) => {
    const response = await apiClient.get(`/analytics/course/${courseId}/`);
    return response.data;
  }
};

// Analytics API Wrapper
export const analyticsApi = {
  exportCourseAttendance: async (courseId: number, format: string) => {
    window.open(`/api/reports/export/attendance/${format}/?course_id=${courseId}`, '_blank');
  }
};
