import React, { useState, useRef, useEffect } from 'react';
import { QrCode, BookOpen, Clock, AlertCircle, TrendingUp, Calendar, X, Image as ImageIcon, Keyboard, Plus, MapPin, CheckCircle2, ChevronRight, Activity, Loader2, LocateFixed, Smartphone, RefreshCw, ArrowLeft, ChevronDown, Home, BarChart, User } from 'lucide-react';
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
  
  // Mobile analytics filters
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  
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
    const getActivityCourseCode = (activity: StudentDashboardData['recent_activity'][number]) => {
        return activity.course_code || 'ACT';
    };
  
  // UI Constants
  const MAX_RECENT_ACTIVITY_MOBILE = 5; // Show up to 5 recent activities on mobile dashboard

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
    { name: 'Present', value: dashboardData.attendance_stats.total_present, color: 'rgb(34, 197, 94)' },
    { name: 'Late', value: dashboardData.attendance_stats.total_late, color: 'rgb(234, 179, 8)' },
    { name: 'Absent', value: dashboardData.attendance_stats.total_absent, color: 'rgb(239, 68, 68)' },
  ] : [];

  const handleAttendanceCheckIn = async (code: string, location: any): Promise<any> => {
      try {
          const attendanceData = await sessionApi.checkInByCode(code, location);
          await loadDashboardData();
          return attendanceData; // Return the full attendance object
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
                                                <p className="text-zinc-900 dark:text-white font-medium">{t.course.course_code} - {t.course_name}</p>
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
      // Mobile Layout (Design 1)
      const mobileLayout = (
          <div className="min-h-screen bg-[#3A3A2F] dark:bg-[#3A3A2F] text-white pb-20">
              {/* Mobile Header */}
              <div className="p-4 flex items-center gap-4">
                  <button 
                      onClick={() => window.history.back()} 
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                      <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-xl font-bold flex-1">Attendance Analytics</h1>
              </div>

              {/* Semester and Course Filters */}
              <div className="px-4 mb-6 flex gap-3">
                  <button className="px-4 py-2 bg-[#4A4A3F] rounded-xl flex items-center gap-2 text-sm font-medium">
                      {selectedSemester}
                      <ChevronDown size={16} />
                  </button>
                  <button className="px-4 py-2 bg-[#4A4A3F] rounded-xl flex items-center gap-2 text-sm font-medium">
                      {selectedCourse}
                      <ChevronDown size={16} />
                  </button>
              </div>

              {/* Overall Attendance Circle */}
              <div className="px-4 mb-6 flex justify-center">
                  <div className="relative w-64 h-64">
                      {/* Circular Progress using SVG */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                          {/* Background circle */}
                          <circle
                              cx="100"
                              cy="100"
                              r="85"
                              fill="none"
                              stroke="#4A4A3F"
                              strokeWidth="20"
                          />
                          {/* Progress circle */}
                          <circle
                              cx="100"
                              cy="100"
                              r="85"
                              fill="none"
                              stroke="#FFD700"
                              strokeWidth="20"
                              strokeDasharray={`${(avgAttendance / 100) * 534} 534`}
                              strokeLinecap="round"
                          />
                      </svg>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-6xl font-bold">{Math.round(avgAttendance)}%</div>
                          <div className="text-sm text-gray-400 uppercase tracking-wide">Overall Attendance</div>
                      </div>
                  </div>
              </div>

              {/* +2% vs last month indicator */}
              <div className="px-4 mb-8 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 rounded-lg">
                      <TrendingUp size={16} className="text-green-400" />
                      <span className="text-green-400 text-sm font-medium">+2% vs last month</span>
                  </div>
              </div>

              {/* Weekly Trends */}
              <div className="px-4 mb-8">
                  <h2 className="text-xl font-bold mb-4">Weekly Trends</h2>
                  <div className="bg-[#2A2A25] rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                          <div>
                              <div className="text-xs text-gray-400 uppercase tracking-wide">Average</div>
                              <div className="text-2xl font-bold">18.5 hrs</div>
                          </div>
                          <div className="px-3 py-1 bg-[#4A4A3F] rounded-lg text-xs font-medium text-[#FFD700]">
                              Last 4 Weeks
                          </div>
                      </div>
                      
                      {/* Bar Chart */}
                      <div className="flex items-end justify-between gap-2 h-40">
                          {weeklyAttendanceData.map((week, index) => {
                              const isHighlighted = index === weeklyAttendanceData.length - 1 || index === 1 || index === 3;
                              const height = `${week.attendance}%`;
                              return (
                                  <div key={week.name} className="flex-1 flex flex-col items-center gap-2">
                                      <div className="w-full flex items-end justify-center" style={{ height: '140px' }}>
                                          <div 
                                              className={`w-full rounded-t-lg transition-all ${
                                                  isHighlighted ? 'bg-[#FFD700]' : 'bg-[#4A4A3F]'
                                              }`}
                                              style={{ height }}
                                          />
                                      </div>
                                      <div className="text-xs text-gray-400">{week.name}</div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>

              {/* Course Performance List */}
              <div className="px-4 space-y-3">
                  {enrolledCourses.slice(0, 4).map((course) => {
                      const attendance = course.attendance_percentage || 0;
                      const getStatusColor = () => {
                          if (attendance >= 90) return 'bg-[#FFD700]';
                          if (attendance >= 75) return 'bg-[#4CAF50]';
                          if (attendance >= 60) return 'bg-[#FFA500]';
                          return 'bg-[#F44336]';
                      };
                      
                      const getIcon = () => {
                          const iconClass = "w-6 h-6";
                          if (course.course.course_code.includes('CALC')) return <div className={`${iconClass} bg-[#FFD700] rounded-lg flex items-center justify-center text-black text-xs font-bold`}>∫</div>;
                          if (course.course.course_code.includes('PHYS')) return <div className={`${iconClass} bg-[#4A90E2] rounded-lg`} />;
                          if (course.course.course_code.includes('ART')) return <div className={`${iconClass} bg-[#9B59B6] rounded-lg`} />;
                          if (course.course.course_code.includes('CS')) return <div className={`${iconClass} bg-[#E91E63] rounded-lg`} />;
                          return <BookOpen className={iconClass} />;
                      };
                      
                      return (
                          <div 
                              key={course.course.course_code}
                              className="bg-[#2A2A25] rounded-xl p-4 flex items-center gap-3"
                          >
                              {getIcon()}
                              <div className="flex-1 min-w-0">
                                  <div className="font-bold text-white truncate">{course.course_name}</div>
                                  <div className="w-full bg-[#1A1A15] rounded-full h-1.5 mt-2">
                                      <div 
                                          className={`h-full rounded-full ${getStatusColor()}`}
                                          style={{ width: `${attendance}%` }}
                                      />
                                  </div>
                              </div>
                              <div className="text-lg font-bold">{Math.round(attendance)}%</div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );

      // Desktop Layout (unchanged)
      const desktopLayout = (
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
                          <div key={course.course.course_code} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                              <div className="flex-1">
                                  <div className="flex justify-between mb-2">
                                      <span className="font-bold text-zinc-900 dark:text-white text-sm">{course.course.course_code}</span>
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

      return (
          <>
              {/* Mobile View */}
              <div className="md:hidden">
                  {mobileLayout}
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block">
                  {desktopLayout}
              </div>
          </>
      );
  }

  // Default Dashboard View (Clean Redesign)
  
  // Mobile Layout (Modern Redesign with Enhanced UX)
  const mobileDashboardLayout = (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 pb-24">
          {/* Modern Header with Gradient */}
          <div className="relative overflow-hidden">
              {/* Background Gradient Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute top-20 left-0 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative p-6">
                  <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                          <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30"
                          >
                              {userName.charAt(0)}
                          </motion.div>
                          <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                              </p>
                              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                                  Hello, {userName.split(' ')[0]}!
                              </h1>
                          </div>
                      </div>
                      <motion.button 
                          whileTap={{ scale: 0.95 }}
                          className="relative w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700"
                      >
                          <Activity size={20} className="text-slate-700 dark:text-slate-300" />
                          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg shadow-red-500/50"></div>
                      </motion.button>
                  </div>
              </div>
          </div>

          {/* Warning Banner (if low attendance) */}
          <AnimatePresence>
              {lowAttendanceCourses.length > 0 && !isWarningDismissed && (
                  <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mx-4 mb-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-red-500/30"
                  >
                      <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                          <AlertCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-bold text-white">Attendance Alert</p>
                          <p className="text-xs text-white/90 mt-0.5">
                              Below 75% in {lowAttendanceCourses.length} course{lowAttendanceCourses.length > 1 ? 's' : ''}
                          </p>
                      </div>
                      <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handleDismissWarning}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                          <X size={18} className="text-white" />
                      </motion.button>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* Quick Actions - Prominent CTAs */}
          <div className="px-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                  <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAttendanceModalOpen(true)}
                      className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                  >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative">
                          <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                              <QrCode size={24} />
                          </div>
                          <h3 className="font-bold text-lg mb-1">Scan QR</h3>
                          <p className="text-xs text-white/80">Mark attendance</p>
                      </div>
                  </motion.button>
                  
                  <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsRegistrationOpen(true)}
                      className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                  >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative">
                          <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                              <Plus size={24} />
                          </div>
                          <h3 className="font-bold text-lg mb-1">Register</h3>
                          <p className="text-xs text-white/80">Add courses</p>
                      </div>
                  </motion.button>
              </div>
          </div>

          {/* Next Class Card - Only if exists */}
          {nextClass && (
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 mb-6"
              >
                  <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Happening Now</span>
                      </div>
                  </div>
                  
                  <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                      {/* Gradient Background */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-3xl"></div>
                      
                      <div className="relative p-6">
                          <div className="flex items-start justify-between mb-4">
                              <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-900 text-xs font-bold rounded-xl shadow-lg shadow-yellow-400/30">
                                  {nextClass.venue_name || 'Lecture Hall'}
                              </span>
                              {nextClass.end_time && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                                      <Clock size={14} className="text-slate-600 dark:text-slate-400" />
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                          {/* Note: Timer updates via dashboard auto-refresh (every 60s) */}
                                          {Math.max(0, Math.floor((new Date(nextClass.end_time).getTime() - Date.now()) / 60000))}m left
                                      </span>
                                  </div>
                              )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{nextClass.course_name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 flex items-center gap-2">
                              <User size={14} />
                              {nextClass.lecturer_name || 'Lecturer TBA'}
                              <span className="text-slate-400 dark:text-slate-500">•</span>
                              <Clock size={14} />
                              {nextClass.start_time || 'Time TBA'}
                          </p>
                          
                          <motion.button 
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsAttendanceModalOpen(true)}
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                          >
                              <QrCode size={20} />
                              Mark Attendance Now
                          </motion.button>
                      </div>
                  </div>
              </motion.div>
          )}

          {/* Stats Overview - Enhanced Cards */}
          <div className="px-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Stats</h2>
              
              {/* Main Attendance Card */}
              <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 mb-4 shadow-xl shadow-indigo-500/30 relative overflow-hidden"
              >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                          <div>
                              <p className="text-white/80 text-sm font-medium mb-1">Overall Attendance</p>
                              <h3 className="text-5xl font-black text-white">{avgAttendance.toFixed(1)}%</h3>
                          </div>
                          <div className="relative w-20 h-20">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6"/>
                                  <circle 
                                      cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="6"
                                      strokeDasharray={`${(avgAttendance / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`}
                                      strokeLinecap="round"
                                  />
                              </svg>
                          </div>
                      </div>
                      
                      {/* Detailed Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                              <p className="text-3xl font-bold text-white mb-1">{dashboardData?.attendance_stats?.total_sessions || 0}</p>
                              <p className="text-xs text-white/80 font-medium">Total Classes</p>
                          </div>
                          <div className="bg-green-500/30 backdrop-blur-sm rounded-2xl p-4 text-center border border-green-400/30">
                              <p className="text-3xl font-bold text-white mb-1">{dashboardData?.attendance_stats?.total_present || 0}</p>
                              <p className="text-xs text-white/90 font-medium">Present</p>
                          </div>
                          <div className="bg-red-500/30 backdrop-blur-sm rounded-2xl p-4 text-center border border-red-400/30">
                              <p className="text-3xl font-bold text-white mb-1">{dashboardData?.attendance_stats?.total_absent || 0}</p>
                              <p className="text-xs text-white/90 font-medium">Missed</p>
                          </div>
                      </div>
                  </div>
              </motion.div>
              
              {/* Secondary Stats - Course Count */}
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
              >
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center">
                              <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                              <p className="text-3xl font-bold text-slate-900 dark:text-white">{enrolledCourses.length}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Enrolled Courses</p>
                          </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-400" />
                  </div>
              </motion.div>
          </div>

          {/* Recent Activity - Redesigned */}
          <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                  <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      View All
                      <ChevronRight size={16} />
                  </button>
              </div>
              
              <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Activity size={24} className="text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No recent activity</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Your attendance records will appear here</p>
                      </div>
                  ) : (
                      recentActivity.slice(0, MAX_RECENT_ACTIVITY_MOBILE).map((activity, index) => {
                          const isPresent = activity.status === 'PRESENT';
                          const isLate = activity.status === 'LATE';
                          const statusColor = isPresent 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : isLate
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                          const iconBg = isPresent
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
                              : isLate
                              ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
                              : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30';
                          const statusLabel = activity.status === 'PRESENT' ? 'Present' 
                              : activity.status === 'LATE' ? 'Late'
                              : activity.status === 'EXCUSED' ? 'Excused'
                              : 'Absent';
                          
                          return (
                              <motion.div 
                                  key={activity.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                              >
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
                                      {isPresent ? (
                                          <CheckCircle2 size={22} className="text-green-600 dark:text-green-400" />
                                      ) : isLate ? (
                                          <Clock size={22} className="text-yellow-600 dark:text-yellow-400" />
                                      ) : (
                                          <X size={22} className="text-red-600 dark:text-red-400" />
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                          {getActivityCourseCode(activity)}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                          {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(activity.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                  </div>
                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap ${statusColor}`}>
                                      {statusLabel}
                                  </span>
                              </motion.div>
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
  );

  // Desktop Layout (unchanged)
  const desktopDashboardLayout = (
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
                   <h3 className="text-2xl font-bold mb-1">{nextClass.course_name}</h3>
                   <div className="flex items-center gap-4 mt-4">
                       <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                           <Clock size={14} className="text-zinc-400"/> {nextClass.start_time}
                       </div>
                       <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                           <MapPin size={14} className="text-zinc-400"/> {nextClass.venue_name}
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
                                   {getActivityCourseCode(activity).substring(0,2)}
                               </div>
                               <div>
                                   <p className="font-bold text-zinc-900 dark:text-white text-sm">{getActivityCourseCode(activity)} {activity.type === 'attendance' ? 'Class' : ''}</p>
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

  return (
      <>
          {/* Mobile View */}
          <div className="md:hidden">
              {mobileDashboardLayout}
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:block">
              {desktopDashboardLayout}
          </div>
      </>
  );
}