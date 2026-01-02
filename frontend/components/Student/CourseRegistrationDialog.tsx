import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Users, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { studentApi, AvailableCourse } from '../../services/api/student';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CourseRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseRegistrationDialog: React.FC<CourseRegistrationDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadAvailableCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedSemester, courses]);

  const loadAvailableCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getAvailableCourses();
      setCourses(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load available courses';
      setError(errorMsg);
      toast.error('Load Error', {
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        course =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSemester !== 'all') {
      filtered = filtered.filter(course => course.semester === selectedSemester);
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingCourseId(courseId);
      setError(null);
      await studentApi.enrollInCourse(courseId);
      
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, can_enroll: false } : c
      ));
      
      toast.success('Enrollment Successful', {
        description: 'You have been enrolled in the course'
      });
      
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to enroll in course';
      setError(errorMsg);
      toast.error('Enrollment Failed', {
        description: errorMsg
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const semesters = Array.from(new Set(courses.map(c => c.semester).filter(Boolean)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Course Registration</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Browse and enroll in available courses
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                          {course.code}
                        </span>
                        {course.semester && (
                          <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded">
                            {course.semester}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex-wrap">
                        {course.credit_units && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.credit_units} units</span>
                          </div>
                        )}
                        {course.enrollment_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.enrollment_count} enrolled</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      {course.can_enroll ? (
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingCourseId === course.id}
                          className="whitespace-nowrap w-full sm:w-auto"
                        >
                          {enrollingCourseId === course.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Enroll
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Enrolled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {filteredCourses.filter(c => c.can_enroll).length} available
          </p>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseRegistrationDialog;
