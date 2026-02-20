import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  },
  register: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },
  verifyEmail: async (email: string, otp: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
  },
  sendEmailVerification: async (email: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SEND_EMAIL_VERIFICATION, { email });
  },
  requestPasswordReset: async (email: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
  },
  verifyPasswordReset: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET, data);
  },
  confirmPasswordReset: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.AUTH.CONFIRM_PASSWORD_RESET, data);
  },
  changePassword: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },
  googleAuth: async (token: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, { token });
  },
  onboarding: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.AUTH.ONBOARDING, data);
  },
  logout: async (data: { refresh_token: string }) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, data);
  },
  me: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },
  refreshToken: async (refresh: string) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh });
  },
};
