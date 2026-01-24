import apiClient from './client';

export interface SystemStats {
  total_users: number;
  active_venues: number;
  total_sessions: number;
  security_alerts: number;
}

export interface SystemActivity {
  name: string;
  active: number;
  sessions: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface SystemConfig {
  payment_gateway_enabled: boolean;
}

export interface SystemLog {
  id: number;
  event_type: string;
  level: 'info' | 'warning' | 'error' | 'success';
  action: string;
  user_name?: string;
  user_role?: string;
  ip_address?: string;
  timestamp: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const systemApi = {
  // Get system statistics
  getStats: async (): Promise<SystemStats> => {
    try {
      const response = await apiClient.get('/system/stats/');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('System stats endpoint not available, using mock data');
      return {
        total_users: 2543,
        active_venues: 12,
        total_sessions: 8921,
        security_alerts: 3,
      };
    }
  },

  // Get system activity data
  getActivity: async (): Promise<SystemActivity[]> => {
    try {
      const response = await apiClient.get('/system/activity/');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('System activity endpoint not available, using mock data');
      return [
        { name: 'Mon', active: 1200, sessions: 450 },
        { name: 'Tue', active: 1900, sessions: 680 },
        { name: 'Wed', active: 1500, sessions: 520 },
        { name: 'Thu', active: 2100, sessions: 790 },
        { name: 'Fri', active: 1800, sessions: 650 },
        { name: 'Sat', active: 400, sessions: 120 },
        { name: 'Sun', active: 300, sessions: 80 },
      ];
    }
  },

  // Get recent alerts
  getAlerts: async (): Promise<SystemAlert[]> => {
    try {
      const response = await apiClient.get('/system/alerts/');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('System alerts endpoint not available, using mock data');
      return [
        {
          id: '1',
          type: 'error',
          title: 'Suspicious Login Detected',
          message: 'Multiple failed attempts from IP 192.168.1.1',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'warning',
          title: 'High Server Load',
          message: 'CPU usage exceeded 85% for 5 mins.',
          timestamp: new Date().toISOString(),
        },
      ];
    }
  },

  // Get system configuration
  getConfig: async (): Promise<SystemConfig> => {
    try {
      const response = await apiClient.get('/system/config/');
      return response.data;
    } catch (error) {
      // Return from localStorage if endpoint doesn't exist yet
      console.warn('System config endpoint not available, using localStorage');
      const stored = localStorage.getItem('PAYMENT_GATEWAY_ENABLED');
      return {
        payment_gateway_enabled: stored === 'true',
      };
    }
  },

  // Update system configuration
  updateConfig: async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
    try {
      const response = await apiClient.patch('/system/config/', config);
      return response.data;
    } catch (error) {
      // Fall back to localStorage if endpoint doesn't exist yet
      console.warn('System config endpoint not available, using localStorage');
      if (config.payment_gateway_enabled !== undefined) {
        localStorage.setItem('PAYMENT_GATEWAY_ENABLED', String(config.payment_gateway_enabled));
      }
      return config as SystemConfig;
    }
  },

  // Get system logs
  getLogs: async (filters?: {
    event_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    page?: number;
    action?: string;
  }): Promise<PaginatedResponse<SystemLog>> => {
    try {
      const response = await apiClient.get('/system/logs/', { params: filters });
      // Handle both paginated and non-paginated responses for backward compatibility
      if (response.data.results) {
        return response.data;
      }
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data
      };
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('System logs endpoint not available, using mock data');
      const mockData = [
        {
          id: 1,
          event_type: 'AUTH',
          level: 'info' as const,
          action: 'User Login',
          user_name: 'Dr. Sarah Johnson',
          user_role: 'Lecturer',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        },
        {
          id: 2,
          event_type: 'AUTH',
          level: 'warning' as const,
          action: 'Failed Login Attempt',
          ip_address: '192.168.1.100',
          user_role: '-',
          timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        },
        {
          id: 3,
          event_type: 'CONFIG',
          level: 'success' as const,
          action: 'System Config Update',
          user_name: 'Admin User',
          user_role: 'Admin',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        },
        {
          id: 4,
          event_type: 'SYSTEM',
          level: 'info' as const,
          action: 'Database Backup',
          user_name: 'System',
          user_role: 'System',
          timestamp: new Date(Date.now() - 540 * 60000).toISOString(),
        },
      ];
      return {
        count: mockData.length,
        next: null,
        previous: null,
        results: mockData
      };
    }
  },
};
