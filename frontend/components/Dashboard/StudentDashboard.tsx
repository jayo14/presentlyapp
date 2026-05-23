import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Clock, Plus,
  Calendar, FileText, CaretRight,
  ChartLineUp, ChartBar, Pulse, Trophy, User, QrCode, MapPin, CheckCircle
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../services/api/student';
import { DashboardCard } from './DashboardCard';
import { PageContainer } from './PageContainer';
import { Button } from '../Button';
import CourseIcon from '../Course/CourseIcon';
import { cn } from '../../src/components/ui/utils';
import { Badge } from '../../src/components/ui/badge';
import { EnhancedAttendanceScanner } from '../Attendance/EnhancedAttendanceScanner';
import { CourseRegistrationDialog } from '../Student/CourseRegistrationDialog';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => studentApi.getStudentDashboard(),
  });

  const activeClass = useMemo(() => {
    if (!dashboardData?.active_sessions) return null;
    const now = new Date();
    return dashboardData.active_sessions.find((s: any) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return now >= start && now <= end;
    });
  }, [dashboardData]);

  const handleAttendanceCheckIn = async (data: any) => {
    setIsScannerOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-8 animate-pulse">
          <div className="h-48 bg-surface-highest rounded-[2rem]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface-highest rounded-2xl" />)}
          </div>
          <div className="h-64 bg-surface-highest rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 1. WELCOME HEADER */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-outline/50 bg-gradient-to-br from-sungold/20 via-surface to-surface p-[40px] md:p-[64px]">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-sungold">
            <span className="h-2 w-2 rounded-full bg-sungold animate-pulse" />
            Student Portal
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Hello, {userName.split(' ')[0]}
          </h2>
          <p className="max-w-xl text-on-surface-variant font-medium text-lg leading-relaxed">
            You're all caught up for today. Join live classes or review your progress below.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={() => setIsScannerOpen(true)}
              className="h-14 px-8 bg-on-surface text-background rounded-2xl font-bold shadow-lg flex items-center gap-2 group"
            >
              <QrCode size={20} weight="bold" className="group-hover:rotate-12 transition-transform" />
              Quick Scan
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRegistrationOpen(true)}
              className="h-14 px-8 border-outline/50 bg-surface/50 backdrop-blur-sm rounded-2xl font-bold"
            >
              Add Course
            </Button>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sungold/10 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-teal/5 blur-[80px] -ml-24 -mb-24" />
      </section>

      {/* 2. LIVE ATTENDANCE OR EMPTY STATE */}
      <section>
        {activeClass ? (
          <DashboardCard className="overflow-hidden relative group border-l-4 border-l-sungold" padding="none">
            <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                   <Badge variant="present" className="px-3 py-1 gap-2 bg-sungold/10 text-sungold border-sungold/20 font-bold uppercase tracking-widest text-[10px]">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sungold opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-sungold"></span>
                     </span>
                     Live Now
                   </Badge>
                   <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                     {activeClass.course_code}
                   </span>
                </div>
                <h3 className="text-3xl font-bold text-on-surface tracking-tight leading-tight">
                  {activeClass.course_name}
                </h3>
                <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-bold text-xs uppercase tracking-widest opacity-80">
                  <div className="flex items-center gap-2">
                    <Clock size={16} weight="bold" className="text-sungold" />
                    <span>Ends in 45m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} weight="bold" className="text-sungold" />
                    <span>Hall B, Room 204</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsScannerOpen(true)}
                className="h-16 px-10 text-lg bg-sungold text-presently-black rounded-2xl font-bold shadow-gold group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <QrCode size={24} weight="bold" />
                  Check In
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </div>

            <div className="h-1.5 w-full bg-surface-highest">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: '65%' }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-sungold shadow-[0_0_10px_rgba(245,197,24,0.5)]"
               />
            </div>
          </DashboardCard>
        ) : (
          <DashboardCard padding="lg" className="flex flex-col items-center text-center gap-6 py-16 border-dashed border-2 bg-surface-highest/20 hover:bg-surface-highest/40 transition-colors">
            <div className="w-20 h-20 rounded-full bg-surface-highest flex items-center justify-center text-on-surface-variant">
              <CheckCircle size={40} weight="bold" className="text-moss-green opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-on-surface tracking-tight">Schedule is clear</h3>
              <p className="text-on-surface-variant max-w-sm mx-auto font-medium text-sm">
                No active classes right now. Enjoy your break or review your upcoming schedule.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-outline/50 h-11 px-6 font-bold text-xs uppercase tracking-[0.2em]"
              onClick={() => navigate('/dashboard/timetable')}
            >
              View Timetable
            </Button>
          </DashboardCard>
        )}
      </section>

      {/* 3. QUICK STATS GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-[24px] md:gap-[32px]">
        {[
          { label: 'Attendance', value: `${dashboardData?.attendance_stats?.average_attendance || 0}%`, icon: Pulse, color: 'text-sungold', bg: 'bg-sungold/10' },
          { label: 'Streak', value: '12 Days', icon: Trophy, color: 'text-moss-green', bg: 'bg-moss-green/10' },
          { label: 'Courses', value: dashboardData?.enrolled_courses?.length || 0, icon: BookOpen, color: 'text-sky-teal', bg: 'bg-sky-teal/10' },
          { label: 'Ranking', value: '#12', icon: ChartBar, color: 'text-sungold', bg: 'bg-sungold/10' },
        ].map((stat, i) => (
          <DashboardCard key={i} className="group relative overflow-hidden">
            <div className="flex justify-between items-start">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                 <stat.icon size={22} weight="bold" />
               </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-on-surface tracking-tight leading-none mb-1">{stat.value}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
            </div>
          </DashboardCard>
        ))}
      </section>

      {/* 4. RECENT ACTIVITY */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Recent Activity</h3>
          <button className="text-xs font-bold text-sungold hover:opacity-80 uppercase tracking-widest">
            History
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData?.recent_activity?.length ? (
            dashboardData.recent_activity.slice(0, 4).map((activity: any, idx: number) => (
              <div key={activity.id} className="flex items-center gap-5 p-4 rounded-2xl border border-outline/50 bg-surface-highest/20 hover:bg-surface-highest/50 transition-all cursor-pointer group" onClick={() => navigate(`/dashboard/courses/${activity.course_id}`)}>
                <div className="w-12 h-12 rounded-xl bg-surface-highest flex items-center justify-center overflow-hidden border border-outline/50 group-hover:scale-105 transition-transform">
                   <CourseIcon
                    title={activity.course_name}
                    code={activity.course_code}
                    className="w-8 h-8"
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-on-surface truncate text-sm group-hover:text-sungold transition-colors">
                      {activity.course_name}
                    </h5>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                      {new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 font-bold text-[10px] uppercase tracking-wider">
                    <Badge variant={activity.status === 'PRESENT' ? 'present' : 'absent'} className="text-[8px] py-0 px-2">
                      {activity.status}
                    </Badge>
                    <span className="text-on-surface-variant opacity-60 truncate">
                      {activity.course_code}
                    </span>
                  </div>
                </div>
                <CaretRight size={18} weight="bold" className="text-outline-variant group-hover:translate-x-1 transition-transform" />
              </div>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-12 bg-surface-highest/10 rounded-3xl border border-dashed border-outline/50">
              <p className="font-bold text-sm text-on-surface-variant uppercase tracking-widest opacity-40">No recent activity</p>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <EnhancedAttendanceScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerify={handleAttendanceCheckIn}
      />
      <CourseRegistrationDialog
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={() => refetch()}
      />
    </PageContainer>
  );
};

export { StudentDashboard };
