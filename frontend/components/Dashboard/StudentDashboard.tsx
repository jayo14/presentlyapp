import React, { useState, useRef, useEffect } from 'react';
import { QrCode, BookOpen, Clock, AlertCircle, TrendingUp, Calendar, X, Image as ImageIcon, Keyboard, Plus, MapPin, CheckCircle2, ChevronRight, Activity, Loader2, LocateFixed, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { studentApi, StudentDashboardData, EnrolledCourse, TimetableEntry, StudentAnalytics } from '../../services/api/student';
import { sessionApi } from '../../services/api/attendance';
import { geolocationService } from '../../services/geolocation';
import CourseRegistrationDialog from '../Student/CourseRegistrationDialog';
import { FindMyLocation } from '../Location/FindMyLocation';
import EnhancedAttendanceScanner from '../Attendance/EnhancedAttendanceScanner';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}
export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isWarningDismissed, setIsWarningDismissed] = useState(() => {
    const dismissed = localStorage.getItem('attendanceWarningDismissed');
    return dismissed === 'true';
  });
  
  // Real data from API
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<StudentAnalytics | null>(null);
  
  // Load dashboard data on mount and setup auto-refresh
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
        loadDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  
  // Load timetable data when view changes to timetable
  useEffect(() => {
    if (view === 'timetable') {
      loadTimetableData();
    }
  }, [view]);
  
  // Load analytics data when view changes to analytics
  useEffect(() => {
    if (view === 'analytics') {
      loadAnalyticsData();
    }
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
      toast.error('Dashboard Error', {
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadTimetableData = async () => {
    try {
      const data = await studentApi.getTimetable();
      // Ensure data is an array
      setTimetableData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load timetable data:', err);
      setTimetableData([]); // Set to empty array on error
      toast.error('Timetable Error', {
        description: 'Failed to load your class timetable'
      });
    }
  };
  
  const loadAnalyticsData = async () => {
    try {
      const data = await studentApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Failed to load analytics data:', err);
      toast.error('Analytics Error', {
        description: 'Failed to load your performance analytics'
      });
    }
  };
  
  // Derived data from API response
  const enrolledCourses = dashboardData?.enrolled_courses || [];
  const lowAttendanceCourses = enrolledCourses.filter(c => (c.attendance_percentage || 0) < 75);
  const avgAttendance = dashboardData?.attendance_stats?.average_attendance || 0;
  const nextClass = dashboardData?.next_class;
  const recentActivity = dashboardData?.recent_activity || [];

  // Handler to dismiss warning
  const handleDismissWarning = () => {
    setIsWarningDismissed(true);
    localStorage.setItem('attendanceWarningDismissed', 'true');
  };
  
  // Handler for successful course registration
  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    loadDashboardData(); // Reload dashboard data
  };

  // Analytics data from API
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

  const handleAttendanceCheckIn = async (code: string, location: any): Promise<boolean> => {
      try {
          await sessionApi.checkInByCode(code, location);
          await loadDashboardData();
          return true;
      } catch (err: any) {
          console.error("Check-in failed:", err);
          throw new Error(err.response?.data?.error || err.message || "Failed to check in");
      }
  };

  // --- Views ---

  if (view === 'timetable') {
      return (
          <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Class Timetable</h2>
                  <Button onClick={() => setIsRegistrationOpen(true)}>
                      <Plus size={18} className="mr-2" /> Register Courses
                  </Button>
              </div>
              
              <div className="grid gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const dayUpper = day.toUpperCase() as TimetableEntry['day_of_week'];
                      const dayClasses = Array.isArray(timetableData) 
                        ? timetableData.filter(t => t.day_of_week === dayUpper && t.is_active)
                        : [];
                      
                      return (
                          <div key={day} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                              <h3 className="text-primary font-bold mb-3">{day}</h3>
                              <div className="space-y-3">
                                  {dayClasses.length > 0 ? (
                                    dayClasses.map((t) => (
                                        <div key={t.id} className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                            <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-zinc-500 dark:text-zinc-400">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-zinc-900 dark:text-white font-medium">{t.course_code} - {t.course_name}</p>
                                                <p className="text-sm text-zinc-500">{t.start_time} - {t.end_time}</p>
                                                {t.venue_name && <p className="text-xs text-zinc-400">{t.venue_name}</p>}
                                            </div>
                                        </div>
                                    ))
                                  ) : (
                                      <p className="text-sm text-zinc-500 italic">No classes scheduled.</p>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  if (view === 'analytics') {
      return (
          <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Performance Insights</h2>
                      <p className="text-zinc-500">Track your attendance trends and statistics.</p>
                  </div>
              </div>

              {/* Location MVP Feature */}
              <FindMyLocation className="shadow-lg shadow-primary/5" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Attendance</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{avgAttendance}%</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Present</p>
                      <p className="text-2xl font-bold text-green-500 mt-1">35</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Late</p>
                      <p className="text-2xl font-bold text-yellow-500 mt-1">5</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Absent</p>
                      <p className="text-2xl font-bold text-red-500 mt-1">2</p>
                  </div>
              </div>

              {/* Charts Layout - Circular Chart First */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Pie Chart (Donut) */}
                  <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
                      <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Status Breakdown</h3>
                      <div className="h-64 w-full relative" style={{ minHeight: '256px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={attendanceStatusData}
                                      innerRadius={70}
                                      outerRadius={90}
                                      paddingAngle={4}
                                      dataKey="value"
                                      stroke="none"
                                  >
                                      {attendanceStatusData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                     contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                  />
                                  <Legend 
                                     verticalAlign="bottom" 
                                     height={36} 
                                     iconType="circle"
                                     formatter={(value) => <span className="text-zinc-500 text-sm ml-1">{value}</span>}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                          {/* Centered Percentage */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                               <div className="text-center">
                                   <p className="text-4xl font-bold text-zinc-900 dark:text-white">{avgAttendance}%</p>
                                   <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total</p>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Line Chart (Area with Gradient) */}
                  <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                      <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Weekly Attendance Trend</h3>
                      <div className="h-64 w-full" style={{ minHeight: '256px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weeklyAttendanceData}>
                                  <defs>
                                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ffca0d" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#ffca0d" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.3} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} domain={[0, 100]} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#ffca0d' }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="attendance" 
                                    stroke="#ffca0d" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorAttendance)" 
                                  />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>

              {/* Detailed Course Breakdown */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                      <h3 className="font-bold text-zinc-900 dark:text-white">Course Performance</h3>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {analyticsData?.course_performance?.map((course) => (
                          <div key={course.course_code} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                              <div className="flex-1">
                                  <div className="flex justify-between mb-2">
                                      <span className="font-bold text-zinc-900 dark:text-white text-sm">{course.course_code}</span>
                                      <span className={`text-sm font-bold ${course.attendance_percentage >= 75 ? 'text-green-500' : 'text-red-500'}`}>{course.attendance_percentage}%</span>
                                  </div>
                                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${course.attendance_percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                                        style={{ width: `${course.attendance_percentage}%` }}
                                      ></div>
                                  </div>
                              </div>
                              <div className="ml-6 text-right w-32">
                                  <p className="text-xs text-zinc-500 truncate">{course.course_name}</p>
                              </div>
                          </div>
                      )) || []}
                  </div>
              </div>
          </div>
      );
  }

  // Default Dashboard View (Clean Redesign)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       {/* Greeting Header */}
       <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-zinc-500 text-sm font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">Hello, {userName.split(' ')[0]}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400">
              {userName.charAt(0)}
          </div>
       </div>

       {/* PROMINENT MARK ATTENDANCE HERO */}
       <button 
         onClick={() => setIsAttendanceModalOpen(true)}
         className="w-full relative overflow-hidden bg-primary text-black rounded-[2rem] p-6 md:p-8 shadow-xl shadow-primary/20 group transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/30 text-left flex items-center justify-between"
       >
          <div className="relative z-10">
              <div className="bg-black/10 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                  Action Required
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-2">Mark<br/>Attendance</h2>
              <p className="text-black/70 font-medium">Scan QR Code or Enter Session ID</p>
          </div>
          <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
               <QrCode size={48} className="text-black" />
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
       </button>

       {/* Warning Banner (Conditionally Rendered) */}
       <AnimatePresence>
         {lowAttendanceCourses.length > 0 && !isWarningDismissed && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-center gap-4"
           >
             <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
               <AlertCircle size={20} />
             </div>
             <div className="flex-1">
                 <p className="text-sm font-bold text-red-600 dark:text-red-300">Attendance Warning</p>
                 <p className="text-xs text-red-500 dark:text-red-400">
                   Below 75% in: {lowAttendanceCourses.map(c => c.code).join(', ')}
                 </p>
             </div>
             <button
               onClick={handleDismissWarning}
               className="p-2 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
               title="Dismiss warning"
             >
               <X size={18} className="text-red-600 dark:text-red-400" />
             </button>
           </motion.div>
         )}
       </AnimatePresence>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Next Class Card */}
           {nextClass ? (
             <div className="bg-zinc-900 text-white p-6 rounded-3xl relative overflow-hidden border border-zinc-800">
               <div className="relative z-10">
                   <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Clock size={14} className="text-primary"/> Up Next
                   </p>
                   <h3 className="text-2xl font-bold mb-1">{nextClass.name}</h3>
                   <div className="flex items-center gap-4 mt-4">
                       <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                           <Clock size={14} className="text-zinc-400"/> {nextClass.time}
                       </div>
                       <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                           <MapPin size={14} className="text-zinc-400"/> {nextClass.venue}
                       </div>
                   </div>
               </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                   <BookOpen size={150} />
               </div>
             </div>
           ) : (
             <div className="bg-zinc-900 text-white p-6 rounded-3xl relative overflow-hidden border border-zinc-800">
               <div className="relative z-10">
                   <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Clock size={14} className="text-primary"/> Up Next
                   </p>
                   <h3 className="text-2xl font-bold mb-1">No Classes Scheduled</h3>
                   <p className="text-zinc-400 text-sm mt-4">You don't have any upcoming classes today.</p>
               </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                   <BookOpen size={150} />
               </div>
             </div>
           )}

           {/* Quick Stats / Actions */}
           <div className="space-y-4">
               <div className="flex gap-4">
                   <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col justify-between">
                       <div className="bg-green-100 dark:bg-green-900/20 w-8 h-8 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                           <TrendingUp size={16} />
                       </div>
                       <div>
                           <p className="text-2xl font-bold text-zinc-900 dark:text-white">{avgAttendance}%</p>
                           <p className="text-xs text-zinc-500">Avg. Attendance</p>
                       </div>
                   </div>
                   <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col justify-between">
                        <div className="bg-blue-100 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                           <BookOpen size={16} />
                        </div>
                       <div>
                           <p className="text-2xl font-bold text-zinc-900 dark:text-white">{enrolledCourses.length}</p>
                           <p className="text-xs text-zinc-500">Active Courses</p>
                       </div>
                   </div>
               </div>
               <button 
                    onClick={() => setIsRegistrationOpen(true)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
               >
                   <div className="flex items-center gap-3">
                       <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-lg">
                           <Plus size={18} className="text-zinc-600 dark:text-zinc-400"/>
                       </div>
                       <div className="text-left">
                           <p className="font-bold text-zinc-900 dark:text-white text-sm">Register Courses</p>
                           <p className="text-xs text-zinc-500">Manage your enrollment</p>
                       </div>
                   </div>
                   <ChevronRight size={18} className="text-zinc-400" />
               </button>
           </div>
       </div>

       {/* Recent Activity List */}
       <div className="pt-4">
           <h3 className="font-bold text-zinc-900 dark:text-white mb-4 px-1">Recent Activity</h3>
           <div className="space-y-3">
               {recentActivity.length === 0 ? (
                   <p className="text-sm text-zinc-500 italic px-1">No recent activity recorded.</p>
               ) : (
                   recentActivity.map((activity) => (
                       <div key={activity.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                           <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm">
                                   {activity.course_code?.substring(0,2) || 'AT'}
                               </div>
                               <div>
                                   <p className="font-bold text-zinc-900 dark:text-white text-sm">{activity.course_code} {activity.type === 'attendance' ? 'Class' : ''}</p>
                                   <p className="text-xs text-zinc-500">{new Date(activity.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                               </div>
                           </div>
                           <span className={`text-xs font-bold px-2 py-1 rounded-md ${activity.status === 'PRESENT' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                               {activity.status || 'Success'}
                           </span>
                       </div>
                   ))
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
  );
}