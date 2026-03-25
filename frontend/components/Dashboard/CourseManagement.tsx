import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowLeft, Save, X, ChevronDown, BookOpen, Layers, MapPin, Users } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Course, Department, College, Institution } from '../../types';
import { coursesApi } from '../../services/api/courses';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';

interface CourseManagementProps {
  userInstitutionId?: number;
  userCollegeId?: number;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({ userInstitutionId, userCollegeId }) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form State
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Course>>({
    code: '',
    title: '',
    description: '',
    credit_units: 3,
    semester: '',
    level: '',
    is_active: true,
    department: [],
  });

  useEffect(() => {
    fetchCourses();
    loadInstitutions();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await coursesApi.getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutions = async () => {
    try {
      const data = await institutionsApi.getAllInstitutions();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load institutions', err);
    }
  };

  // Hierarchy Logic
  useEffect(() => {
    if (selectedInstitution) {
      loadColleges(selectedInstitution);
      loadDepartmentsByInstitution(selectedInstitution);
    } else {
      setColleges([]);
      setDepartments([]);
    }
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedCollege) {
      loadDepartmentsByCollege(selectedCollege);
    } else if (selectedInstitution) {
      loadDepartmentsByInstitution(selectedInstitution);
    }
  }, [selectedCollege]);

  const loadColleges = async (instId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(instId);
      setColleges(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const loadDepartmentsByCollege = async (collegeId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByCollege(collegeId);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const loadDepartmentsByInstitution = async (instId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByInstitution(instId);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      ...course,
      department: course.department || [] // Ensure it's an array
    });
    
    // Attempt to pre-select hierarchy based on the first department
    // Note: This requires fetching the department details to know its college/institution
    // For now, we'll try to use user props or defaults
    if (userInstitutionId) setSelectedInstitution(userInstitutionId);
    
    setView('edit');
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      credit_units: 3,
      semester: '',
      level: '',
      is_active: true,
      department: [],
    });
    if (userInstitutionId) setSelectedInstitution(userInstitutionId);
    if (userCollegeId) setSelectedCollege(userCollegeId);
    setView('create');
  };

  const toggleDepartment = (deptId: number) => {
    const currentDepts = Array.isArray(formData.department) ? formData.department : [];
    const newDepts = currentDepts.includes(deptId)
      ? currentDepts.filter(id => id !== deptId)
      : [...currentDepts, deptId];
    
    setFormData(prev => ({ ...prev, department: newDepts as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.code || !formData.department?.length) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (view === 'edit' && selectedCourse) {
        await coursesApi.updateCourse(selectedCourse.id, formData);
        toast.success('Course updated successfully');
      } else {
        await coursesApi.createCourse(formData as any);
        toast.success('Course created successfully');
      }
      
      fetchCourses();
      setView('list');
    } catch (err) {
      toast.error('Failed to save course');
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-text">Manage Courses</h2>
            <p className="text-textMuted">View and manage your assigned courses.</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus size={18} className="mr-2"/> Add New Course
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-textMuted">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="bg-surfaceLow border border-outline rounded-xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-textMuted mx-auto mb-4" />
            <h3 className="font-headline text-lg font-medium text-text">No courses found</h3>
            <p className="text-textMuted mt-1 mb-6">Get started by creating your first course.</p>
            <Button onClick={handleCreate} variant="secondary">Create Course</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-surface text-text border border-outline p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4 transition-all hover:border-primary/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold font-mono">
                      {course.code}
                    </span>
                    {course.semester && (
                        <span className="text-xs text-textMuted border border-outline px-2 py-0.5 rounded">
                            {course.semester} Semester
                        </span>
                    )}
                  </div>
                  <h3 className="font-headline text-lg font-bold text-text">{course.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-textMuted">
                    <span className="flex items-center gap-1.5">
                        <Layers size={14} /> {course.credit_units} Units
                    </span>
                    {course.level && (
                        <span className="flex items-center gap-1.5">
                            <BookOpen size={14} /> {course.level} Lvl
                        </span>
                    )}
                    {typeof course.enrolled_students_count === 'number' && (
                        <span className="flex items-center gap-1.5 text-primary font-medium">
                            <Users size={14} /> {course.enrolled_students_count} Enrolled
                        </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(course)} className="flex-1 sm:flex-none">
                    <Edit2 size={16} className="mr-2" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Create/Edit View
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setView('list')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="font-headline text-2xl font-bold text-text">
            {view === 'create' ? 'Create New Course' : 'Edit Course'}
          </h2>
          <p className="text-textMuted">
            {view === 'create' ? 'Add a new course to your curriculum.' : `Editing ${selectedCourse?.code}`}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
            <form id="course-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Hierarchy Section */}
                <div className="bg-surface text-text border border-outline rounded-xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-outline pb-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h3 className="font-headline font-semibold text-text">Location in Hierarchy</h3>
                            <p className="text-xs text-textMuted">Select the institutional hierarchy</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Institution <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={selectedInstitution || ''}
                                    onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                                    required
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">College / Faculty</label>
                            <div className="relative">
                                <select
                                    value={selectedCollege || ''}
                                    onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none disabled:opacity-50"
                                    disabled={!selectedInstitution}
                                >
                                    <option value="">Select College (Optional)</option>
                                    {colleges.map(col => (
                                        <option key={col.id} value={col.id}>{col.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                            </div>
                            <p className="text-xs text-textMuted mt-1">Optional: Select a college to filter departments</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Department <span className="text-red-500">*</span></label>
                            {selectedInstitution ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search departments..."
                                            value={deptSearchTerm}
                                            onChange={(e) => setDeptSearchTerm(e.target.value)}
                                            className="w-full bg-surfaceLow border border-outline rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {departments
                                            .filter(d => d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) || d.code.toLowerCase().includes(deptSearchTerm.toLowerCase()))
                                            .map(dept => {
                                                const isSelected = Array.isArray(formData.department) && formData.department.includes(dept.id);
                                                return (
                                                    <button
                                                        key={dept.id}
                                                        type="button"
                                                        onClick={() => toggleDepartment(dept.id)}
                                                        className={`text-left p-3 rounded-lg border text-sm transition-all ${
                                                            isSelected 
                                                            ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                                            : 'bg-muted border-border text-muted-foreground hover:border-border dark:hover:border-border'
                                                        }`}
                                                    >
                                                        <div className="font-semibold truncate">{dept.name}</div>
                                                        <div className="text-xs opacity-70 font-mono">{dept.code}</div>
                                                    </button>
                                                );
                                            })
                                        }
                                        {departments.length === 0 && (
                                            <div className="col-span-full text-center py-4 text-textMuted text-sm italic">
                                                No departments found.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-textMuted">Select one or more departments.</p>
                                </div>
                            ) : (
                                <div className="bg-surfaceLow border border-dashed border-outline rounded-lg p-6 text-center text-textMuted text-sm">
                                    Please select an institution first to view departments.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Course Details Section */}
                <div className="bg-surface text-text border border-outline rounded-xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-outline pb-4">
                        <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 className="font-headline font-semibold text-text">Course Details</h3>
                            <p className="text-xs text-textMuted">Basic information about the course</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Course Title <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. Introduction to Computer Science"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Course Code <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                placeholder="e.g. CSC 101"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Credit Units</label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.credit_units}
                                onChange={(e) => setFormData({...formData, credit_units: parseInt(e.target.value)})}
                                placeholder="3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Level</label>
                            <div className="relative">
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                                    className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Select Level</option>
                                    <option value="100">100 Level</option>
                                    <option value="200">200 Level</option>
                                    <option value="300">300 Level</option>
                                    <option value="400">400 Level</option>
                                    <option value="500">500 Level</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Semester</label>
                            <div className="relative">
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                                    className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Select Semester</option>
                                    <option value="FIRST">First Semester</option>
                                    <option value="SECOND">Second Semester</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Description</label>
                            <textarea
                                className="w-full bg-surfaceLow border border-outline rounded-lg p-3 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]"
                                placeholder="Enter course description..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>

        {/* Right Column: Actions & Summary */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface text-text border border-outline rounded-xl p-6 shadow-sm sticky top-6">
                <h3 className="font-headline font-semibold text-text mb-4">Publish Course</h3>
                
                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 bg-surfaceLow rounded-lg border border-outline">
                        <span className="text-sm font-medium text-textMuted">Status</span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={formData.is_active} 
                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                            />
                            <span className={`text-xs font-bold ${formData.is_active ? 'text-green-500' : 'text-muted-foreground'}`}>
                                {formData.is_active ? 'ACTIVE' : 'DRAFT'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button type="submit" form="course-form" className="w-full justify-center">
                        <Save size={18} className="mr-2" />
                        {view === 'create' ? 'Create Course' : 'Save Changes'}
                    </Button>
                    <Button variant="secondary" className="w-full justify-center" onClick={() => setView('list')}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
