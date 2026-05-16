import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Plus,
  Calendar, FileText, ChevronRight,
  TrendingUp, BarChart3, Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi, lecturerApi } from '../../services/api/attendance';
import { DashboardCard } from './DashboardCard';
import { PageContainer } from './PageContainer';
import { Button } from '../Button';
import CourseIcon from '../Course/CourseIcon';
import { cn } from '../../src/components/ui/utils';
import { Badge } from '../../src/components/ui/badge';

interface LecturerDashboardProps {
  userName: string;
  userProfile?: any;
  view?: 'default' | 'analytics' | 'reports' | 'courses' | 'timetable';
}

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ userName }) => {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['lecturerDashboard'],
    queryFn: () => lecturerApi.getLecturerDashboard(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['lecturerSessions'],
    queryFn: () => attendanceApi.getSessions({ lecturer_only: true }),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-surface-highest rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-surface-highest rounded-2xl" />)}
          </div>
          <div className="h-80 bg-surface-highest rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  const activeSessions = sessions.filter((s: any) => s.is_active);

  return (
    <PageContainer>
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div className="space-y-1">
           <Badge variant="secondary" className="px-3 py-1 bg-sky-teal/10 text-sky-teal border-sky-teal/20 font-bold uppercase tracking-widest text-[10px]">LECTURER PORTAL</Badge>
           <h2 className="text-3xl font-bold text-on-surface tracking-tight">
             Hello, Prof. {userName.split(' ').pop()}
           </h2>
           <p className="text-on-surface-variant font-medium text-sm italic opacity-80">
             "Attendance handled before you finish your intro."
           </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/sessions/new')}
          className="h-14 px-8 bg-sungold text-presently-black rounded-2xl font-bold shadow-gold group overflow-hidden relative"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus size={20} />
            Start Session
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Button>
      </div>

      {/* 2. STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Students', value: dashboardData?.total_students || 0, icon: Users, color: 'text-sungold', bg: 'bg-sungold/10' },
          { label: 'Active Courses', value: dashboardData?.active_courses || 0, icon: BookOpen, color: 'text-moss-green', bg: 'bg-moss-green/10' },
          { label: 'Avg. Attendance', value: `${dashboardData?.avg_attendance || 0}%`, icon: TrendingUp, color: 'text-sky-teal', bg: 'bg-sky-teal/10' },
        ].map((stat, i) => (
          <DashboardCard key={i} className="group relative overflow-hidden">
            <div className="flex justify-between items-start">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                 <stat.icon size={22} />
               </div>
               <Badge variant="outline" className="text-[9px] font-bold opacity-50">REAL-TIME</Badge>
            </div>
            <div className="mt-6">
               <p className="text-3xl font-bold text-on-surface tracking-tight leading-none mb-1">{stat.value}</p>
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
            </div>
          </DashboardCard>
        ))}
      </section>

      {/* 3. ACTIVE SESSIONS */}
      {activeSessions.length > 0 && (
        <section className="space-y-6">
           <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Active Sessions</h3>
              <div className="h-px flex-1 bg-outline/30" />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSessions.map((session: any) => (
                <DashboardCard key={session.id} className="relative overflow-hidden group cursor-pointer border-l-4 border-l-sungold" onClick={() => navigate(`/dashboard/sessions/${session.id}`)}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="text-sungold font-bold text-[10px] uppercase tracking-widest">{session.course_code}</div>
                        <h4 className="text-xl font-bold text-on-surface tracking-tight">{session.course_name}</h4>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 bg-sungold/10 text-sungold rounded-lg animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-sungold" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">LIVE</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 text-on-surface-variant font-bold text-xs mb-8">
                      <div className="flex items-center gap-2"><Users size={16} /> {session.attendee_count} Present</div>
                      <div className="flex items-center gap-2"><Clock size={16} /> Started {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                   <Button variant="outline" fullWidth className="h-12 border-outline/50 rounded-xl group-hover:bg-on-surface group-hover:text-background transition-all font-bold text-xs uppercase tracking-widest">
                      Manage Attendance
                   </Button>
                </DashboardCard>
              ))}
           </div>
        </section>
      )}

      {/* 4. RECENT SESSIONS & TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">History</h3>
              <button className="text-xs font-bold text-sungold hover:opacity-80 uppercase tracking-widest">View All History</button>
           </div>
           <div className="space-y-3">
              {sessions.filter((s: any) => !s.is_active).slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center gap-5 p-4 rounded-2xl border border-outline/50 bg-surface-highest/20 hover:bg-surface-highest/50 transition-all cursor-pointer group" onClick={() => navigate(`/dashboard/sessions/${session.id}`)}>
                   <div className="w-11 h-11 rounded-xl bg-surface-highest flex items-center justify-center border border-outline/50 transition-transform group-hover:scale-105">
                      <CourseIcon title={session.course_name} code={session.course_code} className="w-7 h-7" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface truncate text-sm">{session.course_name}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-wider">
                         <span className="text-sungold">{session.course_code}</span>
                         <span className="opacity-30">•</span>
                         <span>{new Date(session.start_time).toLocaleDateString()}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-bold text-on-surface">{session.attendee_count}</div>
                      <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Students</div>
                   </div>
                   <ChevronRight size={18} className="text-outline-variant group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
           </div>
        </section>

        <section className="space-y-6">
           <h3 className="text-xl font-bold text-on-surface tracking-tight">Toolkit</h3>
           <div className="space-y-4">
              <DashboardCard className="cursor-pointer group" onClick={() => navigate('/dashboard/reports')}>
                 <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-sky-teal/10 flex items-center justify-center text-sky-teal transition-transform group-hover:rotate-12">
                       <FileText size={20} />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-on-surface">Reports</h4>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Export PDF/CSV logs</p>
                    </div>
                 </div>
              </DashboardCard>
              <DashboardCard className="cursor-pointer group" onClick={() => navigate('/dashboard/analytics')}>
                 <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-moss-green/10 flex items-center justify-center text-moss-green transition-transform group-hover:rotate-12">
                       <BarChart3 size={20} />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-on-surface">Analytics</h4>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Engagement insights</p>
                    </div>
                 </div>
              </DashboardCard>
           </div>
        </section>
      </div>
    </PageContainer>
  );
};

export { LecturerDashboard };
