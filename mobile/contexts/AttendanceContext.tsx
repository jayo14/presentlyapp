import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import type { AttendanceRecord, AttendanceStats, Course, Session } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';


const mapApiAttendance = (item: any): AttendanceRecord => ({
  id: String(item.id),
  sessionId: String(item.session || ""),
  studentId: String(item.student || ""),
  studentName: item.student_name || "",
  studentMatric: item.student_matric || "",
  courseCode: item.course_code || "",
  courseName: item.course_name || item.course_code || "",
  timestamp: item.timestamp || item.checked_in_at || new Date().toISOString(),
  method: (item.method || "qr").toLowerCase() as any,
  status: item.status || "PRESENT",
});

const mapApiCourse = (item: any): Course => ({
  id: String(item.id),
  code: item.course_code,
  name: item.course_name,
  totalSessions: item.total_sessions || 0,
  attendedSessions: item.sessions_attended || 0,
  percentage: item.attendance_percentage || 0,
});

const mapApiSession = (item: any): Session => ({
  id: String(item.id),
  courseId: String(item.course),
  courseCode: item.course_code,
  courseName: item.course_name,
  lecturerId: String(item.lecturer || ""),
  lecturerName: item.lecturer_name || "Prof. Instructor",
  venueId: String(item.venue || ""),
  venueName: item.venue_name || "Main Hall",
  startTime: item.start_time,
  endTime: item.end_time,
  duration: 60,
  location: {
    latitude: parseFloat(item.latitude || "0"),
    longitude: parseFloat(item.longitude || "0"),
    radius: item.location_radius || 50,
  },
  status: item.is_active ? "active" : "ended",
  sessionCode: item.session_code,
  date: item.start_time?.split("T")[0],
});

export const [AttendanceProvider, useAttendance] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
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
    if (user && isAuthenticated) {
        loadData();
    } else {
        setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    if (!user || !isAuthenticated) return;
    try {
      setIsLoading(true);
      if (user.role === "student") {
          const response: any = await api.analytics.getStudentDashboard();
          if (response) {
              const attendanceStats = response.attendance_stats || {};
              setStats({
                  totalSessions: attendanceStats.total_sessions || 0,
                  attended: (attendanceStats.total_present || 0) + (attendanceStats.total_late || 0),
                  percentage: attendanceStats.average_attendance || 0,
                  status: (attendanceStats.average_attendance || 0) >= 75 ? 'eligible' : 'at-risk',
              });
              setCourses((response.enrolled_courses || []).map(mapApiCourse));
              setHistory((response.recent_activity || []).map(mapApiAttendance));
          }
          const liveResponse: any = await api.analytics.getLiveSessions();
          const liveSessions = liveResponse?.live_sessions || liveResponse?.results || [];
          setSessions(liveSessions.map(mapApiSession));
      } else if (user.role === "lecturer") {
          const response: any = await api.analytics.getLecturerDashboard();
          if (response) {
              setCourses(response.courses || []);
              setSessions((response.upcoming_sessions || []).map(mapApiSession));
          }
      }
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status !== 401) {
        console.error('Load attendance data error:', error);
      }
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
