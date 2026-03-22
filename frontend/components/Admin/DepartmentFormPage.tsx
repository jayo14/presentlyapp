import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, GraduationCap, Building, Mail, Phone, Globe, Calendar, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Department, College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';

interface ValidationErrors {
  name?: string;
  code?: string;
  abbreviation?: string;
  head_of_department_email?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
}

export const DepartmentFormPage: React.FC = () => {
  const { id, collegeId, deptId } = useParams<{ id: string; collegeId: string; deptId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
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

  // Real-time validation function
  const validateField = (field: keyof Department, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) return 'Department name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        if (value.trim().length > 200) return 'Name must be less than 200 characters';
        break;
      
      case 'code':
        if (!value || !value.trim()) return 'Department code is required';
        if (!/^[A-Z0-9]{2,10}$/.test(value)) return 'Code must be 2-10 uppercase letters/numbers';
        break;
      
      case 'abbreviation':
        if (value && value.trim()) {
          if (value.trim().length < 2) return 'Abbreviation must be at least 2 characters';
          if (value.trim().length > 20) return 'Abbreviation must be less than 20 characters';
        }
        break;
      
      case 'head_of_department_email':
      case 'contact_email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Invalid email format';
        }
        break;
      
      case 'contact_phone':
        if (value && value.trim()) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) return 'Invalid phone format';
          if (value.replace(/\D/g, '').length < 10) return 'Phone must be at least 10 digits';
        }
        break;
      
      case 'website_url':
        if (value && value.trim()) {
          try {
            new URL(value);
          } catch {
            return 'Invalid URL format';
          }
        }
        break;
    }
    return undefined;
  };

  const handleChange = (field: keyof Department, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof ValidationErrors): string | undefined => {
    return touched[field] ? validationErrors[field] : undefined;
  };

  const isFormValid = (): boolean => {
    const errors = {
      name: validateField('name', formData.name),
      code: validateField('code', formData.code),
      abbreviation: validateField('abbreviation', formData.abbreviation),
      head_of_department_email: validateField('head_of_department_email', formData.head_of_department_email),
      contact_email: validateField('contact_email', formData.contact_email),
      contact_phone: validateField('contact_phone', formData.contact_phone),
      website_url: validateField('website_url', formData.website_url),
    };

    setValidationErrors(errors);
    setTouched({
      name: true,
      code: true,
      abbreviation: true,
      head_of_department_email: true,
      contact_email: true,
      contact_phone: true,
      website_url: true,
    });

    return !Object.values(errors).some(err => err !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fix all validation errors before submitting');
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-textMuted font-medium animate-pulse">Loading department data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surfaceLow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)}
            className="flex items-center gap-2 text-sm font-medium text-textMuted hover:text-primary transition-colors w-fit group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Departments
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primaryContainer/20 editorial-shadow flex items-center justify-center shrink-0">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-text">
                  {deptId && deptId !== 'new' ? 'Edit Department' : 'Create Department'}
                </h1>
                <p className="text-textMuted mt-1">{college?.name || 'Loading...'}</p>
              </div>
            </div>
            <div className="hidden sm:flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)}
                className="border-outline hover:bg-surfaceHigh"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="bg-primary text-on-primary-fixed hover:opacity-90 gap-2 font-semibold"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-500 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <section className="glass-panel border border-outline/20 rounded-2xl overflow-hidden editorial-shadow">
            <div className="px-6 py-5 border-b border-outline bg-surfaceContainer">
              <h3 className="font-headline font-bold text-text flex items-center gap-2.5">
                <Building className="w-5 h-5 text-primary" />
                Department Details
              </h3>
              <p className="text-xs text-textMuted mt-1">Core information about the department</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-1">
                  Department Name
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g., Computer Science"
                    className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('name') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('name') && touched.name && formData.name ? 'border-green-500' : ''}`}
                    required
                  />
                  {!getFieldError('name') && touched.name && formData.name && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('name') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('name') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('name')}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-1">
                  Department Code
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('code')}
                    placeholder="e.g., CSC"
                    className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('code') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('code') && touched.code && formData.code ? 'border-green-500' : ''}`}
                    required
                  />
                  {!getFieldError('code') && touched.code && formData.code && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('code') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('code') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('code')}
                  </p>
                )}
                <p className="text-xs text-textMuted mt-1.5">2-10 uppercase letters/numbers</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Abbreviation
                </label>
                <div className="relative">
                  <Input
                    value={formData.abbreviation || ''}
                    onChange={(e) => handleChange('abbreviation', e.target.value)}
                    onBlur={() => handleBlur('abbreviation')}
                    placeholder="e.g., COMP SCI"
                    className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('abbreviation') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('abbreviation') && touched.abbreviation && formData.abbreviation ? 'border-green-500' : ''}`}
                  />
                  {!getFieldError('abbreviation') && touched.abbreviation && formData.abbreviation && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('abbreviation') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('abbreviation') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('abbreviation')}
                  </p>
                )}
                <p className="text-xs text-textMuted mt-1.5">Alternative short form (optional)</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the department's focus and programs"
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border border-outline rounded-2xl text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Established Year
                </label>
                <Input
                  type="number"
                  value={formData.established_year || ''}
                  onChange={(e) => handleChange('established_year', parseInt(e.target.value))}
                  placeholder="e.g., 1995"
                  min="1800"
                  max={new Date().getFullYear() + 5}
                  className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  <Award className="w-4 h-4 inline mr-1" />
                  Accreditation Status
                </label>
                <select
                  value={formData.accreditation_status || ''}
                  onChange={(e) => handleChange('accreditation_status', e.target.value)}
                  className="w-full h-12 px-4 bg-white dark:bg-surfaceLow text-text border border-outline rounded-xl focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="ACCREDITED">✓ Fully Accredited</option>
                  <option value="PROVISIONAL">⏳ Provisional</option>
                  <option value="PENDING">📋 Pending Review</option>
                </select>
              </div>
            </div>
          </section>

          {/* Administration & Contact */}
          <section className="glass-panel border border-outline/20 rounded-2xl overflow-hidden editorial-shadow">
            <div className="px-6 py-5 border-b border-outline bg-surfaceContainer">
              <h3 className="font-headline font-bold text-text flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-primary" />
                Leadership & Contact
              </h3>
              <p className="text-xs text-textMuted mt-1">Department head and contact information</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">HOD Name</label>
                <Input
                  value={formData.head_of_department_name || ''}
                  onChange={(e) => handleChange('head_of_department_name', e.target.value)}
                  placeholder="e.g., Dr. Alan Turing"
                  className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2">HOD Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <Input
                    type="email"
                    value={formData.head_of_department_email || ''}
                    onChange={(e) => handleChange('head_of_department_email', e.target.value)}
                    onBlur={() => handleBlur('head_of_department_email')}
                    placeholder="hod@example.edu"
                    className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('head_of_department_email') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('head_of_department_email') && touched.head_of_department_email && formData.head_of_department_email ? 'border-green-500' : ''}`}
                  />
                  {!getFieldError('head_of_department_email') && touched.head_of_department_email && formData.head_of_department_email && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('head_of_department_email') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('head_of_department_email') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('head_of_department_email')}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <Input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    onBlur={() => handleBlur('contact_email')}
                    placeholder="dept@example.edu"
                    className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('contact_email') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('contact_email') && touched.contact_email && formData.contact_email ? 'border-green-500' : ''}`}
                  />
                  {!getFieldError('contact_email') && touched.contact_email && formData.contact_email && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('contact_email') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('contact_email') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('contact_email')}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <Input
                    value={formData.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    onBlur={() => handleBlur('contact_phone')}
                    placeholder="+234 800 000 0000"
                    className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('contact_phone') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('contact_phone') && touched.contact_phone && formData.contact_phone ? 'border-green-500' : ''}`}
                  />
                  {!getFieldError('contact_phone') && touched.contact_phone && formData.contact_phone && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('contact_phone') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('contact_phone') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('contact_phone')}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text mb-2">Office Location</label>
                <Input
                  value={formData.office_location || ''}
                  onChange={(e) => handleChange('office_location', e.target.value)}
                  placeholder="e.g., Block C, Room 101"
                  className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text mb-2">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <Input
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    onBlur={() => handleBlur('website_url')}
                    placeholder="https://dept.university.edu"
                    className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary transition-all ${
                      getFieldError('website_url') ? 'border-red-500 focus:border-red-500' : ''
                    } ${!getFieldError('website_url') && touched.website_url && formData.website_url ? 'border-green-500' : ''}`}
                  />
                  {!getFieldError('website_url') && touched.website_url && formData.website_url && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {getFieldError('website_url') && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {getFieldError('website_url') && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('website_url')}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="glass-panel border border-outline/20 rounded-2xl editorial-shadow p-6">
             <label className="flex items-center gap-4 cursor-pointer group">
               <div className={`relative w-12 h-7 rounded-full p-1 transition-all duration-300 ${formData.is_active ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-surfaceHigh'}`}>
                 <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
               </div>
               <input
                 type="checkbox"
                 checked={formData.is_active}
                 onChange={(e) => handleChange('is_active', e.target.checked)}
                 className="hidden"
               />
               <div>
                 <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Active Status</span>
                 <p className="text-xs text-textMuted">Department is {formData.is_active ? 'active and' : 'inactive and'} visible to users</p>
               </div>
             </label>
          </section>

          {/* Mobile Action Buttons */}
          <div className="flex flex-col gap-3 sm:hidden sticky bottom-4 bg-white dark:bg-surfaceLow/95 backdrop-blur-lg p-4 -mx-4 border-t border-outline rounded-t-2xl shadow-2xl">
             <Button 
               onClick={handleSubmit} 
               disabled={loading} 
               className="h-14 text-lg bg-primary text-on-primary-fixed hover:opacity-90 font-semibold"
             >
               {loading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save className="w-5 h-5" />
                   Save Department
                 </>
               )}
             </Button>
             <Button 
               variant="outline" 
               onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)} 
               className="h-14 text-lg border-outline"
             >
               Cancel
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentFormPage;
