import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, QrCode, Clock, ArrowUpDown, Trash2, X, Search, Camera, CheckCircle2, FileText, Download, BookOpen, MoreVertical, Share2, Copy, Edit2, AlertCircle, TrendingUp, TrendingDown, Filter, ChevronDown, BarChart3, Timer, AlertOctagon, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
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

interface LecturerDashboardProps {
  userName: string;
  userProfile?: UserProfile;
  view?: string;
}
// ... imports ...

// ... interfaces ...

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ userName, userProfile, view = 'dashboard' }) => {
  const navigate = useNavigate();
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  const { modalProps: deleteModalProps } = useModalAccessibility(isDeleteModalOpen, () => setIsDeleteModalOpen(false));

  // Dashboard analytics state
  const [dashboardAnalytics, setDashboardAnalytics] = useState<LecturerDashboardAnalytics | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAttendanceAnalytics | null>(null);
  
  // Loading states
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Department data
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch real data on mount and setup auto-refresh
  useEffect(() => {
    fetchCourses();
    fetchVenues();
    fetchSessions();
    fetchDashboardAnalytics();

    // Auto-refresh data every 60 seconds
    const interval = setInterval(() => {
        fetchSessions();
        fetchDashboardAnalytics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await analyticsApi.getLecturerDashboard();
      setDashboardAnalytics(data);
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setError(null);
      const data = await courseApi.getAll();
      const coursesArray = Array.isArray(data) ? data : [];
      // Use the raw data as CourseType or transform if necessary. 
      // The API returns Course objects, but the previous code was transforming them.
      // Let's assume the API returns what we need or stick to previous transform if types match.
      // Actually, CourseType is imported from types, let's see what it expects.
      // For now, let's just use the array.
      setCourses(coursesArray); 
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      setVenuesLoading(true);
      const data = await venueApi.getAll();
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching venues:', err);
    } finally {
      setVenuesLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await sessionApi.getAll();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Deprecated/Unused
  const fetchDepartments = async () => {
      // No-op
  };

  const confirmDelete = async () => {
      if (!sessionToDelete) return;
      try {
          // Assuming sessionToDelete is an ID string, convert to number
          await sessionApi.delete(parseInt(sessionToDelete));
          toast.success('Session deleted successfully');
          setIsDeleteModalOpen(false);
          setSessionToDelete(null);
          fetchSessions(); // Refresh
      } catch (err) {
          toast.error('Failed to delete session');
      }
  };





// ... rest of the component logic ...

  // Render Views
  if (view === 'courses') {
      return (
          <CourseManagement 
            userInstitutionId={userProfile?.institution} 
            userCollegeId={userProfile?.college} 
          />
      );
  }

  if (view === 'reports') {
      return <AttendanceReport />;
  }
  
  if (view === 'timetable') {
       return (
         <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 animate-spin" />
           <span>Timetable Module Loading</span>
         </div>
       );
  }
  
  if (view === 'analytics') {
       return <LecturerAnalytics />;
  }

  // Default Dashboard View
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Lecturer Dashboard</h2>
              <p className="text-zinc-500">Manage your courses and attendance sessions.</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => navigate('/dashboard/sessions/new')}>
                    <Plus size={18} className="mr-2"/> Create New Session
                </Button>
            </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">My Courses</h3>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{courses.length}</p>
            </div>
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">Active Sessions</h3>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{sessions.filter(s => s.is_active).length}</p>
            </div>
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                        <Users size={20} />
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">Total Students</h3>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{dashboardAnalytics?.total_students || 0}</p>
            </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-zinc-900 dark:text-white">Recent Sessions</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/sessions')}>View All</Button>
            </div>
            <div className="p-6">
                {sessions.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="text-zinc-400" size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No sessions recorded</h4>
                        <p className="text-sm mb-8 max-w-xs mx-auto">Start taking attendance for your courses to see active and past sessions here.</p>
                        <Button onClick={() => navigate('/dashboard/sessions/new')} className="rounded-xl px-8 h-12">Create Your First Session</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {sessions.slice(0, 6).map(session => (
                            <div 
                                key={session.id} 
                                onClick={() => setSelectedSession(session)}
                                className="group relative bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[320px]"
                            >
                                {/* Decorative Background Elements */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 blur-3xl transition-colors duration-700" />
                                
                                <div className="relative z-10 space-y-8">
                                    {/* Card Top: Course & Status */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-lg text-zinc-500 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3">
                                                {session.course_code?.substring(0,2) || 'CS'}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-primary transition-colors tracking-tight mb-1">{session.course_code}</h4>
                                                <p className="text-sm text-zinc-500 font-medium truncate max-w-[200px]">{session.course_name || 'Class Session'}</p>
                                            </div>
                                        </div>
                                        
                                        {(() => {
                                            const isExpired = session.is_active && new Date(session.end_time) < new Date();
                                            const status = session.is_active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'ENDED';
                                            const statusStyles = {
                                                'ACTIVE': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50',
                                                'EXPIRED': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
                                                'ENDED': 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                            };
                                            return (
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.1em] border uppercase ${statusStyles[status]}`}>
                                                    {status}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {/* Card Middle: Stats Grid */}
                                    <div className="grid grid-cols-2 gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Calendar size={14} className="text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Session Date</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                                {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Users size={14} className="text-blue-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                                <span className="text-xl text-zinc-900 dark:text-white font-black">{session.attendee_count || 0}</span> <span className="text-zinc-500 font-medium">Present</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Bottom: Actions */}
                                <div className="relative z-10 flex items-center gap-4 mt-8">
                                    <Button 
                                        variant="secondary" 
                                        className="flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-black transition-all group/btn shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/dashboard/reports?courseId=${session.course}&sessionId=${session.id}`);
                                        }}
                                    >
                                        <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        View Full Report
                                    </Button>
                                    
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSessionToDelete(session.id.toString());
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="h-14 w-14 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-red-200"
                                    >
                                        <Trash2 size={20}/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

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



      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div 
                {...deleteModalProps}
                aria-labelledby="delete-title"
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 outline-none"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-red-500/10 p-3 rounded-full text-red-500"><Trash2 size={24} /></div>
                    <div><h3 id="delete-title" className="text-lg font-bold text-zinc-900 dark:text-white">Delete Session?</h3><p className="text-sm text-zinc-500">This action cannot be undone.</p></div>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none" onClick={confirmDelete}>Delete</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};