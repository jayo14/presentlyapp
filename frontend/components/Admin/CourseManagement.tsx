import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Course, Institution, College, Department } from '../../types';
import { coursesApi, institutionApi, collegeApi, departmentApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { CourseModal } from './CourseModal';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadColleges(selectedInstitution);
      setSelectedCollege(null);
      setSelectedDepartment(null);
    }
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedCollege) {
      loadDepartments(selectedCollege);
      setSelectedDepartment(null);
    }
  }, [selectedCollege]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instRes] = await Promise.all([
        institutionApi.getAll(),
        loadCourses()
      ]);
      setInstitutions(instRes);
    } catch (err) {
      setError('Failed to load initial data');
      toast.error('Load failed');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await coursesApi.getAll();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
    }
  };

  const loadColleges = async (instId: number) => {
    try {
      const data = await collegeApi.getByInstitution(instId);
      setColleges(data);
    } catch (err) {
      toast.error('Failed to load colleges');
    }
  };

  const loadDepartments = async (collegeId: number) => {
    try {
      const data = await departmentApi.getByCollege(collegeId);
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDepartment || course.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleSaveCourse = async (formData: Partial<Course>) => {
    try {
      if (editingCourse) {
        await coursesApi.updateCourse(editingCourse.id, formData);
        toast.success('Course updated successfully');
      } else {
        await coursesApi.createCourse(formData as Omit<Course, 'id' | 'created_at' | 'updated_at' | 'department_name'>);
        toast.success('Course created successfully');
      }
      loadCourses();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save course');
      throw err;
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await coursesApi.deleteCourse(id);
      toast.success('Course deleted');
      loadCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  return (
    <DashboardPage
      title="Curriculum Catalog"
      description="Manage the registry of courses and academic subjects across all departments."
      seoTitle="Course Management | Admin"
      action={
        <Button size="lg" className="shadow-gold" onClick={handleCreateCourse}>
          <Plus size={24} className="mr-2" />
          Create Course
        </Button>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        {error && (
          <div className="p-6 bg-soft-coral/10 border border-soft-coral/30 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-soft-coral mt-0.5" />
            <div>
              <p className="text-soft-coral font-bold uppercase tracking-widest text-xs mb-1">System Error</p>
              <p className="text-presently-black font-medium">{error}</p>
            </div>
          </div>
        )}

        <ModernCard padding="lg" className="bg-warm-ivory/10 border-outline/40">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Institution</label>
                 <select
                   value={selectedInstitution || ''}
                   onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                   className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none appearance-none cursor-pointer"
                 >
                   <option value="">All Institutions</option>
                   {institutions.map(inst => (
                     <option key={inst.id} value={inst.id}>{inst.short_name}</option>
                   ))}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">College/Faculty</label>
                 <select
                   value={selectedCollege || ''}
                   onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                   disabled={!selectedInstitution}
                   className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none appearance-none disabled:opacity-40 cursor-pointer"
                 >
                   <option value="">All Colleges</option>
                   {colleges.map(college => (
                     <option key={college.id} value={college.id}>{college.name}</option>
                   ))}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Department</label>
                 <select
                   value={selectedDepartment || ''}
                   onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : null)}
                   disabled={!selectedCollege}
                   className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none appearance-none disabled:opacity-40 cursor-pointer"
                 >
                   <option value="">All Departments</option>
                   {departments.map(dept => (
                     <option key={dept.id} value={dept.id}>{dept.name}</option>
                   ))}
                 </select>
              </div>
           </div>
        </ModernCard>

        <div className="relative max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={20} />
          <input
            type="text"
            placeholder="Search by course name or code (e.g. CSC402)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-bold text-sm focus:ring-4 focus:ring-sungold/10 outline-none transition-all shadow-sm"
          />
        </div>

        <ResponsiveGrid columns={3} gap={32}>
          {loading && courses.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
          ) : (
            filteredCourses.map(course => (
              <ModernCard
                key={course.id}
                padding="lg"
                className="group hover:border-sungold/40 transition-all flex flex-col justify-between h-full border border-outline/30"
              >
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-[30%] bg-warm-ivory border border-outline flex items-center justify-center text-sungold shadow-sm">
                      <BookOpen size={28} weight="bold" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-3 hover:bg-surface-highest/40 rounded-xl border border-outline text-on-surface-variant transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-3 hover:bg-soft-coral/10 rounded-xl border border-outline text-soft-coral transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                       <Badge variant="secondary" className="font-bold tracking-[0.2em]">{course.code}</Badge>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-presently-black leading-tight mb-3">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} weight="bold" className="text-sungold" />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{course.department_name}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline/40 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Enrollment</span>
                        <span className="text-sm font-bold text-presently-black tabular-nums">0 Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </ResponsiveGrid>

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-32 bg-surface-highest/20 rounded-[3rem] border-2 border-dashed border-outline/40">
            <BookOpen className="w-24 h-24 text-outline mx-auto mb-6 opacity-20" />
            <h4 className="font-display text-3xl font-bold text-presently-black">No Courses</h4>
            <p className="text-on-surface-variant font-medium mt-3 max-w-sm mx-auto">Define the academic curriculum to begin tracking attendance.</p>
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
    </DashboardPage>
  );
};

export default CourseManagement;
