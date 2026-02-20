import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const studentsService = {
  list: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.USERS.LIST, { ...params, role: 'student' });
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.USERS.GET(id));
  },
  getByCourse: async (courseId: string) => {
    return apiClient.get(API_ENDPOINTS.COURSES.ENROLLED_STUDENTS(courseId));
  },
};
