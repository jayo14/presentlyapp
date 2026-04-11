import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Activity, BookOpen, Clock,
  Calendar, CheckCircle2, AlertCircle, XCircle,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  ChevronRight, Calendar as CalendarIcon, Filter,
  Download, Share2, Sparkles, Target, Trophy,
  ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { studentApi, StudentAnalytics as StudentAnalyticsType } from '../../services/api/student';
import { SEO } from '../SEO';
import { LoadingScreen } from '../LoadingScreen';

export const StudentAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentAnalyticsType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('This Semester');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await studentApi.getAnalytics();
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!data) return <div>Failed to load analytics data</div>;

  const statusData = [
    { name: 'Present', value: data.status_breakdown?.present || 0, color: '#10b981' },
    { name: 'Late', value: data.status_breakdown?.late || 0, color: '#f59e0b' },
    { name: 'Absent', value: data.status_breakdown?.absent || 0, color: '#ef4444' },
  ];

  const totalSessions = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <>
      <SEO title="Student Analytics | Presently" />
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white pb-20 font-geist">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Academic Intelligence</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter">Insights & Trends</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                {['This Month', 'This Semester', 'Overall'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedPeriod === period
                      ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <button className="p-3 bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                <Download size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* STATS OVERVIEW */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Avg Attendance', value: `${data.overall_stats?.average_attendance || 0}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Total Sessions', value: data.overall_stats?.total_sessions || 0, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Present Today', value: 'Yes', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Current Streak', value: '8 Days', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.label}
                className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-between min-h-[140px] hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-1">{stat.value}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* WEEKLY TRENDS */}
            <section className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Attendance Momentum</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Weekly participation rate</p>
                </div>
                <LineChartIcon size={16} className="text-slate-400" />
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-6 rounded-[3rem] h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weekly_attendance}>
                    <defs>
                      <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#755b00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#755b00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      cursor={{ stroke: '#755b00', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="#755b00"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorAttend)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* STATUS BREAKDOWN */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Engagement Mix</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Distribution profile</p>
                </div>
                <PieChartIcon size={16} className="text-slate-400" />
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-6 rounded-[3rem] h-[350px] flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="80%">
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
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10%]">
                  <span className="block text-2xl font-black tracking-tighter">{totalSessions}</span>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                </div>

                <div className="w-full space-y-2 px-4 pb-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* COURSE PERFORMANCE TABLE */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Academic Breakdown</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Performance by module</p>
              </div>
              <Filter size={16} className="text-slate-400" />
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Course</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attendance</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sessions</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                      <th className="px-6 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.course_performance?.map((course, idx) => (
                      <tr key={course.course_code} className="group hover:bg-slate-50 dark:hover:bg-white/2 transition-colors border-b border-slate-200/50 dark:border-white/5 last:border-0">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                              {course.course_code.slice(0, 3)}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm tracking-tight">{course.course_code}</h4>
                              <p className="text-[10px] font-medium text-slate-400 truncate max-w-[150px] uppercase">{course.course_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-black tracking-tighter">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${course.attendance_percentage >= 75 ? 'bg-emerald-500' :
                                  course.attendance_percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                style={{ width: `${course.attendance_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs">{course.attendance_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-xs font-bold text-slate-500 underline decoration-slate-200 dark:decoration-white/10 underline-offset-4">
                            {course.sessions_attended} / {course.total_sessions}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current ${course.status === 'Good' ? 'text-emerald-500 bg-emerald-500/5' :
                            course.status === 'Average' ? 'text-amber-500 bg-amber-500/5' : 'text-rose-500 bg-rose-500/5'
                            }`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* AI INSIGHTS CARD */}
          <section className="bg-gradient-to-br from-primary to-[#755b00cc] p-1 rounded-[3.5rem] shadow-xl shadow-primary/20">
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl p-8 rounded-[3.4rem] border border-white/20 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Target size={40} />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tighter text-white">Projected: Dean's List</h3>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-[0.2em]">Based on your current momentum</p>
                </div>
                <p className="text-sm text-white/70 max-w-2xl font-medium leading-relaxed">
                  Your consistency in <span className="text-white font-black underline underline-offset-4">CSC 401</span> and <span className="text-white font-black underline underline-offset-4">CSC 405</span> is currently top 5% in the department. Maintaining this pace for 3 more weeks will secure your attendance eligibility for all examinations.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-5 py-2.5 bg-white rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-black/10">
                    View Path to Success
                  </div>
                  <div className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer">
                    Dismiss
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};
