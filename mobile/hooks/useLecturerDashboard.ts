import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface LecturerDashboardStats {
  total_sessions: number;
  avg_attendance_percentage: number;
  active_sessions_count: number;
  total_students: number;
  weekly_overview: Array<{name: string, attendees: number}>;
  total_courses?: number;
}

export const useLecturerDashboard = () => {
  return useQuery<LecturerDashboardStats>({
    queryKey: ['lecturer', 'dashboard'],
    queryFn: async () => {
        const [dashboard, courses] = await Promise.all([
            api.analytics.getLecturerDashboard(),
            api.courses.list()
        ]);

        return {
            ...dashboard,
            total_courses: Array.isArray(courses) ? courses.length : (courses?.results?.length || 0)
        };
    },
  });
};

export const useUpcomingSessions = () => {
    return useQuery({
        queryKey: ['lecturer', 'sessions', 'upcoming'],
        queryFn: () => api.sessions.list({ status: 'upcoming', limit: 5 }),
    });
};

export const useRecentActivity = () => {
    return useQuery({
        queryKey: ['lecturer', 'activity'],
        queryFn: () => api.sessions.list({ limit: 5 }),
    });
};
