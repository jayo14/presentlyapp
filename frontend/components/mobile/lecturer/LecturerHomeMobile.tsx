import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Users, BookBookmark, 
  TrendUp, Clock, CaretRight, 
  FileText, ChartBar, Broadcast,
  Sparkle
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi, lecturerApi } from '../../../services/api/attendance';
import { useNavigate } from 'react-router-dom';

export const LecturerHomeMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['lecturerDashboard'],
    queryFn: () => lecturerApi.getLecturerDashboard(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['lecturerSessions'],
    queryFn: () => attendanceApi.getSessions({ lecturer_only: true }),
  });

  const activeSessions = sessions.filter((s: any) => s.is_active);

  if (isLoading) return <div className="p-4 space-y-4">
    <div className="h-40 bg-surface-container animate-pulse rounded-3xl" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-surface-container animate-pulse rounded-3xl" />
      <div className="h-32 bg-surface-container animate-pulse rounded-3xl" />
    </div>
  </div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <Sparkle size={18} weight="duotone" className="text-sungold" />
              <span className="text-xs font-bold uppercase tracking-widest">Faculty Portal</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hello, Prof.
            </h1>
          </div>
          <button 
            onClick={() => navigate('/dashboard/sessions/new')}
            className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
          >
             <Plus size={24} weight="bold" />
          </button>
        </div>

        {/* Active Session Card */}
        {activeSessions.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Live Sessions
            </h2>
            {activeSessions.map((session: any) => (
              <motion.div 
                key={session.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                className="p-6 rounded-[32px] bg-sungold text-presently-black shadow-gold space-y-4 relative overflow-hidden"
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{session.course_code}</span>
                    <h3 className="text-2xl font-bold leading-tight">{session.course_name}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center">
                     <Broadcast size={24} weight="fill" className="animate-pulse" />
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-6 font-bold text-sm">
                   <div className="flex items-center gap-1.5">
                      <Users size={18} weight="fill" />
                      {session.attendee_count} Present
                   </div>
                   <div className="flex items-center gap-1.5 text-black/60">
                      <Clock size={18} weight="fill" />
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>

                {/* Glassy overlay effect */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-[32px] bg-surface-container border border-outline border-dashed text-center space-y-4">
             <div className="w-16 h-16 rounded-3xl bg-surface mx-auto flex items-center justify-center shadow-sm">
                <Broadcast size={32} weight="duotone" className="text-on-surface-variant opacity-40" />
             </div>
             <div className="space-y-1">
                <h3 className="text-lg font-bold">No active lectures</h3>
                <p className="text-sm text-on-surface-variant font-medium px-6">Ready to start? Create a session and let students scan in.</p>
             </div>
             <button 
               className="h-12 px-6 bg-sungold text-black rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
               onClick={() => navigate('/dashboard/sessions/new')}
             >
                Launch Session
             </button>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-[28px] bg-surface-container border border-outline flex flex-col justify-between h-40">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">{dashboardData?.total_students || 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Students</p>
          </div>
        </div>
        
        <div className="p-5 rounded-[28px] bg-surface-container border border-outline flex flex-col justify-between h-40">
          <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
            <TrendUp size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">{dashboardData?.avg_attendance || 0}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Engage Rate</p>
          </div>
        </div>
      </section>

      {/* Quick Tools */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1">Power Tools</h2>
        <div className="grid grid-cols-1 gap-3">
           <button 
             onClick={() => navigate('/dashboard/reports')}
             className="p-5 rounded-[24px] bg-surface border border-outline shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all"
           >
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                 <FileText size={24} weight="duotone" />
              </div>
              <div className="flex-1 text-left">
                 <h4 className="font-bold">Export Logs</h4>
                 <p className="text-xs text-on-surface-variant font-medium">Download PDF/CSV attendance</p>
              </div>
              <CaretRight size={20} weight="bold" className="text-on-surface-variant" />
           </button>

           <button 
             onClick={() => navigate('/dashboard/analytics')}
             className="p-5 rounded-[24px] bg-surface border border-outline shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all"
           >
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-success">
                 <ChartBar size={24} weight="duotone" />
              </div>
              <div className="flex-1 text-left">
                 <h4 className="font-bold">Performance</h4>
                 <p className="text-xs text-on-surface-variant font-medium">Course-wide engagement trends</p>
              </div>
              <CaretRight size={20} weight="bold" className="text-on-surface-variant" />
           </button>
        </div>
      </section>

      {/* Recent History */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Class History</h2>
          <button className="text-xs font-bold text-sungold">See All</button>
        </div>
        <div className="space-y-3">
          {sessions.filter((s: any) => !s.is_active).slice(0, 3).map((session: any) => (
            <div 
              key={session.id}
              className="p-4 rounded-3xl bg-surface-container/50 border border-outline/50 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-surface border border-outline flex items-center justify-center font-bold text-xs">
                 {session.course_code.substring(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-sm truncate">{session.course_name}</h4>
                 <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                   {new Date(session.start_time).toLocaleDateString()} • {session.attendee_count} students
                 </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
