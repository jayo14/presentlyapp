import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, BookOpen, 
  GraduationCap
} from '@phosphor-icons/react';
import { coursesApi, institutionApi } from '../../../services/api/admin';
import { Course, Institution } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { CourseManagement } from '../../Admin/CourseManagement';
import { Badge } from '../../../src/components/ui/badge';

export const CourseManagementMobile: React.FC = () => {
  const isDesktop = !useBreakpoint('md');
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instRes, courseRes] = await Promise.all([
        institutionApi.getAll(),
        coursesApi.getAll()
      ]);
      setInstitutions(instRes);
      setCourses(courseRes);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDesktop) return <CourseManagement />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <SEO title="Course Catalog | Presently Mobile" />

      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-display font-bold text-presently-black">Catalog</h1>
         <p className="text-on-surface-variant font-medium text-sm">Academic courses and codes</p>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative flex-1 group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={18} />
            <input
              placeholder="Search code or name..."
              className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-sungold text-presently-black shadow-gold active:scale-95 transition-all">
            <Plus size={20} weight="bold" />
         </button>
      </div>

      <div className="space-y-4 pb-24">
         {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
         ) : (
           filteredCourses.map(course => (
             <div key={course.id} className="p-6 bg-surface border border-outline rounded-[2.5rem] shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-14 h-14 rounded-[30%] bg-sungold/10 text-sungold border border-outline flex items-center justify-center shadow-sm shrink-0">
                      <BookOpen size={28} weight="bold" />
                   </div>
                   <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                         <Badge variant="secondary" className="font-black px-2 py-0.5">{course.code}</Badge>
                      </div>
                      <h3 className="font-bold text-presently-black text-lg line-clamp-1">{course.name}</h3>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline/40 pt-5">
                   <div className="flex items-center gap-2 text-on-surface-variant">
                      <GraduationCap size={16} weight="bold" className="text-sungold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">{course.department_name}</span>
                   </div>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};
