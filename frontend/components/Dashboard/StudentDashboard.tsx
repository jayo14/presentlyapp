import React, { useState, useEffect } from 'react';
import {
  QrCode,
  BookOpen,
  Clock,
  WarningCircle,
  TrendingUp,
  MapPin,
  CaretRight,
  Pulse,
  CircleNotch,
  ArrowsClockwise,
  SquaresFour,
  Bell,
  Sparkle,
  Fingerprint,
  Lightning,
  Shapes,
  Trophy,
  Star,
  ArrowUpRight,
  Layers,
  Atom,
  ShieldCheck
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { LoadingScreen } from '../LoadingScreen';
import { useStudentDashboard } from '../../services/api/student';
import { sessionApi } from '../../services/api/attendance';
import { EnhancedAttendanceScanner } from '../Attendance/EnhancedAttendanceScanner';
import CourseRegistrationDialog from '../Student/CourseRegistrationDialog';
import CourseIcon from '../Course/CourseIcon';
import { StudentAnalytics } from '../Analytics/StudentAnalytics';
import { offlineSyncManager } from '../../src/utils/offlineSync';
import { ResponsiveGrid } from '../layout-primitives/ResponsiveGrid';
import { DashboardCard } from '../layout-primitives/DashboardCard';
import { DashboardPage } from '../layout-primitives/DashboardPage';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { data: dashboardData, isLoading, refetch } = useStudentDashboard();
  const [isImageTransitioning, setIsImageTransitioning] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for device trust confirmation
    if (searchParams.get('device_trusted') === 'true') {
      const deviceName = searchParams.get('device_name') || 'Your device';
      toast.success(`${deviceName} is now trusted.`, {
        description: 'You will no longer receive alerts for logins from this device.',
        icon: <ShieldCheck className="text-green-500" size={20} weight="bold" />,
        duration: 5000,
      });
      // Clear params to avoid repeat toasts
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('device_trusted');
      newParams.delete('device_name');
      setSearchParams(newParams);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setIsImageTransitioning(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAttendanceCheckIn = async (code: string, location: any): Promise<any> => {
    try {
      if (!navigator.onLine) {
        return await offlineSyncManager.queueAttendanceCheckIn({
          sessionCode: code,
          location,
          source: 'dashboard',
        });
      }

      const attendanceData = await sessionApi.checkInByCode(code, location);
      await refetch();
      return attendanceData;
    } catch (err: any) {
      console.error("Check-in failed:", err);
      const rawMsg = err.response?.data?.error || err.message || "Failed to check in";
      const status = err.response?.status;
      
      let userFriendlyMsg = rawMsg;
      if (status === 429) {
        userFriendlyMsg = 'Too many check-in attempts. Please wait a moment and try again.';
      } else if (rawMsg.toLowerCase().includes('distance') || rawMsg.toLowerCase().includes('radius') || rawMsg.toLowerCase().includes('far from venue') || rawMsg.toLowerCase().includes('outside geofence') || rawMsg.toLowerCase().includes('outside area')) {
        userFriendlyMsg = 'Be in class and try again';
      } else if (rawMsg.toLowerCase().includes('closed') || rawMsg.toLowerCase().includes('expired') || rawMsg.toLowerCase().includes('ended') || rawMsg.toLowerCase().includes('no longer active')) {
        userFriendlyMsg = 'Attendance session has closed, ask your lecturers for more information';
      } else if (!err.response || err.code === 'ECONNABORTED' || /network error|failed to fetch|load failed|fetch failed/i.test(rawMsg)) {
        return await offlineSyncManager.queueAttendanceCheckIn({
          sessionCode: code,
          location,
          source: 'dashboard',
        });
      }
      
      throw new Error(userFriendlyMsg);
    }
  };

  const nextClass = dashboardData?.next_class;

  // Show analytics without loading screen
  if (view === 'analytics') {
    return <StudentAnalytics />;
  }

  // Only show loading screen for main dashboard view
  if (isLoading && !dashboardData) return <LoadingScreen message="Loading dashboard..." />;

  return (
    <>
      <SEO title="Presently | Home" />

      <DashboardPage
        subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        title={
          <>
            Hey {userName.split(' ')[0]}, <span className="text-primary dark:text-slate-600">you're on track.</span>
          </>
        }
        titleClassName="text-3xl font-black tracking-tighter leading-tight"
        className="max-w-4xl mx-auto pb-24"
      >
        <div className="lg:col-span-12 space-y-8">
            {/* MAIN ACTION CARD */}
            <section>
                <DashboardCard
                    noPadding
                    onClick={() => setIsAttendanceModalOpen(true)}
                    className="relative aspect-[16/9] md:aspect-[3/1] overflow-hidden bg-slate-900 group border-white/5"
                >
                {isImageTransitioning ? (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    <CircleNotch className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : (
                    <>
                    <picture>
                        <source srcSet="/images/dashboard_hero.avif" type="image/avif" />
                        <source srcSet="/images/dashboard_hero.webp" type="image/webp" />
                        <img
                        src="/images/dashboard_hero.png"
                        alt="Course Visual"
                        width={1600}
                        height={400}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1620641788421-7a1c342f4ec6?q=80&w=1000";
                        }}
                        />
                    </picture>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    </>
                )}

                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                    <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-2">
                        <Fingerprint size={14} weight="bold" className="text-white animate-pulse" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Tap to Scan</span>
                    </div>
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500">
                        <QrCode size={26} weight="bold" className="text-slate-900 md:hidden" />
                        <QrCode size={36} weight="bold" className="text-slate-900 hidden md:block" />
                    </div>
                    </div>

                    <div className="space-y-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                        <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Live Now</p>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter">
                        {nextClass?.course_code || "Mark Attendance"}
                    </h3>
                    <p className="text-white/70 text-sm md:text-lg font-medium max-w-sm truncate">
                        {nextClass?.course_name || "Scan to record your participation"}
                    </p>
                    </div>
                </div>
                </DashboardCard>
            </section>

            {/* COMPACT STATS GRID */}
            <ResponsiveGrid cols={3}>
                {/* ATTENDANCE CARD */}
                <DashboardCard className="p-4 flex flex-col justify-between min-h-[120px]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Pulse size={18} weight="bold" />
                </div>
                <div>
                    <div className="flex items-end gap-1">
                    <span className="text-xl font-black tracking-tighter">{(dashboardData?.attendance_stats?.average_attendance || 0)}%</span>
                    <ArrowUpRight size={14} weight="bold" className="text-emerald-500 mb-1" />
                    </div>
                    <p className="text-[9px] font-black text-textMuted uppercase tracking-widest">Attendance</p>
                </div>
                </DashboardCard>

                {/* ACADEMIC LEVEL CARD */}
                <DashboardCard variant="scholar" className="p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden">
                <Star size={40} weight="bold" className="absolute -right-2 -top-2 opacity-10 rotate-12" />
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Trophy size={18} weight="bold" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black tracking-tighter text-white">LVL 4</span>
                    <span className="text-[8px] font-bold text-white/80 uppercase">Scholar</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[65%]" />
                    </div>
                    <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Next: Dean's List</p>
                </div>
                </DashboardCard>

                {/* COURSES CARD */}
                <DashboardCard
                onClick={() => window.location.href = '/dashboard/courses'}
                className="p-4 flex flex-col justify-between min-h-[120px] group"
                >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BookOpen size={18} weight="bold" />
                </div>
                <div>
                    <div className="flex items-end gap-1">
                    <span className="text-xl font-black tracking-tighter">{dashboardData?.enrolled_courses?.length || 0}</span>
                    </div>
                    <p className="text-[9px] font-black text-textMuted uppercase tracking-widest">Active Courses</p>
                </div>
                </DashboardCard>
            </ResponsiveGrid>

            {/* ACTIVITY FEED */}
            <section className="space-y-5">
                <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">Recent Beats</h4>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Your timeline</p>
                </div>
                <button className="text-[9px] font-black text-primary tracking-widest hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/dashboard/sessions'}>
                    VIEW HISTORY
                </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dashboardData?.recent_activity?.length ? (
                    dashboardData.recent_activity.slice(0, 4).map((activity, idx) => (
                    <DashboardCard
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={activity.id}
                        className="p-4 flex items-center gap-4 group"
                    >
                        <CourseIcon
                        title={activity.course_name}
                        code={activity.course_code}
                        className={`w-12 h-12 flex-shrink-0 ${activity.status === 'PRESENT' ? 'ring-4 ring-emerald-500/20' : 'ring-4 ring-rose-500/20'
                            }`}
                        />
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start text-xs">
                            <div className="flex items-center gap-1.5 line-clamp-1">
                            {['present', 'late', 'flagged'].includes(activity.status.toLowerCase()) ? (
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                activity.status.toLowerCase() === 'present' ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' :
                                activity.status.toLowerCase() === 'late' ? 'text-amber-500 bg-amber-500/5 border-amber-500/10' :
                                'text-blue-500 bg-blue-500/5 border-blue-500/10'
                                }`}>
                                {activity.status}
                                </span>
                            ) : (
                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">Absent</span>
                            )}
                            </div>
                            <p className="text-[8px] font-bold text-textMuted uppercase whitespace-nowrap ml-2">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <h5 className="font-bold text-sm tracking-tight truncate mt-0.5 group-hover:text-primary transition-colors">
                            {activity.course_code} <span className="opacity-30 mx-0.5">/</span> {activity.course_name}
                        </h5>
                        {activity.lecturer_name && (
                            <p className="text-[10px] font-medium text-textMuted mt-0.5 truncate uppercase tracking-wider">
                            {activity.lecturer_name}
                            </p>
                        )}
                        </div>
                    </DashboardCard>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-textMuted">
                    <p className="text-xs font-bold uppercase tracking-widest">No recent activity detected</p>
                    </div>
                )}
                </div>
            </section>
        </div>
      </DashboardPage>

      {/* Modals */}
      <EnhancedAttendanceScanner
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onVerify={handleAttendanceCheckIn}
      />
      <CourseRegistrationDialog
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={refetch}
      />
    </>
  );
};

export default StudentDashboard;
