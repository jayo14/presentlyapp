import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, MapPin, User, Users, Calendar, AlertCircle, Plus, Search, Filter, GraduationCap, TrendingUp, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '../Button';
import { studentApi, EnrolledCourse } from '../../services/api/student';
import CourseRegistrationDialog from './CourseRegistrationDialog';
import { toast } from 'sonner';

interface StudentCoursesPageProps {
  userName?: string;
}

export const StudentCoursesPage: React.FC<StudentCoursesPageProps> = ({ userName }) => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getDashboard();
      setCourses(data.enrolled_courses || []);
    } catch (error: any) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses', {
        description: error.response?.data?.error || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && !course.is_completed) ||
                         (filterStatus === 'completed' && course.is_completed);
    
    return matchesSearch && matchesFilter;
  });

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success dark:text-success-light';
    if (percentage >= 60) return 'text-warning dark:text-warning-light';
    return 'text-error dark:text-error-light';
  };

  const getAttendanceBgColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-success/10 dark:bg-success-light/10';
    if (percentage >= 60) return 'bg-warning/10 dark:bg-warning-light/10';
    return 'bg-error/10 dark:bg-error-light/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading your courses...</p>
        </div>
      </div>
    );
  }

  // Mobile Layout (Design 4)
  const mobileLayout = (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 hover:bg-light-surface dark:hover:bg-dark-surface rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold">My Courses</h1>
        </div>
      </div>

      {/* Course Cards */}
      <div className="p-4 space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-light-surface dark:bg-dark-surface rounded-full mb-4">
              <BookOpen size={32} className="text-light-text-tertiary dark:text-dark-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Start by registering for courses'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const attendance = course.attendance_percentage || 0;
            const getStatusBadge = () => {
              if (attendance >= 90) return { text: 'Excellent', bg: 'bg-success/10 dark:bg-success-light/10', color: 'text-success dark:text-success-light' };
              if (attendance >= 75) return { text: 'Active', bg: 'bg-success/10 dark:bg-success-light/10', color: 'text-success dark:text-success-light' };
              if (attendance >= 60) return { text: 'Warning', bg: 'bg-warning/10 dark:bg-warning-light/10', color: 'text-warning dark:text-warning-light' };
              return { text: 'Low', bg: 'bg-error/10 dark:bg-error-light/10', color: 'text-error dark:text-error-light' };
            };
            
            const status = getStatusBadge();
            const getProgressColorClass = () => {
              if (attendance >= 90) return 'bg-primary dark:bg-dark-primary';
              if (attendance >= 75) return 'bg-success dark:bg-success-light';
              if (attendance >= 60) return 'bg-warning dark:bg-warning-light';
              return 'bg-error dark:bg-error-light';
            };
            
            const getProgressTextClass = () => {
              if (attendance >= 90) return 'text-primary dark:text-dark-primary';
              if (attendance >= 75) return 'text-success dark:text-success-light';
              if (attendance >= 60) return 'text-warning dark:text-warning-light';
              return 'text-error dark:text-error-light';
            };
            
            // Generate course thumbnail based on course name
            const getCourseImage = (name: string) => {
              const colors = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-red-500',
                'from-indigo-500 to-purple-500'
              ];
              const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const colorIndex = hash % colors.length;
              return colors[colorIndex];
            };
            
            return (
              <div 
                key={course.id}
                className="bg-light-surface dark:bg-dark-surface rounded-2xl overflow-hidden"
              >
                {/* Course Thumbnail */}
                <div className={`h-24 bg-gradient-to-br ${getCourseImage(course.course_name)} relative flex items-center justify-center`}>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 ${status.bg} ${status.color} text-xs font-bold rounded-full`}>
                      {status.text}
                    </span>
                  </div>
                </div>
                
                {/* Course Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{course.course_name}</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                    {course.course_code} • {course.lecturer_name || 'Prof. Not Assigned'}
                  </p>
                  
                  {/* Attendance Progress */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">Attendance</span>
                    <span className={`text-sm font-bold ${getProgressTextClass()}`}>
                      {Math.round(attendance)}%
                    </span>
                  </div>
                  <div className="w-full bg-light-background dark:bg-dark-background rounded-full h-1.5">
                    <div 
                      className={`h-full rounded-full transition-all ${getProgressColorClass()}`}
                      style={{ width: `${attendance}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={() => setIsRegistrationOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary dark:bg-dark-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-hover dark:hover:bg-dark-primary-hover transition-colors"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border px-6 py-3 flex justify-between items-center">
        <button className="flex flex-col items-center gap-1 text-light-text-tertiary dark:text-dark-text-tertiary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary dark:text-dark-primary">
          <GraduationCap size={24} />
          <span className="text-xs">Courses</span>
        </button>
        <button 
          className="w-14 h-14 -mt-7 bg-primary dark:bg-dark-primary rounded-2xl flex items-center justify-center text-white hover:bg-primary-hover dark:hover:bg-dark-primary-hover transition-colors"
        >
          <QrCode size={28} />
        </button>
        <button className="flex flex-col items-center gap-1 text-light-text-tertiary dark:text-dark-text-tertiary">
          <TrendingUp size={24} />
          <span className="text-xs">Analytics</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-light-text-tertiary dark:text-dark-text-tertiary">
          <User size={24} />
          <span className="text-xs">Profile</span>
        </button>
      </div>

      {/* Course Registration Dialog */}
      <CourseRegistrationDialog
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          loadCourses();
        }}
      />
    </div>
  );

  // Desktop Layout (unchanged)
  const desktopLayout = (
    <div className="min-h-screen bg-light-background dark:bg-dark-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 dark:bg-dark-primary/10 rounded-xl">
              <GraduationCap className="text-primary dark:text-dark-primary" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">My Courses</h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'} enrolled
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Search courses, codes, or lecturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-full text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-full text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
            >
              <option value="all">All Courses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <Button
              onClick={() => setIsRegistrationOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Course
            </Button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-light-surface dark:bg-dark-surface rounded-full mb-4">
              <BookOpen className="text-light-text-tertiary dark:text-dark-text-tertiary" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              {searchTerm ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {searchTerm ? 'Try adjusting your search or filters' : 'Start by registering for courses'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsRegistrationOpen(true)}>
                <Plus size={18} className="mr-2" />
                Register for Courses
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-light-text dark:text-dark-text mb-1 line-clamp-1">
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-primary dark:text-dark-primary font-semibold">
                      {course.course_code}
                    </p>
                  </div>
                  {course.is_completed && (
                    <div className="flex-shrink-0 ml-2">
                      <CheckCircle2 className="text-success dark:text-success-light" size={24} />
                    </div>
                  )}
                </div>

                {/* Lecturer Info */}
                <div className="flex items-center gap-2 mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  <User size={16} />
                  <span className="line-clamp-1">{course.lecturer_name || 'Not assigned'}</span>
                </div>

                {/* Attendance Stats */}
                <div className={`${getAttendanceBgColor(course.attendance_percentage)} rounded-xl p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-light-text dark:text-dark-text">Attendance</span>
                    <span className={`text-lg font-bold ${getAttendanceColor(course.attendance_percentage)}`}>
                      {course.attendance_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-light-background dark:bg-dark-background rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        course.attendance_percentage >= 75
                          ? 'bg-success dark:bg-success-light'
                          : course.attendance_percentage >= 60
                          ? 'bg-warning dark:bg-warning-light'
                          : 'bg-error dark:bg-error-light'
                      }`}
                      style={{ width: `${course.attendance_percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    <span>{course.attended_sessions} attended</span>
                    <span>{course.total_sessions} total</span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                    <Clock size={16} />
                    <span>{course.credit_hours || 0} credit hours</span>
                  </div>
                  {course.next_session && (
                    <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                      <Calendar size={16} />
                      <span className="line-clamp-1">
                        Next: {new Date(course.next_session).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Performance Indicator */}
                {course.attendance_percentage < 75 && (
                  <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                    <div className="flex items-start gap-2 text-xs text-warning dark:text-warning-light">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>Attendance below required 75%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Course Registration Dialog */}
        <CourseRegistrationDialog
          isOpen={isRegistrationOpen}
          onClose={() => {
            setIsRegistrationOpen(false);
            loadCourses(); // Reload courses after registration
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        {mobileLayout}
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        {desktopLayout}
      </div>
    </>
  );
};

export default StudentCoursesPage;
