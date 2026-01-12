import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, QrCode, Clock, ArrowUpDown, Trash2, X, Search, Camera, CheckCircle2, FileText, Download, BookOpen, MoreVertical, Share2, Copy, Edit2, AlertCircle, TrendingUp, TrendingDown, Filter, ChevronDown, BarChart3, Timer, AlertOctagon } from 'lucide-react';
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

  // Fetch real data on mount
  useEffect(() => {
    fetchCourses();
    fetchVenues();
    fetchSessions();
    fetchDashboardAnalytics();
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
      return <div className="p-8 text-center text-zinc-500">Reports Module Loading...</div>;
  }
  
  if (view === 'timetable') {
       return <div className="p-8 text-center text-zinc-500">Timetable Module Loading...</div>;
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
                    <div className="text-center py-12 text-zinc-500">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-zinc-400" size={24} />
                        </div>
                        <h4 className="text-zinc-900 dark:text-white font-medium mb-1">No sessions yet</h4>
                        <p className="text-sm mb-4">Create your first attendance session to get started.</p>
                        <Button variant="secondary" onClick={() => navigate('/dashboard/sessions/new')}>Create Session</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessions.slice(0, 6).map(session => (
                            <div 
                                key={session.id} 
                                onClick={() => setSelectedSession(session)}
                                className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer group hover:border-primary/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {session.course_code?.substring(0,2) || 'CS'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">{session.course_code}</h4>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(session.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock size={12}/> {new Date(session.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                     {(() => {
                                         const isExpired = session.is_active && new Date(session.end_time) < new Date();
                                         return (
                                             <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${session.is_active && !isExpired ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                 {session.is_active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'ENDED'}
                                             </span>
                                         );
                                     })()}
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSessionToDelete(session.id.toString());
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="text-zinc-400 hover:text-red-500"
                                     >
                                        <Trash2 size={16}/>
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