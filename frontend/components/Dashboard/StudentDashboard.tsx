import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, BookOpen, Trophy,
  ChevronRight, Calendar, MapPin,
  User, Clock, CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../services/api/attendance';
import { attendanceApi } from '../../services/api/attendance';
import { EnhancedAttendanceScanner } from '../Attendance/EnhancedAttendanceScanner';
import CourseRegistrationDialog from '../Student/CourseRegistrationDialog';
import { ModernCard } from '../ModernCard';
import { Button } from '../Button';
import CourseIcon from '../Course/CourseIcon';
import { cn } from '../../src/components/ui/utils';

interface StudentDashboardProps {
  userName: string;
  view?: 'default' | 'analytics' | 'timetable';
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => studentApi.getDashboardData(),
    refetchInterval: 30000 // Refetch every 30s for "real-time" feel
  });

  const { data: statsData } = useQuery({
    queryKey: ['attendanceStats'],
    queryFn: () => attendanceApi.getAttendanceStats(),
  });

  const activeClass = useMemo(() => {
    // Logic to find if there's a class happening right now
    if (!dashboardData?.upcoming_sessions?.length) return null;
    const now = new Date();
    return dashboardData.upcoming_sessions.find(s => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return now >= start && now <= end;
    });
  }, [dashboardData]);

  const handleAttendanceCheckIn = async (data: any) => {
    // Actual check-in logic would go here
    setIsScannerOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-surfaceContainer rounded-lg" />
        <div className="h-64 w-full bg-surfaceContainer rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surfaceContainer rounded-md" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* 1. WELCOME HEADER */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-text">
          Hello, {userName.split(' ')[0]}
        </h1>
        <p className="text-textMuted font-medium">You're all caught up for today.</p>
      </header>

      {/* 2. LIVE ATTENDANCE CARD (Flighty/Monzo style) */}
      <section>
        {activeClass ? (
          <ModernCard variant="accent" padding="none" className="overflow-hidden border-primary/30 relative">
            <div className="absolute top-0 right-0 p-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
                 </span>
                 Live Now
               </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                  {activeClass.course_code}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-text tracking-tight">
                  {activeClass.course_name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-textMuted font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>Ends in 45 mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    <span>Room 302, Block B</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-primary text-primary-foreground h-[60px] px-8 text-lg"
                >
                  <QrCode size={24} />
                  Mark Attendance
                </Button>
                <Button variant="outline" className="h-[60px] px-8">
                  View Details
                </Button>
              </div>
            </div>

            {/* Visual Progress Bar for the live session */}
            <div className="h-1.5 w-full bg-primary/10">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: '40%' }}
                 className="h-full bg-primary"
               />
            </div>
          </ModernCard>
        ) : (
          <ModernCard padding="lg" className="flex flex-col items-center text-center gap-4 py-12">
            <div className="w-20 h-20 rounded-full bg-surfaceContainer flex items-center justify-center text-textMuted">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No active classes</h3>
              <p className="text-textMuted max-w-xs mx-auto">
                Next class: <strong>Introduction to AI</strong> at 2:00 PM
              </p>
            </div>
            <Button variant="secondary" onClick={() => setIsScannerOpen(true)}>
              <QrCode size={20} />
              Quick Scan
            </Button>
          </ModernCard>
        )}
      </section>

      {/* 3. QUICK STATS GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${dashboardData?.attendance_stats?.average_attendance || 0}%`, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Streak', value: '12 Days', icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Courses', value: dashboardData?.enrolled_courses?.length || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Level', value: 'LVL 4', icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <ModernCard key={i} padding="md" className="flex flex-col justify-between min-h-[140px] touch-scale">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{stat.label}</p>
            </div>
          </ModernCard>
        ))}
      </section>

      {/* 4. RECENT ACTIVITY (Beats) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-black uppercase tracking-widest">Recent Activity</h4>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {dashboardData?.recent_activity?.length ? (
            dashboardData.recent_activity.slice(0, 3).map((activity, idx) => (
              <ModernCard key={activity.id} padding="sm" className="flex items-center gap-4 hover:border-primary/20 transition-colors cursor-pointer group">
                <CourseIcon
                  title={activity.course_name}
                  code={activity.course_code}
                  className="w-12 h-12"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                      {activity.course_code}: {activity.course_name}
                    </h5>
                    <span className="text-[10px] font-bold text-textMuted uppercase">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      activity.status === 'PRESENT' ? 'text-success border-success/20 bg-success/5' : 'text-error border-error/20 bg-error/5'
                    )}>
                      {activity.status}
                    </span>
                    <span className="text-[10px] text-textMuted font-medium truncate uppercase">
                      {activity.lecturer_name}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-textMuted group-hover:text-text transition-colors" />
              </ModernCard>
            ))
          ) : (
            <div className="text-center py-8 text-textMuted">
              <p className="text-sm">No activity recorded yet.</p>
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
        onSuccess={refetch}
      />
    </div>
  );
};

export { StudentDashboard };
