import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Clock, Plus,
  Calendar, FileText, ChevronRight,
  TrendingUp, BarChart3, MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, lecturerApi } from '../../services/api/attendance';
import { ModernCard } from '../ModernCard';
import { Button } from '../Button';
import CourseIcon from '../Course/CourseIcon';
import { cn } from '../../src/components/ui/utils';

interface LecturerDashboardProps {
  userName: string;
  userProfile?: any;
  view?: 'default' | 'analytics' | 'reports' | 'courses' | 'timetable';
}

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ userName }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<any>(null);

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
        <div className="h-8 w-48 bg-surfaceContainer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-surfaceContainer rounded-md" />)}
        </div>
        <div className="h-64 bg-surfaceContainer rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-text">
            Welcome, Professor
          </h1>
          <p className="text-textMuted font-medium">Manage your courses and attendance.</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/sessions/new')}
          className="h-[54px] px-6"
        >
          <Plus size={20} />
          New Session
        </Button>
      </header>

      {/* STATS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Courses', value: dashboardData?.total_courses || 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Students', value: dashboardData?.total_students || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Today\'s Sessions', value: dashboardData?.active_sessions || 0, icon: Clock, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <ModernCard key={i} className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{stat.label}</p>
            </div>
          </ModernCard>
        ))}
      </section>

      {/* RECENT SESSIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-widest">Active & Recent Sessions</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/sessions')} className="text-primary">
            View History
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.length > 0 ? (
            sessions.slice(0, 4).map((session: any) => (
              <ModernCard
                key={session.id}
                className="group hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/dashboard/sessions?id=${session.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <CourseIcon title={session.course_name} code={session.course_code} className="w-10 h-10 rounded-xl" />
                    <div>
                      <h4 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                        {session.course_code}
                      </h4>
                      <p className="text-xs text-textMuted font-medium truncate max-w-[150px]">
                        {session.course_name}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    session.is_active
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-surfaceContainer text-textMuted border-outline"
                  )}>
                    {session.is_active ? 'Live' : 'Ended'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-textMuted uppercase">
                      <Users size={14} />
                      <span>{session.attendee_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-textMuted uppercase">
                      <Calendar size={14} />
                      <span>{new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </ModernCard>
            ))
          ) : (
            <ModernCard className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surfaceContainer flex items-center justify-center text-textMuted">
                <Calendar size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-bold">No sessions found</p>
                <p className="text-sm text-textMuted max-w-xs">Start a new session to begin taking attendance.</p>
              </div>
              <Button onClick={() => navigate('/dashboard/sessions/new')}>
                Create First Session
              </Button>
            </ModernCard>
          )}
        </div>
      </section>

      {/* QUICK ACTIONS / TOOLS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModernCard variant="outline" className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h4 className="font-bold">Attendance Analytics</h4>
          </div>
          <p className="text-sm text-textMuted">
            Get deep insights into student participation and course performance.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/dashboard/analytics')}>
            Open Analytics
          </Button>
        </ModernCard>

        <ModernCard variant="outline" className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h4 className="font-bold">Generate Reports</h4>
          </div>
          <p className="text-sm text-textMuted">
            Export attendance data for your courses in CSV or PDF format.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/dashboard/reports')}>
            View Reports
          </Button>
        </ModernCard>
      </section>
    </div>
  );
};

export { LecturerDashboard };
