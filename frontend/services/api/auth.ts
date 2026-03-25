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
  rememberMe?: boolean;
}

export interface OnboardingData {
  role: UserRole;
  first_name?: string;
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
  timezone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  onboarding_complete: boolean;
  email_verified?: boolean;
  is_verified?: boolean;
  institution?: number;
  institution_name?: string;
  college?: number;
  college_name?: string;
  phone_number?: string;
  phone?: string;
  matric_number?: string;
  department?: string;
  level?: string;
  staff_id?: string;
  courses?: string;
  assigned_lecturer?: string;
  notifications_enabled: boolean;
  location_enabled: boolean;
  dark_mode: boolean;
  timezone: string;
  signature_url?: string;
  created_at: string;
  updated_at: string;
  // Optional stats (populated by some endpoints)
  active_courses_count?: number;
  total_sessions_count?: number;
  attendance_rate?: number;
  completed_courses_count?: number;
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
    email_verified?: boolean;
    avatar_url?: string;
  };
  tokens?: {
    access: string;
    refresh: string;
  };
  requires_onboarding?: boolean;
  requires_email_verification?: boolean;
  errors?: any;
}

// Authentication API
export const authApi = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', data);
    const result = response.data;
    
    if (result.success && result.tokens) {
      // Default to rememberMe = true for registration
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh, true);
    }
    
    return result;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', data);
    const result = response.data;
    
    if (result.success && result.tokens) {
      // Use rememberMe preference from login data, default to true
      const rememberMe = data.rememberMe !== undefined ? data.rememberMe : true;
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh, rememberMe);
    }
    
    return result;
  },

  // Google Auth
  googleAuth: async (idToken: string, rememberMe: boolean = true): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google-auth/', { id_token: idToken });
    const result = response.data;
    
    if (result.success && result.tokens) {
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh, rememberMe);
    }
    
    return result;
  },

  // Google OAuth2 Callback
  googleCallback: async (code: string, redirectUri: string, rememberMe: boolean = true): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google-callback/', { code, redirect_uri: redirectUri });
    const result = response.data;

    if (result.success && result.tokens) {
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh, rememberMe);
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
    console.log('[Auth API] Fetching current user from /auth/me/');
    const response = await apiClient.get('/auth/me/');
    console.log('[Auth API] Current user response:', response.status);
    return response.data.user;
  },

  // Complete onboarding
  completeOnboarding: async (data: OnboardingData): Promise<UserProfile> => {
    const response = await apiClient.post('/auth/onboarding/', data);
    return response.data.user;
  },

  // Upload avatar image to Cloudinary via backend, returns the hosted URL
  uploadAvatar: async (base64DataUri: string): Promise<string> => {
    const response = await apiClient.post('/auth/upload-avatar/', { avatar_base64: base64DataUri });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Avatar upload failed');
    }
    return response.data.avatar_url as string;
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

  // Send email verification OTP
  sendVerificationOTP: async (email: string): Promise<{ success: boolean; message?: string; expires_in?: number; error?: string }> => {
    const response = await apiClient.post('/auth/email-verification/send/', { email });
    return response.data;
  },

  // Verify email with OTP
  verifyEmailOTP: async (email: string, otp: string, rememberMe: boolean = true): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/email-verification/verify/', { email, otp });
    const result = response.data;
    
    if (result.success && result.tokens) {
      tokenManager.setTokens(result.tokens.access, result.tokens.refresh, rememberMe);
    }
    
    return result;
  },
};
