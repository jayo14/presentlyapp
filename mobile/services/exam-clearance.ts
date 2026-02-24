import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const examClearanceService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.LIST);
  },
  calculateAll: async () => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.CALCULATE_ALL);
  },
  generate: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.GENERATE, data);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.GET(id));
  },
  approve: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.APPROVE(id));
  },
  reject: async (id: string) => {
    return apiClient.post(API_ENDPOINTS.EXAM_CLEARANCE.REJECT(id));
  },
  getReport: async () => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.REPORT);
  },
  getCertificate: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.CERTIFICATE(id));
  },
  getByCourse: async (courseId: string) => {
    return apiClient.get(API_ENDPOINTS.EXAM_CLEARANCE.COURSE(courseId));
  },
};
