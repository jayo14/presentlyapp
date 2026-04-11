import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Calendar, Clock, Trash2, X, BookOpen, FileText, RefreshCw, MapPin, Timer, Loader2, BarChart3 } from 'lucide-react';
import { Session } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { courseApi, sessionApi, AttendanceSession } from '../../services/api/attendance';
import { venueApi } from '../../services/api/venues';
import { Venue as VenueType } from '../../types';
import { analyticsApi, LecturerDashboardAnalytics, CourseAttendanceAnalytics } from '../../services/api/analytics';
import { UserProfile } from '../../services/api/auth';
import { CourseManagement } from './CourseManagement';
import { LecturerAnalytics } from './LecturerAnalytics';
import { institutionsApi } from '../../services/api/institutions';
import { Department, Course as CourseType } from '../../types';
import { coursesApi } from '../../services/api/courses';
import { toast } from 'sonner';
import { SessionDetailDialog } from '../Attendance/SessionDetailDialog';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { AttendanceReport } from './AttendanceReport';
import { SEO } from '../SEO';
import { studentApi, TimetableEntry } from '../../services/api/student';

interface LecturerDashboardProps {
  userName: string;
  userProfile?: UserProfile;
  view?: string;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ userName, userProfile, view = 'dashboard' }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Preserved State Hooks
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { modalProps: deleteModalProps } = useModalAccessibility(isDeleteModalOpen, () => setIsDeleteModalOpen(false));
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAttendanceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const data = await courseApi.getAll();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes cache sharing globally
  });

  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const data = await venueApi.getAll();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000
  });

  const { data: sessions = [], isLoading: sessionsLoading, refetch: fetchSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const data = await sessionApi.getAll();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 60000 // Polling instead of standard interval
  });

  const { data: dashboardAnalytics, isLoading: analyticsLoading, refetch: fetchDashboardAnalytics } = useQuery({
    queryKey: ['lecturerDashboardAnalytics'],
    queryFn: () => analyticsApi.getLecturerDashboard(),
    refetchInterval: 60000
  });

  useEffect(() => {
    if (view === 'timetable') fetchTimetable();
  }, [view]);

  const fetchTimetable = async () => {
    try {
      setTimetableLoading(true);
      const data = await studentApi.getTimetable();
      setTimetableData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setTimetableData([]);
      toast.error('Failed to load timetable');
    } finally {
      setTimetableLoading(false);
    }
  };



  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await sessionApi.delete(parseInt(sessionToDelete));
      toast.success('Session deleted successfully');
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
      fetchSessions();
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  // ─── View: Courses ─────────────────────────────────────
  if (view === 'courses') {
    return (
      <>
        <SEO title="My Courses | Lecturer Dashboard" description="Manage your courses, enrolled students and course settings on Presently." noIndex />
        <CourseManagement userInstitutionId={userProfile?.institution} userCollegeId={userProfile?.college} />
      </>
    );
  }

  // ─── View: Reports ─────────────────────────────────────
  if (view === 'reports') {
    return (
      <>
        <SEO title="Attendance Reports | Lecturer Dashboard" description="View and export detailed attendance reports for your courses on Presently." noIndex />
        <AttendanceReport />
      </>
    );
  }

  // ─── View: Timetable ──────────────────────────────────
  if (view === 'timetable') {
    return (
      <>
        <SEO title="Timetable | Lecturer Dashboard" description="View your teaching schedule and class timetable on Presently." noIndex />
        <div className="h-full overflow-y-auto space-y-6 animate-in fade-in duration-300 px-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-headline text-xl font-semibold text-text">Teaching Schedule</h2>
              <p className="text-sm text-textMuted mt-0.5">Your weekly class timetable and lecture venues.</p>
            </div>
            <button
              onClick={fetchTimetable}
              disabled={timetableLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={timetableLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {timetableLoading && timetableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-textMuted">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p className="text-sm">Loading your schedule...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const dayUpper = day.toUpperCase() as TimetableEntry['day_of_week'];
                const dayClasses = timetableData.filter(t => t.day_of_week === dayUpper && t.is_active);

                return (
                  <div key={day} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h3 className="font-headline text-xs font-semibold text-text uppercase tracking-wider">{day}</h3>
                      <span className="text-[10px] font-semibold bg-surfaceHigh text-textMuted px-1.5 py-0.5 rounded ml-auto">
                        {dayClasses.length}
                      </span>
                    </div>
                    {dayClasses.length > 0 ? (
                      dayClasses.map((t) => (
                        <div
                          key={t.id}
                          className="bg-surface text-text border border-outline p-3.5 rounded-xl hover:border-outline transition-colors"
                        >
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{t.course_code}</span>
                          <h4 className="font-headline text-sm font-medium text-text mt-1 line-clamp-2">{t.course_name}</h4>
                          <div className="mt-2.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-textMuted">
                              <Timer size={12} />
                              <span>{t.start_time} – {t.end_time}</span>
                            </div>
                            {t.venue_name && (
                              <div className="flex items-center gap-1.5 text-xs text-textMuted">
                                <MapPin size={12} />
                                <span className="truncate">{t.venue_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-surfaceLow/50 border border-dashed border-outline rounded-xl p-5 text-center">
                        <p className="text-xs text-textMuted">No classes</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  // ─── View: Analytics ───────────────────────────────────
  if (view === 'analytics') {
    return (
      <>
        <SEO title="Analytics | Lecturer Dashboard" description="Review attendance analytics, course performance and student engagement data on Presently." noIndex />
        <LecturerAnalytics />
      </>
    );
  }

  // ─── Default Dashboard View ────────────────────────────
  return (
    <>
      <SEO title="Lecturer Dashboard | Presently" description="Manage your courses, attendance sessions and view real-time student engagement on Presently." noIndex />
      <div className="h-full overflow-y-auto space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline text-xl font-semibold text-text">Welcome back, {userName.split(' ')[0]}</h2>
            <p className="text-sm text-textMuted mt-0.5">Manage your courses and attendance sessions.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/sessions/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Session
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface text-text border border-outline rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text">{courses.length}</p>
            <p className="text-xs text-textMuted mt-0.5">My Courses</p>
          </div>
          <div className="bg-surface text-text border border-outline rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text">{sessions.filter(s => s.is_active).length}</p>
            <p className="text-xs text-textMuted mt-0.5">Active Sessions</p>
          </div>
          <div className="bg-surface text-text border border-outline rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Users size={18} className="text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text">{dashboardAnalytics?.total_students || 0}</p>
            <p className="text-xs text-textMuted mt-0.5">Total Students</p>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-surface text-text border border-outline rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline flex justify-between items-center">
            <h3 className="font-headline text-sm font-semibold text-text">Recent Sessions</h3>
            <button
              onClick={() => navigate('/dashboard/sessions')}
              className="text-xs font-medium text-textMuted hover:text-text transition-colors"
            >
              View all →
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-14 h-14 bg-surfaceHigh rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-textMuted" size={24} />
              </div>
              <h4 className="font-headline text-base font-semibold text-text mb-1">No sessions recorded</h4>
              <p className="text-sm text-textMuted mb-6 max-w-xs mx-auto">Start taking attendance for your courses to see sessions here.</p>
              <button
                onClick={() => navigate('/dashboard/sessions/new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Your First Session
              </button>
            </div>
          ) : (
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sessions.slice(0, 6).map(session => {
                  const isExpired = session.is_active && new Date(session.end_time) < new Date();
                  const status = session.is_active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'ENDED';
                  const statusStyles: Record<string, string> = {
                    'ACTIVE': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
                    'EXPIRED': 'bg-inputmber-50 text-muted-foregroundmber-700 dark:bg-inputmber-500/10 dark:text-muted-foregroundmber-400',
                    'ENDED': 'bg-muted text-muted-foreground',
                  };

                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="bg-surfaceLow/50 border border-outline rounded-xl p-4 hover:border-outline cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface text-text border border-outline flex items-center justify-center text-xs font-bold text-textMuted group-hover:text-primary transition-colors">
                            {session.course_code?.substring(0, 2) || 'CS'}
                          </div>
                          <div>
                            <h4 className="font-headline text-sm font-semibold text-text group-hover:text-primary transition-colors">{session.course_code}</h4>
                            <p className="text-xs text-textMuted truncate max-w-[180px]">{session.course_name || 'Class Session'}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-textMuted mt-3 pt-3 border-t border-outline">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={12} />
                          <span>{session.attendee_count || 0} present</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/reports?courseId=${session.course}&sessionId=${session.id}`);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-text rounded-lg hover:bg-primary hover:text-black transition-colors"
                        >
                          <FileText size={13} />
                          Report
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session.id.toString());
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Session Detail Dialog */}
        {selectedSession && (
          <SessionDetailDialog
            session={selectedSession as any}
            onClose={() => setSelectedSession(null)}
            onSessionEnded={() => {
              fetchSessions();
              fetchDashboardAnalytics();
            }}
          />
        )}

        {/* Delete Confirmation */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
            <div
              {...deleteModalProps}
              aria-labelledby="delete-title"
              className="bg-surface text-text border border-outline rounded-none md:rounded-xl w-full h-[100dvh] md:h-auto md:max-w-sm p-6 shadow-xl animate-in zoom-in-95 outline-none overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-50 p-2.5 rounded-lg text-red-500">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 id="delete-title" className="font-headline text-base font-semibold text-text">Delete Session?</h3>
                  <p className="text-sm text-textMuted mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-textMuted bg-surfaceHigh rounded-lg hover:bg-surfaceHigh transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-text rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};