import React, { useState, useEffect } from 'react';
import { 
  QrCode, BookOpen, Clock, AlertCircle, TrendingUp, 
  Calendar, Plus, MapPin, ChevronRight, Activity, 
  Loader2, User, RefreshCw, CheckCircle2, Search,
  GraduationCap, LayoutGrid, Timer, BellRing
} from 'lucide-react';
import { SkeletonStudentDashboard } from '../Skeleton';
import { SEO } from '../SEO';
import { studentApi, StudentDashboardData } from '../../services/api/student';
import { sessionApi } from '../../services/api/attendance';
import { EnhancedAttendanceScanner } from '../Attendance/EnhancedAttendanceScanner';
import CourseRegistrationDialog from '../Student/CourseRegistrationDialog';
import { useCurrentUser } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const { data: currentUser } = useCurrentUser();
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => { loadDashboardData(); }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derived data
  const enrolledCourses = dashboardData?.enrolled_courses || [];
  const avgAttendance = dashboardData?.attendance_stats?.average_attendance || 0;
  const nextClass = dashboardData?.next_class;

  const displayAvatar = currentUser?.avatar_url;
  const displayInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  const handleAttendanceCheckIn = async (code: string, location: any): Promise<any> => {
    try {
      const attendanceData = await sessionApi.checkInByCode(code, location);
      await loadDashboardData();
      return attendanceData;
    } catch (err: any) {
      console.error("Check-in failed:", err);
      throw new Error(err.response?.data?.error || err.message || "Failed to check in");
    }
  };

  if (loading && !dashboardData) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      {/* Greeting skeleton */}
      <div className="h-10 bg-surfaceContainer rounded-lg w-64" />
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-surfaceContainer rounded-xl" />
        ))}
      </div>
      {/* Course list skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-surfaceContainer rounded-xl" />
        ))}
      </div>
    </div>
  )
}

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 bg-surfaceHigh/50 rounded-full flex items-center justify-center text-textMuted/60 mb-2">
            <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-headline font-black text-text">Data Unavailable</h3>
          <p className="text-sm font-medium text-textMuted max-w-xs">We couldn't retrieve your academic data. Please check your connection and try again.</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-[#111111] font-headline font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all"
        >
          <RefreshCw size={16} />
          Retry Sync
        </button>
      </div>
    );
  }

  // ─── Default Dashboard View ────────────────────────────
  return (
    <>
      <SEO title="Student Dashboard | Presently" description="Track your attendance, enrolled courses, upcoming classes and academic performance on Presently." noIndex />
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-4xl mx-auto">
        
        {/* MOBILE GREETING */}
        <header className="flex md:hidden justify-between items-center mb-6 px-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h2 className="font-headline text-2xl font-bold text-text tracking-tight mt-1">Hello, {userName.split(' ')[0]} 👋</h2>
          </div>
          <div className="relative cursor-pointer" onClick={() => window.location.href='/dashboard/profile'}>
             <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-surfaceHigh p-0.5 bg-white shadow-sm">
               {displayAvatar ? (
                 <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary bg-primary/5 rounded-xl">
                   {displayInitials}
                 </div>
               )}
             </div>
          </div>
        </header>

        {/* HERO CTA CARD */}
        <section className="relative px-2">
          <div 
            onClick={() => setIsAttendanceModalOpen(true)}
            className="bg-white dark:bg-surfaceContainer/20 rounded-[2.5rem] p-7 shadow-[0_24px_48px_rgba(0,0,0,0.04)] border border-outline/10 overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-primary to-primaryContainer"></div>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-100 dark:border-red-500/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-[10px] font-black tracking-[0.15em] text-red-600 dark:text-red-400 uppercase">Action Required</span>
                </div>
                
                <div>
                  <h3 className="text-4xl font-headline font-black text-text tracking-tight leading-none mb-3">Mark Attendance</h3>
                  <p className="text-textMuted font-medium text-base flex items-center gap-2">
                    <BookOpen size={18} className="text-primary/60" />
                    {nextClass ? `${nextClass.course_code} — ${nextClass.course_name}` : 'Check for active sessions'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10">
                    <MapPin size={16} />
                    <span>{nextClass?.venue_name || 'Academic Block'}</span>
                  </div>
                  
                  <div className="px-4 py-2.5 bg-surfaceHigh/40 rounded-2xl flex items-center gap-2 border border-outline/5">
                    <Clock size={16} className="text-primary" />
                    <span className="text-xs font-black tracking-tight text-text">Session active</span>
                  </div>
                </div>
              </div>

              <div className="bg-text text-background w-24 h-24 rounded-[2rem] shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 self-center md:self-start">
                 <QrCode size={40} strokeWidth={2.5} />
              </div>
            </div>

            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
          </div>
        </section>

        {/* STATS GRID */}
        <section className="grid grid-cols-2 gap-4 md:gap-6 px-2">
          <div className="bg-white dark:bg-surfaceContainer/10 rounded-[2.5rem] p-8 border border-outline/10 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
               <div className="p-4 bg-primaryContainer/20 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                  <Activity size={24} strokeWidth={2.5} />
               </div>
               <div className="flex items-center gap-1 text-emerald-500 font-black text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span>+4%</span>
               </div>
            </div>
            <div>
              <span className="text-2xl font-semibold text-text tracking-tight">{avgAttendance}%</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mt-1">Avg. Attendance</p>
            </div>
          </div>

          <div className="bg-white dark:bg-surfaceContainer/10 rounded-[2.5rem] p-8 border border-outline/10 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => window.location.href='/dashboard/courses'}>
            <div className="flex justify-between items-start mb-6">
               <div className="p-4 bg-secondaryContainer/20 rounded-2xl text-secondary group-hover:scale-110 transition-transform">
                  <BookOpen size={24} strokeWidth={2.5} />
               </div>
               <button className="text-[10px] font-black text-primary underline underline-offset-4 decoration-2">VIEW ALL</button>
            </div>
            <div>
              <span className="text-2xl font-semibold text-text tracking-tight">{enrolledCourses.length}</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mt-1">Active Courses</p>
            </div>
          </div>
        </section>

        {/* UP NEXT SECTION */}
        <section className="space-y-6 px-2">
          <div className="flex justify-between items-end px-4">
            <h4 className="text-[11px] font-black tracking-[0.25em] text-textMuted/60 uppercase font-headline">Intelligence Feed / Today</h4>
            <button className="text-[11px] font-black text-primary hover:text-primaryContainer transition-colors" onClick={() => window.location.href='/dashboard/timetable'}>FULL TIMETABLE</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {nextClass ? (
              <div className="bg-white dark:bg-surface border border-outline/10 p-8 rounded-[3rem] flex items-center gap-8 shadow-sm hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />
                <div className="w-20 h-20 rounded-[2rem] bg-surfaceLow flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                  <Clock size={32} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase rounded-full border border-primary/20">Active Now</span>
                    <p className="text-[10px] font-black text-textMuted tracking-widest uppercase">{nextClass.start_time} — START</p>
                  </div>
                  <h5 className="font-headline font-black text-text text-2xl tracking-tighter truncate group-hover:text-primary transition-colors">
                    {nextClass.course_code}: {nextClass.course_name}
                  </h5>
                  <div className="flex items-center gap-4 mt-1 text-xs font-bold text-textMuted/60">
                     <span className="flex items-center gap-2"><MapPin size={16} className="text-primary/60" /> {nextClass.venue_name}</span>
                     <span className="flex items-center gap-2 text-textMuted/40">Reference: CS-{nextClass.id}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surfaceHigh/40 text-textMuted group-hover:bg-primary group-hover:text-background group-hover:translate-x-1 transition-all">
                   <ChevronRight size={24} />
                </div>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center bg-surfaceLow/30 rounded-[3rem] border-2 border-dashed border-outline/10 px-8 text-center animate-in fade-in zoom-in duration-1000">
                 <div className="w-24 h-24 rounded-full bg-surfaceContainer/50 flex items-center justify-center mb-6 text-primary shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                 </div>
                 <h5 className="font-headline font-black text-text text-2xl tracking-tight mb-3">Today's Missions Accomplished</h5>
                 <p className="font-medium text-textMuted/80 text-base max-w-sm mx-auto leading-relaxed">You've successfully addressed all scheduled sessions for today. Enjoy your downtime, commander.</p>
                 
                 <div className="mt-10 p-6 bg-white dark:bg-surface rounded-[2.5rem] border border-outline/10 w-full max-w-md flex items-center justify-between gap-4">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">Expansion Protocol</p>
                       <p className="text-sm font-bold text-text">Register New Curriculum</p>
                    </div>
                    <button 
                      onClick={() => setIsRegistrationOpen(true)}
                      className="h-14 px-8 bg-text text-background font-black text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10"
                    >
                      ENROLL NOW
                    </button>
                 </div>
              </div>
            )}
            
            {/* Marked Sessions / Today's History */}
            {dashboardData.recent_activity.filter(a => a.type === 'attendance').slice(0, 2).map(activity => (
              <div key={activity.id} className="bg-surfaceLow/20 border border-outline/5 p-6 rounded-[2.5rem] flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                 <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 size={24} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-textMuted tracking-widest uppercase mb-1">Session Marked • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <h5 className="font-headline font-bold text-text text-lg tracking-tight">
                      {activity.course_code}: {activity.course_name}
                    </h5>
                 </div>
                 <div className="px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Present
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modals */}
        <EnhancedAttendanceScanner
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          onVerify={handleAttendanceCheckIn}
        />
        <CourseRegistrationDialog
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={loadDashboardData}
        />
      </div>
    </>
  );
};