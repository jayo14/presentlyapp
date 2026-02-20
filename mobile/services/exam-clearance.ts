import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const examClearanceService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.LIST);
  },
  getByCourse: async (courseId: string) => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.COURSE(courseId));
  },
  generate: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.GENERATE, data);
  },
  approve: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.APPROVE(id));
  },
  reject: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.REJECT(id));
  },
  getCertificate: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.CERTIFICATE(id));
  },
};
