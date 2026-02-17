import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import type { AttendanceRecord, AttendanceStats, Course, Session } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

export const [AttendanceProvider, useAttendance] = createContextHook(() => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    attended: 0,
    percentage: 0,
    status: 'eligible',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      if (user.role === 'student') {
          const response: any = await api.analytics.getStudentDashboard();
          if (response) {
              setStats({
                  totalSessions: response.total_sessions || 0,
                  attended: response.attended_sessions || 0,
                  percentage: response.attendance_percentage || 0,
                  status: response.eligibility_status || 'eligible',
              });
              setCourses(response.courses || []);
              setHistory(response.recent_activity || []);
          }
          const liveResponse: any = await api.analytics.getLiveSessions();
          if (liveResponse && liveResponse.results) {
              setSessions(liveResponse.results);
          }
      } else if (user.role === 'lecturer') {
          const response: any = await api.analytics.getLecturerDashboard();
          if (response) {
              setCourses(response.courses || []);
              setSessions(response.upcoming_sessions || []);
          }
      }
    } catch (error) {
      console.error('Load attendance data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (
    sessionCode: string,
    location?: { latitude: number; longitude: number }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response: any = await api.checkIn.mark(sessionCode, { location });
      if (response.success) {
          await loadData(); // Refresh stats
          return { success: true };
      }
      return { success: false, error: response.detail || 'Check-in failed' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Failed to mark attendance' };
    }
  };

  const getActiveSession = (): Session | null => {
    return sessions.find((s) => s.status === 'active') || null;
  };

  return {
    sessions,
    history,
    courses,
    stats,
    isLoading,
    markAttendance,
    getActiveSession,
    refreshData: loadData,
  };
});
