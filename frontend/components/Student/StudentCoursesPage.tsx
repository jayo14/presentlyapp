import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Trash2, BookMarked, Loader2, ArrowLeft, MoreVertical, TrendingUp
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
import { Badge } from '../../src/components/ui/badge';

const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();
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
      loadCourses();
    } catch (error: any) {
      toast.error('Update Failed', { description: 'Unable to modify course enrollment' });
    } finally {
      setDroppingId(null);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <SEO title="Academic Courses | Presently" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-on-surface-variant mb-4">
              <button onClick={() => navigate('/dashboard')} className="hover:text-sungold transition-colors">Dashboard</button>
              <span>/</span>
              <span className="font-bold text-presently-black">Courses</span>
           </div>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             My Curriculum
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Manage your active enrollments and tracking.
           </p>
        </div>
        <Button
          onClick={() => setIsRegistrationOpen(true)}
          size="lg"
          className="h-16 px-10 shadow-gold"
        >
          <Plus size={24} className="mr-2" />
          Enroll in Course
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder="Search by course name or code..."
          className="w-full h-14 pl-12 pr-4 bg-white border border-outline rounded-2xl focus:ring-2 focus:ring-sungold/20 focus:border-sungold transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 bg-slate-100 rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredCourses.map((enrollment) => (
             <ModernCard key={enrollment.id} padding="none" className="overflow-hidden group flex flex-col h-full hover:border-sungold/30 transition-all">
                <div className="p-6 flex-grow">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-warm-ivory flex items-center justify-center border border-outline group-hover:border-sungold/20">
                         <CourseIcon title={enrollment.course_name} code={enrollment.course_code} className="w-8 h-8" />
                      </div>
                      <Badge variant="present" className="px-2">Active</Badge>
                   </div>

                   <div className="space-y-1 mb-6">
                      <div className="text-sungold font-bold text-xs uppercase tracking-widest">{enrollment.course_code}</div>
                      <h3 className="font-display text-xl font-bold text-presently-black line-clamp-2 leading-tight">
                        {enrollment.course_name}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest pt-2">
                        {enrollment.lecturer_name || 'Department Lecturer'}
                      </p>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-outline/50 group-hover:bg-sungold/5 group-hover:border-sungold/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <TrendingUp size={18} className="text-moss-green" />
                         <div>
                            <p className="text-lg font-bold text-presently-black leading-none">88%</p>
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Attendance</p>
                         </div>
                      </div>
                      <div className="h-8 w-px bg-outline/50" />
                      <div className="text-right">
                         <p className="text-lg font-bold text-presently-black leading-none">24</p>
                         <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Lectures</p>
                      </div>
                   </div>
                </div>

                <div className="p-4 border-t border-outline flex gap-2">
                   <Button variant="outline" className="flex-1 h-11 text-xs font-bold" onClick={() => navigate(`/dashboard/analytics?course=${enrollment.course_id}`)}>
                      View Analytics
                   </Button>
                   <button
                     onClick={() => setCourseToDrop(enrollment)}
                     className="w-11 h-11 flex items-center justify-center rounded-full text-soft-coral hover:bg-soft-coral/10 transition-all border border-soft-coral/20"
                     title="Drop Course"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
             </ModernCard>
           ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-outline">
           <BookMarked className="mx-auto text-slate-300 mb-6" size={64} />
           <h3 className="font-display text-2xl font-bold text-presently-black mb-2">No courses found</h3>
           <p className="text-on-surface-variant mb-8">Enroll in a course to start tracking your attendance.</p>
           <Button onClick={() => setIsRegistrationOpen(true)}>
             Browse Course Catalog
           </Button>
        </div>
      )}

      <CourseRegistrationDialog
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={loadCourses}
      />

      <ConfirmationDialog
        isOpen={!!courseToDrop}
        onClose={() => setCourseToDrop(null)}
        onConfirm={handleDropCourse}
        title="Drop Course?"
        message={`Are you sure you want to remove ${courseToDrop?.course_code} from your curriculum? This action will archive your attendance history for this course.`}
        confirmLabel="Drop Course"
        variant="destructive"
        isLoading={!!droppingId}
      />
    </div>
  );
};

export default StudentCoursesPage;
