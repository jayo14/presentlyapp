import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, GraduationCap, Building, Mail, Phone, Globe, Calendar, Award } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Department, College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';

export const DepartmentFormPage: React.FC = () => {
  const { id, collegeId, deptId } = useParams<{ id: string; collegeId: string; deptId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    code: '',
    abbreviation: '',
    description: '',
    head_of_department_name: '',
    head_of_department_email: '',
    contact_email: '',
    contact_phone: '',
    office_location: '',
    website_url: '',
    established_year: new Date().getFullYear(),
    accreditation_status: 'PENDING',
    is_active: true,
  });

  useEffect(() => {
    if (collegeId) {
      loadCollege(Number(collegeId));
    }
    if (deptId && deptId !== 'new') {
      loadDepartment(Number(deptId));
    }
  }, [collegeId, deptId]);

  const loadCollege = async (cId: number) => {
    try {
      const data = await institutionsApi.getCollegeById(cId);
      setCollege(data);
    } catch (err) {
      console.error('Failed to load college', err);
    }
  };

  const loadDepartment = async (dId: number) => {
    try {
      setFetching(true);
      const data = await institutionsApi.getDepartmentById(dId);
      setFormData(data);
    } catch (err) {
      setError('Failed to load department details');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof Department, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (deptId && deptId !== 'new') {
        await institutionsApi.updateDepartment(Number(deptId), formData);
        toast.success('Department updated successfully');
      } else {
        await institutionsApi.createDepartment({
          ...formData,
          institution: Number(id),
          college: Number(collegeId),
        } as Omit<Department, 'id'>);
        toast.success('Department created successfully');
      }
      
      navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save department';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-input border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-textMuted animate-pulse">Loading department data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)}
          className="flex items-center gap-2 text-sm text-textMuted hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-primary">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold text-text">
                {deptId && deptId !== 'new' ? 'Edit Department' : 'New Department'}
              </h1>
              <p className="text-textMuted">{college?.name || 'College'}</p>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
             <Button variant="secondary" onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
             </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Basic Information Section */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline bg-background/50">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Department Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMuted mb-2">Department Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Computer Science"
                className="h-12 bg-background border-outline focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Department Code *</label>
              <Input
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., CSC"
                className="h-12 bg-background border-outline focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Abbreviation</label>
              <Input
                value={formData.abbreviation || ''}
                onChange={(e) => handleChange('abbreviation', e.target.value)}
                placeholder="Alternative abbreviation"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMuted mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the department"
                rows={3}
                className="w-full px-4 py-3 bg-background border border-outline rounded-3xl text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Established Year</label>
              <Input
                type="number"
                value={formData.established_year || ''}
                onChange={(e) => handleChange('established_year', parseInt(e.target.value))}
                placeholder="e.g., 1995"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Accreditation Status</label>
              <select
                value={formData.accreditation_status || ''}
                onChange={(e) => handleChange('accreditation_status', e.target.value)}
                className="w-full h-12 px-4 bg-background border border-outline rounded-full text-text focus:outline-none focus:border-primary transition-colors"
              >
                <option value="ACCREDITED">Fully Accredited</option>
                <option value="PROVISIONAL">Provisional</option>
                <option value="PENDING">Pending Review</option>
              </select>
            </div>
          </div>
        </section>

        {/* Administration & Contact */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline bg-background/50">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Leadership & Contact
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">HOD Name</label>
              <Input
                value={formData.head_of_department_name || ''}
                onChange={(e) => handleChange('head_of_department_name', e.target.value)}
                placeholder="e.g., Dr. Alan Turing"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">HOD Email</label>
              <Input
                type="email"
                value={formData.head_of_department_email || ''}
                onChange={(e) => handleChange('head_of_department_email', e.target.value)}
                placeholder="hod@example.edu"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Official Email</label>
              <Input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="dept@example.edu"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Contact Phone</label>
              <Input
                value={formData.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="+234..."
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMuted mb-2">Office Location</label>
              <Input
                value={formData.office_location || ''}
                onChange={(e) => handleChange('office_location', e.target.value)}
                placeholder="e.g., Block C, Room 101"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="bg-surface border border-outline rounded-2xl p-6">
           <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-primary' : 'bg-zinc-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="hidden"
              />
              <span className="text-sm font-bold text-textMuted group-hover:text-primary transition-colors">Active Status</span>
           </label>
        </section>

        {/* Mobile Action Buttons */}
        <div className="flex flex-col gap-3 md:hidden">
           <Button onClick={handleSubmit} disabled={loading} className="h-12 text-lg">
              {loading ? 'Saving...' : 'Save Department'}
           </Button>
           <Button variant="secondary" onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)} className="h-12 text-lg">Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentFormPage;
