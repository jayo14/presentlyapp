import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Check, Loader2, AlertCircle, ChevronRight, GraduationCap, LayoutGrid, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import { studentApi, AvailableCourse } from '../../services/api/student';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CourseRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (enrolledCourseId?: number) => void;
  initialCourseCode?: string;
}

export const CourseRegistrationDialog: React.FC<CourseRegistrationDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCourseCode
}) => {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadAvailableCourses();
      if (initialCourseCode) setSearchTerm(initialCourseCode);
    }
  }, [isOpen, initialCourseCode]);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedSemester, courses]);

  const loadAvailableCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getAvailableCourses();
      setCourses(data);
      const alreadyEnrolled = data.filter(c => !c.can_enroll).map(c => c.id);
      setEnrolledIds(new Set(alreadyEnrolled));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load available courses';
      setError(errorMsg);
      toast.error('Connection Error', { description: errorMsg });
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
      await studentApi.enrollInCourse(courseId);
      
      setEnrolledIds(prev => new Set([...Array.from(prev), courseId]));
      toast.success('Course Enrolled', { 
        description: 'Successfully added to your curriculum' 
      });
      onSuccess(courseId);
    } catch (err: any) {
      toast.error('Enrollment Failed', { 
        description: err.response?.data?.error || 'Please try again later' 
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-surface w-full md:max-w-lg h-[100dvh] md:h-auto md:max-h-[85vh] rounded-none md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-outline/10"
      >
        {/* Mobile Drag Handle */}
        <div className="hidden md:block w-12 h-1.5 bg-outline/20 rounded-full mx-auto mt-4" />

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex flex-col gap-1 relative flex-shrink-0">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-headline font-black text-text tracking-tight uppercase tracking-widest">Register Courses</h2>
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-surfaceHigh/50 flex items-center justify-center text-textMuted hover:text-text hover:bg-surfaceHigh transition-colors"
              aria-label="Close"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
          <p className="text-textMuted font-medium text-sm">Select the modules you wish to enroll in this semester</p>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 space-y-4 flex-shrink-0">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Browse Department</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search e.g. CS101"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surfaceLow/50 border border-outline/10 h-14 pl-12 pr-4 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                  />
                </div>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <select 
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full bg-surfaceLow/50 border border-outline/10 h-14 pl-12 pr-4 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All Semesters</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                </div>
             </div>
           </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3 custom-scrollbar">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4 text-textMuted/60">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">Syncing Curriculum...</span>
             </div>
           ) : filteredCourses.length > 0 ? (
             filteredCourses.map(course => {
               const isEnrolled = enrolledIds.has(course.id);
               return (
                 <motion.div 
                   layout
                   key={course.id}
                   className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between gap-4 group ${
                     isEnrolled 
                     ? 'bg-primary/5 border-primary/20' 
                     : 'bg-white border-outline/10 hover:border-primary/30 shadow-sm'
                   }`}
                 >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                         isEnrolled ? 'bg-primary text-background shadow-lg' : 'bg-surfaceLow text-textMuted group-hover:bg-primary/10 group-hover:text-primary'
                       }`}>
                          {isEnrolled ? <Check size={20} strokeWidth={3} /> : <BookOpen size={20} />}
                       </div>
                       <div className="min-w-0">
                          <p className="text-[10px] font-black tracking-widest text-primary/70 uppercase mb-0.5">{course.code}</p>
                          <h4 className="font-headline font-black text-text text-base tracking-tight truncate">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-bold text-textMuted/60 flex items-center gap-1">
                                <Info size={10} /> {course.credit_units} Units
                             </span>
                             {isEnrolled && (
                               <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Current Module</span>
                             )}
                          </div>
                       </div>
                    </div>
                    {isEnrolled ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black border border-primary/20">
                         ADDED
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingCourseId === course.id}
                        className="h-10 px-6 bg-text text-background text-xs font-black rounded-xl hover:bg-surface active:scale-95 transition-all flex items-center justify-center"
                      >
                         {enrollingCourseId === course.id ? <Loader2 size={16} className="animate-spin" /> : 'ADD'}
                      </button>
                    )}
                 </motion.div>
               );
             })
           ) : (
             <div className="py-20 flex flex-col items-center justify-center text-textMuted/40 text-center px-8">
                <Search size={48} className="mb-4 text-textMuted/20" />
                <p className="font-headline font-black text-lg text-textMuted/60">No modules found</p>
                <p className="text-xs font-medium max-w-[200px] mt-1 text-textMuted/40">Try adjusting your search criteria or filter.</p>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-outline/5 bg-white/80 backdrop-blur-md flex-shrink-0">
           <button 
             onClick={onClose}
             className="w-full bg-primary text-background h-16 rounded-[1.5rem] font-headline font-black text-lg shadow-[0_16px_32px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
           >
              Submit Registration
              <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseRegistrationDialog;
