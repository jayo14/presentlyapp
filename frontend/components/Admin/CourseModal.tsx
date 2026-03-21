import React, { useState, useEffect } from 'react';
import { X, AlertCircle, BookOpen, Search } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Course, Department, College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

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
  
  const { modalRef, modalProps } = useModalAccessibility(true, onClose);
  
  // Hierarchical state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Course>>({
    department: course?.department || [],
    code: course?.code || '',
    title: course?.title || '',
    description: course?.description || '',
    lecturer: course?.lecturer || undefined,
    credit_units: course?.credit_units || 3,
    semester: course?.semester || '',
    level: course?.level || '',
    is_active: course?.is_active !== false,
  });

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Load institutions on mount
  useEffect(() => {
    loadInstitutions();
  }, []);

  // When editing a course, pre-select the hierarchy
  useEffect(() => {
    if (course && departments.length > 0) {
      const dept = departments.find(d => d.id === course.department);
      if (dept) {
        setSelectedInstitution(dept.institution || dept.institution_id);
        setSelectedCollege(dept.college || dept.college_id);
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

  const toggleDepartment = (deptId: number) => {
    const currentDepts = Array.isArray(formData.department) ? formData.department : (formData.department ? [formData.department] : []);
    const newDepts = currentDepts.includes(deptId)
      ? currentDepts.filter(id => id !== deptId)
      : [...currentDepts, deptId];
    
    setFormData(prev => ({
      ...prev,
      department: newDepts as any
    }));
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
    if (!formData.department || (Array.isArray(formData.department) && formData.department.length === 0)) {
      setError('At least one department is required');
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
    <div 
      className="fixed inset-0 bg-cardackgroundlack/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        {...modalProps}
        aria-labelledby="modal-title"
        className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 id="modal-title" className="text-xl font-bold text-foreground">
            {course ? 'Edit Course' : 'Create Course'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
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
            <p className="text-sm text-muted-foreground mb-4">
              Select the institutional hierarchy: Institution → College/Faculty → Department
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Institution *
                </label>
                <select
                  value={selectedInstitution || ''}
                  onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-full text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select Institution</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  College/Faculty
                </label>
                <select
                  value={selectedCollege || ''}
                  onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                  disabled={!selectedInstitution}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-full text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select College/Faculty (Optional)</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Select a college to filter departments
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Department *
                </label>
                
                {selectedInstitution ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search departments..."
                        value={deptSearchTerm}
                        onChange={(e) => setDeptSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto bg-card border border-border rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredDepartments
                        .filter(d => d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) || d.code.toLowerCase().includes(deptSearchTerm.toLowerCase()))
                        .map(dept => (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleDepartment(dept.id)}
                            className={`flex flex-col text-left px-3 py-2 rounded-lg text-sm transition-all border-border ${
                              Array.isArray(formData.department) && formData.department.includes(dept.id)
                                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                : 'bg-transparent border-zinc-800 text-muted-foreground hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                          >
                            <div className="font-bold truncate">{dept.name}</div>
                            <div className={`text-[10px] uppercase font-mono tracking-wider ${Array.isArray(formData.department) && formData.department.includes(dept.id) ? 'text-primary/80' : 'text-muted-foreground'}`}>
                              {dept.code}
                            </div>
                          </button>
                        ))
                      }
                      {filteredDepartments.length === 0 && (
                        <div className="col-span-full p-3 text-center text-xs text-muted-foreground italic">
                          No departments found
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-4 py-2 bg-accent/50 border border-border border-dashed rounded-lg text-muted-foreground text-sm italic">
                    Please select an institution first
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Level
                </label>
                <select
                  value={formData.level || ''}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-full text-foreground focus:outline-none focus:border-primary"
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Semester
                </label>
                <select
                  value={formData.semester || ''}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  className="w-full h-12 px-4 bg-accent border border-border rounded-full text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select Semester</option>
                  <option value="FIRST">First Semester</option>
                  <option value="SECOND">Second Semester</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the course"
                className="w-full px-4 py-2 bg-accent border border-border rounded-3xl text-foreground focus:outline-none focus:border-primary min-h-[100px]"
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
              className="w-4 h-4 rounded border-border bg-accent text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-muted-foreground">
              Course is active and available
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
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
