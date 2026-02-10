import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Users, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { studentApi, AvailableCourse } from '../../services/api/student';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

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
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastEnrolledCourse, setLastEnrolledCourse] = useState<string>('');
  const [courseCode, setCourseCode] = useState('');
  
  const { modalProps } = useModalAccessibility(isOpen, onClose);

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
      
      const enrolledCourse = courses.find(c => c.id === courseId);
      if (enrolledCourse) {
        setLastEnrolledCourse(`${enrolledCourse.code} (${enrolledCourse.title})`);
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 5000); // Hide after 5 seconds
      }
      
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
        {...modalProps}
        aria-labelledby="reg-dialog-title"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col outline-none"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 id="reg-dialog-title" className="text-2xl font-bold text-zinc-900 dark:text-white">Course Registration</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Browse and enroll in available courses
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          {/* Success Banner - matching Design 2 */}
          {showSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-700 rounded-xl flex items-start gap-3 relative"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-800 dark:text-green-300 font-bold text-sm mb-1">
                  Course Added Successfully
                </h3>
                <p className="text-green-700 dark:text-green-400 text-xs">
                  {lastEnrolledCourse} has been added to your schedule.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="flex-shrink-0 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Add via Code Section - matching Design 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Add via Code</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter the unique 6-digit code provided by your course instructor.
            </p>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="e.g. CS101"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="flex-1"
                maxLength={10}
              />
              <Button 
                onClick={() => {
                  // Find course by code and enroll
                  const course = courses.find(c => c.code.toUpperCase() === courseCode.toUpperCase());
                  if (course && course.can_enroll) {
                    handleEnroll(course.id);
                    setCourseCode('');
                  } else if (course && !course.can_enroll) {
                    toast.error('Already enrolled in this course');
                  } else {
                    toast.error('Course not found');
                  }
                }}
                disabled={!courseCode.trim()}
                className="whitespace-nowrap"
              >
                Register Course →
              </Button>
            </div>
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative px-4 bg-white dark:bg-zinc-900">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase">OR BROWSE</span>
            </div>
          </div>

          {/* Browse Department Section - matching Design 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Browse Department</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Find open electives and major courses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search for departments..."
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
      </motion.div>
    </div>
  );
};

export default CourseRegistrationDialog;
