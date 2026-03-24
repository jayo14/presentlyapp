import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, MapPin, User, GraduationCap, Plus, Search, CheckCircle2, QrCode, Trash2, ArrowLeft, MoreVertical, X, Award, Zap, Activity } from 'lucide-react';
import { Button } from '../Button';
import { studentApi, EnrolledCourse } from '../../services/api/student';
import CourseRegistrationDialog from './CourseRegistrationDialog';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { motion, AnimatePresence } from 'framer-motion';

const AUTO_CHECKIN_KEY = 'pending_auto_checkin';

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
      const data = await studentApi.getDashboard();
      setCourses(data.enrolled_courses || []);
    } catch (error: any) {
      toast.error('Sync Error', { description: 'Failed to retrieve academic portfolio' });
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (course: EnrolledCourse) => {
    if (!window.confirm(`Disenroll from ${course.course_code}? This action is permanent.`)) return;
    try {
      setDroppingId(course.id);
      await studentApi.dropCourse(course.id);
      toast.success('Curriculum Updated', { description: `Removed ${course.course_code}` });
      await loadCourses();
    } catch (err: any) {
      toast.error('Update Failed', { description: err.response?.data?.error || 'Please try again' });
    } finally {
      setDroppingId(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Accessing Archives...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Academic Portfolio | Presently" description="Manage your registered modules and track academic progress." noIndex />
      
      <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto pb-24">
        
        {/* HEADER SECTION */}
        <header className="px-2 flex flex-col gap-1">
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
              <h1 className="text-4xl font-headline font-black tracking-tight text-text">Modules</h1>
              <p className="text-textMuted font-medium text-sm mt-1">{courses.length} Active Enrollments found</p>
           </div>
        </header>

        {/* SEARCH BAR */}
        <section className="px-2">
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Find a module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-surfaceContainer/20 border border-outline/10 h-16 pl-14 pr-6 rounded-[1.5rem] font-bold text-sm focus:outline-none focus:border-primary/50 shadow-sm transition-all"
              />
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
                    className="bg-white dark:bg-surfaceContainer/10 rounded-[2.5rem] p-7 border border-outline/10 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                     <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] pointer-events-none transition-all group-hover:bg-primary/10"></div>
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-surfaceHigh/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                           <BookOpen size={24} strokeWidth={2.5} />
                        </div>
                        <button 
                          onClick={() => handleDropCourse(course)}
                          disabled={droppingId === course.id}
                          className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
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
              <div className="py-24 flex flex-col items-center justify-center bg-surfaceHigh/10 border-2 border-dashed border-outline/10 rounded-[3rem] text-center px-12">
                 <div className="w-20 h-20 bg-surfaceHigh/40 rounded-full flex items-center justify-center opacity-40 mb-6">
                    <GraduationCap size={40} />
                 </div>
                 <h4 className="text-2xl font-headline font-black text-text">No Modules Registered</h4>
                 <p className="text-textMuted text-sm font-medium mt-2 max-w-[240px]">Expand your academic portfolio by enrolling in new department modules.</p>
                 <button 
                   onClick={() => setIsRegistrationOpen(true)}
                   className="mt-8 px-10 py-4 bg-primary text-[#111111] font-headline font-black text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                 >
                   Register Courses
                 </button>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* FLOATING ACTION BUTTON */}
        <button 
           onClick={() => setIsRegistrationOpen(true)}
           className="fixed bottom-28 right-6 w-16 h-16 bg-primary text-[#111111] rounded-[1.5rem] shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center active:scale-90 transition-all z-[60]"
        >
           <Plus size={32} strokeWidth={3} />
        </button>

        <CourseRegistrationDialog 
          onSuccess={loadCourses}
          isOpen={isRegistrationOpen}
          initialCourseCode={searchParams.get('courseCode') || undefined}
          onClose={() => { setIsRegistrationOpen(false); loadCourses(); }}
        />
      </div>
    </>
  );
};

export default StudentCoursesPage;
