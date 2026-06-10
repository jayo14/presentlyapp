import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  WarningCircle,
  TrendingUp,
  BookOpen,
  MapPin,
  User,
  Funnel,
  CaretRight,
  CircleNotch,
  FileText,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { SkeletonStudentDashboard } from '../Skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { DashboardPage } from '../layout-primitives/DashboardPage';
import { DashboardCard } from '../layout-primitives/DashboardCard';
import { ResponsiveGrid } from '../layout-primitives/ResponsiveGrid';

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
    setTimeout(() => setLoading(false), 1000);
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
      case 'present': return <CheckCircle size={16} weight="bold" className="text-green-600" />;
      case 'absent': return <XCircle size={16} weight="bold" className="text-red-600" />;
      case 'late': return <Clock size={16} weight="bold" className="text-yellow-600" />;
      case 'excused': return <FileText size={16} weight="bold" className="text-blue-600" />;
      default: return <WarningCircle size={16} weight="bold" className="text-textMuted" />;
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
      className="pb-24"
    >
      <div className="space-y-8">
        {/* Overall Stats */}
        <ResponsiveGrid cols={4}>
          <DashboardCard padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-[10px] font-black uppercase tracking-widest">Overall</span>
              <TrendingUp size={20} weight="bold" className="text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-text tracking-tight">{overallAttendance}%</span>
            </div>
            <div className="mt-3 h-1.5 bg-outline/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${overallAttendance}%` }}
              />
            </div>
          </DashboardCard>

          <DashboardCard padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-[10px] font-black uppercase tracking-widest">Courses</span>
              <BookOpen size={20} weight="bold" className="text-primary" />
            </div>
            <span className="text-3xl font-black text-text tracking-tight">{courses.length}</span>
            <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mt-1">Active</p>
          </DashboardCard>

          <DashboardCard padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-[10px] font-black uppercase tracking-widest">Present</span>
              <CheckCircle size={20} weight="bold" className="text-green-600" />
            </div>
            <span className="text-3xl font-black text-green-600 tracking-tight">
              {courses.reduce((sum, c) => sum + c.attendedSessions, 0)}
            </span>
            <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mt-1">Sessions</p>
          </DashboardCard>

          <DashboardCard padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-[10px] font-black uppercase tracking-widest">Absent</span>
              <XCircle size={20} weight="bold" className="text-red-600" />
            </div>
            <span className="text-3xl font-black text-red-600 tracking-tight">
              {courses.reduce((sum, c) => sum + (c.totalSessions - c.attendedSessions), 0)}
            </span>
            <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest mt-1">Missed</p>
          </DashboardCard>
        </ResponsiveGrid>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-surface-low border border-outline/5 rounded-2xl w-fit">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'history', label: 'History', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              <tab.icon size={16} weight={activeTab === tab.id ? "bold" : "regular"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course List */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-2 px-1">
              <Funnel size={16} weight="bold" className="text-textMuted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-primary focus:ring-0 cursor-pointer"
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
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ y: 2, scale: 0.99 }}
                  className="group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-black text-[10px] uppercase tracking-widest">{course.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusColor(course.status)}`}>
                          {course.attendancePercentage}%
                        </span>
                      </div>
                      <h3 className="font-headline text-text font-black text-xl tracking-tighter leading-tight mb-1 group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-textMuted text-xs font-medium flex items-center gap-1.5 uppercase tracking-wide">
                        <User size={14} weight="bold" />
                        {course.lecturer}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-surface-highest/40 flex items-center justify-center text-textMuted group-hover:text-primary group-hover:bg-primary/10 transition-all">
                      <CaretRight size={20} weight="bold" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="text-textMuted">
                      {course.attendedSessions} / {course.totalSessions} sessions
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} weight="bold" />
                        {course.attendedSessions}
                      </span>
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle size={14} weight="bold" />
                        {course.totalSessions - course.attendedSessions}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-outline/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        course.status === 'excellent' ? 'bg-green-600' :
                        course.status === 'good' ? 'bg-blue-600' :
                        course.status === 'warning' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${course.attendancePercentage}%` }}
                    />
                  </div>

                  {/* Submit justification if below threshold */}
                  {course.attendancePercentage < 75 && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/courses/${course.id}/justify`);
                      }}
                      variant="secondary"
                      size="sm"
                      className="mt-4 w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <FileText size={16} weight="bold" className="mr-2" />
                      Justify Absence
                    </Button>
                  )}
                </DashboardCard>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map(session => (
              <DashboardCard
                key={session.id}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-primary font-black text-[10px] uppercase tracking-widest">{session.courseCode}</span>
                    <h3 className="font-headline text-text font-black text-xl tracking-tighter leading-tight mt-1">
                      {session.courseName}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
                    {session.date}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-textMuted">
                    <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
                      <Clock size={16} weight="bold" />
                    </div>
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-textMuted">
                    <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
                      <MapPin size={16} weight="bold" />
                    </div>
                    <span className="truncate">{session.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-textMuted">
                    <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
                      <User size={16} weight="bold" />
                    </div>
                    <span>{session.lecturer}</span>
                  </div>
                </div>
              </DashboardCard>
            ))}

            {upcomingSessions.length === 0 && (
              <div className="col-span-full py-16 text-center bg-surface-low rounded-[2.5rem] border border-outline/5">
                <Calendar size={48} weight="bold" className="mx-auto text-textMuted mb-4 opacity-20" />
                <h3 className="font-headline text-lg font-black text-text tracking-tight mb-2">No upcoming sessions</h3>
                <p className="text-textMuted text-xs font-bold uppercase tracking-widest">Check back later for scheduled classes</p>
              </div>
            )}
          </div>
        )}

        {/* Attendance History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {attendanceHistory.map(record => (
              <DashboardCard key={record.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <span className="text-primary font-black text-[10px] uppercase tracking-widest">{record.courseCode}</span>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} weight="bold" />
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} weight="bold" />
                          {record.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                {record.notes && (
                  <div className="mt-4 p-4 bg-surface-low rounded-2xl border border-outline/5">
                    <p className="text-xs font-medium text-textMuted flex items-start gap-3">
                      <FileText size={16} weight="bold" className="mt-0.5 text-primary" />
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
