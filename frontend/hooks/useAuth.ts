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
        if (response.requires_onboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
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
