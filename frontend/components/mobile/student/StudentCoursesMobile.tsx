import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlass, Plus, Trash, BookBookmark, 
  TrendUp, CaretRight, GraduationCap,
  DotsThreeVertical, Info
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentApi } from '../../../services/api/student';
import { toast } from 'sonner';
import { SEO } from '../../SEO';

export const StudentCoursesMobile: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseToDrop, setCourseToDrop] = useState<any>(null);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getEnrolledCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <SEO title="My Courses | Presently" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
           <p className="text-on-surface-variant font-medium">Manage your active enrollments.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/courses/register')}
          className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
        >
          <Plus size={24} weight="bold" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <MagnifyingGlass size={20} weight="bold" />
        </div>
        <input 
          type="text"
          placeholder="Search by course or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
        />
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-surface-container rounded-3xl animate-pulse" />)
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <motion.div 
              key={course.id}
              layout
              className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold">
                    <BookBookmark size={28} weight="duotone" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sungold">
                      {course.course_code}
                    </span>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{course.course_name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium">{course.lecturer_name || 'Prof. Adeyemi'}</p>
                  </div>
                </div>
                <button className="p-2 text-on-surface-variant">
                  <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl">
                 <div className="flex-1 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <TrendUp size={16} weight="bold" />
                   </div>
                   <div>
                      <p className="text-sm font-black tracking-tight">88%</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Attendance</p>
                   </div>
                 </div>
                 <div className="w-px h-8 bg-outline/50" />
                 <div className="flex-1 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-sungold/10 flex items-center justify-center text-sungold">
                      <GraduationCap size={16} weight="bold" />
                   </div>
                   <div>
                      <p className="text-sm font-black tracking-tight">24</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Lectures</p>
                   </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate(`/dashboard/analytics?course=${course.id}`)}
                  className="flex-1 h-12 bg-surface-container border border-outline rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Info size={18} weight="duotone" />
                  Insights
                </button>
                <button 
                  onClick={() => setCourseToDrop(course)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-error bg-error/5 border border-error/10 active:scale-90 transition-all"
                >
                  <Trash size={20} weight="duotone" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
             <BookBookmark size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-6" />
             <h3 className="text-xl font-bold mb-2">No courses found</h3>
             <p className="text-on-surface-variant font-medium px-10 mb-8">Ready to add something to your list?</p>
             <button 
               onClick={() => navigate('/dashboard/courses/register')}
               className="h-14 px-8 bg-sungold text-black rounded-2xl font-bold shadow-gold active:scale-95 transition-all"
             >
                Enroll Now
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
