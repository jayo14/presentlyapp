import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, BookOpen, 
  GraduationCap, Users, CaretRight, 
  DotsThreeVertical, Trash, Pencil,
  Tag
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesApi, institutionApi, collegeApi, departmentApi } from '../../../services/api/admin';
import { Course, Institution, College, Department } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';

import { CourseModal } from '../../Admin/CourseModal';


export const CourseManagementMobile: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (selectedInstitution) loadColleges(selectedInstitution);
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedCollege) loadDepartments(selectedCollege);
  }, [selectedCollege]);

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
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async (id: number) => {
    try {
      const data = await collegeApi.getByInstitution(id);
      setColleges(data);
    } catch (e) {}
  };

  const loadDepartments = async (id: number) => {
    try {
      const data = await departmentApi.getByCollege(id);
      setDepartments(data);
    } catch (e) {}
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCourse = async (formData: Partial<Course>) => {
    try {
      if (editingCourse) {
        await coursesApi.updateCourse(editingCourse.id, formData);
        toast.success('Course updated');
      } else {
        await coursesApi.createCourse(formData as any);
        toast.success('Course created');
      }
      loadInitialData();
      setShowModal(false);
    } catch (err: any) {
      toast.error('Failed to save');
      throw err;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Course Catalog | Presently Admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
           <p className="text-on-surface-variant font-medium">Academic inventory.</p>
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setShowModal(true); }}
          className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
        >
          <Plus size={24} weight="bold" />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <MagnifyingGlass size={20} weight="bold" />
          </div>
          <input 
            type="text"
            placeholder="Search title, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <select 
             value={selectedInstitution || ''} 
             onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
             className="px-4 py-2.5 bg-surface-container border border-outline rounded-full text-[10px] font-black uppercase tracking-widest outline-none"
           >
              <option value="">Institution</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.short_name}</option>)}
           </select>
           <select 
             value={selectedDepartment || ''} 
             onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : null)}
             disabled={!selectedCollege}
             className="px-4 py-2.5 bg-surface-container border border-outline rounded-full text-[10px] font-black uppercase tracking-widest outline-none disabled:opacity-50"
           >
              <option value="">Dept</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
           </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-36 bg-surface-container animate-pulse rounded-3xl" />)
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <motion.div 
              key={course.id}
              layout
              className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold">
                   <BookOpen size={28} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg leading-tight truncate">{course.title}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <Tag size={12} weight="bold" className="text-sungold" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-presently-black">{course.code}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">• {course.credit_units} Units</span>
                   </div>
                </div>
                <button className="p-2 text-on-surface-variant">
                   <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    <GraduationCap size={14} weight="duotone" />
                    <span className="truncate">{course.department_name}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                       <Users size={14} weight="duotone" />
                       {course.enrolled_students_count || 0} Enrolled
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => { setEditingCourse(course); setShowModal(true); }}
                         className="p-2.5 rounded-xl bg-surface-container border border-outline text-on-surface-variant active:scale-90 transition-all"
                       >
                          <Pencil size={18} weight="duotone" />
                       </button>
                       <button className="p-2.5 rounded-xl bg-error/5 border border-error/10 text-error active:scale-90 transition-all">
                          <Trash size={18} weight="duotone" />
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
             <BookOpen size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
             <p className="text-sm text-on-surface-variant font-medium">Course catalog is empty.</p>
          </div>
        )}
      </div>

      {showModal && (
        <CourseModal
          course={editingCourse || undefined}
          departments={departments}
          onSave={handleSaveCourse}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
