import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Plus, Trash2, User, Activity,
  BookMarked, Loader2, ArrowLeft, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentApi } from '../../services/api/attendance';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
import { Button } from '../Button';
import CourseIcon from '../Course/CourseIcon';
import CourseRegistrationDialog from './CourseRegistrationDialog';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { cn } from '../../src/components/ui/utils';

const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [courseToDrop, setCourseToDrop] = useState<any>(null);
  const [droppingId, setDroppingId] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const enrolledData = await studentApi.getEnrolledCourses();
      setCourses(Array.isArray(enrolledData) ? enrolledData : []);
    } catch (error: any) {
      toast.error('Sync Error', { description: 'Failed to retrieve academic portfolio' });
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async () => {
    if (!courseToDrop) return;
    try {
      setDroppingId(courseToDrop.id);
      await studentApi.dropCourse(courseToDrop.id);
      toast.success('Curriculum Updated', { description: `Removed ${courseToDrop.course_code}` });
      setCourseToDrop(null);
      await loadCourses();
    } catch (err: any) {
      toast.error('Update Failed', { description: err.response?.data?.error || 'Please try again' });
    } finally {
      setDroppingId(null);
    }
  };

  const filteredCourses = React.useMemo(() => {
    const sourceArr = Array.isArray(courses) ? courses : [];
    return sourceArr.filter(course => {
      const name = course?.course_name?.toLowerCase() || '';
      const code = course?.course_code?.toLowerCase() || '';
      const search = searchTerm?.toLowerCase() || '';
      return name.includes(search) || code.includes(search);
    });
  }, [courses, searchTerm]);

  return (
    <>
      <SEO title="Academic Portfolio | Presently" description="Manage your registered courses and track academic progress." noIndex />

      <div className="space-y-8 max-w-4xl mx-auto pb-24">
        {/* HEADER */}
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-text">Your Courses</h1>
          <p className="text-textMuted font-medium">Tracking {courses.length} active enrollments</p>
        </header>

        {/* SEARCH & ACTION */}
        <section className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Find a course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[54px] bg-surface border border-outline rounded-xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
          </div>
          <Button onClick={() => setIsRegistrationOpen(true)} className="h-[54px] px-6 shrink-0">
            <Plus size={20} />
            Add Course
          </Button>
        </section>

        {/* COURSE GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-48 bg-surfaceContainer animate-pulse rounded-md" />)
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, idx) => {
                  const attendance = course.attendance_percentage || 0;
                  return (
                    <ModernCard
                      key={course.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <CourseIcon title={course.course_name} code={course.course_code} className="w-12 h-12" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-textMuted hover:text-error"
                            onClick={() => setCourseToDrop(course)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        <div>
                          <p className="text-[10px] font-black tracking-widest text-primary uppercase">{course.course_code}</p>
                          <h3 className="text-xl font-bold tracking-tight text-text line-clamp-1">{course.course_name}</h3>
                          <p className="text-xs text-textMuted font-medium mt-1 uppercase tracking-wider">{course.lecturer_name || 'Prof. Unassigned'}</p>
                        </div>
                      </div>

                      <div className="mt-8 space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">Progress</span>
                          <span className={cn(
                            "text-lg font-black tracking-tight",
                            attendance >= 75 ? "text-success" : "text-amber-500"
                          )}>
                            {Math.round(attendance)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surfaceContainer rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${attendance}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={cn(
                              "h-full rounded-full",
                              attendance >= 75 ? "bg-success" : "bg-amber-500"
                            )}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-textMuted uppercase">
                          <span>{course.sessions_attended} Attended</span>
                          <span>{course.total_sessions} Total</span>
                        </div>
                      </div>
                    </ModernCard>
                  );
                })
              ) : (
                <ModernCard className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-6 border-dashed">
                  <div className="w-20 h-20 bg-surfaceContainer rounded-full flex items-center justify-center text-textMuted">
                    <BookMarked size={40} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Your portfolio is empty</h3>
                    <p className="text-textMuted max-w-xs mx-auto">Start by registering for the courses in your department this semester.</p>
                  </div>
                  <Button onClick={() => setIsRegistrationOpen(true)}>
                    Register Courses
                  </Button>
                </ModernCard>
              )}
            </AnimatePresence>
          )}
        </section>
      </div>

      <CourseRegistrationDialog
        onSuccess={loadCourses}
        isOpen={isRegistrationOpen}
        onClose={() => { setIsRegistrationOpen(false); loadCourses(); }}
      />

      <ConfirmationDialog
        isOpen={!!courseToDrop}
        onClose={() => setCourseToDrop(null)}
        onConfirm={handleDropCourse}
        isLoading={!!droppingId}
        variant="danger"
        title="Disenroll Course"
        description={`Are you sure you want to remove ${courseToDrop?.course_code} from your portfolio?`}
        confirmText="Drop Course"
      />
    </>
  );
};

export default StudentCoursesPage;
