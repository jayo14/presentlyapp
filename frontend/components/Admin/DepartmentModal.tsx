import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Department, Institution, College } from '../../types';

interface DepartmentModalProps {
  department?: Department;
  institutions: Institution[];
  colleges: College[];
  onSave: (data: Partial<Department>) => Promise<void>;
  onClose: () => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  department,
  institutions,
  colleges,
  onSave,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({
    institution_id: department?.institution_id || institutions[0]?.id || 0,
    college_id: department?.college_id || 0,
    name: department?.name || '',
    code: department?.code || '',
    abbreviation: department?.abbreviation || '',
    description: department?.description || '',
    head_of_department_name: department?.head_of_department_name || '',
    head_of_department_email: department?.head_of_department_email || '',
    contact_email: department?.contact_email || '',
    contact_phone: department?.contact_phone || '',
    office_location: department?.office_location || '',
    website_url: department?.website_url || '',
    established_year: department?.established_year || new Date().getFullYear(),
    accreditation_status: department?.accreditation_status || 'PENDING',
    is_active: department?.is_active !== false,
  });

  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);

  useEffect(() => {
    if (formData.institution_id) {
      const filtered = colleges.filter(c => c.institution_id === formData.institution_id);
      setFilteredColleges(filtered);
      if (filtered.length > 0 && !department) {
        setFormData(prev => ({ ...prev, college_id: filtered[0].id }));
      }
    }
  }, [formData.institution_id, colleges]);

  const handleChange = (field: keyof Department, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      setError('Department name is required');
      return;
    }
    if (!formData.code?.trim()) {
      setError('Department code is required');
      return;
    }
    if (!formData.institution_id) {
      setError('Institution is required');
      return;
    }
    if (!formData.college_id) {
      setError('College is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save department');
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
            {department ? 'Edit Department' : 'Create Department'}
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

          {/* Institutional Affiliation */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Institutional Affiliation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Institution *
                </label>
                <select
                  value={formData.institution_id}
                  onChange={(e) => handleChange('institution_id', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.short_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  College *
                </label>
                <select
                  value={formData.college_id}
                  onChange={(e) => handleChange('college_id', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  required
                  disabled={filteredColleges.length === 0}
                >
                  {filteredColleges.length > 0 ? (
                    filteredColleges.map(college => (
                      <option key={college.id} value={college.id}>{college.name}</option>
                    ))
                  ) : (
                    <option value="">No colleges available</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Department Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Code *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="e.g., CS"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Abbreviation *
                </label>
                <Input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => handleChange('abbreviation', e.target.value)}
                  placeholder="e.g., COMP SCI"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the department"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Head of Department
                </label>
                <Input
                  type="text"
                  value={formData.head_of_department_name}
                  onChange={(e) => handleChange('head_of_department_name', e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  HOD Email
                </label>
                <Input
                  type="email"
                  value={formData.head_of_department_email}
                  onChange={(e) => handleChange('head_of_department_email', e.target.value)}
                  placeholder="hod@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="dept@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Office Location
                </label>
                <Input
                  type="text"
                  value={formData.office_location}
                  onChange={(e) => handleChange('office_location', e.target.value)}
                  placeholder="e.g., Block A, Room 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Established Year
                </label>
                <Input
                  type="number"
                  value={formData.established_year}
                  onChange={(e) => handleChange('established_year', Number(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Accreditation Status
                </label>
                <select
                  value={formData.accreditation_status}
                  onChange={(e) => handleChange('accreditation_status', e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="ACCREDITED">Accredited</option>
                  <option value="PROVISIONAL">Provisional</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
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
              Department is active
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
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

export default DepartmentModal;
