import apiClient from './client';
import { Institution, College, Department } from '../../types';

// Institution API
export const institutionApi = {
  // Get all institutions
  getAll: async (): Promise<Institution[]> => {
    const response = await apiClient.get('/institutions/');
    // Handle paginated response
    return response.data.results || response.data;
  },

  // Get institution by ID
  getById: async (id: number): Promise<Institution> => {
    const response = await apiClient.get(`/institutions/${id}/`);
    return response.data;
  },

  // Create institution
  createInstitution: async (data: Omit<Institution, 'id'>): Promise<Institution> => {
    const response = await apiClient.post('/institutions/', data);
    return response.data;
  },

  // Update institution
  updateInstitution: async (id: number, data: Partial<Institution>): Promise<Institution> => {
    const response = await apiClient.patch(`/institutions/${id}/`, data);
    return response.data;
  },

  // Delete institution
  deleteInstitution: async (id: number): Promise<void> => {
    await apiClient.delete(`/institutions/${id}/`);
  },
};

// College API
export const collegeApi = {
  // Get all colleges
  getAll: async (): Promise<College[]> => {
    const response = await apiClient.get('/colleges/');
    return response.data.results || response.data;
  },

  // Get colleges by institution
  getByInstitution: async (institutionId: number): Promise<College[]> => {
    const response = await apiClient.get(`/colleges/?institution=${institutionId}`);
    return response.data.results || response.data;
  },

  // Get college by ID
  getById: async (id: number): Promise<College> => {
    const response = await apiClient.get(`/colleges/${id}/`);
    return response.data;
  },

  // Create college
  createCollege: async (data: Omit<College, 'id'>): Promise<College> => {
    const response = await apiClient.post('/colleges/', data);
    return response.data;
  },

  // Update college
  updateCollege: async (id: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.patch(`/colleges/${id}/`, data);
    return response.data;
  },

  // Delete college
  deleteCollege: async (id: number): Promise<void> => {
    await apiClient.delete(`/colleges/${id}/`);
  },
};

// Department API
export const departmentApi = {
  // Get all departments
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get('/departments/');
    return response.data.results || response.data;
  },

  // Get departments by college
  getByCollege: async (collegeId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?college=${collegeId}`);
    return response.data.results || response.data;
  },

  // Get departments by institution
  getByInstitution: async (institutionId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?institution=${institutionId}`);
    return response.data.results || response.data;
  },

  // Get department by ID
  getById: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },

  // Create department
  createDepartment: async (data: Omit<Department, 'id'>): Promise<Department> => {
    const response = await apiClient.post('/departments/', data);
    return response.data;
  },

  // Update department
  updateDepartment: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch(`/departments/${id}/`, data);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}/`);
  },
};

// Maintain backward compatibility if needed (deprecated)
export const institutionsApi = {
  ...institutionApi,
  getAllInstitutions: institutionApi.getAll,
  getCollegesByInstitution: collegeApi.getByInstitution,
  getDepartmentsByCollege: departmentApi.getByCollege,
  getDepartmentsByInstitution: departmentApi.getByInstitution,
  getAllDepartments: departmentApi.getAll,
  getDepartmentById: departmentApi.getById,
};
