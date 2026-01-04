import apiClient from './client';
import { Institution, College, Department } from '../../types';

export const institutionsApi = {
  // Institution methods
  getAllInstitutions: async (): Promise<Institution[]> => {
    const response = await apiClient.get('/institutions/');
    // Handle paginated response
    return response.data.results || response.data;
  },
  createInstitution: async (data: Omit<Institution, 'id'>): Promise<Institution> => {
    const response = await apiClient.post('/institutions/', data);
    return response.data;
  },
  updateInstitution: async (id: number, data: Partial<Institution>): Promise<Institution> => {
    const response = await apiClient.patch(`/institutions/${id}/`, data);
    return response.data;
  },
  deleteInstitution: async (id: number): Promise<void> => {
    await apiClient.delete(`/institutions/${id}/`);
  },
  getInstitutionById: async (id: number): Promise<Institution> => {
    const response = await apiClient.get(`/institutions/${id}/`);
    return response.data;
  },

  // College methods
  getCollegesByInstitution: async (institutionId: number): Promise<College[]> => {
    const response = await apiClient.get(`/colleges/?institution=${institutionId}`);
    // Handle paginated response
    return response.data.results || response.data;
  },
  createCollege: async (data: Omit<College, 'id'>): Promise<College> => {
    const response = await apiClient.post('/colleges/', data);
    return response.data;
  },
  updateCollege: async (id: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.patch(`/colleges/${id}/`, data);
    return response.data;
  },
  deleteCollege: async (id: number): Promise<void> => {
    await apiClient.delete(`/colleges/${id}/`);
  },
  getCollegeById: async (id: number): Promise<College> => {
    const response = await apiClient.get(`/colleges/${id}/`);
    return response.data;
  },

  // Department methods
  getDepartmentsByCollege: async (collegeId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?college=${collegeId}`);
    // Handle paginated response
    return response.data.results || response.data;
  },
  getDepartmentsByInstitution: async (institutionId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?institution=${institutionId}`);
    // Handle paginated response
    return response.data.results || response.data;
  },
  getDepartmentsByFilter: async (filters: { institution?: number; college?: number }): Promise<Department[]> => {
    const params = new URLSearchParams();
    if (filters.institution) params.append('institution', filters.institution.toString());
    if (filters.college) params.append('college', filters.college.toString());
    const response = await apiClient.get(`/departments/?${params.toString()}`);
    return response.data.results || response.data;
  },
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/departments/');
    // Handle paginated response
    return response.data.results || response.data;
  },
  getDepartmentById: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },
  createDepartment: async (data: Omit<Department, 'id'>): Promise<Department> => {
    const response = await apiClient.post('/departments/', data);
    return response.data;
  },
  updateDepartment: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch(`/departments/${id}/`, data);
    return response.data;
  },
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}/`);
  },
};