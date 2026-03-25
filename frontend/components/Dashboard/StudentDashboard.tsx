import React, { useState, useEffect, lazy } from 'react';
import { QrCode, BookOpen, Clock, AlertCircle, TrendingUp, Calendar, Plus, MapPin, ChevronRight, Activity, Loader2, User, RefreshCw } from 'lucide-react';
import { SkeletonStudentDashboard } from '../Skeleton';
import { SEO } from '../SEO';
import { studentApi, StudentDashboardData } from '../../services/api/student';
import { sessionApi } from '../../services/api/attendance';
import { EnhancedAttendanceScanner } from '../Attendance/EnhancedAttendanceScanner';
import CourseRegistrationDialog from '../Student/CourseRegistrationDialog';
import { useCurrentUser } from '../../hooks/useAuth';

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
    return <SkeletonStudentDashboard />;
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
        <header className="flex md:hidden justify-between items-center mb-2 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h2 className="font-headline text-2xl font-black text-text tracking-tight mt-1">Hello, {userName.split(' ')[0]} 👋</h2>
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

              <div className="bg-text text-white w-24 h-24 rounded-[2rem] shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 self-center md:self-start">
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
              <span className="text-5xl font-headline font-black text-text tracking-tighter">{avgAttendance}%</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mt-3">Avg. Attendance</p>
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
              <span className="text-5xl font-headline font-black text-text tracking-tighter">{enrolledCourses.length}</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mt-3">Active Courses</p>
            </div>
          </div>
        </section>

        {/* UP NEXT SECTION */}
        <section className="space-y-6 px-2">
          <div className="flex justify-between items-end px-2">
            <h4 className="text-[11px] font-black tracking-[0.25em] text-textMuted/80 uppercase font-headline">Mission Schedule</h4>
            <button className="text-[11px] font-black text-primary hover:text-primaryContainer transition-colors" onClick={() => window.location.href='/dashboard/timetable'}>FULL TIMETABLE</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextClass ? (
              <div className="bg-white dark:bg-surfaceContainer/5 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm border border-outline/5 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-surfaceContainer/50 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary/10 transition-all duration-500">
                  <Clock size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-textMuted tracking-widest uppercase mb-1.5">{nextClass.start_time} — {(nextClass as any).end_time ?? ''}</p>
                  <h5 className="font-headline font-black text-text text-xl tracking-tight truncate group-hover:text-primary transition-colors">
                    {nextClass.course_code}: {nextClass.course_name}
                  </h5>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-textMuted/70">
                     <span className="flex items-center gap-1.5"><MapPin size={14} /> {nextClass.venue_name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surfaceHigh/40 text-textMuted group-hover:bg-primary group-hover:text-white group-hover:translate-x-1 transition-all">
                   <ChevronRight size={20} />
                </div>
              </div>
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surfaceHigh/20 rounded-[3rem] border-2 border-dashed border-outline/20 px-6 text-center">
                 <div className="w-20 h-20 rounded-full bg-surfaceContainer flex items-center justify-center mb-6 text-textMuted/40">
                    <Calendar className="w-10 h-10" />
                 </div>
                 <h5 className="font-headline font-black text-text text-lg tracking-tight mb-2">Daily mission accomplished</h5>
                 <p className="font-medium text-textMuted/80 text-sm max-w-xs">No scheduled classes remaining for today. Enjoy your rest, commander.</p>
                 <button className="mt-8 px-8 py-3 bg-white dark:bg-surface text-text font-black text-xs rounded-2xl border border-outline/30 shadow-sm hover:shadow-md transition-all active:scale-95" onClick={() => setIsRegistrationOpen(true)}>REGISTER NEW MODULES</button>
              </div>
            )}
          </div>
        </section>

        {/* QUICK REGISTER CTA */}
        <section className="px-2 pb-20">
           <div 
             onClick={() => setIsRegistrationOpen(true)}
             className="bg-primary/[0.03] hover:bg-primary/[0.06] border-2 border-dashed border-primary/20 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 transition-all group cursor-pointer"
           >
              <div className="w-16 h-16 rounded-full bg-white dark:bg-surface flex items-center justify-center text-primary shadow-[0_12px_24px_rgba(0,0,0,0.08)] group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                 <Plus size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                 <h4 className="font-headline font-black text-text text-2xl tracking-tight">Add New Courses</h4>
                 <p className="text-sm font-medium text-textMuted mt-1.5 max-w-xs mx-auto">Expand your academic curriculum by enrolling in more department modules.</p>
              </div>
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