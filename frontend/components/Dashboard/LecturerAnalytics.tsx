import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  BarChart3, Users, Calendar, TrendingUp, AlertCircle, 
  ChevronDown, Filter, Download, ArrowRight, BookOpen,
  Search, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { analyticsApi, LecturerDashboardAnalytics, CourseAttendanceAnalytics } from '../../services/api/analytics';
import { courseApi, Course } from '../../services/api/attendance';
import { toast } from 'sonner';

export const LecturerAnalytics: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<LecturerDashboardAnalytics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseAnalytics(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [analytics, coursesData] = await Promise.all([
        analyticsApi.getLecturerDashboard(),
        courseApi.getAll()
      ]);
      setDashboardData(analytics);
      setCourses(coursesData);
      
      // Select first course by default if available
      if (coursesData.length > 0) {
        setSelectedCourseId(coursesData[0].id);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast.error('Failed to load analytics overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAnalytics = async (courseId: number) => {
    try {
      setCourseLoading(true);
      const data = await analyticsApi.getCourseAttendance(courseId);
      setCourseAnalytics(data);
    } catch (err) {
      console.error('Error fetching course analytics:', err);
      toast.error('Failed to load course details');
    } finally {
      setCourseLoading(false);
    }
  };

  const COLORS = ['#C1B66D', '#002368', '#ef4444', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-input border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Gathering insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attendance Analytics</h2>
          <p className="text-muted-foreground">Track student participation and engagement trends.</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download size={18} />
          <span>Export Reports</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card text-foreground border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg. Attendance</p>
              <h3 className="text-2xl font-black">{dashboardData?.avg_attendance_percentage.toFixed(1)}%</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full w-fit">
            <TrendingUp size={12} />
            <span>+2.4% from last week</span>
          </div>
        </div>

        <div className="bg-card text-foreground border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-cardackgroundlue-500/10 text-on-primary-fixedlue-500 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</p>
              <h3 className="text-2xl font-black">{dashboardData?.total_sessions}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium italic">Across all active courses</p>
        </div>

        <div className="bg-card text-foreground border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Today</p>
              <h3 className="text-2xl font-black">{dashboardData?.active_sessions_count}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium italic">Ongoing sessions right now</p>
        </div>

        <div className="bg-card text-foreground border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Engagement</p>
              <h3 className="text-2xl font-black">High</h3>
            </div>
          </div>
          <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-500 h-full w-[85%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend */}
        <div className="lg:col-span-2 bg-card text-foreground border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Weekly Overview</h3>
              <p className="text-sm text-muted-foreground">Attendance volume per day</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span>
                  Attendance
               </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.weekly_overview}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717a', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717a', fontSize: 12}} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(193, 182, 109, 0.05)'}}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="attendees" 
                  fill="#C1B66D" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-card text-foreground border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-1">Status Distribution</h3>
          <p className="text-sm text-muted-foreground mb-8">Overall student standing</p>
          
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Good Standing', value: courseAnalytics?.good_standing_count || 75 },
                    { name: 'At Risk', value: courseAnalytics?.at_risk_count || 25 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#C1B66D" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-black">{courseAnalytics?.avg_attendance.toFixed(0) || 0}%</span>
               <span className="text-[10px] uppercase font-bold text-muted-foreground">Avg Rate</span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
             <div className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary"></div>
                   <span className="text-sm font-medium">Good Standing</span>
                </div>
                <span className="text-sm font-bold">{courseAnalytics?.good_standing_count || 0}</span>
             </div>
             <div className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <span className="text-sm font-medium">At Risk</span>
                </div>
                <span className="text-sm font-bold">{courseAnalytics?.at_risk_count || 0}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Course Specific Insights */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Course Insights</h3>
            <p className="text-sm text-muted-foreground">Deep dive into specific course metrics</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search students..." 
                className="pl-9 h-10 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="bg-card text-foreground border border-border rounded-lg pl-4 pr-10 py-2 text-sm font-bold focus:ring-primary focus:border-primary outline-none appearance-none"
                value={selectedCourseId || ''}
                onChange={e => setSelectedCourseId(Number(e.target.value))}
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.code}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {courseLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-64 bg-accent/50 animate-pulse rounded-2xl"></div>
             ))}
          </div>
        ) : courseAnalytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Summary Card */}
            <div className="bg-card border-border rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <BookOpen size={120} />
              </div>
              <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Course Summary</h4>
              <h3 className="text-3xl font-black text-primary-foreground mb-8">{courseAnalytics.course_code}</h3>
              
              <div className="grid grid-cols-2 gap-8 relative z-10 mb-8">
                  <div>
                    <span className="text-muted-foreground text-sm block mb-1">Total Sessions</span>
                    <span className="text-2xl font-bold text-primary-foreground">{courseAnalytics.total_sessions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm block mb-1">Benchmark</span>
                    <span className="text-2xl font-bold text-primary">{courseAnalytics.benchmark}%</span>
                  </div>
              </div>
              
              <div className="pt-6 border-t border-border relative z-10">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex justify-between">
                    <span>Health Status</span>
                    <span className="text-primary-foreground">{courseAnalytics.avg_attendance.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{width: `${courseAnalytics.avg_attendance}%`}}
                      ></div>
                  </div>
              </div>
            </div>

            {/* At-Risk Alerts */}
            <div className="bg-card text-foreground border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold flex items-center gap-2 text-lg">
                    <AlertCircle size={20} className="text-red-500" />
                    At-Risk Alerts
                </h4>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                  {courseAnalytics.at_risk_count} Students
                </span>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {courseAnalytics.students
                    .filter(s => s.percentage < courseAnalytics.benchmark)
                    .map(student => (
                    <div key={student.id} className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                        <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-600 font-bold">
                          {student.name.substring(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground truncate">{student.name}</div>
                          <div className="text-xs text-red-600 font-medium">
                            {student.percentage.toFixed(0)}% attendance • {student.department}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <ArrowRight size={16} />
                        </Button>
                    </div>
                  ))}
                  {courseAnalytics.at_risk_count === 0 && (
                    <div className="text-center py-12 text-muted-foreground italic">
                      No students currently at risk.
                    </div>
                  )}
              </div>
              
              <div className="pt-6 mt-auto border-t border-border">
                <Button className="w-full bg-card border border-border font-bold h-12 rounded-xl hover:bg-accent">
                    Send Bulk Reminders
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/50 rounded-3xl border border-dashed border-border">
             <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
             <h3 className="text-lg font-bold">No analytics for this course</h3>
             <p className="text-muted-foreground">Host a few sessions to see data here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
