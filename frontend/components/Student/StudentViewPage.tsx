import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, 
  BookOpen, MapPin, User, Filter, ChevronRight, Loader, FileText,
  Award, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';

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
      default: return 'text-text-secondary bg-surface';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} className="text-green-600" />;
      case 'absent': return <XCircle size={16} className="text-red-600" />;
      case 'late': return <Clock size={16} className="text-yellow-600" />;
      case 'excused': return <FileText size={16} className="text-blue-600" />;
      default: return <AlertCircle size={16} className="text-text-secondary" />;
    }
  };

  const filteredCourses = filterStatus === 'all' 
    ? courses 
    : courses.filter(course => course.status === filterStatus);

  const overallAttendance = Math.round(
    courses.reduce((sum, course) => sum + course.attendancePercentage, 0) / courses.length
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
              My Attendance
            </h1>
            <p className="text-text-secondary">Track your attendance across all courses</p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Overall</span>
              <TrendingUp size={20} className="text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-primary">{overallAttendance}%</span>
            </div>
            <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${overallAttendance}%` }}
              />
            </div>
          </div>

          <div className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Courses</span>
              <BookOpen size={20} className="text-primary" />
            </div>
            <span className="text-3xl font-bold text-text-primary">{courses.length}</span>
            <p className="text-text-secondary text-xs mt-1">Active enrollments</p>
          </div>

          <div className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Present</span>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">
              {courses.reduce((sum, c) => sum + c.attendedSessions, 0)}
            </span>
            <p className="text-text-secondary text-xs mt-1">Total sessions</p>
          </div>

          <div className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Absent</span>
              <XCircle size={20} className="text-red-600" />
            </div>
            <span className="text-3xl font-bold text-red-600">
              {courses.reduce((sum, c) => sum + (c.totalSessions - c.attendedSessions), 0)}
            </span>
            <p className="text-text-secondary text-xs mt-1">Missed sessions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 px-4 overflow-x-auto">
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'upcoming', label: 'Upcoming', icon: Calendar },
          { id: 'history', label: 'History', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface dark:bg-zinc-900 text-text-secondary hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course List */}
      {activeTab === 'courses' && (
        <div className="px-4">
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-text-secondary" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 text-sm text-text-primary"
            >
              <option value="all">All Courses</option>
              <option value="excellent">Excellent (&gt;90%)</option>
              <option value="good">Good (75-90%)</option>
              <option value="warning">Warning (60-75%)</option>
              <option value="danger">Danger (&lt;60%)</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary font-bold text-sm">{course.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                        {course.attendancePercentage}%
                      </span>
                    </div>
                    <h3 className="text-text-primary font-semibold text-base mb-1">
                      {course.name}
                    </h3>
                    <p className="text-text-secondary text-sm flex items-center gap-1">
                      <User size={14} />
                      {course.lecturer}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    {course.attendedSessions} / {course.totalSessions} sessions
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} />
                      {course.attendedSessions}
                    </span>
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle size={14} />
                      {course.totalSessions - course.attendedSessions}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
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
                    className="mt-3 w-full"
                  >
                    <FileText size={14} className="mr-2" />
                    Submit Absence Justification
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {activeTab === 'upcoming' && (
        <div className="px-4 space-y-3">
          {upcomingSessions.map(session => (
            <div
              key={session.id}
              className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-primary font-bold text-sm">{session.courseCode}</span>
                  <h3 className="text-text-primary font-semibold text-base mt-1">
                    {session.courseName}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {session.date}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock size={14} />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin size={14} />
                  <span>{session.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <User size={14} />
                  <span>{session.lecturer}</span>
                </div>
              </div>
            </div>
          ))}

          {upcomingSessions.length === 0 && (
            <div className="text-center py-16 bg-surface dark:bg-zinc-900/50 rounded-2xl border border-border dark:border-zinc-800">
              <Calendar size={48} className="mx-auto text-text-secondary mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No upcoming sessions</h3>
              <p className="text-text-secondary">Check back later for scheduled classes</p>
            </div>
          )}
        </div>
      )}

      {/* Attendance History */}
      {activeTab === 'history' && (
        <div className="px-4 space-y-3">
          {attendanceHistory.map(record => (
            <div
              key={record.id}
              className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <span className="text-primary font-bold text-sm">{record.courseCode}</span>
                    <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {record.time}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>

              {record.notes && (
                <div className="mt-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <p className="text-xs text-text-secondary flex items-start gap-2">
                    <FileText size={12} className="mt-0.5" />
                    <span>{record.notes}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
