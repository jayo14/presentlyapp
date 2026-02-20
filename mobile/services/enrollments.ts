import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const enrollmentsService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.ENROLLMENTS.LIST);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.ENROLLMENTS.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.ENROLLMENTS.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.ENROLLMENTS.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.ENROLLMENTS.DELETE(id));
  },
  enroll: async (courseId: string) => {
    return apiClient.post(API_ENDPOINTS.ENROLLMENTS.ENROLL, { course: courseId });
  },
  drop: async (enrollmentId: string) => {
    return apiClient.post(API_ENDPOINTS.ENROLLMENTS.DROP(enrollmentId));
  },
};
