import apiClient from './client';
import { Course } from '../../types';

export const coursesApi = {
  // Get all courses
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses/');
    return response.data.results || response.data;
  },

  // Get single course
  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },

  // Create course
  create: async (data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post('/courses/', data);
    return response.data;
  },

  // Update course
  update: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.patch(`/courses/${id}/`, data);
    return response.data;
  },

  // Delete course
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}/`);
  },

  // Specialized filters
  getByDepartment: async (departmentId: number): Promise<Course[]> => {
    const response = await apiClient.get(`/courses/?department=${departmentId}`);
    return response.data.results || response.data;
  },

  getByLevel: async (level: string): Promise<Course[]> => {
    const response = await apiClient.get(`/courses/?level=${level}`);
    return response.data.results || response.data;
  },

  // Backward compatibility
  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses/');
    return response.data.results || response.data;
  },
  getCourse: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },
  createCourse: async (data: any): Promise<Course> => {
    const response = await apiClient.post('/courses/', data);
    return response.data;
  },
  updateCourse: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.patch(`/courses/${id}/`, data);
    return response.data;
  },
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}/`);
  },
};
