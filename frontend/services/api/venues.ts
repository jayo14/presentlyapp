import apiClient from './client';
import { Venue } from '../../types';
import { AttendanceSession } from './attendance';

export interface VenueFilters {
  institution?: number;
  name?: string;
}

export const venueApi = {
  getAll: async (filters?: VenueFilters): Promise<Venue[]> => {
    const response = await apiClient.get('/venues/', { params: filters });
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<Venue> => {
    const response = await apiClient.get(`/venues/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Venue>): Promise<Venue> => {
    const response = await apiClient.post('/venues/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Venue>): Promise<Venue> => {
    const response = await apiClient.patch(`/venues/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/venues/${id}/`);
  },

  getSessions: async (venueId: number): Promise<AttendanceSession[]> => {
    const response = await apiClient.get(`/venues/${venueId}/sessions/`);
    return response.data.results || response.data.sessions || response.data;
  },

  getActiveSessions: async (): Promise<number[]> => {
    const response = await apiClient.get('/venues/active_sessions/');
    return response.data.active_venue_ids || [];
  },
};

export const venuesApi = venueApi;
