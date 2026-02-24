import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const analyticsService = {
  getDashboard: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  },
  getStudentDashboard: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STUDENT_DASHBOARD);
  },
  getLecturerDashboard: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LECTURER_DASHBOARD);
  },
  getAdminDashboard: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD);
  },
  getCourseAttendance: async (courseId: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.COURSE(courseId));
  },
  getStudentAttendance: async (studentId: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STUDENT(studentId));
  },
  getAttendanceTrends: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.TRENDS);
  },
  getAttendanceOverview: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
  },
  getOverview: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
  },
  getSessionAnalytics: async (sessionId: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.SESSION(sessionId));
  },
  getAttendancePredictions: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_ATTENDANCE);
  },
  getDropoutPredictions: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_DROPOUTS);
  },
  getLiveSessions: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LIVE_SESSIONS);
  },
  getSessionStatistics: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.SESSIONS_STATS);
  },
  getAtRiskStudents: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.AT_RISK_STUDENTS);
  },
  getStudentEngagement: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.ENGAGEMENT);
  },
  getStudentPerformance: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PERFORMANCE);
  },
  getCollegeAnalytics: async (id: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.COLLEGE(id));
  },
  getDepartmentAnalytics: async (id: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.DEPARTMENT(id));
  },
  // Attendance methods (legacy useApi support)
  mark: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.ATTENDANCES.CREATE, data);
  },
  getHistory: async (params?: any): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ATTENDANCES.LIST, params);
  },
  getStats: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STATISTICS);
  },
  getSessionAttendance: async (sessionId: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.SESSION(sessionId));
  },
  getComparison: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.COMPARISON);
  },
};
