import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: any[] = [];
  public client: AxiosInstance;
  private maxRetries = 3;

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

        const status = error.response?.status;

        // 1. Handle Token Refresh (401)
        if (status === 401 && !originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client.request(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;
          const refresh = await storage.getRefreshToken();
          if (!refresh) {
            this.isRefreshing = false;
            // TODO: Redirect to login if possible, or trigger logout event
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, { refresh });
            const accessToken = response.data?.access || response.data?.access_token;

            if (!accessToken) throw new Error('Refresh failed');

            await storage.setAuthToken(accessToken);
            this.processQueue(null, accessToken);
            this.isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client.request(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }

        // 2. Exponential Backoff Retry for transient errors (500, 502, 503, 504, or Network Error)
        const isTransientError = !status || (status >= 500 && status <= 504);
        if (isTransientError && (originalRequest._retryCount || 0) < this.maxRetries) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          const delay = Math.pow(2, originalRequest._retryCount) * 1000;

          return new Promise(resolve => setTimeout(resolve, delay)).then(() => {
            return this.client.request(originalRequest);
          });
        }

        // 3. Structured Error Surfaces
        if (status === 403) {
            console.error('[API] Permission Denied: You do not have access to this resource.');
        } else if (status === 404) {
            console.error('[API] Not Found: The requested resource does not exist.');
        } else if (status >= 500) {
            console.error('[API] Server Error: Our systems are experiencing issues. Please try again later.');
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
