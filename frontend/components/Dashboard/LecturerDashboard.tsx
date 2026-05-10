import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Clock, Plus,
  Calendar, FileText, ChevronRight,
  TrendingUp, BarChart3, MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, lecturerApi } from '../../services/api/attendance';
import { ModernCard } from '../ModernCard';
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
  const queryClient = useQueryClient();

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
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const activeSessions = sessions.filter((s: any) => s.is_active);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">LECTURER PORTAL</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Welcome, Prof. {userName.split(' ').pop()}
           </h1>
           <p className="text-on-surface-variant font-medium text-lg italic">
             "Attendance handled before you say good morning."
           </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/sessions/new')}
          size="lg"
          className="h-16 px-10 shadow-gold"
        >
          <Plus size={24} className="mr-2" />
          Start New Session
        </Button>
      </header>

      {/* 2. STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Students', value: dashboardData?.total_students || 0, icon: Users, variant: 'default' as const },
          { label: 'Active Courses', value: dashboardData?.active_courses || 0, icon: BookOpen, variant: 'excused' as const },
          { label: 'Avg. Attendance', value: `${dashboardData?.avg_attendance || 0}%`, icon: TrendingUp, variant: 'present' as const },
        ].map((stat, i) => (
          <ModernCard key={i} padding="md" className="flex flex-col justify-between min-h-[140px] group hover:border-sungold/30 transition-all">
            <div className="flex justify-between items-start">
               <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-presently-black border border-outline group-hover:bg-sungold/10 transition-colors">
                 <stat.icon size={24} />
               </div>
               <Badge variant={stat.variant}>Live Data</Badge>
            </div>
            <div>
               <p className="font-display text-4xl font-bold text-presently-black">{stat.value}</p>
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </ModernCard>
        ))}
      </section>

      {/* 3. ACTIVE SESSIONS */}
      {activeSessions.length > 0 && (
        <section className="space-y-6">
           <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold text-presently-black">Active Sessions</h2>
              <div className="h-px flex-1 bg-outline" />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSessions.map((session: any) => (
                <ModernCard key={session.id} variant="gold-accent" className="relative overflow-hidden group cursor-pointer" onClick={() => navigate(`/dashboard/sessions/${session.id}`)}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="text-sungold font-bold text-xs uppercase tracking-widest">{session.course_code}</div>
                        <h3 className="font-display text-2xl font-bold text-presently-black">{session.course_name}</h3>
                      </div>
                      <Badge variant="present" className="animate-pulse">LIVE</Badge>
                   </div>
                   <div className="flex items-center gap-6 text-on-surface-variant font-bold text-sm mb-8">
                      <div className="flex items-center gap-2"><Users size={18} /> {session.attendee_count} Present</div>
                      <div className="flex items-center gap-2"><Clock size={18} /> Started {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                   <Button variant="outline" fullWidth className="h-12 border-presently-black group-hover:bg-presently-black group-hover:text-white transition-all">
                      Manage Attendance
                   </Button>
                </ModernCard>
              ))}
           </div>
        </section>
      )}

      {/* 4. RECENT SESSIONS & TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-presently-black">Recent History</h2>
              <button className="text-sm font-bold text-sungold hover:underline">View All</button>
           </div>
           <div className="space-y-4">
              {sessions.filter((s: any) => !s.is_active).slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center gap-6 p-4 rounded-2xl border border-outline hover:bg-slate-50 transition-all cursor-pointer" onClick={() => navigate(`/dashboard/sessions/${session.id}`)}>
                   <div className="w-12 h-12 rounded-xl bg-warm-ivory flex items-center justify-center border border-outline">
                      <CourseIcon title={session.course_name} code={session.course_code} className="w-8 h-8" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-presently-black truncate">{session.course_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                         <span className="font-bold">{session.course_code}</span>
                         <span>•</span>
                         <span>{new Date(session.start_time).toLocaleDateString()}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="font-display text-xl font-bold text-presently-black">{session.attendee_count}</div>
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Students</div>
                   </div>
                   <ChevronRight size={20} className="text-slate-300" />
                </div>
              ))}
           </div>
        </section>

        <section className="space-y-6">
           <h2 className="font-display text-2xl font-bold text-presently-black">Power Tools</h2>
           <div className="space-y-4">
              <ModernCard padding="md" className="group cursor-pointer hover:border-sungold/30 transition-all" onClick={() => navigate('/dashboard/reports')}>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-teal/10 flex items-center justify-center text-sky-teal">
                       <FileText size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-presently-black">Export Reports</h4>
                       <p className="text-xs text-on-surface-variant">Generate PDF/CSV logs</p>
                    </div>
                 </div>
              </ModernCard>
              <ModernCard padding="md" className="group cursor-pointer hover:border-sungold/30 transition-all" onClick={() => navigate('/dashboard/analytics')}>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-moss-green/10 flex items-center justify-center text-moss-green">
                       <BarChart3 size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-presently-black">View Analytics</h4>
                       <p className="text-xs text-on-surface-variant">Class engagement trends</p>
                    </div>
                 </div>
              </ModernCard>
           </div>
        </section>
      </div>
    </div>
  );
};

export { LecturerDashboard };
