import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const institutionsService = {
  list: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.INSTITUTIONS.LIST, params);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.INSTITUTIONS.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.INSTITUTIONS.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.INSTITUTIONS.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.INSTITUTIONS.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.INSTITUTIONS.DELETE(id));
  },
};

export const collegesService = {
  list: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.COLLEGES.LIST, params);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.COLLEGES.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.COLLEGES.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.COLLEGES.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.COLLEGES.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.COLLEGES.DELETE(id));
  },
};

export const departmentsService = {
  list: async (params?: any) => {
    return apiClient.get(API_ENDPOINTS.DEPARTMENTS.LIST, params);
  },
  get: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.DEPARTMENTS.GET(id));
  },
  create: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.DEPARTMENTS.CREATE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data);
  },
  partialUpdate: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id));
  },
  getCourses: async (id: string, params?: any) => {
    return apiClient.get(API_ENDPOINTS.DEPARTMENTS.COURSES(id), params);
  },
};
