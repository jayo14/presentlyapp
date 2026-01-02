import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, RegisterData, LoginData, OnboardingData, AuthResponse, UserProfile } from '../services/api/auth';
import { queryKeys } from '../services/api/queryClient';
import { useNavigate } from 'react-router-dom';

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    enabled: authApi.isAuthenticated(),
    retry: false,
  });
};

// Hook for user registration
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.user) {
        queryClient.setQueryData(queryKeys.currentUser, response.user);
        if (response.requires_onboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    },
  });
};

// Hook for user login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.user) {
        queryClient.setQueryData(queryKeys.currentUser, response.user);
        // Small delay to show loading state during navigation
        setTimeout(() => {
          if (response.requires_onboarding) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }, 100);
      }
    },
  });
};

// Hook for user logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
};

// Hook for completing onboarding
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OnboardingData) => authApi.completeOnboarding(data),
    onSuccess: (user: UserProfile) => {
      queryClient.setQueryData(queryKeys.currentUser, user);
      navigate('/dashboard');
    },
  });
};

// Hook for changing password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(oldPassword, newPassword),
  });
};

// Hook for requesting password reset
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  });
};

// Hook for verifying reset token
export const useVerifyResetToken = () => {
  return useMutation({
    mutationFn: ({ uid, token }: { uid: string; token: string }) =>
      authApi.verifyResetToken(uid, token),
  });
};

// Hook for resetting password
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ uid, token, newPassword }: { uid: string; token: string; newPassword: string }) =>
      authApi.resetPassword(uid, token, newPassword),
    onSuccess: () => {
      // Navigate to login after successful password reset
      navigate('/login');
    },
  });
};

// Hook for sending email verification OTP
export const useSendVerificationOTP = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.sendVerificationOTP(email),
  });
};

// Hook for verifying email with OTP
export const useVerifyEmailOTP = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyEmailOTP(email, otp),
    onSuccess: (response: any) => {
      if (response.success && response.user) {
        // Set current user in cache
        queryClient.setQueryData(queryKeys.currentUser, response.user);
        
        // Navigate based on onboarding status
        if (response.requires_onboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    },
  });
};
