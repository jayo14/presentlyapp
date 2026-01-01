import apiClient from './client';
import { Institution, College } from '../../types';

export const institutionsApi = {
  // Institution methods
  getAllInstitutions: async (): Promise<Institution[]> => {
    const response = await apiClient.get('/institutions/');
    return response.data;
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

  // College methods
  getCollegesByInstitution: async (institutionId: number): Promise<College[]> => {
    const response = await apiClient.get(`/colleges/?institution=${institutionId}`);
    return response.data;
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
};