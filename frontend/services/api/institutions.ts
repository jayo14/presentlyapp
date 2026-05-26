import apiClient from './client';
import { Institution, College, Department } from '../../types';

export const institutionApi = {
  // Institution
  getAll: async (): Promise<Institution[]> => {
    const response = await apiClient.get('/institutions/');
    return response.data.results || response.data;
  },
  getById: async (id: number): Promise<Institution> => {
    const response = await apiClient.get(`/institutions/${id}/`);
    return response.data;
  },
  create: async (data: Partial<Institution>): Promise<Institution> => {
    const response = await apiClient.post('/institutions/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Institution>): Promise<Institution> => {
    const response = await apiClient.patch(`/institutions/${id}/`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/institutions/${id}/`);
  },
};

export const collegeApi = {
  // College
  getCollegesByInstitution: async (institutionId: number): Promise<College[]> => {
    const response = await apiClient.get(`/colleges/?institution=${institutionId}`);
    return response.data.results || response.data;
  },
  getCollegeById: async (id: number): Promise<College> => {
    const response = await apiClient.get(`/colleges/${id}/`);
    return response.data;
  },
  createCollege: async (institutionId: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.post('/colleges/', { ...data, institution: institutionId });
    return response.data;
  },
  updateCollege: async (id: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.patch(`/colleges/${id}/`, data);
    return response.data;
  },
  deleteCollege: async (id: number): Promise<void> => {
    await apiClient.delete(`/colleges/${id}/`);
  },
};

export const departmentApi = {
  // Department
  getDepartmentsByCollege: async (collegeId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?college=${collegeId}`);
    return response.data.results || response.data;
  },
  getDepartmentById: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },
  createDepartment: async (collegeId: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.post('/departments/', { ...data, college: collegeId });
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

// Backward compatibility exports
export const institutionsApi = {
  ...institutionApi,
  getCollegesByInstitution: collegeApi.getCollegesByInstitution,
  getCollegeById: collegeApi.getCollegeById,
  createCollege: collegeApi.createCollege,
  updateCollege: collegeApi.updateCollege,
  deleteCollege: collegeApi.deleteCollege,
  getDepartmentsByCollege: departmentApi.getDepartmentsByCollege,
  getDepartmentById: departmentApi.getDepartmentById,
  createDepartment: departmentApi.createDepartment,
  updateDepartment: departmentApi.updateDepartment,
  deleteDepartment: departmentApi.deleteDepartment,
};
