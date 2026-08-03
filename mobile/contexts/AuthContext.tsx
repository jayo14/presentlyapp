import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { storage } from '@/utils/storage';
import type { User } from '@/types';
import { api } from '@/services/api';

type SignInResult = { success: boolean; error?: string; requiresVerification?: boolean; user?: User };

const normalizeRole = (role?: string): User['role'] => {
  const normalized = String(role || '').toLowerCase();
  if (['admin', 'superadmin', 'super_admin', 'administrator'].includes(normalized)) {
    return 'admin';
  }
  if (['lecturer', 'teacher', 'staff', 'instructor'].includes(normalized)) {
    return 'lecturer';
  }
  if (['student', 'learner'].includes(normalized)) {
    return 'student';
  }
  return 'student';
};

// ...existing code...


const mapApiUser = (data: any, fallbackEmail: string): User => {
  const userData = data?.user ?? data;
  const firstName = userData?.first_name ?? userData?.firstName;
  const lastName = userData?.last_name ?? userData?.lastName;
  const fullNameFromParts = [firstName, lastName].filter(Boolean).join(' ').trim();
  const profilePicture =
    userData?.avatar_url ??
    userData?.profile_picture ??
    userData?.profilePicture ??
    userData?.avatar ??
    userData?.photo_url ??
    userData?.photoURL ??
    '';

  return {
    id: String(userData?.id ?? userData?._id ?? userData?.uuid ?? 'user-1'),
    fullName: (userData?.full_name ?? userData?.fullName ?? userData?.name ?? fullNameFromParts) || 'User',
    email: userData?.email ?? fallbackEmail,
    role: normalizeRole(userData?.role ?? userData?.user_type),
    emailVerified: userData?.is_verified ?? userData?.emailVerified ?? false,
    onboardingCompleted: userData?.onboarding_completed ?? userData?.onboardingCompleted ?? false,
    matricNumber: userData?.matric_number ?? userData?.matricNumber ?? '',
    department: userData?.department ?? '',
    level: userData?.level ?? '',
    deviceId: userData?.device_id ?? userData?.deviceId ?? '',
    createdAt: userData?.created_at ?? userData?.createdAt ?? new Date().toISOString(),
    phoneNumber: userData?.phone_number ?? userData?.phoneNumber,
    school: userData?.institution_name ?? userData?.institution ?? userData?.school,
    college: userData?.college_name ?? userData?.college,
    profilePicture,
    institutionId: userData?.institution_id ?? userData?.institution?.id ?? userData?.institution,
  };
};

const getAccessToken = (response: any): string | undefined => {
  return response?.access || response?.token || response?.access_token || response?.jwt?.access;
};

const getRefreshToken = (response: any): string | undefined => {
  return response?.refresh || response?.refresh_token || response?.jwt?.refresh;
};

const isAuthFailure = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 401;
};

const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;

  const responseData = error?.response?.data;
  if (!responseData) return error?.message || 'An unexpected error occurred';

  if (responseData.error && typeof responseData.error === 'string') return responseData.error;
  if (responseData.detail && typeof responseData.detail === 'string') return responseData.detail;
  if (responseData.message && typeof responseData.message === 'string') return responseData.message;

  if (responseData.errors && typeof responseData.errors === 'object') {
    const firstKey = Object.keys(responseData.errors)[0];
    const firstError = responseData.errors[firstKey];
    if (Array.isArray(firstError)) return `${firstKey}: ${firstError[0]}`;
    if (typeof firstError === 'string') return `${firstKey}: ${firstError}`;
  }

  return 'An unexpected error occurred';
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => {
      refreshUser();
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        refreshUser();
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  const persistUser = async (nextUser: User) => {
    await storage.setUser(nextUser);
    await storage.saveUser(nextUser);
    setUser(nextUser);
  };

  const checkAuth = async () => {
    try {
      const [token, refreshToken, savedUser] = await Promise.all([
        storage.getAuthToken(),
        storage.getRefreshToken(),
        storage.getUser(),
      ]);
      
      if (token) {
        try {
          const userData = await api.auth.me();
          const freshUser = mapApiUser(userData, savedUser?.email || userData?.email || '');
          await persistUser(freshUser);
          setIsAuthenticated(!!freshUser.emailVerified);
          return;
        } catch (meError: any) {
          if (refreshToken) {
            const refreshed = await refreshSession(savedUser);
            if (refreshed.success) return;
          }
          if (!isAuthFailure(meError) && savedUser && savedUser.emailVerified) {
            setUser(savedUser);
            setIsAuthenticated(true);
            return;
          }
        }
      }

      if (!token && refreshToken) {
        const refreshed = await refreshSession(savedUser);
        if (refreshed.success) return;
      }

      if (!token && !refreshToken) {
        // Keep pending-signup users in memory/storage so they can complete OTP
        // verification instead of being bounced back to sign-in.
        if (savedUser && !savedUser.emailVerified) {
          setUser(savedUser);
          setIsAuthenticated(false);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const userData = await api.auth.me();
      const updatedUser = mapApiUser(userData, userData?.email || '');
      await persistUser(updatedUser);
      setIsAuthenticated(!!updatedUser.emailVerified);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      if (isAuthFailure(error)) {
        await signOut();
        return { success: false, error: 'Session expired' };
      }
      return { success: false, error: extractErrorMessage(error) };
    }
  };

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      console.log('Signing in:', email);
      const savedUser = await storage.getUser();
      
      try {
        const response: any = await api.auth.login(email, password);
        const accessToken = getAccessToken(response);
        const refreshToken = getRefreshToken(response);
        if (accessToken) {
          await storage.setAuthToken(accessToken);
        }
        if (refreshToken) {
          await storage.setRefreshToken(refreshToken);
        }

        let userData = response?.user;
        if (!userData && accessToken) {
          try {
            userData = await api.auth.me();
          } catch (meError) {
            if (savedUser?.email?.toLowerCase() === email.toLowerCase()) {
              userData = savedUser;
            } else {
              userData = undefined;
            }
          }
        }

        if (userData || accessToken) {
          const userToLog = mapApiUser(userData || {}, email);
          const isVerified = !!userToLog.emailVerified;

          await persistUser(userToLog);
          setIsAuthenticated(isVerified);
          
          return { success: true, requiresVerification: !isVerified, user: userToLog };
        }

        return { success: false, error: extractErrorMessage(response) };
      } catch (apiError: any) {
        return { success: false, error: extractErrorMessage(apiError) };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Internal error' };
    }
  };

  const signUp = async (data: any): Promise<{ success: boolean; error?: string; requiresVerification?: boolean; user?: User }> => {
    try {
      try {
        const response: any = await api.auth.register(data);

        // Treat email verification as required by default for new registrations.
        // Only skip it when the backend explicitly returns requires_email_verification: false.
        const requiresVerification = response?.requires_email_verification !== false;

        // Only persist tokens once the email has been verified (i.e., after the
        // verify-email step). Do NOT store tokens here when verification is pending.
        if (!requiresVerification) {
          const accessToken = getAccessToken(response);
          const refreshToken = getRefreshToken(response);
          if (accessToken) {
            await storage.setAuthToken(accessToken);
          }
          if (refreshToken) {
            await storage.setRefreshToken(refreshToken);
          }
        }

        const userData = response?.user;
        if (userData) {
          const newUser = mapApiUser(userData, data?.email || userData?.email || '');
          if (requiresVerification) {
            newUser.onboardingCompleted = false;
          }
          await persistUser(newUser);
          // isAuthenticated tracks email-verification status; onboarding is gated
          // separately via user.onboardingCompleted in AuthGate.
          setIsAuthenticated(!requiresVerification);
          return { success: true, requiresVerification, user: newUser };
        }

        // Some backends return no user object during registration (OTP-only flow).
        // Persist a minimal stub so verify-email can look up the email via storage.
        // The id is a temporary placeholder; it is replaced by the real user data
        // once the backend returns a full profile after email verification.
        if (requiresVerification) {
          const tempUser: User = {
            id: 'pending-verification',
            fullName: data?.full_name || '',
            email: data?.email || '',
            role: 'student',
            emailVerified: false,
            onboardingCompleted: false,
            matricNumber: '',
            department: '',
            level: '',
            deviceId: '',
            createdAt: new Date().toISOString(),
          };
          await persistUser(tempUser);
          return { success: true, requiresVerification: true };
        }

        return { success: false, error: extractErrorMessage(response) };
      } catch (apiError: any) {
        return { success: false, error: extractErrorMessage(apiError) };
      }
    } catch (error) {
      return { success: false, error: 'Failed to create account' };
    }
  };

  const verifyEmail = async (otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const savedUser = await storage.getUser();
      if (!savedUser) return { success: false, error: 'User not found' };

      const response: any = await api.auth.verifyEmail(savedUser.email, otp);
      const accessToken = getAccessToken(response);
      const refreshToken = getRefreshToken(response);
      if (accessToken) {
        const verifiedUser = { ...savedUser, emailVerified: true };
        await persistUser(verifiedUser);
        await storage.setAuthToken(accessToken);
        if (refreshToken) {
          await storage.setRefreshToken(refreshToken);
        }
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: extractErrorMessage(response) };
    } catch (error) {
      return { success: false, error: 'Invalid verification code' };
    }
  };

  const resendOTP = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const savedUser = await storage.getUser();
      if (!savedUser) return { success: false, error: 'User not found' };
      await api.auth.sendEmailVerification(savedUser.email);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to resend OTP' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.auth.requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send reset link' };
    }
  };

  const verifyPasswordReset = async (data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.auth.verifyPasswordReset(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to verify reset token' };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.auth.confirmPasswordReset({ token, new_password: newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const changePassword = async (data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.auth.changePassword(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to change password' };
    }
  };

  const googleSignIn = async (token: string): Promise<SignInResult> => {
    try {
      const response: any = await api.auth.googleAuth(token);
      const accessToken = getAccessToken(response);
      const refreshToken = getRefreshToken(response);
      if (accessToken) {
        await storage.setAuthToken(accessToken);
      }
      if (refreshToken) {
        await storage.setRefreshToken(refreshToken);
      }

      const userData = response?.user ?? (accessToken ? await api.auth.me() : undefined);
      if (userData || accessToken) {
        const userToLog = mapApiUser(userData || {}, userData?.email || '');
        const isVerified = !!userToLog.emailVerified;
        await persistUser(userToLog);
        setIsAuthenticated(isVerified);
        return { success: true, requiresVerification: !isVerified, user: userToLog };
      }

      return { success: false, error: extractErrorMessage(response) };
    } catch (error) {
      return { success: false, error: 'Google auth failed' };
    }
  };

  const onboarding = async (data: any): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response: any = await api.auth.onboarding(data);
      const userData = response?.user ?? response;
      if (userData) {
        const updatedUser = mapApiUser(userData, userData?.email || '');
        updatedUser.onboardingCompleted = true;
        await persistUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to complete onboarding' };
    }
  };

  const refreshSession = async (
    fallbackUser?: User | null
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const refresh = await storage.getRefreshToken();
      if (!refresh) return { success: false, error: 'No refresh token' };
      const response: any = await api.auth.refreshToken(refresh);
      const accessToken = getAccessToken(response);
      if (!accessToken) return { success: false, error: 'Refresh failed' };
      await storage.setAuthToken(accessToken);
      if (response?.refresh) {
        await storage.setRefreshToken(response.refresh);
      }
      const userData = await api.auth.me().catch(() => null);
      if (userData) {
        const userToLog = mapApiUser(userData, userData?.email || '');
        await persistUser(userToLog);
        setIsAuthenticated(!!userToLog.emailVerified);
      } else if (fallbackUser) {
        setUser(fallbackUser);
        setIsAuthenticated(!!fallbackUser.emailVerified);
      }
      return { success: true };
    } catch (error: any) {
      if (isAuthFailure(error)) {
        await signOut();
        return { success: false, error: 'Session expired' };
      }
      if (fallbackUser) {
        setUser(fallbackUser);
        setIsAuthenticated(!!fallbackUser.emailVerified);
      }
      return { success: false, error: 'Failed to refresh session' };
    }
  };

  const updateProfileDetails = async (details: Partial<User>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      ...details,
      profilePicture:
        typeof details.profilePicture === 'string'
          ? details.profilePicture.trim()
          : user.profilePicture,
    };

    await persistUser(updatedUser);
  };

  const updateProfilePicture = async (avatarUrl: string) => {
    await updateProfileDetails({ profilePicture: avatarUrl });
  };

  const signOut = async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await api.auth.logout({ refresh_token: refreshToken }).catch(() => {});
      }
      await storage.clearAll();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      await storage.clearAll();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    verifyEmail,
    resendOTP,
    forgotPassword,
    verifyPasswordReset,
    resetPassword,
    changePassword,
    googleSignIn,
    onboarding,
    refreshSession,
    refreshUser,
    signOut,
    checkAuth,
    updateProfileDetails,
    updateProfilePicture,
    profile: {
      displayName: user?.fullName || 'User',
      initials:
        user?.fullName
          ?.split(' ')
          .map((part) => part?.[0])
          .filter(Boolean)
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'U',
      avatarUrl: user?.profilePicture || '',
    },
  };
});
