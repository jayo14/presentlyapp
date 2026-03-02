import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, Building2, GraduationCap, AlertCircle, Loader, ArrowLeft, Users } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Course, Department, College, Institution } from '../../types';
import { coursesApi } from '../../services/api/courses';
import { institutionsApi } from '../../services/api/institutions';
import CourseModal from './CourseModal';
import { SEO } from '../SEO';

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [institutionsData, coursesData, departmentsData] = await Promise.all([
        institutionsApi.getAllInstitutions(),
        coursesApi.getAllCourses(),
        institutionsApi.getAllDepartments()
      ]);
      setInstitutions(Array.isArray(institutionsData) ? institutionsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCoursesByDepartment = async (departmentId: number) => {
    try {
      setLoading(true);
      const data = await coursesApi.getCoursesByDepartment(departmentId);
      setCourses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      setColleges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load colleges', err);
    }
  };

  const loadDepartments = async (collegeId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByCollege(collegeId);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const filteredCourses = Array.isArray(courses) ? courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
      } else {
        await coursesApi.createCourse(formData as Omit<Course, 'id' | 'created_at' | 'updated_at' | 'department_name' | 'lecturer_name'>);
      }
      if (selectedDepartment) {
        await loadCoursesByDepartment(selectedDepartment);
      } else {
        await loadCourses();
      }
      setShowModal(false);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await coursesApi.deleteCourse(id);
      if (selectedDepartment) {
        await loadCoursesByDepartment(selectedDepartment);
      } else {
        await loadCourses();
      }
    } catch (err) {
      setError('Failed to delete course');
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSelectedInstitution(null);
    setSelectedCollege(null);
    setSelectedDepartment(null);
    loadCourses();
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Courses | Admin | Presently" description="Manage courses offered across departments and institutions." />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Course Management</h2>
            <p className="text-sm text-zinc-400">Manage courses across institutions</p>
          </div>
        </div>
        <Button onClick={handleCreateCourse} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-500 font-semibold">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Hierarchical Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Filter by Hierarchy</h3>
          {(selectedInstitution || selectedCollege || selectedDepartment) && (
            <button
              onClick={resetFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Institution
            </label>
            <select
              value={selectedInstitution || ''}
              onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.short_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              College/Faculty
            </label>
            <select
              value={selectedCollege || ''}
              onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedInstitution}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>{college.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment || ''}
              onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedCollege}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search courses by title, code, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{course.title}</h3>
                  <p className="text-xs text-zinc-400">{course.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Edit course"
                >
                  <Edit2 className="w-4 h-4 text-zinc-400" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Delete course"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {course.department_name && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <GraduationCap className="w-4 h-4" />
                  <span>{course.department_name}</span>
                </div>
              )}

              {course.lecturer_name && (
                <div className="text-zinc-400">
                  Lecturer: {course.lecturer_name}
                </div>
              )}

              {typeof course.enrolled_students_count === 'number' && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled_students_count} Student{course.enrolled_students_count !== 1 ? 's' : ''} Enrolled</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="text-zinc-400">
                  {course.credit_units} Credit{course.credit_units !== 1 ? 's' : ''}
                </div>
                {course.level && (
                  <div className="text-zinc-400">
                    Level {course.level}
                  </div>
                )}
              </div>

              {course.semester && (
                <div className="text-zinc-500 text-xs">
                  Semester: {course.semester}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  course.is_active 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No courses found</p>
          <p className="text-zinc-500 text-sm mt-1">Create your first course to get started</p>
        </div>
      )}

      {/* Course Modal */}
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
