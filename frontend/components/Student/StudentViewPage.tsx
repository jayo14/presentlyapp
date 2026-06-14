import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, 
  BookOpen, MapPin, User, Filter, ChevronRight, FileText
} from 'lucide-react';
import { SkeletonStudentDashboard } from '../Skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { DashboardPage } from '../layout-primitives/DashboardPage';
import { DashboardCard } from '../layout-primitives/DashboardCard';
import { ResponsiveGrid } from '../layout-primitives/ResponsiveGrid';
import { cn } from '@/lib/utils';

interface Course {
  id: number;
  code: string;
  name: string;
  lecturer: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
}

interface UpcomingSession {
  id: number;
  courseCode: string;
  courseName: string;
  venue: string;
  time: string;
  date: string;
  lecturer: string;
}

interface AttendanceRecord {
  id: number;
  courseCode: string;
  date: string;
  time: string;
  venue: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export const StudentViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'upcoming' | 'history'>('courses');
  const [filterStatus, setFilterStatus] = useState<'all' | 'excellent' | 'good' | 'warning' | 'danger'>('all');

  // Mock data - replace with actual API calls
  const courses: Course[] = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Programming',
      lecturer: 'Dr. Smith',
      totalSessions: 24,
      attendedSessions: 23,
      attendancePercentage: 96,
      status: 'excellent'
    },
    {
      id: 2,
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      lecturer: 'Prof. Johnson',
      totalSessions: 20,
      attendedSessions: 17,
      attendancePercentage: 85,
      status: 'good'
    },
    {
      id: 3,
      code: 'CS301',
      name: 'Database Management Systems',
      lecturer: 'Dr. Williams',
      totalSessions: 18,
      attendedSessions: 12,
      attendancePercentage: 67,
      status: 'warning'
    },
    {
      id: 4,
      code: 'CS401',
      name: 'Software Engineering',
      lecturer: 'Dr. Brown',
      totalSessions: 16,
      attendedSessions: 8,
      attendancePercentage: 50,
      status: 'danger'
    },
  ];

  const upcomingSessions: UpcomingSession[] = [
    {
      id: 1,
      courseCode: 'CS101',
      courseName: 'Introduction to Programming',
      venue: 'Room 204, Engineering Block',
      time: '10:00 AM',
      date: 'Today',
      lecturer: 'Dr. Smith'
    },
    {
      id: 2,
      courseCode: 'CS201',
      courseName: 'Data Structures & Algorithms',
      venue: 'Room 305, Science Block',
      time: '2:00 PM',
      date: 'Tomorrow',
      lecturer: 'Prof. Johnson'
    },
  ];

  const attendanceHistory: AttendanceRecord[] = [
    {
      id: 1,
      courseCode: 'CS101',
      date: '2024-02-08',
      time: '10:00 AM',
      venue: 'Room 204',
      status: 'present'
    },
    {
      id: 2,
      courseCode: 'CS201',
      date: '2024-02-07',
      time: '2:00 PM',
      venue: 'Room 305',
      status: 'present'
    },
    {
      id: 3,
      courseCode: 'CS301',
      date: '2024-02-06',
      time: '11:00 AM',
      venue: 'Room 210',
      status: 'absent',
      notes: 'Medical emergency'
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-500/10 border-green-500/30';
      case 'good': return 'text-blue-600 bg-blue-500/10 border-blue-500/30';
      case 'warning': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
      case 'danger': return 'text-red-600 bg-red-500/10 border-red-500/30';
      case 'present': return 'text-green-600 bg-green-500/10';
      case 'absent': return 'text-red-600 bg-red-500/10';
      case 'late': return 'text-yellow-600 bg-yellow-500/10';
      case 'excused': return 'text-blue-600 bg-blue-500/10';
      default: return 'text-textMuted bg-surface';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} className="text-green-600" />;
      case 'absent': return <XCircle size={16} className="text-red-600" />;
      case 'late': return <Clock size={16} className="text-yellow-600" />;
      case 'excused': return <FileText size={16} className="text-blue-600" />;
      default: return <AlertCircle size={16} className="text-textMuted" />;
    }
  };

  const filteredCourses = filterStatus === 'all' 
    ? courses 
    : courses.filter(course => course.status === filterStatus);

  const overallAttendance = Math.round(
    courses.reduce((sum, course) => sum + course.attendancePercentage, 0) / courses.length
  );

  if (loading) {
    return <SkeletonStudentDashboard />;
  }

  return (
    <DashboardPage
      title="My Attendance"
      description="Track your attendance across all courses"
      className="max-w-4xl mx-auto"
    >
      {/* Overall Stats */}
      <ResponsiveGrid cols={4} gap={24}>
        <DashboardCard className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Overall</span>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-black text-text tracking-tight">{overallAttendance}%</span>
          </div>
          <div className="h-1.5 bg-surfaceLow rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${overallAttendance}%` }}
            />
          </div>
        </DashboardCard>

        <DashboardCard className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Courses</span>
            <BookOpen size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-black text-text tracking-tight">{courses.length}</span>
          <p className="text-[10px] font-bold text-textMuted uppercase mt-1">Active</p>
        </DashboardCard>

        <DashboardCard className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Present</span>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <span className="text-2xl font-black text-text tracking-tight">
            {courses.reduce((sum, c) => sum + c.attendedSessions, 0)}
          </span>
          <p className="text-[10px] font-bold text-textMuted uppercase mt-1">Total</p>
        </DashboardCard>

        <DashboardCard className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Absent</span>
            <XCircle size={18} className="text-red-500" />
          </div>
          <span className="text-2xl font-black text-text tracking-tight">
            {courses.reduce((sum, c) => sum + (c.totalSessions - c.attendedSessions), 0)}
          </span>
          <p className="text-[10px] font-bold text-textMuted uppercase mt-1">Missed</p>
        </DashboardCard>
      </ResponsiveGrid>

      {/* Tabs */}
      <div className="flex gap-2 mt-8 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'upcoming', label: 'Upcoming', icon: Calendar },
          { id: 'history', label: 'History', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[13px] whitespace-nowrap transition-all duration-200 border ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                : 'bg-surface text-textMuted border-outline/5 hover:bg-surface-highest/40 hover:text-text'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-3 px-1">
              <Filter size={14} className="text-textMuted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-primary focus:outline-none cursor-pointer"
              >
                <option value="all">All Courses</option>
                <option value="excellent">Excellent (&gt;90%)</option>
                <option value="good">Good (75-90%)</option>
                <option value="warning">Warning (60-75%)</option>
                <option value="danger">Danger (&lt;60%)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map(course => (
                <DashboardCard
                  key={course.id}
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                  className="group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-primary font-black text-[10px] uppercase tracking-widest">{course.code}</span>
                        </div>
                        <h3 className="font-headline text-text font-black text-xl tracking-tighter leading-tight group-hover:text-primary transition-colors">
                          {course.name}
                        </h3>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest border",
                        getStatusColor(course.status)
                      )}>
                        {course.attendancePercentage}%
                      </div>
                    </div>

                    <p className="text-textMuted text-xs font-medium flex items-center gap-2 mb-6 uppercase tracking-wider">
                      <User size={14} />
                      {course.lecturer}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-textMuted">
                      <span>{course.attendedSessions} / {course.totalSessions} sessions</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle size={14} />
                          {course.attendedSessions}
                        </span>
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle size={14} />
                          {course.totalSessions - course.attendedSessions}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 bg-surfaceLow rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          course.status === 'excellent' ? 'bg-green-500' :
                          course.status === 'good' ? 'bg-blue-500' :
                          course.status === 'warning' ? 'bg-amber-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${course.attendancePercentage}%` }}
                      />
                    </div>

                    {course.attendancePercentage < 75 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/courses/${course.id}/justify`);
                        }}
                        variant="secondary"
                        size="sm"
                        className="w-full h-11 rounded-xl text-[11px] font-black uppercase tracking-widest mt-2"
                      >
                        <FileText size={14} className="mr-2" />
                        Justify Absence
                      </Button>
                    )}
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map(session => (
              <DashboardCard key={session.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-primary font-black text-[10px] uppercase tracking-widest">{session.courseCode}</span>
                    <h3 className="font-headline text-text font-black text-xl tracking-tighter leading-tight mt-1">
                      {session.courseName}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-primary/10 text-primary border border-primary/20 uppercase">
                    {session.date}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-outline/5">
                  <div className="flex items-center gap-3 text-xs font-medium text-textMuted uppercase tracking-wider">
                    <Clock size={16} className="text-primary" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-textMuted uppercase tracking-wider">
                    <MapPin size={16} className="text-primary" />
                    <span className="truncate">{session.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-textMuted uppercase tracking-wider">
                    <User size={16} className="text-primary" />
                    <span>{session.lecturer}</span>
                  </div>
                </div>
              </DashboardCard>
            ))}

            {upcomingSessions.length === 0 && (
              <div className="col-span-full text-center py-24 bg-surface rounded-[2.5rem] border border-outline/10 border-dashed">
                <Calendar size={48} className="mx-auto text-textMuted opacity-20 mb-6" />
                <h3 className="font-headline text-lg font-black text-text tracking-tight uppercase mb-2">No upcoming sessions</h3>
                <p className="text-xs font-medium text-textMuted uppercase tracking-widest">Check back later for scheduled classes</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {attendanceHistory.map(record => (
              <DashboardCard key={record.id} noPadding className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border",
                      getStatusColor(record.status)
                    )}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <span className="text-primary font-black text-[10px] uppercase tracking-widest">{record.courseCode}</span>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-textMuted uppercase tracking-wider mt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-primary" />
                          {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" />
                          {record.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                    getStatusColor(record.status)
                  )}>
                    {record.status}
                  </span>
                </div>

                {record.notes && (
                  <div className="mt-4 p-4 bg-surfaceLow rounded-2xl border border-outline/5">
                    <p className="text-[11px] font-medium text-textMuted flex items-start gap-3">
                      <FileText size={14} className="mt-0.5 text-primary shrink-0" />
                      <span>{record.notes}</span>
                    </p>
                  </div>
                )}
              </DashboardCard>
            ))}
          </div>
        )}
      </div>
    </DashboardPage>
  );
};
