import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status !== 401) {
          return Promise.reject(error);
        }

        const originalRequest: any = error.config || {};
        if (originalRequest._retry) {
          await storage.clearAll();
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        const refresh = await storage.getRefreshToken();
        if (!refresh) {
          await storage.clearAll();
          return Promise.reject(error);
        }

        try {
          const refreshed: any = await this.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh });
          const accessToken = refreshed?.access || refreshed?.access_token || refreshed?.token;
          if (!accessToken) {
            await storage.clearAll();
            return Promise.reject(error);
          }

          await storage.setAuthToken(accessToken);
          if (refreshed?.refresh || refreshed?.refresh_token) {
            await storage.setRefreshToken(refreshed.refresh || refreshed.refresh_token);
          }

          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${accessToken}`,
          };

          return this.client.request(originalRequest);
        } catch (refreshError) {
          await storage.clearAll();
          return Promise.reject(refreshError);
        }
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  // Auth API calls
  auth = {
    login: async (email: string, password: string) => {
      return this.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    },
    register: async (data: any) => {
      return this.post(API_ENDPOINTS.AUTH.REGISTER, data);
    },
    verifyEmail: async (email: string, otp: string) => {
      return this.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
    },
    sendEmailVerification: async (email: string) => {
      return this.post(API_ENDPOINTS.AUTH.SEND_EMAIL_VERIFICATION, { email });
    },
    requestPasswordReset: async (email: string) => {
      return this.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
    },
    verifyPasswordReset: async (data: any) => {
      return this.post(API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET, data);
    },
    confirmPasswordReset: async (data: any) => {
      return this.post(API_ENDPOINTS.AUTH.CONFIRM_PASSWORD_RESET, data);
    },
    changePassword: async (data: any) => {
      return this.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    },
    googleAuth: async (token: string) => {
      return this.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, { token });
    },
    onboarding: async (data: any) => {
      return this.post(API_ENDPOINTS.AUTH.ONBOARDING, data);
    },
    me: async () => {
      return this.get(API_ENDPOINTS.AUTH.ME);
    },
    logout: async () => {
      return this.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    refreshToken: async (refresh: string) => {
      return this.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh });
    },
  };

  // Attendances
  attendances = {
    list: async (params?: any) => {
      return this.get(API_ENDPOINTS.ATTENDANCES.LIST, params);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.ATTENDANCES.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.ATTENDANCES.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.ATTENDANCES.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.ATTENDANCES.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.ATTENDANCES.DELETE(id));
    },
  };

  // Analytics
  analytics = {
    getDashboard: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    },
    getAdminDashboard: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD);
    },
    getStudentDashboard: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.STUDENT_DASHBOARD);
    },
    getLecturerDashboard: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.LECTURER_DASHBOARD);
    },
    getCourseStats: async (courseId: string) => {
      return this.get(API_ENDPOINTS.ANALYTICS.COURSE(courseId));
    },
    getStudentStats: async (studentId: string) => {
      return this.get(API_ENDPOINTS.ANALYTICS.STUDENT(studentId));
    },
    getTrends: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.TRENDS);
    },
    getOverview: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
    },
    getCollegeStats: async (collegeId: string) => {
      return this.get(API_ENDPOINTS.ANALYTICS.COLLEGE(collegeId));
    },
    getDepartmentStats: async (departmentId: string) => {
      return this.get(API_ENDPOINTS.ANALYTICS.DEPARTMENT(departmentId));
    },
    getComparison: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.COMPARISON);
    },
    getStatistics: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.STATISTICS);
    },
    getSessionStats: async (sessionId: string) => {
      return this.get(API_ENDPOINTS.ANALYTICS.SESSION(sessionId));
    },
    getAttendancePredictions: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_ATTENDANCE);
    },
    getDropoutPredictions: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_DROPOUTS);
    },
    getLiveSessions: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.LIVE_SESSIONS);
    },
    getSessionStatistics: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.SESSIONS_STATS);
    },
    getAtRiskStudents: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.AT_RISK_STUDENTS);
    },
    getStudentEngagement: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.ENGAGEMENT);
    },
    getStudentPerformance: async () => {
      return this.get(API_ENDPOINTS.ANALYTICS.PERFORMANCE);
    },
  };

  // Check-in
  checkIn = {
    get: async (code: string) => {
      return this.get(API_ENDPOINTS.CHECK_IN.GET(code));
    },
    mark: async (code: string, data: any) => {
      return this.post(API_ENDPOINTS.CHECK_IN.MARK(code), data);
    },
  };

  // Courses
  courses = {
    list: async () => {
      return this.get(API_ENDPOINTS.COURSES.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.COURSES.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.COURSES.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.COURSES.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.COURSES.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.COURSES.DELETE(id));
    },
    getAvailable: async () => {
      return this.get(API_ENDPOINTS.COURSES.AVAILABLE);
    },
    getEnrolledStudents: async (courseId: string) => {
      return this.get(API_ENDPOINTS.COURSES.ENROLLED_STUDENTS(courseId));
    },
  };

  // Course Enrollments
  enrollments = {
    list: async () => {
      return this.get(API_ENDPOINTS.ENROLLMENTS.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.ENROLLMENTS.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.ENROLLMENTS.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.ENROLLMENTS.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.ENROLLMENTS.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.ENROLLMENTS.DELETE(id));
    },
    enroll: async (courseId: string) => {
      return this.post(API_ENDPOINTS.ENROLLMENTS.ENROLL, { course: courseId });
    },
    drop: async (enrollmentId: string) => {
      return this.post(API_ENDPOINTS.ENROLLMENTS.DROP(enrollmentId));
    },
  };

  // Sessions
  sessions = {
    list: async () => {
      return this.get(API_ENDPOINTS.SESSIONS.LIST);
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.SESSIONS.CREATE, data);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.SESSIONS.GET(id));
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.SESSIONS.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.SESSIONS.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.SESSIONS.DELETE(id));
    },
    checkIn: async (sessionId: string, data: any) => {
      return this.post(API_ENDPOINTS.SESSIONS.CHECK_IN(sessionId), data);
    },
    end: async (sessionId: string) => {
      return this.post(API_ENDPOINTS.SESSIONS.END(sessionId));
    },
  };

  // Users API calls
  users = {
    list: async (params?: any) => {
      return this.get(API_ENDPOINTS.USERS.LIST, params);
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.USERS.CREATE, data);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.USERS.GET(id));
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.USERS.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.USERS.DELETE(id));
    },
    resetPassword: async (id: string) => {
      return this.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id));
    },
  };

  // Venues
  venues = {
    list: async () => {
      return this.get(API_ENDPOINTS.VENUES.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.VENUES.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.VENUES.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.VENUES.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.VENUES.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.VENUES.DELETE(id));
    },
    getSessions: async (venueId: string) => {
      return this.get(API_ENDPOINTS.VENUES.SESSIONS(venueId));
    },
  };

  // Colleges
  colleges = {
    list: async () => {
      return this.get(API_ENDPOINTS.COLLEGES.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.COLLEGES.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.COLLEGES.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.COLLEGES.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.COLLEGES.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.COLLEGES.DELETE(id));
    },
  };

  // Departments
  departments = {
    list: async () => {
      return this.get(API_ENDPOINTS.DEPARTMENTS.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.DEPARTMENTS.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.DEPARTMENTS.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id));
    },
  };

  // Institutions
  institutions = {
    list: async () => {
      return this.get(API_ENDPOINTS.INSTITUTIONS.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.INSTITUTIONS.GET(id));
    },
    create: async (data: any) => {
      return this.post(API_ENDPOINTS.INSTITUTIONS.CREATE, data);
    },
    update: async (id: string, data: any) => {
      return this.put(API_ENDPOINTS.INSTITUTIONS.UPDATE(id), data);
    },
    partialUpdate: async (id: string, data: any) => {
      return this.patch(API_ENDPOINTS.INSTITUTIONS.UPDATE(id), data);
    },
    delete: async (id: string) => {
      return this.delete(API_ENDPOINTS.INSTITUTIONS.DELETE(id));
    },
  };

  // Notifications
  notifications = {
    list: async () => {
      return this.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    },
    broadcast: async (data: any) => {
      return this.post(API_ENDPOINTS.NOTIFICATIONS.BROADCAST, data);
    },
    getUnreadCount: async () => {
      return this.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    },
    markAllRead: async () => {
      return this.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
    send: async (data: any) => {
      return this.post(API_ENDPOINTS.NOTIFICATIONS.SEND, data);
    },
    read: async (id: string) => {
      return this.post(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    },
    getPreferences: async () => {
      return this.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
    },
    updatePreferences: async (data: any) => {
      return this.patch(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, data);
    },
    listDevices: async () => {
      return this.get(API_ENDPOINTS.NOTIFICATIONS.DEVICES);
    },
    registerDevice: async (data: any) => {
      return this.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data);
    },
    deactivateDevice: async (id: string) => {
      return this.post(API_ENDPOINTS.NOTIFICATIONS.DEACTIVATE_DEVICE(id));
    },
  };

  // System
  system = {
    getActivity: async () => {
      return this.get(API_ENDPOINTS.SYSTEM.ACTIVITY);
    },
    getAlerts: async () => {
      return this.get(API_ENDPOINTS.SYSTEM.ALERTS);
    },
    getConfig: async () => {
      return this.get(API_ENDPOINTS.SYSTEM.CONFIG);
    },
    updateConfig: async (data: any) => {
      return this.patch(API_ENDPOINTS.SYSTEM.CONFIG, data);
    },
    getLogs: async () => {
      return this.get(API_ENDPOINTS.SYSTEM.LOGS);
    },
    getStats: async () => {
      return this.get(API_ENDPOINTS.SYSTEM.STATS);
    },
  };

  // Timetables
  timetables = {
    list: async () => {
      return this.get(API_ENDPOINTS.TIMETABLES.LIST);
    },
    get: async (id: string) => {
      return this.get(API_ENDPOINTS.TIMETABLES.GET(id));
    },
  };
}

export const api = new ApiService();
export default api;
