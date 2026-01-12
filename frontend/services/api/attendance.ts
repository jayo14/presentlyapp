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
  course_code?: string;
  checked_in_at: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  distance_from_venue?: number;
  location_verified: boolean;
  status: 'PRESENT' | 'LATE' | 'EXCUSED';
}

export interface CheckInData {
  latitude?: number;
  longitude?: number;
  elevation?: number;
  location_verified?: boolean;
}

// Course API
export const courseApi = {
  // Get all courses (optionally filtered)
  getAll: async (filters?: { department?: number; lecturer?: number }): Promise<Course[]> => {
    const response = await apiClient.get('/courses/', { params: filters });
    return response.data.results || response.data;
  },

  // Get course by ID
  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },

  // Create course (lecturer/admin only)
  create: async (data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post('/courses/', data);
    return response.data;
  },

  // Update course (lecturer/admin only)
  update: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.patch(`/courses/${id}/`, data);
    return response.data;
  },

  // Delete course (lecturer/admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}/`);
  },

  // Get all course enrollments (optionally filtered)
  getAllEnrollments: async (filters?: { student?: string; course?: number; active?: boolean }): Promise<any[]> => {
    const response = await apiClient.get('/course-enrollments/', { params: filters });
    return response.data.results || response.data;
  },
};

// Attendance Session API
export const sessionApi = {
  // Get all sessions (optionally filtered)
  getAll: async (filters?: { course?: number; active?: boolean }): Promise<AttendanceSession[]> => {
    const response = await apiClient.get('/sessions/', { params: filters });
    return response.data.results || response.data;
  },

  // Get session by ID
  getById: async (id: number): Promise<AttendanceSession> => {
    const response = await apiClient.get(`/sessions/${id}/`);
    return response.data;
  },

  // Create session (lecturer/admin only)
  create: async (data: Partial<AttendanceSession>): Promise<AttendanceSession> => {
    const response = await apiClient.post('/sessions/', data);
    return response.data;
  },

  // Update session (lecturer/admin only)
  update: async (id: number, data: Partial<AttendanceSession>): Promise<AttendanceSession> => {
    const response = await apiClient.patch(`/sessions/${id}/`, data);
    return response.data;
  },

  // Delete session (lecturer/admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/sessions/${id}/`);
  },

  // Check in to a session (student only)
  checkIn: async (sessionId: number, data: CheckInData): Promise<Attendance> => {
    const response = await apiClient.post(`/sessions/${sessionId}/check_in/`, data);
    return response.data.attendance;
  },

  // Check in by session code (student only)
  checkInByCode: async (code: string, data: CheckInData): Promise<Attendance> => {
    const response = await apiClient.post(`/check-in/${code}/`, data);
    return response.data.attendance || response.data;
  },

  // End a session (lecturer/admin only)
  end: async (sessionId: number): Promise<AttendanceSession> => {
    const response = await apiClient.post(`/sessions/${sessionId}/end/`);
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  // Get all attendance records (optionally filtered)
  getAll: async (filters?: { session?: number; student?: string }): Promise<Attendance[]> => {
    const response = await apiClient.get('/attendances/', { params: filters });
    return response.data.results || response.data;
  },

  // Get attendance by ID
  getById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get(`/attendances/${id}/`);
    return response.data;
  },

  // Create attendance record (admin only - usually students use checkIn)
  create: async (data: Partial<Attendance>): Promise<Attendance> => {
    const response = await apiClient.post('/attendances/', data);
    return response.data;
  },

  // Update attendance record
  update: async (id: number, data: Partial<Attendance>): Promise<Attendance> => {
    const response = await apiClient.patch(`/attendances/${id}/`, data);
    return response.data;
  },

  // Delete attendance record
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/attendances/${id}/`);
  },
};