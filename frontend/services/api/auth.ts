import apiClient, { tokenManager } from './client';
import { UserRole } from '../../types';

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  password2: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  role: UserRole;
  phone_number?: string;
  matric_number?: string;
  department?: string;
  level?: string;
  staff_id?: string;
  courses?: string;
  assigned_lecturer?: string;
  institution?: number;
  college?: number;
  avatar_url?: string;
  notifications_enabled?: boolean;
  location_enabled?: boolean;
  dark_mode?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  onboarding_complete: boolean;
  institution?: number;
  institution_name?: string;
  college?: number;
  college_name?: string;
  phone_number?: string;
  matric_number?: string;
  department?: string;
  level?: string;
  staff_id?: string;
  courses?: string;
  assigned_lecturer?: string;
  notifications_enabled: boolean;
  location_enabled: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    onboarding_complete: boolean;
    avatar_url?: string;
  };
  tokens?: {
    access: string;
    refresh: string;
  };
  requires_onboarding?: boolean;
  errors?: any;
}

// Authentication API
export const authApi = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', data);
    const result = response.data;
    
    if (result.success && result.tokens) {
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh);
    }
    
    return result;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', data);
    const result = response.data;
    
    if (result.success && result.tokens) {
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh);
    }
    
    return result;
  },

  // Logout
  logout: async (): Promise<void> => {
    const refreshToken = tokenManager.getRefreshToken();
    try {
      await apiClient.post('/auth/logout/', { refresh_token: refreshToken });
    } finally {
      tokenManager.clearTokens();
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/auth/me/');
    return response.data.user;
  },

  // Complete onboarding
  completeOnboarding: async (data: OnboardingData): Promise<UserProfile> => {
    const response = await apiClient.post('/auth/onboarding/', data);
    return response.data.user;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    });
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  // Request password reset email
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post('/auth/password-reset/request/', { email });
    return response.data;
  },

  // Verify password reset token
  verifyResetToken: async (uid: string, token: string): Promise<{ success: boolean; valid: boolean; email?: string; error?: string }> => {
    const response = await apiClient.post('/auth/password-reset/verify/', { uid, token });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (uid: string, token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post('/auth/password-reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};
