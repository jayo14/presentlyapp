import apiClient from './client';
import { Course } from '../../types';

export const coursesApi = {
  // Get all courses
  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses/');
    return response.data;
  },

  // Get courses by department
  getCoursesByDepartment: async (departmentId: number): Promise<Course[]> => {
    const response = await apiClient.get(`/courses/?department=${departmentId}`);
    return response.data;
  },

  // Get courses by level
  getCoursesByLevel: async (level: string): Promise<Course[]> => {
    const response = await apiClient.get(`/courses/?level=${level}`);
    return response.data;
  },

  // Get a single course
  getCourse: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },

  // Create a course
  createCourse: async (data: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'department_name' | 'lecturer_name'>): Promise<Course> => {
    const response = await apiClient.post('/courses/', data);
    return response.data;
  },

  // Update a course
  updateCourse: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.patch(`/courses/${id}/`, data);
    return response.data;
  },

  // Delete a course
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}/`);
  },
};
