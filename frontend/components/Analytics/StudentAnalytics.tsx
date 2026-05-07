import React from 'react';
import {
  TrendingUp, Activity, Target,
  Calendar, Award, ArrowUpRight,
  PieChart as PieChartIcon, Filter,
  ChevronRight, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, PieChart,
  Pie, Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../services/api/attendance';
import { ModernCard } from '../ModernCard';
import { Button } from '../Button';
import { cn } from '../../src/components/ui/utils';

const COLORS = ['#D4AF37', '#14B86A', '#FF4F40', '#64748B'];

const StudentAnalytics: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['studentAnalytics'],
    queryFn: () => studentApi.getAttendanceStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surfaceContainer rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surfaceContainer rounded-md" />)}
        </div>
        <div className="h-64 bg-surfaceContainer rounded-md" />
      </div>
    );
  }

  const attendanceData = [
    { name: 'Mon', value: 80 },
    { name: 'Tue', value: 100 },
    { name: 'Wed', value: 90 },
    { name: 'Thu', value: 70 },
    { name: 'Fri', value: 85 },
    { name: 'Sat', value: 0 },
    { name: 'Sun', value: 0 },
  ];

  const statusData = [
    { name: 'Present', value: data?.attendance_stats?.total_present || 0, color: '#14B86A' },
    { name: 'Late', value: data?.attendance_stats?.total_late || 0, color: '#D4AF37' },
    { name: 'Absent', value: data?.attendance_stats?.total_absent || 0, color: '#FF4F40' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* HEADER */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-text">Analytics</h1>
        <p className="text-textMuted font-medium">Your academic performance at a glance.</p>
      </header>

      {/* CORE STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall', value: `${data?.attendance_stats?.average_attendance || 0}%`, icon: Activity, color: 'text-success' },
          { label: 'Sessions', value: data?.attendance_stats?.total_sessions || 0, icon: BarChart3, color: 'text-primary' },
          { label: 'Ranking', value: 'Top 5%', icon: Target, color: 'text-blue-500' },
          { label: 'Badges', value: '12', icon: Award, color: 'text-purple-500' },
        ].map((stat, i) => (
          <ModernCard key={i} padding="md" className="flex flex-col justify-between min-h-[140px]">
            <div className="w-10 h-10 rounded-xl bg-surfaceContainer flex items-center justify-center">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{stat.label}</p>
            </div>
          </ModernCard>
        ))}
      </section>

      {/* TREND CHART */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-widest">Attendance Trend</h3>
          <Button variant="ghost" size="sm" className="text-primary">Weekly View</Button>
        </div>
        <ModernCard className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#D4AF37"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ModernCard>
      </section>

      {/* BREAKDOWN GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PIE CHART */}
        <ModernCard className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest">Status Breakdown</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black">{data?.attendance_stats?.total_sessions || 0}</span>
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-textMuted uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* TOP COURSES */}
        <ModernCard className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest">Module Ranking</h3>
          <div className="space-y-4">
            {data?.course_performance?.slice(0, 4).map((course: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceContainer flex items-center justify-center text-[10px] font-black shrink-0">
                    {course.course_code.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{course.course_code}</p>
                    <p className="text-[10px] text-textMuted font-medium truncate uppercase">{course.course_name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-sm font-black",
                    course.attendance_percentage >= 75 ? "text-success" : "text-amber-500"
                  )}>
                    {course.attendance_percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full h-12" onClick={() => navigate('/dashboard/courses')}>
            View All Courses
          </Button>
        </ModernCard>
      </section>
    </div>
  );
};

export default StudentAnalytics;
