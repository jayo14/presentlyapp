import React, { useState, useEffect } from 'react';
import {
  QrCode, BookOpen, Clock, AlertCircle, TrendingUp,
  MapPin, ChevronRight, Activity,
  Loader2, RefreshCw,
  LayoutGrid, BellRing, Sparkles,
  Fingerprint, Zap, Shapes, Trophy, Star,
  ArrowUpRight, Layers, Atom
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '../SEO';
import { LoadingScreen } from '../LoadingScreen';
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
  const [isImageTransitioning, setIsImageTransitioning] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => { loadDashboardData(); }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!dashboardData) setLoading(true);
      const data = await studentApi.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      // Simulate image load delay for smooth transition
      setTimeout(() => setIsImageTransitioning(false), 800);
    }
  };

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

  if (loading && !dashboardData) return <LoadingScreen message="Syncing your flow" />;

  const displayInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  const nextClass = dashboardData?.next_class;

  return (
    <>
      <SEO title="Presently | Home" />

      <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#08080A] pb-24 text-slate-900 dark:text-white font-sans selection:bg-primary/20 overflow-x-hidden">

        {/* TOP NAV - MOBILE VIEW ONLY (Desktop has Sidebar) */}
        {/* <nav className="sticky top-0 z-50 px-6 py-4 bg-[#FDFDFF]/70 dark:bg-[#08080A]/70 backdrop-blur-2xl md:hidden">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Layers size={16} className="text-on-primary-fixed" />
              </div>
              <h1 className="text-sm font-black tracking-widest uppercase opacity-80">Presently</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 relative">
                <BellRing size={18} className="text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#FDFDFF] dark:border-[#08080A]"></span>
              </button>
              <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner overflow-hidden cursor-pointer" onClick={() => window.location.href='/dashboard/profile'}>
                {currentUser?.avatar_url ? (
                   <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary bg-primary/10">
                    {displayInitials}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav> */}

        <main className="max-w-4xl mx-auto px-6 pt-4 space-y-8">

          {/* GREETING */}
          <header className="max-w-md md:max-w-none">
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-60 mb-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h2 className="text-3xl font-black tracking-tighter leading-tight">
              Hey {userName.split(' ')[0]}, <span className="text-slate-400 dark:text-slate-600">you're on track.</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* L-Column (Main Card) */}
            <div className="lg:col-span-12 space-y-8">

              {/* MAIN ACTION CARD */}
              <section>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="relative aspect-[16/9] md:aspect-[3/1] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-xl shadow-primary/5 group cursor-pointer border border-white/5"
                >
                  {isImageTransitioning ? (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : (
                    <>
                      <img
                        src="/images/dashboard_hero.png"
                        alt="Course Visual"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1620641788421-7a1c342f4ec6?q=80&w=1000";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    </>
                  )}

                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-2">
                        <Fingerprint size={14} className="text-white animate-pulse" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Tap to Scan</span>
                      </div>
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500">
                        <QrCode size={26} className="text-slate-900 md:hidden" />
                        <QrCode size={36} className="text-slate-900 hidden md:block" />
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
                </motion.div>
              </section>

              {/* COMPACT STATS GRID */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ATTENDANCE CARD */}
                <div className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4 rounded-[2rem] flex flex-col justify-between min-h-[120px] hover:shadow-lg transition-all">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-black tracking-tighter">{(dashboardData?.attendance_stats?.average_attendance || 0)}%</span>
                      <ArrowUpRight size={14} className="text-emerald-500 mb-1" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                  </div>
                </div>

                {/* ACADEMIC LEVEL CARD */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#755b00cc] to-primary p-4 rounded-[2rem] flex flex-col justify-between min-h-[120px] shadow-lg shadow-primary/10 group cursor-default">
                  <Star size={40} className="absolute -right-2 -top-2 opacity-10 rotate-12" />
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Trophy size={18} />
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
                </div>

                {/* COURSES CARD */}
                <div
                  onClick={() => window.location.href = '/dashboard/courses'}
                  className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4 rounded-[2rem] flex flex-col justify-between min-h-[120px] hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-black tracking-tighter">{dashboardData?.enrolled_courses?.length || 0}</span>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Courses</p>
                  </div>
                </div>

                {/* ZAP/STREAK CARD */}
                {/* <div className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4 rounded-[2rem] flex flex-col justify-between min-h-[120px] hover:shadow-lg transition-all">
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-black tracking-tighter">12</span>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Day Streak</p>
                  </div>
                </div> */}
              </section>

              {/* ACTIVITY FEED */}
              <section className="space-y-5">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Recent Beats</h4>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Your timeline</p>
                  </div>
                  <button className="text-[9px] font-black text-primary tracking-widest hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/dashboard/sessions'}>
                    VIEW HISTORY
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardData?.recent_activity?.length ? (
                    dashboardData.recent_activity.slice(0, 4).map((activity, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={activity.id}
                        className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4 rounded-[1.75rem] flex items-center gap-4 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${activity.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {activity.status === 'present' ? <Shapes size={20} /> : <Atom size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5 line-clamp-1">
                              {activity.status === 'present' ? (
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">Present</span>
                              ) : (
                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">Absent</span>
                              )}
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase whitespace-nowrap ml-2">
                              {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <h5 className="font-bold text-sm tracking-tight truncate mt-0.5 group-hover:text-primary transition-colors">
                            {activity.course_code} <span className="opacity-30 mx-0.5">/</span> {activity.course_name}
                          </h5>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-slate-400">
                      <p className="text-xs font-bold uppercase tracking-widest">No recent activity detected</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>

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

export default StudentDashboard;
