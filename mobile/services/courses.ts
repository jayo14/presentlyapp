import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const coursesService = {
  list: async (params?: any): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.COURSES.LIST, params);
  },
  get: async (id: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.COURSES.GET(id));
  },
  create: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.COURSES.CREATE, data);
  },
  update: async (id: string, data: any): Promise<any> => {
    return apiClient.put(API_ENDPOINTS.COURSES.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any): Promise<any> => {
    return apiClient.patch(API_ENDPOINTS.COURSES.UPDATE(id), data);
  },
  delete: async (id: string): Promise<any> => {
    return apiClient.delete(API_ENDPOINTS.COURSES.DELETE(id));
  },
  getAvailable: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.COURSES.AVAILABLE);
  },
  getEnrolledStudents: async (courseId: string): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.COURSES.ENROLLED_STUDENTS(courseId));
  },
  getMyCourses: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.COURSES.LIST, { enrolled: true });
  },
};
