import apiClient from './client';
import { Venue } from '../../types';
import { AttendanceSession } from './attendance';

export interface VenueFilters {
  institution?: number;
}

// Venue API
export const venueApi = {
  // Get all venues (optionally filtered)
  getAll: async (filters?: VenueFilters): Promise<Venue[]> => {
    const response = await apiClient.get('/venues/', { params: filters });
    return response.data;
  },

  // Get venue by ID
  getById: async (id: number): Promise<Venue> => {
    const response = await apiClient.get(`/venues/${id}/`);
    return response.data;
  },

  // Create venue (admin only)
  create: async (data: Partial<Venue>): Promise<Venue> => {
    const response = await apiClient.post('/venues/', data);
    return response.data;
  },

  // Update venue (admin only)
  update: async (id: number, data: Partial<Venue>): Promise<Venue> => {
    const response = await apiClient.patch(`/venues/${id}/`, data);
    return response.data;
  },

  // Delete venue (admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/venues/${id}/`);
  },

  // Get sessions for a venue
  getSessions: async (venueId: number): Promise<AttendanceSession[]> => {
    const response = await apiClient.get(`/venues/${venueId}/sessions/`);
    return response.data.sessions;
  },
};
