import apiClient from './client';

export interface Notification {
  id: number;
  type: 'CLASS_REMINDER' | 'ATTENDANCE' | 'ALERT' | 'ANNOUNCEMENT' | 'SYSTEM';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_course?: string;
  action_url?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  target_audience: 'ALL' | 'STUDENTS' | 'LECTURERS' | 'ADMINS' | 'CLASS_REPS';
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export const notificationsApi = {
  // Get all notifications for current user
  getAll: async (filters?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<Notification[]> => {
    try {
      const response = await apiClient.get('/notifications/', { params: filters });
      // Handle paginated response
      return response.data.results || response.data;
    } catch (error) {
      // Return mock data if endpoint doesn't exist yet
      console.warn('Notifications endpoint not available, using mock data');
      return [
        {
          id: 1,
          type: 'CLASS_REMINDER',
          title: 'Class Reminder: CS402',
          message: 'Advanced Web Development starts in 15 minutes at LH 1.',
          is_read: false,
          created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          related_course: 'CS402',
        },
        {
          id: 2,
          type: 'ATTENDANCE',
          title: 'Attendance Marked',
          message: 'You have successfully marked attendance for Database Systems.',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: 3,
          type: 'ALERT',
          title: 'Low Attendance Alert',
          message: 'Your attendance in ENG101 is below 75%. Please attend upcoming classes.',
          is_read: false,
          created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
          related_course: 'ENG101',
        },
        {
          id: 4,
          type: 'SYSTEM',
          title: 'System Update',
          message: 'Presently will undergo scheduled maintenance on Sunday at 2 AM.',
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
        },
      ];
    }
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/`, { is_read: true });
      return response.data;
    } catch (error) {
      // Mock response
      return { id, is_read: true } as Notification;
    }
  },

  // Mark all notifications as read
  // Clear all notifications\n  clearAll: async (): Promise<void> => {\n    try {\n      await apiClient.post("/notifications/mark-all-read/");\n    } catch (error) {\n      console.warn("Clear all endpoint not available");\n    }\n  },
  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.post('/notifications/mark-all-read/');
    } catch (error) {
      console.warn('Mark all as read endpoint not available');
    }
  },

  // Delete notification
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}/`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/notifications/unread-count/');
      return response.data.count || 0;
    } catch (error) {
      return 0;
    }
  },
};

export const announcementsApi = {
  // Get all announcements (for admin)
  getAll: async (filters?: {
    is_active?: boolean;
    priority?: string;
    target_audience?: string;
  }): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get('/announcements/', { params: filters });
      // Handle paginated response
      return response.data.results || response.data;
    } catch (error) {
      console.warn('Announcements endpoint not available, using mock data');
      return [];
    }
  },

  // Get active announcements (for users)
  getActive: async (): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get('/announcements/active/');
      // Handle paginated response
      return response.data.results || response.data;
    } catch (error) {
      console.warn('Active announcements endpoint not available');
      return [];
    }
  },

  // Create announcement (admin only)
  create: async (data: Omit<Announcement, 'id' | 'created_by' | 'created_at'>): Promise<Announcement> => {
    const response = await apiClient.post('/announcements/', data);
    return response.data;
  },

  // Update announcement (admin only)
  update: async (id: number, data: Partial<Announcement>): Promise<Announcement> => {
    const response = await apiClient.patch(`/announcements/${id}/`, data);
    return response.data;
  },

  // Delete announcement (admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/announcements/${id}/`);
  },

  // Publish announcement (creates notifications for target audience)
  publish: async (id: number): Promise<void> => {
    await apiClient.post(`/announcements/${id}/publish/`);
  },
};
