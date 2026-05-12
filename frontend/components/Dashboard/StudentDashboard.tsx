import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, BookOpen, Trophy,
  ChevronRight, Calendar, MapPin,
  User, Clock, CheckCircle2, QrCode
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
import { Badge } from '../../src/components/ui/badge';
import { useTheme } from '../ThemeProvider';
import { SkeletonStudentDashboard } from '../Skeleton';

interface StudentDashboardProps {
  userName: string;
  view?: 'default' | 'analytics' | 'timetable';
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => studentApi.getDashboardData(),
    refetchInterval: 30000
  });

  const { data: statsData } = useQuery({
    queryKey: ['attendanceStats'],
    queryFn: () => attendanceApi.getAttendanceStats(),
  });

  const activeClass = useMemo(() => {
    if (!dashboardData?.upcoming_sessions?.length) return null;
    const now = new Date();
    return dashboardData.upcoming_sessions.find((s: any) => {
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
    return <SkeletonStudentDashboard />;
  }

  const shellClasses = cn(
    'space-y-10 max-w-5xl mx-auto pb-20 rounded-[2.5rem] border border-outline/60 p-4 md:p-0',
    resolvedTheme === 'dark' ? 'bg-surface/50' : 'bg-transparent'
  );

  const heroGradient = resolvedTheme === 'dark'
    ? 'from-surface via-surfaceHigh to-background'
    : 'from-background via-surface to-surfaceHigh';

  return (
    <div className={shellClasses}>
      {/* 1. WELCOME HEADER */}
      <header className={cn('flex flex-col gap-4 rounded-[2rem] border border-outline bg-gradient-to-br px-6 py-7 md:px-8 md:py-10 shadow-sm', heroGradient)}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-textMuted">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Student dashboard
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface">
          Hello, {userName.split(' ')[0]}
        </h1>
        <p className="max-w-2xl text-on-surface-variant font-medium text-lg">
          You're all caught up for today. Check live attendance, review your schedule, and jump into scanner mode when class starts.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Badge variant="secondary" className="px-3 py-1.5">Theme {resolvedTheme}</Badge>
          <Badge variant="outline" className="px-3 py-1.5">{dashboardData?.enrolled_courses?.length || 0} active courses</Badge>
        </div>
      </header>

      {/* 2. LIVE ATTENDANCE CARD */}
      <section>
        {activeClass ? (
          <ModernCard variant="gold-accent" padding="none" className="overflow-hidden relative group bg-surface">
            <div className="absolute top-6 right-6">
               <Badge variant="present" className="px-3 py-1.5 gap-2">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss-green opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-moss-green"></span>
                 </span>
                 Live Now
               </Badge>
            </div>
            
            <div className="p-8 md:p-10 space-y-8">
              <div className="space-y-3">
                <div className="text-primary font-bold text-sm uppercase tracking-widest">
                  {activeClass.course_code}
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface leading-tight">
                  {activeClass.course_name}
                </h2>
                <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    <span>Ends in 45 mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <span>Room 302, Block B</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setIsScannerOpen(true)}
                  className="h-16 px-10 text-lg shadow-gold"
                >
                  <QrCode size={24} className="mr-2" />
                  Mark Attendance
                </Button>
                <Button variant="outline" className="h-16 px-10 text-lg">
                  View Details
                </Button>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: '40%' }}
                 className="h-full bg-primary"
               />
            </div>
          </ModernCard>
        ) : (
          <ModernCard padding="lg" className="flex flex-col items-center text-center gap-6 py-16 border-dashed border-2 bg-surface">
            <div className="w-24 h-24 rounded-full bg-surfaceHigh flex items-center justify-center text-on-surface-variant">
              <CheckCircle2 size={48} className="text-success/60" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-on-surface">No active classes</h3>
              <p className="text-on-surface-variant max-w-sm mx-auto font-medium">
                Your schedule is clear. Next class: <span className="text-on-surface font-bold">Introduction to AI</span> at 2:00 PM
              </p>
            </div>
            <Button variant="secondary" size="lg" onClick={() => setIsScannerOpen(true)}>
              <QrCode size={20} className="mr-2" />
              Quick Scan
            </Button>
          </ModernCard>
        )}
      </section>

      {/* 3. QUICK STATS GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Attendance', value: `${dashboardData?.attendance_stats?.average_attendance || 0}%`, icon: Activity, variant: 'present' as const },
          { label: 'Streak', value: '12 Days', icon: Trophy, variant: 'default' as const },
          { label: 'Courses', value: dashboardData?.enrolled_courses?.length || 0, icon: BookOpen, variant: 'excused' as const },
          { label: 'Level', value: 'LVL 4', icon: User, variant: 'secondary' as const },
        ].map((stat, i) => (
          <ModernCard key={i} padding="md" className="flex flex-col justify-between min-h-[160px] hover:shadow-lg transition-all group bg-surface">
            <div className="flex justify-between items-start">
               <div className="w-12 h-12 rounded-xl bg-surfaceHigh flex items-center justify-center text-on-surface border border-outline group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                 <stat.icon size={24} />
               </div>
               <Badge variant={stat.variant}>Active</Badge>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-on-surface leading-none mb-2">{stat.value}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </ModernCard>
        ))}
      </section>

      {/* 4. RECENT ACTIVITY */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Recent Activity</h4>
          <button className="text-sm font-bold text-sungold hover:underline">
            View All History
          </button>
        </div>

        <div className="space-y-4">
          {dashboardData?.recent_activity?.length ? (
            dashboardData.recent_activity.slice(0, 3).map((activity: any, idx: number) => (
              <ModernCard key={activity.id} padding="sm" className="flex items-center gap-6 hover:border-primary/30 transition-all cursor-pointer group bg-surface">
                <div className="w-14 h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center overflow-hidden border border-outline group-hover:border-primary/20">
                   <CourseIcon
                    title={activity.course_name}
                    code={activity.course_code}
                    className="w-10 h-10"
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="font-display text-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {activity.course_code}: {activity.course_name}
                    </h5>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant={activity.status === 'PRESENT' ? 'present' : 'absent'}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-on-surface-variant font-medium truncate uppercase tracking-widest">
                      {activity.lecturer_name}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surfaceHigh flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary-fixed transition-all">
                  <ChevronRight size={20} />
                </div>
              </ModernCard>
            ))
          ) : (
            <div className="text-center py-12 text-on-surface-variant bg-surfaceHigh rounded-3xl border border-dashed border-outline">
              <p className="font-medium">No activity recorded yet.</p>
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
