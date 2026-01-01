import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';

// Types
interface Venue {
  id: number;
  name: string;
  building?: string;
  room_number?: string;
  capacity: number;
  latitude?: number;
  longitude?: number;
  gps_radius: number;
  venue_type: 'CLASSROOM' | 'LECTURE_HALL' | 'LAB' | 'AUDITORIUM' | 'ONLINE';
  has_projector: boolean;
  has_computers: boolean;
  has_whiteboard: boolean;
  has_microphone: boolean;
  institution?: number;
  college?: number;
  description?: string;
  is_active: boolean;
}

// Queries
export const useVenues = (filters?: {
  institution?: number;
  college?: number;
  type?: string;
  active?: boolean;
}) => {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      const response = await apiClient.get('/venues/', { params: filters });
      return response.data as Venue[];
    },
  });
};

export const useVenue = (venueId: number) => {
  return useQuery({
    queryKey: ['venues', venueId],
    queryFn: async () => {
      const response = await apiClient.get(`/venues/${venueId}/`);
      return response.data as Venue;
    },
    enabled: !!venueId,
  });
};

// Mutations
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Venue>) => {
      const response = await apiClient.post('/venues/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Venue> }) => {
      const response = await apiClient.patch(`/venues/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venueId: number) => {
      const response = await apiClient.delete(`/venues/${venueId}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};
