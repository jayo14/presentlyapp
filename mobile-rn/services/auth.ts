import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  },
  register: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },
  verifyEmail: async (email: string, otp: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
  },
  sendEmailVerification: async (email: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.SEND_EMAIL_VERIFICATION, { email });
  },
  requestPasswordReset: async (email: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
  },
  verifyPasswordReset: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET, data);
  },
  confirmPasswordReset: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.CONFIRM_PASSWORD_RESET, data);
  },
  changePassword: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },
  googleAuth: async (token: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, { token });
  },
  onboarding: async (data: any): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.ONBOARDING, data);
  },
  logout: async (data: { refresh_token: string }): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, data);
  },
  me: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },
  refreshToken: async (refresh: string): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh });
  },
  uploadAvatar: async (formData: FormData): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.AUTH.UPLOAD_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
