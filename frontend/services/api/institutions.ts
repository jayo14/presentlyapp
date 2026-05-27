import apiClient from './client';
import { Institution, College, Department } from '../../types';

export const institutionApi = {
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
  getAll: async (): Promise<College[]> => {
    const response = await apiClient.get('/colleges/');
    return response.data.results || response.data;
  },
  getByInstitution: async (institutionId: number): Promise<College[]> => {
    const response = await apiClient.get(`/colleges/?institution=${institutionId}`);
    return response.data.results || response.data;
  },
  getById: async (id: number): Promise<College> => {
    const response = await apiClient.get(`/colleges/${id}/`);
    return response.data;
  },
  create: async (institutionId: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.post('/colleges/', { ...data, institution: institutionId });
    return response.data;
  },
  update: async (id: number, data: Partial<College>): Promise<College> => {
    const response = await apiClient.patch(`/colleges/${id}/`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/colleges/${id}/`);
  },
};

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get('/departments/');
    return response.data.results || response.data;
  },
  getByCollege: async (collegeId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?college=${collegeId}`);
    return response.data.results || response.data;
  },
  getByInstitution: async (institutionId: number): Promise<Department[]> => {
    const response = await apiClient.get(`/departments/?institution=${institutionId}`);
    return response.data.results || response.data;
  },
  getById: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },
  create: async (collegeId: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.post('/departments/', { ...data, college: collegeId });
    return response.data;
  },
  update: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch(`/departments/${id}/`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}/`);
  },
};

// Backward compatibility exports
export const institutionsApi = {
  ...institutionApi,
  getAllInstitutions: institutionApi.getAll,
  getInstitutionById: institutionApi.getById,
  createInstitution: institutionApi.create,
  updateInstitution: institutionApi.update,
  deleteInstitution: institutionApi.delete,

  getCollegesByInstitution: collegeApi.getByInstitution,
  getCollegeById: collegeApi.getById,
  createCollege: collegeApi.create,
  updateCollege: collegeApi.update,
  deleteCollege: collegeApi.delete,

  getDepartmentsByCollege: departmentApi.getByCollege,
  getDepartmentsByInstitution: departmentApi.getByInstitution,
  getAllDepartments: departmentApi.getAll,
  getDepartmentById: departmentApi.getById,
  createDepartment: departmentApi.create,
  updateDepartment: departmentApi.update,
  deleteDepartment: departmentApi.delete,
};
