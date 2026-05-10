import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, GraduationCap, Users, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Course, Institution, College, Department } from '../../types';
import { coursesApi, institutionApi, collegeApi, departmentApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { CourseModal } from './CourseModal';

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

  useEffect(() => {
    if (selectedDepartment) {
      loadCoursesByDepartment(selectedDepartment);
    } else {
      loadCourses();
    }
  }, [selectedDepartment]);

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

  const loadCoursesByDepartment = async (deptId: number) => {
    try {
      setLoading(true);
      const data = await coursesApi.getByDepartment(deptId);
      setCourses(data);
    } catch (err) {
      toast.error('Failed to load department courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        toast.success('Course updated');
      } else {
        await coursesApi.createCourse(formData as Omit<Course, 'id' | 'created_at' | 'updated_at' | 'department_name' | 'lecturer_name'>);
        toast.success('Course created');
      }

      if (selectedDepartment) {
        loadCoursesByDepartment(selectedDepartment);
      } else {
        loadCourses();
      }
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
      toast.success('Course removed');
      if (selectedDepartment) {
        loadCoursesByDepartment(selectedDepartment);
      } else {
        loadCourses();
      }
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const resetFilters = () => {
    setSelectedInstitution(null);
    setSelectedCollege(null);
    setSelectedDepartment(null);
    loadCourses();
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="Course Catalog | Presently Admin" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">ACADEMIC INVENTORY</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Course Catalog
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Manage curricula and student enrollments across institutions.
           </p>
        </div>
        <Button size="lg" className="h-16 px-10 shadow-gold" onClick={handleCreateCourse}>
          <Plus size={24} className="mr-2" />
          Add Course
        </Button>
      </header>

      {error && (
        <div className="p-6 bg-soft-coral/10 border border-soft-coral/30 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-soft-coral mt-0.5" />
          <div>
            <p className="text-soft-coral font-bold uppercase tracking-widest text-xs mb-1">System Error</p>
            <p className="text-presently-black font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Hierarchical Filters */}
      <ModernCard padding="lg" className="bg-warm-ivory/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-presently-black">Hierarchy Filter</h3>
          {(selectedInstitution || selectedCollege || selectedDepartment) && (
            <button onClick={resetFilters} className="text-xs font-bold text-sungold hover:underline uppercase tracking-widest">
              Reset All Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Institution</label>
            <select
              value={selectedInstitution || ''}
              onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
              className="w-full h-14 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.short_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">College/Faculty</label>
            <select
              value={selectedCollege || ''}
              onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedInstitution}
              className="w-full h-14 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none disabled:opacity-50"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>{college.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Department</label>
            <select
              value={selectedDepartment || ''}
              onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedCollege}
              className="w-full h-14 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none disabled:opacity-50"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </ModernCard>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder="Search by title, code, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-medium focus:ring-2 focus:ring-sungold/20 outline-none"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && courses.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
          ))
        ) : (
          filteredCourses.map(course => (
            <ModernCard
              key={course.id}
              padding="lg"
              className="group hover:border-sungold/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 hover:bg-slate-50 rounded-xl border border-outline text-on-surface-variant"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 hover:bg-red-50 rounded-xl border border-outline text-soft-coral"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-presently-black leading-tight mb-1">{course.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] py-0">{course.code}</Badge>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{course.credit_units} UNITS</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-outline">
                  {course.department_name && (
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <GraduationCap size={16} className="text-sungold" />
                      <span className="text-xs font-bold uppercase tracking-wider line-clamp-1">{course.department_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Users size={16} className="text-sungold" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {course.enrolled_students_count || 0} ENROLLED
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={cn("w-2 h-2 rounded-full", course.is_active ? "bg-moss-green" : "bg-slate-300")} />
                   <span className="text-[10px] font-bold text-presently-black uppercase tracking-[0.2em]">
                     {course.is_active ? 'ACTIVE' : 'DORMANT'}
                   </span>
                </div>
                {course.level && (
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">LEVEL {course.level}</span>
                )}
              </div>
            </ModernCard>
          ))
        )}
      </div>

      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-outline">
          <BookOpen className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h4 className="font-display text-2xl font-bold text-presently-black">No Courses Found</h4>
          <p className="text-on-surface-variant font-medium mt-2">Try adjusting your filters or create a new course.</p>
        </div>
      )}

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

export default CourseManagement;
