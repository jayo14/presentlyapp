import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const institutionsService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.INSTITUTIONS.LIST);
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
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.INSTITUTIONS.DELETE(id));
  },
};

export const collegesService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.COLLEGES.LIST);
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
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.COLLEGES.DELETE(id));
  },
};

export const departmentsService = {
  list: async () => {
    return apiClient.get(API_ENDPOINTS.DEPARTMENTS.LIST);
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
  delete: async (id: string) => {
    return apiClient.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id));
  },
};
