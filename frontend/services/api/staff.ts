import apiClient from './client';

export interface RBACPermission {
  id: number;
  codename: string;
  name: string;
  group: string;
  description?: string;
  is_dangerous: boolean;
}

export interface StaffRole {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_system: boolean;
}

export interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface StaffProfile {
  user: StaffUser;
  role: StaffRole | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  invited_at?: string;
  invitation_accepted_at?: string;
  last_active_at?: string;
}

export interface StaffInvitation {
  id: number;
  email: string;
  full_name: string;
  role: StaffRole | null;
  custom_permissions?: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expires_at: string;
  created_at: string;
}

export const staffApi = {
  getPermissionsCatalog: async () => {
    const response = await apiClient.get('/rbac/permissions/');
    return response.data as {
      success: boolean;
      groups: Record<string, Array<{ codename: string; name: string; dangerous: boolean; enabled: boolean }>>;
      permissions: RBACPermission[];
      roles: StaffRole[];
    };
  },

  getStaffProfiles: async (params?: { search?: string; status?: string; page?: number; page_size?: number }) => {
    const response = await apiClient.get('/staff/', { params });
    return response.data as {
      success: boolean;
      results: StaffProfile[];
      count: number;
      page: number;
      total_pages: number;
    };
  },

  getStaffInvitations: async (status?: string) => {
    const response = await apiClient.get('/staff/invitations/', { params: status ? { status } : undefined });
    return response.data as { success: boolean; results: StaffInvitation[] };
  },

  inviteStaff: async (payload: { email: string; full_name: string; role_id?: number; permissions?: string[] }) => {
    const response = await apiClient.post('/staff/invitations/invite/', payload);
    return response.data;
  },

  resendInvitation: async (invitationId: number) => {
    const response = await apiClient.post(`/staff/invitations/${invitationId}/resend/`);
    return response.data;
  },

  revokeInvitation: async (invitationId: number) => {
    const response = await apiClient.post(`/staff/invitations/${invitationId}/revoke/`);
    return response.data;
  },

  updateStaff: async (
    userId: string,
    payload: { role_id?: number | null; status?: string; permissions?: string[] }
  ) => {
    const response = await apiClient.patch(`/staff/${userId}/`, payload);
    return response.data;
  },
};
