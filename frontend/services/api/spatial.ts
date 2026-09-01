import apiClient from './client';
import { SpatialFeature, GeoJSONFeatureCollection } from '../../types';

export interface SpatialFeatureFilters {
  institution?: number;
  category?: string;
  parent?: number;
  is_active?: boolean;
  search?: string;
}

export const spatialApi = {
  // Get all spatial features
  getAll: async (filters?: SpatialFeatureFilters): Promise<SpatialFeature[]> => {
    const response = await apiClient.get('/spatial-features/', { params: filters });
    return response.data.results || response.data;
  },

  // Get single spatial feature by ID
  getById: async (id: number): Promise<SpatialFeature> => {
    const response = await apiClient.get(`/spatial-features/${id}/`);
    return response.data;
  },

  // Create new spatial feature
  create: async (featureData: Partial<SpatialFeature>): Promise<SpatialFeature> => {
    const response = await apiClient.post('/spatial-features/', featureData);
    return response.data;
  },

  // Update existing spatial feature
  update: async (id: number, featureData: Partial<SpatialFeature>): Promise<SpatialFeature> => {
    const response = await apiClient.put(`/spatial-features/${id}/`, featureData);
    return response.data;
  },

  // Delete / deactivate spatial feature
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/spatial-features/${id}/`);
  },

  // Export spatial features as GeoJSON FeatureCollection
  exportGeoJSON: async (filters?: SpatialFeatureFilters): Promise<GeoJSONFeatureCollection> => {
    const response = await apiClient.get('/spatial-features/export-geojson/', { params: filters });
    return response.data;
  },

  // Import GeoJSON FeatureCollection into spatial features
  importGeoJSON: async (geojson: GeoJSONFeatureCollection | Record<string, any>): Promise<any> => {
    const response = await apiClient.post('/spatial-features/import-geojson/', geojson);
    return response.data;
  },
};
