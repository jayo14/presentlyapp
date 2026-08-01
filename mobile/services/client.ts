import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';
import { router } from 'expo-router';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _noRetry?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: any[] = [];
  public client: AxiosInstance;
  private maxRetries = 3;

  private extractAccessToken(payload: any): string | undefined {
    if (!payload) return undefined;
    return payload.access || payload.access_token || payload.token || payload?.jwt?.access || payload?.data?.access || payload?.data?.access_token;
  }

  private extractRefreshToken(payload: any): string | undefined {
    if (!payload) return undefined;
    return payload.refresh || payload.refresh_token || payload?.jwt?.refresh || payload?.data?.refresh || payload?.data?.refresh_token;
  }

  private extractErrorMessage(errorData: any, fallback: string): string {
    if (!errorData) return fallback;
    if (typeof errorData?.detail === 'string') return errorData.detail;
    if (typeof errorData?.message === 'string') return errorData.message;
    if (typeof errorData?.error === 'string') return errorData.error;
    if (errorData?.errors && typeof errorData.errors === 'object') {
      const firstKey = Object.keys(errorData.errors)[0];
      const firstError = errorData.errors[firstKey];
      if (Array.isArray(firstError) && firstError[0]) return `${firstKey}: ${firstError[0]}`;
      if (typeof firstError === 'string') return `${firstKey}: ${firstError}`;
    }
    if (typeof errorData === 'object') {
      const firstKey = Object.keys(errorData)[0];
      const firstError = errorData[firstKey];
      if (Array.isArray(firstError) && firstError[0]) return `${firstKey}: ${firstError[0]}`;
      if (typeof firstError === 'string') return `${firstKey}: ${firstError}`;
    }
    return fallback;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig;
        if (!originalRequest) return Promise.reject(error);

        const status = error.response?.status;        const errorData = error.response?.data as any;

        // 1. Handle Token Refresh (401)
        if (status === 401 && !originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client.request(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;
          const refresh = await storage.getRefreshToken();
          if (!refresh) {
            this.isRefreshing = false;
            await this.handleUnauthorized();
            return Promise.reject(error);
          }

          try {
            const response = await this.client.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh });
            const accessToken = this.extractAccessToken(response.data);
            const newRefreshToken = this.extractRefreshToken(response.data);

            if (!accessToken) throw new Error('Refresh failed');

            await storage.setAuthToken(accessToken);
            if (newRefreshToken) {
              await storage.setRefreshToken(newRefreshToken);
            }
            
            this.processQueue(null, accessToken);
            this.isRefreshing = false;

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client.request(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.isRefreshing = false;
            await this.handleUnauthorized();
            return Promise.reject(refreshError);
          }
        }

        // 2. Exponential Backoff Retry for transient errors (500, 502, 503, 504, or Network Error)
        const isTransientError = status === undefined || (status >= 500 && status <= 504);
        const shouldRetry = isTransientError && !originalRequest._noRetry && (originalRequest._retryCount || 0) < this.maxRetries;
        
        if (shouldRetry) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          const delay = Math.pow(2, originalRequest._retryCount) * 1000;

          return new Promise(resolve => setTimeout(resolve, delay)).then(() => {
            return this.client.request(originalRequest);
          });
        }

        // 3. Structured Error Mapping
        if (status === 400) {
           const message = this.extractErrorMessage(errorData, 'Bad Request');
           console.warn(`[API] 400: ${message}`);
        } else if (status === 403) {
            console.warn('[API] 403: Permission Denied');
        } else if (status === 404) {
            console.warn('[API] 404: Not Found');
        } else if (status === 429) {
            const retryAfter = error.response?.headers['retry-after'] || '60';
            console.warn(`[API] 429: Too many requests. Retry after ${retryAfter}s`);
        } else if (status != null && status >= 500) {
            console.error('[API] 500+: Server Error');
        } else if (!status) {
            console.error('[API] Network Error / Timeout');
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleUnauthorized() {
    await storage.clearAll();
    // Redirect to login if we have a router available
    try {
      router.replace('/auth/sign-in');
    } catch (e) {
      console.warn('Failed to redirect to login:', e);
    }
  }

  async get<T>(url: string, params?: any, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params, ...config });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
