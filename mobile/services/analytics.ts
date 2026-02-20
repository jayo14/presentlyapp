import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const analyticsService = {
  getDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  },
  getStudentDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STUDENT_DASHBOARD);
  },
  getLecturerDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LECTURER_DASHBOARD);
  },
  getAdminDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD);
  },
  getCourseAttendance: async (courseId: string) => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.COURSE(courseId));
  },
  getStudentAttendance: async (studentId: string) => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STUDENT(studentId));
  },
  getAttendanceTrends: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.TRENDS);
  },
  getAttendanceOverview: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
  },
  getSessionAnalytics: async (sessionId: string) => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.SESSION(sessionId));
  },
  getAttendancePredictions: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_ATTENDANCE);
  },
  getDropoutPredictions: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PREDICTIONS_DROPOUTS);
  },
  getLiveSessions: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.LIVE_SESSIONS);
  },
  getSessionStatistics: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.SESSIONS_STATS);
  },
  getAtRiskStudents: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.AT_RISK_STUDENTS);
  },
  getStudentEngagement: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.ENGAGEMENT);
  },
  getStudentPerformance: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.PERFORMANCE);
  },
  getCollegeAnalytics: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.COLLEGE(id));
  },
  getDepartmentAnalytics: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.DEPARTMENT(id));
  },
  // Attendance methods (legacy useApi support)
  mark: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.ATTENDANCES.CREATE, data);
  },
  getHistory: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.ATTENDANCES.LIST, params);
  },
  getStats: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.STATISTICS);
  },
  getSessionAttendance: async (sessionId: string) => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.SESSION(sessionId));
  },
  getComparison: async () => {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.COMPARISON);
  },
};
