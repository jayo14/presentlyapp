import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { QrCode, BookOpen, Clock, AlertCircle, TrendingUp, Calendar, X, Plus, MapPin, CheckCircle2, ChevronRight, Activity, Loader2, RefreshCw, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { SEO } from '../SEO';
import { studentApi, StudentDashboardData, EnrolledCourse, TimetableEntry, StudentAnalytics } from '../../services/api/student';
import { sessionApi } from '../../services/api/attendance';
import { geolocationService } from '../../services/geolocation';
import CourseRegistrationDialog from '../Student/CourseRegistrationDialog';
const FindMyLocation = lazy(() => import('../Location/FindMyLocation').then(module => ({ default: module.FindMyLocation })));
import EnhancedAttendanceScanner from '../Attendance/EnhancedAttendanceScanner';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { useCurrentUser } from '../../hooks/useAuth';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const { data: currentUser } = useCurrentUser();
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isWarningDismissed, setIsWarningDismissed] = useState(() => {
    const dismissed = localStorage.getItem('attendanceWarningDismissed');
    return dismissed === 'true';
  });

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<StudentAnalytics | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => { loadDashboardData(); }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (view === 'timetable') loadTimetableData();
  }, [view]);

  useEffect(() => {
    if (view === 'analytics') loadAnalyticsData();
  }, [view]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load dashboard data';
      setError(errorMsg);
      toast.error('Dashboard Error', { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const loadTimetableData = async () => {
    try {
      const data = await studentApi.getTimetable();
      setTimetableData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load timetable data:', err);
      setTimetableData([]);
      toast.error('Timetable Error', { description: 'Failed to load your class timetable' });
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const data = await studentApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Failed to load analytics data:', err);
      toast.error('Analytics Error', { description: 'Failed to load your performance analytics' });
    }
  };

  // Derived data
  const enrolledCourses = dashboardData?.enrolled_courses || [];
  const lowAttendanceCourses = enrolledCourses.filter(c => (c.attendance_percentage || 0) < 75);
  const avgAttendance = dashboardData?.attendance_stats?.average_attendance || 0;
  const nextClass = dashboardData?.next_class;
  const recentActivity = dashboardData?.recent_activity || [];
  const getActivityCourseCode = (activity: StudentDashboardData['recent_activity'][number]) => {
    return activity.course_code || 'ACT';
  };

  const displayAvatar = currentUser?.avatar_url;
  const displayInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  const handleDismissWarning = () => {
    setIsWarningDismissed(true);
    localStorage.setItem('attendanceWarningDismissed', 'true');
  };

  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    loadDashboardData();
  };

  const weeklyAttendanceData = [
    { name: 'W1', attendance: 70 },
    { name: 'W2', attendance: 85 },
    { name: 'W3', attendance: 80 },
    { name: 'W4', attendance: 90 },
    { name: 'W5', attendance: avgAttendance },
  ];

  const attendanceStatusData = dashboardData?.attendance_stats ? [
    { name: 'Present', value: dashboardData.attendance_stats.total_present, color: '#22c55e' },
    { name: 'Late', value: dashboardData.attendance_stats.total_late, color: '#eab308' },
    { name: 'Absent', value: dashboardData.attendance_stats.total_absent, color: '#ef4444' },
  ] : [];

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

  // ─── View: Timetable ──────────────────────────────────
  if (view === 'timetable') {
    return (
      <>
        <SEO title="Class Timetable | Student Dashboard" description="View your weekly class schedule and registered courses on Presently." noIndex />
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Class Timetable</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Your weekly class schedule.</p>
            </div>
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-on-primary-fixedlack rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Register Courses
            </button>
          </div>

          <div className="grid gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
              const dayUpper = day.toUpperCase() as TimetableEntry['day_of_week'];
              const dayClasses = Array.isArray(timetableData)
                ? timetableData.filter(t => t.day_of_week === dayUpper && t.is_active)
                : [];

              return (
                <div key={day} className="bg-card text-foreground border border-border rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{day}</h3>
                  <div className="space-y-2">
                    {dayClasses.length > 0 ? (
                      dayClasses.map((t) => (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-muted-foreground">
                            <Clock size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{t.course.course_code} – {t.course_name}</p>
                            <p className="text-xs text-muted-foreground">{t.start_time} – {t.end_time}</p>
                            {t.venue_name && <p className="text-xs text-muted-foreground">{t.venue_name}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No classes scheduled.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <CourseRegistrationDialog
            isOpen={isRegistrationOpen}
            onClose={() => setIsRegistrationOpen(false)}
            onSuccess={handleRegistrationSuccess}
          />
        </div>
      </>
    );
  }

  // ─── View: Analytics ───────────────────────────────────
  if (view === 'analytics') {
    return (
      <>
        <SEO title="Attendance Analytics | Student Dashboard" description="View your attendance analytics, course performance and weekly trends on Presently." noIndex />
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">Performance Insights</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Track your attendance trends and statistics.</p>
          </div>

          {/* Location Map */}
          <Suspense fallback={
            <div className="h-[280px] w-full flex flex-col items-center justify-center bg-card text-foreground border border-border rounded-xl animate-pulse text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <p className="text-sm">Loading Map...</p>
            </div>
          }>
            <FindMyLocation className="shadow-sm" />
          </Suspense>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Attendance', value: `${avgAttendance}%`, color: 'text-foreground' },
              { label: 'Present', value: dashboardData?.attendance_stats?.total_present || 0, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Late', value: dashboardData?.attendance_stats?.total_late || 0, color: 'text-muted-foregroundmber-600 dark:text-muted-foregroundmber-400' },
              { label: 'Absent', value: dashboardData?.attendance_stats?.total_absent || 0, color: 'text-red-600 dark:text-red-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-card text-foreground border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Donut Chart */}
            <div className="md:col-span-5 bg-card text-foreground border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Status Breakdown</h3>
              <div className="h-56 w-full relative" style={{ minHeight: '224px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceStatusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {attendanceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      iconType="circle"
                      formatter={(value) => <span className="text-muted-foreground text-xs ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                  <div className="text-center">
                    <p className="text-3xl font-semibold text-foreground">{avgAttendance}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Area Chart */}
            <div className="md:col-span-7 bg-card text-foreground border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Attendance Trend</h3>
              <div className="h-56 w-full" style={{ minHeight: '224px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyAttendanceData}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} domain={[0, 100]} width={28} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#f59e0b' }}
                    />
                    <Area type="monotone" dataKey="attendance" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-card text-foreground border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Course Performance</h3>
            </div>
            <div className="divide-y divide-zinc-100">
              {(analyticsData?.course_performance || []).map((course) => (
                <div key={course.course_code} className="px-5 py-3.5 flex items-center gap-4 hover:bg-accent hover:text-accent-foreground/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{course.course_code}</span>
                      <span className={`text-sm font-semibold ${course.attendance_percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {course.attendance_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${course.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${course.attendance_percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <p className="text-xs text-muted-foreground truncate">{course.course_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Default Dashboard View ────────────────────────────
  return (
    <>
      <SEO title="Student Dashboard | Presently" description="Track your attendance, enrolled courses, upcoming classes and academic performance on Presently." noIndex />
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <h1 className="text-xl font-semibold text-foreground mt-0.5">Hello, {userName.split(' ')[0]}</h1>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-accent border border-border flex items-center justify-center">
            {displayAvatar ? (
              <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">{displayInitials}</span>
            )}
          </div>
        </div>

        {/* Mark Attendance CTA */}
        <button
          onClick={() => setIsAttendanceModalOpen(true)}
          className="w-full relative overflow-hidden bg-primary text-on-primary-fixedlack rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="relative z-10">
            <span className="inline-flex items-center px-2 py-0.5 bg-cardackgroundlack/10 rounded text-[10px] font-semibold uppercase tracking-wider mb-2">
              Action Required
            </span>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">Mark Attendance</h2>
            <p className="text-sm text-on-primary-fixedlack/70 font-medium mt-0.5">Scan QR Code or Enter Session ID</p>
          </div>
          <div className="relative z-10 bg-card/20 p-3.5 rounded-xl backdrop-blur-sm group-hover:bg-card/30 transition-colors">
            <QrCode size={36} className="text-on-primary-fixedlack" />
          </div>
          <div className="absolute right-0 top-0 w-48 h-48 bg-card/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </button>

        {/* Warning Banner */}
        <AnimatePresence>
          {lowAttendanceCourses.length > 0 && !isWarningDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-center gap-3"
            >
              <div className="bg-red-100 p-2 rounded-lg text-red-600 flex-shrink-0">
                <AlertCircle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700">Attendance Warning</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Below 75% in: {lowAttendanceCourses.map(c => c.code).join(', ')}
                </p>
              </div>
              <button
                onClick={handleDismissWarning}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={16} className="text-red-600" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next Class */}
          {nextClass ? (
            <div className="bg-card text-foreground p-5 rounded-xl relative overflow-hidden border border-border">
              <div className="relative z-10">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={12} className="text-primary" /> Up Next
                </p>
                <h3 className="text-lg font-semibold mb-3">{nextClass.course_name}</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-accent px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <Clock size={12} className="text-muted-foreground" /> {nextClass.start_time}
                  </div>
                  <div className="bg-accent px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <MapPin size={12} className="text-muted-foreground" /> {nextClass.venue_name}
                  </div>
                </div>
              </div>
              <div className="absolute right-[-16px] bottom-[-16px] opacity-5">
                <BookOpen size={120} />
              </div>
            </div>
          ) : (
            <div className="bg-card text-foreground p-5 rounded-xl relative overflow-hidden border border-border">
              <div className="relative z-10">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={12} className="text-primary" /> Up Next
                </p>
                <h3 className="text-lg font-semibold mb-1">No Classes Scheduled</h3>
                <p className="text-sm text-muted-foreground">You don't have any upcoming classes today.</p>
              </div>
            </div>
          )}

          {/* Stats + Register CTA */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-card text-foreground border border-border p-4 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                  <TrendingUp size={16} />
                </div>
                <p className="text-2xl font-semibold text-foreground">{avgAttendance}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg. Attendance</p>
              </div>
              <div className="flex-1 bg-card text-foreground border border-border p-4 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-cardackgroundlue-50 flex items-center justify-center text-on-primary-fixedlue-600 mb-2">
                  <BookOpen size={16} />
                </div>
                <p className="text-2xl font-semibold text-foreground">{enrolledCourses.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active Courses</p>
              </div>
            </div>
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="w-full bg-muted border border-border p-3.5 rounded-xl flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-accent p-2 rounded-lg">
                  <Plus size={16} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Register Courses</p>
                  <p className="text-xs text-muted-foreground">Manage your enrollment</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="bg-card text-foreground border border-border rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-secondary font-medium">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your attendance records will appear here</p>
              </div>
            ) : (
              recentActivity.slice(0, 8).map((activity, index) => {
                const isPresent = activity.status === 'PRESENT';
                const isLate = activity.status === 'LATE';
                const statusColor = isPresent
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : isLate
                  ? 'bg-inputmber-50 text-muted-foregroundmber-700 dark:bg-inputmber-500/10 dark:text-muted-foregroundmber-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
                const statusLabel = activity.status === 'PRESENT' ? 'Present'
                  : activity.status === 'LATE' ? 'Late'
                  : activity.status === 'EXCUSED' ? 'Excused'
                  : 'Absent';

                return (
                  <div
                    key={activity.id || `activity-${index}`}
                    className="flex items-center justify-between p-3 bg-card text-foreground border border-border rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {getActivityCourseCode(activity).substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{getActivityCourseCode(activity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modals */}
        <EnhancedAttendanceScanner
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          onVerify={handleAttendanceCheckIn}
        />
        <CourseRegistrationDialog
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      </div>
    </>
  );
};