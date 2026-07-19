import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Building2, Globe, Mail, Phone, Calendar, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';

interface ValidationErrors {
  full_name?: string;
  short_name?: string;
  country?: string;
  city?: string;
  address?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
}

export const InstitutionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState<Partial<Institution>>({
    full_name: '',
    short_name: '',
    abbreviation: '',
    country: '',
    state_province: '',
    city: '',
    address: '',
    postal_code: '',
    institution_type: 'UNIVERSITY',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    established_year: new Date().getFullYear(),
    accreditation_status: 'ACCREDITED',
    is_active: true,
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadInstitution(Number(id));
    }
  }, [id]);

  const loadInstitution = async (instId: number) => {
    try {
      setFetching(true);
      const data = await institutionsApi.getAllInstitutions(); // We need a getById ideally
      const inst = (data as any).results?.find((i: Institution) => i.id === instId) || data.find((i: Institution) => i.id === instId);
      
      if (inst) {
        setFormData({
          ...inst,
        });
      } else {
        setError('Institution not found');
      }
    } catch (err) {
      setError('Failed to load institution details');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof Institution, value: any) => {
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

  const handleBlur = (field: keyof Institution) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Real-time validation function
  const validateField = (field: keyof Institution, value: any): string | undefined => {
    switch (field) {
      case 'full_name':
        if (!value || !value.trim()) return 'Institution name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        if (value.trim().length > 255) return 'Name must be less than 255 characters';
        break;
      
      case 'short_name':
        if (!value || !value.trim()) return 'Display name is required';
        if (value.trim().length < 2) return 'Display name must be at least 2 characters';
        break;
      
      case 'country':
        if (!value || !value.trim()) return 'Country is required';
        break;
      
      case 'city':
        if (!value || !value.trim()) return 'City is required';
        break;
      
      case 'address':
        if (!value || !value.trim()) return 'Address is required';
        if (value.trim().length < 5) return 'Address must be at least 5 characters';
        break;
      
      case 'website_url':
        if (value && value.trim()) {
          try {
            new URL(value);
          } catch {
            return 'Please enter a valid URL';
          }
        }
        break;
      
      case 'contact_email':
        if (value && value.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
          }
        }
        break;
      
      case 'contact_phone':
        if (value && value.trim()) {
          const digitsOnly = value.replace(/\D/g, '');
          if (digitsOnly.length < 10) {
            return 'Phone number must be at least 10 digits';
          }
        }
        break;
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const errors: ValidationErrors = {};
    errors.full_name = validateField('full_name', formData.full_name);
    errors.short_name = validateField('short_name', formData.short_name);
    errors.country = validateField('country', formData.country);
    errors.city = validateField('city', formData.city);
    errors.address = validateField('address', formData.address);
    errors.website_url = validateField('website_url', formData.website_url);
    errors.contact_email = validateField('contact_email', formData.contact_email);
    errors.contact_phone = validateField('contact_phone', formData.contact_phone);
    
    // Filter out undefined errors
    const hasErrors = Object.values(errors).some(error => error !== undefined);
    
    if (hasErrors) {
      setValidationErrors(errors);
      setTouched({
        full_name: true,
        short_name: true,
        country: true,
        city: true,
        address: true,
        website_url: true,
        contact_email: true,
        contact_phone: true,
      });
      toast.error('Please fix all validation errors');
      return;
    }
    
    if (!formData.full_name?.trim()) {
      toast.error('Institution name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (id && id !== 'new') {
        await institutionsApi.updateInstitution(Number(id), formData);
        toast.success('Institution updated successfully');
      } else {
        await institutionsApi.createInstitution(formData as Omit<Institution, 'id'>);
        toast.success('Institution created successfully');
      }
      
      navigate('/dashboard/institutions');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save institution';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-textMuted animate-pulse">Loading institution data...</p>
      </div>
    );
  }

  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/dashboard/institutions')}
          className="flex items-center gap-2 text-sm text-textMuted hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Institutions
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primaryContainer/20 editorial-shadow flex items-center justify-center text-primary">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold text-text">
                {id && id !== 'new' ? 'Edit Institution' : 'New Institution'}
              </h1>
              <p className="text-textMuted">Configure institutional profile and settings</p>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
             <Button variant="secondary" onClick={() => navigate('/dashboard/institutions')}>Cancel</Button>
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
        <section className="glass-panel border border-outline/20 rounded-2xl editorial-shadow overflow-hidden">
          <div className="p-6 border-b border-outline bg-surfaceContainer">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Basic Profile
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text mb-2">Full Legal Name *</label>
              <div className="relative">
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  onBlur={() => handleBlur('full_name')}
                  placeholder="e.g., Lagos State University of Science and Technology"
                  className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.full_name && validationErrors.full_name ? 'border-red-500' : ''
                  } ${touched.full_name && !validationErrors.full_name && formData.full_name ? 'border-green-500' : ''}`}
                  required
                />
                {touched.full_name && !validationErrors.full_name && formData.full_name && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.full_name && validationErrors.full_name && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.full_name && validationErrors.full_name && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.full_name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Display Name / Abbreviation *</label>
              <div className="relative">
                <Input
                  value={formData.short_name || ''}
                  onChange={(e) => handleChange('short_name', e.target.value)}
                  onBlur={() => handleBlur('short_name')}
                  placeholder="e.g., LASUSTECH"
                  className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.short_name && validationErrors.short_name ? 'border-red-500' : ''
                  } ${touched.short_name && !validationErrors.short_name && formData.short_name ? 'border-green-500' : ''}`}
                  required
                />
                {touched.short_name && !validationErrors.short_name && formData.short_name && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.short_name && validationErrors.short_name && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.short_name && validationErrors.short_name && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.short_name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Alternative Code</label>
              <Input
                value={formData.abbreviation || ''}
                onChange={(e) => handleChange('abbreviation', e.target.value)}
                placeholder="e.g., LST"
                className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Institution Type *</label>
              <select
                value={formData.institution_type || ''}
                onChange={(e) => handleChange('institution_type', e.target.value)}
                className="w-full h-12 px-4 bg-white dark:bg-surfaceLow text-text border border-outline rounded-xl focus:outline-none focus:border-primary transition-colors"
              >
                <option value="UNIVERSITY">University</option>
                <option value="POLYTECHNIC">Polytechnic</option>
                <option value="COLLEGE">College</option>
                <option value="INSTITUTE">Institute</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Established Year</label>
              <Input
                type="number"
                value={formData.established_year || ''}
                onChange={(e) => handleChange('established_year', parseInt(e.target.value))}
                placeholder="e.g., 2021"
                className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Location & Contact Section */}
        <section className="glass-panel border border-outline/20 rounded-2xl editorial-shadow overflow-hidden">
          <div className="p-6 border-b border-outline bg-surfaceContainer">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Location & Connectivity
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Country *</label>
              <div className="relative">
                <Input
                  value={formData.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  onBlur={() => handleBlur('country')}
                  placeholder="e.g., Nigeria"
                  className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.country && validationErrors.country ? 'border-red-500' : ''
                  } ${touched.country && !validationErrors.country && formData.country ? 'border-green-500' : ''}`}
                  required
                />
                {touched.country && !validationErrors.country && formData.country && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.country && validationErrors.country && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.country && validationErrors.country && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.country}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">State / Province</label>
              <Input
                value={formData.state_province || ''}
                onChange={(e) => handleChange('state_province', e.target.value)}
                placeholder="e.g., Lagos"
                className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">City *</label>
              <div className="relative">
                <Input
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder="e.g., Ikorodu"
                  className={`h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.city && validationErrors.city ? 'border-red-500' : ''
                  } ${touched.city && !validationErrors.city && formData.city ? 'border-green-500' : ''}`}
                  required
                />
                {touched.city && !validationErrors.city && formData.city && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.city && validationErrors.city && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.city && validationErrors.city && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.city}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Postal Code</label>
              <Input
                value={formData.postal_code || ''}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="e.g., 100001"
                className="h-12 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="institution-address" className="block text-sm font-semibold text-text mb-2">Street Address *</label>
              <div className="relative">
                <textarea
                  id="institution-address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder="Full street address, building name, etc."
                  rows={3}
                  className={`w-full px-4 py-3 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border border-outline rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none ${
                    touched.address && validationErrors.address ? 'border-red-500' : ''
                  } ${touched.address && !validationErrors.address && formData.address ? 'border-green-500' : ''}`}
                  required
                />
              </div>
              {touched.address && validationErrors.address && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <Input
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  onBlur={() => handleBlur('website_url')}
                  placeholder="https://lasustech.edu.ng"
                  className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.website_url && validationErrors.website_url ? 'border-red-500' : ''
                  } ${touched.website_url && !validationErrors.website_url && formData.website_url ? 'border-green-500' : ''}`}
                />
                {touched.website_url && !validationErrors.website_url && formData.website_url && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.website_url && validationErrors.website_url && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.website_url && validationErrors.website_url && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.website_url}
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
                  placeholder="info@lasustech.edu.ng"
                  className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.contact_email && validationErrors.contact_email ? 'border-red-500' : ''
                  } ${touched.contact_email && !validationErrors.contact_email && formData.contact_email ? 'border-green-500' : ''}`}
                />
                {touched.contact_email && !validationErrors.contact_email && formData.contact_email && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.contact_email && validationErrors.contact_email && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.contact_email && validationErrors.contact_email && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.contact_email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <Input
                  type="tel"
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  onBlur={() => handleBlur('contact_phone')}
                  placeholder="+234..."
                  className={`h-12 pl-10 bg-white dark:bg-surfaceLow text-text placeholder:text-textMuted border-outline focus:border-primary ${
                    touched.contact_phone && validationErrors.contact_phone ? 'border-red-500' : ''
                  } ${touched.contact_phone && !validationErrors.contact_phone && formData.contact_phone ? 'border-green-500' : ''}`}
                />
                {touched.contact_phone && !validationErrors.contact_phone && formData.contact_phone && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {touched.contact_phone && validationErrors.contact_phone && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {touched.contact_phone && validationErrors.contact_phone && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.contact_phone}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Accreditation & Status Section */}
        <section className="glass-panel border border-outline/20 rounded-2xl editorial-shadow overflow-hidden">
          <div className="p-6 border-b border-outline bg-surfaceContainer">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Compliance & Visibility
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Accreditation Status</label>
              <select
                value={formData.accreditation_status || ''}
                onChange={(e) => handleChange('accreditation_status', e.target.value)}
                className="w-full h-12 px-4 bg-white dark:bg-surfaceLow text-text border border-outline rounded-xl focus:outline-none focus:border-primary transition-colors"
              >
                <option value="ACCREDITED">Fully Accredited</option>
                <option value="PROVISIONAL">Provisional</option>
                <option value="PENDING">Pending Review</option>
              </select>
            </div>
            <div className="flex items-center gap-4 h-12 mt-8">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-primary' : 'bg-surfaceHigh'}`}>
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
            </div>
          </div>
        </section>

        {/* Mobile Action Buttons */}
        <div className="flex flex-col gap-3 md:hidden">
           <Button onClick={handleSubmit} disabled={loading} className="h-12 text-lg">
              {loading ? 'Saving...' : 'Save Institution'}
           </Button>
           <Button variant="secondary" onClick={() => navigate('/dashboard/institutions')} className="h-12 text-lg">Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionFormPage;
