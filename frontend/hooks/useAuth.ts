import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { authApi, RegisterData, LoginData, OnboardingData, AuthResponse, UserProfile } from '../services/api/auth';
import { queryKeys } from '../services/api/queryClient';
import { institutionsApi } from '../services/api/institutions';
import { studentApi } from '../services/api/student';
import { dashboardApi } from '../services/api/dashboard';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

const PREFETCH_REFERENCE_STALE_TIME = 10 * 60 * 1000;
const PREFETCH_DASHBOARD_STALE_TIME = 2 * 60 * 1000;

const warmAuthenticatedCaches = (queryClient: QueryClient, user: AuthResponse['user']) => {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.institutions,
    queryFn: institutionsApi.getAllInstitutions,
    staleTime: PREFETCH_REFERENCE_STALE_TIME,
  });

  if (user?.role === UserRole.STUDENT) {
    void queryClient.prefetchQuery({
      queryKey: [...queryKeys.currentUser, 'student-dashboard'],
      queryFn: studentApi.getDashboard,
      staleTime: PREFETCH_DASHBOARD_STALE_TIME,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchInterval: 60 * 1000,
    });
  } else if (user?.role === UserRole.LECTURER) {
    void queryClient.prefetchQuery({
      queryKey: [...queryKeys.currentUser, 'lecturer-dashboard'],
      queryFn: dashboardApi.getLecturerDashboard,
      staleTime: PREFETCH_DASHBOARD_STALE_TIME,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchInterval: 60 * 1000,
    });
  }

  void (async () => {
    try {
      const fullProfile = await queryClient.fetchQuery({
        queryKey: queryKeys.currentUser,
        queryFn: authApi.getCurrentUser,
        staleTime: 0,
      });

      if (fullProfile?.institution) {
        void queryClient.prefetchQuery({
          queryKey: queryKeys.colleges(fullProfile.institution),
          queryFn: () => institutionsApi.getCollegesByInstitution(fullProfile.institution!),
          staleTime: PREFETCH_REFERENCE_STALE_TIME,
        });
      }

      if (fullProfile?.college) {
        void queryClient.prefetchQuery({
          queryKey: queryKeys.departments({ college: fullProfile.college }),
          queryFn: () => institutionsApi.getDepartmentsByCollege(fullProfile.college!),
          staleTime: PREFETCH_REFERENCE_STALE_TIME,
        });
      }
    } catch {
      // Keep auth flow fast even if the profile refresh fails.
    }
  })();
};

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    enabled: authApi.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
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
        warmAuthenticatedCaches(queryClient, response.user);
        if (response.requires_email_verification || !response.user.email_verified) {
          navigate(`/otp-verification?email=${encodeURIComponent(response.user.email)}`);
        } else if (response.requires_onboarding) {
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
        const user = response.user;
        queryClient.setQueryData(queryKeys.currentUser, user);
        warmAuthenticatedCaches(queryClient, user);
        // Small delay to show loading state during navigation
        setTimeout(() => {
          if (response.requires_email_verification || !user.email_verified) {
            navigate(`/otp-verification?email=${encodeURIComponent(user.email)}`);
          } else if (response.requires_onboarding) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }, 100);
      }
    },
  });
};

// Hook for Google auth
export const useGoogleAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ idToken, rememberMe }: { idToken: string; rememberMe?: boolean }) => 
      authApi.googleAuth(idToken, rememberMe),
    onSuccess: (response: AuthResponse) => {
      if (response.success && response.user) {
        queryClient.setQueryData(queryKeys.currentUser, response.user);
        warmAuthenticatedCaches(queryClient, response.user);
        if (response.requires_email_verification || !response.user.email_verified) {
          navigate(`/otp-verification?email=${encodeURIComponent(response.user.email)}`, { replace: true });
        } else if (response.requires_onboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
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
        warmAuthenticatedCaches(queryClient, response.user);
        
        // Navigate based on onboarding status
        if (response.requires_email_verification || !response.user.email_verified) {
          navigate(`/otp-verification?email=${encodeURIComponent(response.user.email)}`);
        } else if (response.requires_onboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    },
  });
};

// Hook for resending email verification
export const useResendEmailVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.sendVerificationOTP(email),
  });
};
