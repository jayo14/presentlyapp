import apiClient from './client';

export interface UserDevice {
  id: number;
  device_name: string;
  ip_address: string;
  geo_country?: string;
  geo_city?: string;
  timezone?: string;
  isp?: string;
  lat?: number;
  lon?: number;
  device_fingerprint: string;
  is_trusted: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface SecurityStatusResponse {
  success: boolean;
  devices: UserDevice[];
}

export const securityApi = {
  // Get all registered devices
  getDevices: async (): Promise<UserDevice[]> => {
    const response = await apiClient.get('/auth/security/devices/');
    return response.data.devices;
  },

  // Trust a device
  trustDevice: async (deviceId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/auth/security/devices/${deviceId}/trust/`);
    return response.data;
  },

  // Revoke/Delete a device
  revokeDevice: async (deviceId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/auth/security/devices/${deviceId}/revoke/`);
    return response.data;
  }
};
