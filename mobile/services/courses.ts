import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const coursesService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.COURSES.LIST);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.COURSES.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.COURSES.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.COURSES.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.COURSES.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.COURSES.DELETE(id));
  },
  getAvailable: async () => {
    return apiClient.get(API_ENDPOINTS.COURSES.AVAILABLE);
  },
  getEnrolledStudents: async (courseId: string) => {
    return apiClient.get(API_ENDPOINTS.COURSES.ENROLLED_STUDENTS(courseId));
  },
};
