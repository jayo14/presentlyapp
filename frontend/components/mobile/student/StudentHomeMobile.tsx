import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Scan, Clock, MapPin, 
  TrendUp, Trophy, GraduationCap,
  CaretRight, Sun, Moon, Sparkle
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../../services/api/student';
import { attendanceApi } from '../../../services/api/attendance';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';


export const StudentHomeMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => studentApi.getDashboardData(),
    refetchInterval: 30000
  });

  const activeSession = useMemo(() => {
    if (!dashboardData?.upcoming_sessions?.length) return null;
    const now = new Date();
    return dashboardData.upcoming_sessions.find((s: any) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return now >= start && now <= end;
    });
  }, [dashboardData]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  }, []);

  if (isLoading) return <div className="p-4 space-y-4">
    <div className="h-40 w-full bg-surface-container animate-pulse rounded-3xl" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-surface-container animate-pulse rounded-3xl" />
      <div className="h-32 bg-surface-container animate-pulse rounded-3xl" />
    </div>
  </div>;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Greeting & Hero */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <greeting.icon size={18} weight="duotone" className="text-sungold" />
              <span className="text-xs font-bold uppercase tracking-widest">{greeting.text}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ready for class?
            </h1>
          </div>
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-12 h-12 rounded-2xl bg-sungold/10 border border-sungold/20 flex items-center justify-center"
          >
             <Sparkle size={24} weight="fill" className="text-sungold" />
          </motion.div>
        </div>

        {/* Active Session Card */}
        {activeSession ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative h-64 rounded-[32px] overflow-hidden group shadow-2xl"
          >
             <img 
               src="https://images.unsplash.com/photo-1523050853063-913a3e973028?auto=format&fit=crop&q=80&w=1000" 
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               alt="Classroom"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
             
             <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Live Now
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    {activeSession.course_code}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {activeSession.course_name}
                </h2>
                
                <div className="flex items-center gap-4 text-white/80 text-sm font-medium mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} weight="duotone" className="text-sungold" />
                    {activeSession.venue_name || 'Main Hall'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} weight="duotone" className="text-sungold" />
                    Ends in 45m
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/dashboard/scanner')}
                  className="w-full h-14 bg-sungold text-black rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(245,197,24,0.3)]"
                >
                  <Scan size={24} weight="bold" />
                  Mark Presence
                </button>
             </div>
          </motion.div>
        ) : (
          <div className="p-8 rounded-[32px] bg-surface-container border border-outline border-dashed text-center space-y-4">
             <div className="w-16 h-16 rounded-3xl bg-surface mx-auto flex items-center justify-center shadow-sm">
                <GraduationCap size={32} weight="duotone" className="text-on-surface-variant opacity-40" />
             </div>
             <div className="space-y-1">
                <h3 className="text-lg font-bold">No sessions active</h3>
                <p className="text-sm text-on-surface-variant font-medium px-4">Your schedule is clear right now. Relax or catch up on materials.</p>
             </div>
             <button 
               className="text-sungold font-bold text-sm uppercase tracking-widest flex items-center gap-2 mx-auto"
               onClick={() => navigate('/dashboard/courses')}
             >
                Browse Courses <CaretRight size={16} weight="bold" />
             </button>
          </div>
        )}
      </section>

      {/* 2. Quick Stats Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1">Performance</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[28px] bg-surface-container border border-outline flex flex-col justify-between h-40">
            <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
              <TrendUp size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{dashboardData?.attendance_stats?.average_attendance || 0}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Avg Attendance</p>
            </div>
          </div>
          
          <div className="p-5 rounded-[28px] bg-surface-container border border-outline flex flex-col justify-between h-40">
            <div className="w-10 h-10 rounded-2xl bg-sungold/10 flex items-center justify-center text-sungold">
              <Trophy size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">12d</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Daily Streak</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Activity Feed</h2>
          <button className="text-xs font-bold text-sungold">View History</button>
        </div>
        <div className="space-y-4">
          {dashboardData?.recent_activity?.slice(0, 3).map((activity: any) => (
            <motion.div 
              key={activity.id}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-3xl bg-surface border border-outline shadow-sm flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-on-surface-variant font-bold">
                 {activity.course_code.substring(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{activity.course_name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${activity.status === 'PRESENT' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                     {activity.status}
                   </span>
                   <span className="text-[10px] font-bold text-on-surface-variant">
                     {new Date(activity.timestamp).toLocaleDateString()}
                   </span>
                </div>
              </div>
              <CaretRight size={20} className="text-on-surface-variant" weight="bold" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Timeline / Upcoming */}
      <section>
         <div className="flex items-center gap-2 mb-4 px-1">
            <Clock size={18} weight="duotone" className="text-sungold" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Next in Schedule</h2>
         </div>
         <div className="bg-surface-container rounded-[32px] p-2">
            {dashboardData?.upcoming_sessions?.slice(0, 2).map((session: any, i: number) => (
              <div key={i} className={`p-4 flex items-center gap-4 ${i === 0 ? 'border-b border-outline/50' : ''}`}>
                 <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-lg font-black tracking-tighter">
                      {new Date(session.start_time).getHours()}:00
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Starts</span>
                 </div>
                 <div className="h-10 w-px bg-outline/50" />
                 <div className="flex-1">
                    <h5 className="font-bold text-sm">{session.course_name}</h5>
                    <p className="text-xs text-on-surface-variant font-medium">{session.venue_name}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};
