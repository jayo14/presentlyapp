import apiClient from './client';
import { Institution, College, Department } from '../../types';

// Institution API
export const institutionApi = {
  // Get all institutions
  getAll: async (): Promise<Institution[]> => {
    const response = await apiClient.get('/institutions/');
    return response.data;
  },

  // Get institution by ID
  getById: async (id: number): Promise<Institution> => {
    const response = await apiClient.get(`/institutions/${id}/`);
    return response.data;
  },

  // Create institution (admin only)
  create: async (data: Partial<Institution>): Promise<Institution> => {
    const response = await apiClient.post('/institutions/', data);
    return response.data;
  },

  // Update institution (admin only)
  update: async (id: number, data: Partial<Institution>): Promise<Institution> => {
    const response = await apiClient.patch(`/institutions/${id}/`, data);
    return response.data;
  },

  // Delete institution (admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/institutions/${id}/`);
  },
};

// College API
export const collegeApi = {
  // Get all colleges (optionally filtered by institution)
  getAll: async (institutionId?: number): Promise<College[]> => {
    const params = institutionId ? { institution: institutionId } : {};
    const response = await apiClient.get('/colleges/', { params });
    return response.data;
  },

  // Get college by ID
  getById: async (id: number): Promise<College> => {
    const response = await apiClient.get(`/colleges/${id}/`);
    return response.data;
  },

  // Create college (admin only)
  create: async (data: Partial<College>): Promise<College> => {
    const response = await apiClient.post('/colleges/', data);
    return response.data;
  },

  // Update college (admin only)
  update: async (id: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.patch(`/colleges/${id}/`, data);
    return response.data;
  },

  // Delete college (admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/colleges/${id}/`);
  },
};

// Department API
export const departmentApi = {
  // Get all departments (optionally filtered)
  getAll: async (filters?: { college?: number; institution?: number }): Promise<Department[]> => {
    const response = await apiClient.get('/departments/', { params: filters });
    return response.data;
  },

  // Get department by ID
  getById: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },

  // Create department (admin only)
  create: async (data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.post('/departments/', data);
    return response.data;
  },

  // Update department (admin only)
  update: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch(`/departments/${id}/`, data);
    return response.data;
  },

  // Delete department (admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}/`);
  },
};
