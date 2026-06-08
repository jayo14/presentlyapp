import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export interface StaffProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  department_name?: string;
}

export const staffService = {
  getProfiles: async (): Promise<StaffProfile[]> => {
    return apiClient.get<StaffProfile[]>(API_ENDPOINTS.STAFF.PROFILES);
  },
  updateProfile: async (id: string, data: Partial<StaffProfile>) => {
    return apiClient.patch(API_ENDPOINTS.STAFF.UPDATE(id), data);
  },
  getInvitations: async () => {
    return apiClient.get(API_ENDPOINTS.STAFF.INVITATIONS);
  },
  inviteStaff: async (email: string, role: string, departmentId?: string) => {
    return apiClient.post(API_ENDPOINTS.STAFF.INVITE, { email, role, department: departmentId });
  },
  resendInvitation: async (id: number) => {
    return apiClient.post(API_ENDPOINTS.STAFF.RESEND_INVITE(id), {});
  },
  revokeInvitation: async (id: number) => {
    return apiClient.post(API_ENDPOINTS.STAFF.REVOKE_INVITE(id), {});
  },
  acceptInvitation: async (token: string, password?: string) => {
    return apiClient.post(API_ENDPOINTS.STAFF.ACCEPT_INVITE, { token, password });
  },
};

export const rbacService = {
  getPermissions: async () => {
    return apiClient.get(API_ENDPOINTS.RBAC.PERMISSIONS);
  },
  getRoles: async () => {
    return apiClient.get(API_ENDPOINTS.RBAC.ROLES);
  },
};
