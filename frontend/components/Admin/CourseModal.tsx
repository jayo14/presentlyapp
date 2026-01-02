import React, { useState, useEffect } from 'react';
import { X, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Course, Department, College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';

interface CourseModalProps {
  course?: Course;
  departments: Department[];
  onSave: (data: Partial<Course>) => Promise<void>;
  onClose: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  course,
  departments,
  onSave,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hierarchical state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Course>>({
    department: course?.department || undefined,
    code: course?.code || '',
    title: course?.title || '',
    description: course?.description || '',
    lecturer: course?.lecturer || undefined,
    credit_units: course?.credit_units || 3,
    semester: course?.semester || '',
    level: course?.level || '',
    is_active: course?.is_active !== false,
  });

  // Load institutions on mount
  useEffect(() => {
    loadInstitutions();
  }, []);

  // When editing a course, pre-select the hierarchy
  useEffect(() => {
    if (course && departments.length > 0) {
      const dept = departments.find(d => d.id === course.department);
      if (dept) {
        setSelectedInstitution(dept.institution_id);
        setSelectedCollege(dept.college_id);
      }
    }
  }, [course, departments]);

  // Load colleges when institution changes
  useEffect(() => {
    if (selectedInstitution) {
      loadColleges(selectedInstitution);
      // Reset downstream selections
      setSelectedCollege(null);
      if (!course) { // Only clear department if not editing
        setFormData(prev => ({ ...prev, department: undefined }));
      }
    } else {
      setColleges([]);
      setSelectedCollege(null);
      setFilteredDepartments([]);
      if (!course) {
        setFormData(prev => ({ ...prev, department: undefined }));
      }
    }
  }, [selectedInstitution]);

  // Load departments when college changes
  useEffect(() => {
    if (selectedCollege) {
      loadDepartmentsByCollege(selectedCollege);
      if (!course) { // Only clear department if not editing
        setFormData(prev => ({ ...prev, department: undefined }));
      }
    } else if (selectedInstitution) {
      // If institution is selected but no college, show all departments for that institution
      loadDepartmentsByInstitution(selectedInstitution);
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedCollege, selectedInstitution]);

  const loadInstitutions = async () => {
    try {
      const data = await institutionsApi.getAllInstitutions();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load institutions', err);
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

  const loadDepartmentsByCollege = async (collegeId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByCollege(collegeId);
      setFilteredDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
      setFilteredDepartments([]);
    }
  };

  const loadDepartmentsByInstitution = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByInstitution(institutionId);
      setFilteredDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
      setFilteredDepartments([]);
    }
  };

  const handleChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title?.trim()) {
      setError('Course title is required');
      return;
    }
    if (!formData.code?.trim()) {
      setError('Course code is required');
      return;
    }
    if (!formData.department) {
      setError('Department is required');
      return;
    }
    if (!formData.credit_units || formData.credit_units < 1) {
      setError('Credit units must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-xl font-bold text-foreground">
            {course ? 'Edit Course' : 'Create Course'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Hierarchical Selection */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Location in Hierarchy</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Select the institutional hierarchy: Institution → College/Faculty → Department
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Institution *
                </label>
                <select
                  value={selectedInstitution || ''}
                  onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select Institution</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.full_name}</option>
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
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select College/Faculty (Optional)</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  Optional: Select a college to filter departments
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Department *
                </label>
                <select
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value ? Number(e.target.value) : undefined)}
                  disabled={!selectedInstitution}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Department</option>
                  {filteredDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {!selectedInstitution && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Please select an institution first
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Course Code *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="e.g., CSC 301"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Credit Units *
                </label>
                <Input
                  type="number"
                  value={formData.credit_units}
                  onChange={(e) => handleChange('credit_units', Number(e.target.value))}
                  placeholder="3"
                  min="1"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Course Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Data Structures and Algorithms"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Level
                </label>
                <select
                  value={formData.level || ''}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select Level</option>
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="600">600 Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Semester
                </label>
                <select
                  value={formData.semester || ''}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select Semester</option>
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                  <option value="Both Semesters">Both Semesters</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the course"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary min-h-[100px]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-zinc-400">
              Course is active and available
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
