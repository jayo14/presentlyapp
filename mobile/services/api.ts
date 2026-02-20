import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';

class ApiClient {
  private isRefreshing = false;
  private failedQueue: any[] = [];
  public client: AxiosInstance;

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

    // Request interceptor to add auth token
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

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config || {};

        // If not 401 or it's a refresh token request itself, don't try to refresh
        if (error.response?.status !== 401 || originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
          return Promise.reject(error);
        }

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

        originalRequest._retry = true;
        this.isRefreshing = true;

        const refresh = await storage.getRefreshToken();
        if (!refresh) {
          this.isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, { refresh });
          const refreshed = response.data;

          const accessToken = refreshed?.access || refreshed?.access_token || refreshed?.token;
          if (!accessToken) {
            throw new Error('No access token in refresh response');
          }

          await storage.setAuthToken(accessToken);
          if (refreshed?.refresh || refreshed?.refresh_token) {
            await storage.setRefreshToken(refreshed.refresh || refreshed.refresh_token);
          }

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

import { authService } from './auth';
import { lecturerService } from './lecturer';
import { analyticsService } from './analytics';
import { coursesService } from './courses';
import { sessionsService } from './sessions';
import { notificationsService } from './notifications';
import { reportsService } from './reports';
import { examClearanceService } from './exam-clearance';
import { venuesService } from './venues';
import { enrollmentsService } from './enrollments';
import { studentsService } from './students';
import { institutionsService, collegesService, departmentsService } from './institutions';
import { timetablesService } from './timetables';
import { checkInService } from './checkin';
import { adminService } from './admin';
import { usersService } from './users';

// Re-export services under a single api object for compatibility
export const api = {
  auth: authService,
  lecturer: lecturerService,
  analytics: analyticsService,
  courses: coursesService,
  sessions: sessionsService,
  notifications: notificationsService,
  reports: reportsService,
  examClearance: examClearanceService,
  venues: venuesService,
  enrollments: enrollmentsService,
  students: studentsService,
  institutions: institutionsService,
  colleges: collegesService,
  departments: departmentsService,
  timetables: timetablesService,
  admin: adminService,
  users: usersService,
  checkIn: checkInService,
  // Backward compatibility mappings
  attendance: analyticsService,
  system: lecturerService,
  // users: authService,
};

export default api;
