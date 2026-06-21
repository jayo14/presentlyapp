import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Plus, Search, Trash2, Activity, Loader2, BookMarked, ArrowRight } from 'lucide-react';
import { studentApi, EnrolledCourse } from '../../services/api/student';
import CourseRegistrationDialog from './CourseRegistrationDialog';
import CourseIcon from '../Course/CourseIcon';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonCourseGrid } from '../Skeleton';
import { ConfirmationDialog } from '../ConfirmationDialog';


interface StudentCoursesPageProps {
  userName?: string;
}

export const StudentCoursesPage: React.FC<StudentCoursesPageProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [droppingId, setDroppingId] = useState<number | null>(null);
  const [courseToDrop, setCourseToDrop] = useState<EnrolledCourse | null>(null);
  const [checkInIntent, setCheckInIntent] = useState<any>({ fromCheckIn: false, autoCheckIn: false });

  useEffect(() => { loadCourses(); }, []);

  useEffect(() => {
    const source = searchParams.get('source');
    const sessionCode = searchParams.get('sessionCode') || undefined;
    if (source === 'checkin' && sessionCode) {
      setCheckInIntent({ fromCheckIn: true, sessionCode, autoCheckIn: searchParams.get('auto_checkin') === '1' });
      setIsRegistrationOpen(true);
    }
  }, [searchParams]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Fetch directly from enrolled courses endpoint for reliability on this page
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

  // Highly defensive filtering to prevent "filter is not a function" errors
  const filteredCourses = React.useMemo(() => {
    const sourceArr = Array.isArray(courses) ? courses : [];
    return sourceArr.filter(course => {
      const name = course?.course_name?.toLowerCase() || '';
      const code = course?.course_code?.toLowerCase() || '';
      const search = searchTerm?.toLowerCase() || '';
      return name.includes(search) || code.includes(search);
    });
  }, [courses, searchTerm]);

  if (loading && courses.length === 0) {
    return <SkeletonCourseGrid />;
  }

  return (
    <>
      <SEO title="Academic Portfolio | Presently" description="Manage your registered courses and track academic progress." noIndex />

      <div className="relative isolate overflow-hidden space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-24">
        <div className="orb w-[560px] h-[560px] bg-sungold/10 -top-48 -right-32" />
        <div className="orb w-[420px] h-[420px] bg-blue-400/5 top-1/3 -left-24" />
        <div className="relative z-10 space-y-8">

        <section className="skeuo-card mx-2 p-6 md:p-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sungold/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-black/5 text-[10px] font-black uppercase tracking-[0.25em] text-textMuted">
                Academic Portfolio
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-headline font-black tracking-tight text-text">Courses</h1>
                <p className="max-w-2xl text-sm md:text-base text-textMuted/80 font-medium">
                  Track your enrolled courses, review attendance progress, and register for more from the same dashboard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:min-w-[340px]">
              <div className="skeuo-card p-4 md:p-5 rounded-[1.75rem]">
                <p className="text-[9px] font-black uppercase tracking-widest text-textMuted">Active courses</p>
                <p className="mt-2 text-2xl md:text-3xl font-black tracking-tighter text-text">{filteredCourses.length}</p>
              </div>
              <div className="skeuo-card p-4 md:p-5 rounded-[1.75rem]">
                <p className="text-[9px] font-black uppercase tracking-widest text-textMuted">Total sessions</p>
                <p className="mt-2 text-2xl md:text-3xl font-black tracking-tighter text-text">
                  {courses.reduce((sum, course) => sum + (course.total_sessions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HEADER SECTION */}
        {/* <header className="px-2 flex flex-col gap-1">
           <div className="flex justify-between items-center">
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-2xl bg-surfaceHigh/40 flex items-center justify-center text-textMuted active:scale-90 transition-all"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Academic Portfolio</span>
              <button className="w-10 h-10 rounded-2xl bg-surfaceHigh/40 flex items-center justify-center text-textMuted">
                 <MoreVertical size={18} />
              </button>
           </div>
           <div className="mt-6">
              <h1 className="text-4xl font-headline font-black tracking-tight text-text">Courses</h1>
              <p className="text-textMuted font-medium text-sm mt-1">{courses.length} Active Enrollments found</p>
           </div>
        </header> */}

        {/* SEARCH BAR */}
        <section className="px-2">
          <div className="skeuo-card p-2 md:p-3">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Find a course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent h-16 pl-14 pr-6 rounded-[1.5rem] font-bold text-sm text-text placeholder:text-textMuted/50 focus:outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* COURSE GRID */}
        <section className="px-2 grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, idx) => {
                const attendance = course.attendance_percentage || 0;
                return (
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={course.id}
                  className="skeuo-card p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all relative overflow-hidden group"
                  >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] pointer-events-none transition-all group-hover:bg-primary/10" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-sungold/40 to-transparent opacity-70" />

                  <div className="flex justify-between items-start mb-6">
                    <CourseIcon
                      title={course.course_name}
                      code={course.course_code}
                      className="w-14 h-14 group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={() => setCourseToDrop(course)}
                      disabled={droppingId === course.id}
                      className="skeuo-button w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all active:scale-90"
                    >
                      {droppingId === course.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>

                  <div className="space-y-1 mb-8">
                    <p className="text-[10px] font-black tracking-widest text-primary/70 uppercase">{course.course_code}</p>
                    <h3 className="text-2xl font-headline font-black text-text tracking-tight leading-tight">{course.course_name}</h3>
                    <p className="text-textMuted font-bold text-xs flex items-center gap-2">
                      <User size={14} className="opacity-40" />
                      {course.lecturer_name || 'Prof. Unassigned'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Progress</span>
                      </div>
                      <span className={`text-xl font-headline font-black ${attendance >= 75 ? 'text-emerald-500' : 'text-amber-500 font-black'}`}>
                        {Math.round(attendance)}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-surfaceHigh/40 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attendance}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${attendance >= 75 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-textMuted/40 uppercase tracking-tighter">
                      <span>{course.sessions_attended} Sessions</span>
                      <span>{course.total_sessions} Total</span>
                    </div>
                  </div>
                  </motion.div>

                );
              })
            ) : (
              <div className="skeuo-card py-24 flex flex-col items-center justify-center text-center px-12 mx-2">
                <div className="w-20 h-20 bg-white/70 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-textMuted/40 border border-black/5">
                  <BookMarked size={40} />
                </div>
                <h4 className="text-2xl font-headline font-black text-text">No Courses Registered</h4>
                <p className="text-textMuted/80 text-sm font-medium mt-2 max-w-[240px]">Expand your academic portfolio by enrolling in new department courses.</p>
                <button
                  onClick={() => setIsRegistrationOpen(true)}
                  className="mt-8 skeuo-button-gold px-10 py-4 font-headline font-black text-sm inline-flex items-center gap-2"
                >
                  Register Courses
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* FLOATING ACTION BUTTON */}
        <button
          onClick={() => setIsRegistrationOpen(true)}
          className="fixed bottom-28 right-6 w-16 h-16 skeuo-button-gold rounded-[1.75rem] flex items-center justify-center active:scale-90 transition-all z-[60]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>

        <CourseRegistrationDialog
          onSuccess={loadCourses}
          isOpen={isRegistrationOpen}
          initialCourseCode={searchParams.get('courseCode') || undefined}
          onClose={() => { setIsRegistrationOpen(false); loadCourses(); }}
        />

        <ConfirmationDialog
          isOpen={!!courseToDrop}
          onClose={() => setCourseToDrop(null)}
          onConfirm={handleDropCourse}
          isLoading={!!droppingId}
          variant="danger"
          title="Disenroll Course"
          description={`Are you sure you want to remove ${courseToDrop?.course_code} from your portfolio? This will permanently delete your local attendance records for this course.`}
          confirmText="Drop Course"
        />
        </div>
      </div>
    </>
  );
};

export default StudentCoursesPage;
