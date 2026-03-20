import axios from 'axios';
import { toast } from 'sonner';

// API Base URL - Django backend
// Ensure requests always target backend host from env (never relative to frontend host)
const DEFAULT_API_URL = 'http://localhost:8000/api';

const normalizeApiBaseUrl = (apiUrl?: string): string => {
  const trimmedUrl = (apiUrl || '').trim();

  if (!trimmedUrl) {
    return DEFAULT_API_URL;
  }

  const normalizedUrl = trimmedUrl.replace(/\/+$/, '');

  if (!/^https?:\/\//i.test(normalizedUrl)) {
    console.warn('[API Client] VITE_API_URL must be absolute (http/https). Falling back to default backend URL.');
    return DEFAULT_API_URL;
  }

  // Normalize any accidental duplicate api segment: .../api/api -> .../api
  const withoutDuplicateApi = normalizedUrl.replace(/\/api(?:\/api)+$/i, '/api');
  return withoutDuplicateApi.endsWith('/api')
    ? withoutDuplicateApi
    : `${withoutDuplicateApi}/api`;
};

const rawApiUrl: string = import.meta.env.VITE_API_URL || '';
const API_BASE_URL: string = normalizeApiBaseUrl(rawApiUrl);

// Log for debugging in development
if (import.meta.env.DEV) {
  console.log('[API Client] Raw API URL:', rawApiUrl);
  console.log('[API Client] Final API Base URL:', API_BASE_URL);
}

// List of endpoints that gracefully handle 404s with fallback data
const GRACEFUL_404_ENDPOINTS = [
  '/system/stats/',
  '/system/activity/',
  '/system/alerts/',
  '/system/config/',
  '/venues/active_sessions/'
];

// Check if an endpoint gracefully handles 404
const isGraceful404 = (url: string): boolean => {
  return GRACEFUL_404_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';

export const tokenManager = {
  getAccessToken: () => {
    // Check localStorage first, then sessionStorage
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken: () => {
    // Check localStorage first, then sessionStorage
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens: (accessToken: string, refreshToken: string, rememberMe: boolean = true) => {
    if (rememberMe) {
      // Store in localStorage for persistent login
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      // Store the rememberMe preference in localStorage
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      // Clear from sessionStorage if it exists
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      // Store in sessionStorage for session-only login
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      // Store the rememberMe preference in sessionStorage (so it's cleared when session ends)
      sessionStorage.setItem(REMEMBER_ME_KEY, 'false');
      // Clear from localStorage if it exists
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },
  clearTokens: () => {
    // Clear from both storages
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REMEMBER_ME_KEY);
  },
  getRememberMe: () => {
    // Check localStorage first for persistent preference, then sessionStorage
    const localPref = localStorage.getItem(REMEMBER_ME_KEY);
    const sessionPref = sessionStorage.getItem(REMEMBER_ME_KEY);
    
    if (localPref === 'true') return true;
    if (sessionPref === 'false') return false;
    
    // Default to true if no preference is stored
    return true;
  },
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't show toast for graceful 404s or cancelled requests
    if (error.response?.status === 404 && isGraceful404(originalRequest.url)) {
      // These endpoints handle 404 gracefully with fallback data
      return Promise.reject(error);
    }

    // Don't show errors for cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        toast.error('Session Expired', {
          description: 'Please log in again to continue.'
        });
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;
        // Update both access and refresh tokens (rotation enabled)
        // Preserve the rememberMe preference when refreshing tokens
        const rememberMe = tokenManager.getRememberMe();
        tokenManager.setTokens(access, refresh, rememberMe);

        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        toast.error('Session Expired', {
          description: 'Please log in again to continue.'
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show user-friendly error messages for other errors
    const status = error.response?.status;
    
    // Improved error message extraction
    let errorMessage = '';
    const errorData = error.response?.data;
    
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.errors) {
        // Handle {"success":false,"errors":{"non_field_errors":["Invalid email or password."]}}
        const errors = errorData.errors;
        if (errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
          errorMessage = errors.non_field_errors[0];
        } else if (typeof errors === 'object') {
          // Join multiple field errors
          errorMessage = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
        }
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        errorMessage = errorData.non_field_errors[0];
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }
    
    if (!errorMessage) {
      errorMessage = error.message;
    }

    // Only show toast for errors that aren't handled by components
    if (!originalRequest._skipGlobalErrorHandler) {
      if (status === 403) {
        toast.error('Access Denied', {
          description: errorMessage || 'You do not have permission to perform this action.'
        });
      } else if (status === 404) {
        toast.error('Not Found', {
          description: errorMessage || 'The requested resource was not found.'
        });
      } else if (status === 500) {
        toast.error('Server Error', {
          description: errorMessage || 'Something went wrong on our end. Please try again later.'
        });
      } else if (status >= 400 && status < 500) {
        // For 4xx errors, prioritize showing the actual API message
        toast.error('Request Failed', {
          description: errorMessage || 'Please check your input and try again.'
        });
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network Error', {
          description: 'Unable to connect to the server. Please check your connection.'
        });
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
