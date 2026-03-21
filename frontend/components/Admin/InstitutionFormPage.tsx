import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Building2, Globe, Mail, Phone, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';

export const InstitutionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        <div className="w-12 h-12 border-input border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-textMuted animate-pulse">Loading institution data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
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
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline bg-background/50">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Basic Profile
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMuted mb-2">Full Legal Name *</label>
              <Input
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="e.g., Lagos State University of Science and Technology"
                className="h-12 bg-background border-outline focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Display Name / Abbreviation *</label>
              <Input
                value={formData.short_name || ''}
                onChange={(e) => handleChange('short_name', e.target.value)}
                placeholder="e.g., LASUSTECH"
                className="h-12 bg-background border-outline focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Alternative Code</label>
              <Input
                value={formData.abbreviation || ''}
                onChange={(e) => handleChange('abbreviation', e.target.value)}
                placeholder="e.g., LST"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Institution Type *</label>
              <select
                value={formData.institution_type || ''}
                onChange={(e) => handleChange('institution_type', e.target.value)}
                className="w-full h-12 px-4 bg-background border border-outline rounded-xl text-text focus:outline-none focus:border-primary transition-colors"
              >
                <option value="UNIVERSITY">University</option>
                <option value="POLYTECHNIC">Polytechnic</option>
                <option value="COLLEGE">College</option>
                <option value="INSTITUTE">Institute</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Established Year</label>
              <Input
                type="number"
                value={formData.established_year || ''}
                onChange={(e) => handleChange('established_year', parseInt(e.target.value))}
                placeholder="e.g., 2021"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Location & Contact Section */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline bg-background/50">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Location & Connectivity
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Country *</label>
              <Input
                value={formData.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g., Nigeria"
                className="h-12 bg-background border-outline focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">State / Province</label>
              <Input
                value={formData.state_province || ''}
                onChange={(e) => handleChange('state_province', e.target.value)}
                placeholder="e.g., Lagos"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">City *</label>
              <Input
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g., Ikorodu"
                className="h-12 bg-background border-outline focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Postal Code</label>
              <Input
                value={formData.postal_code || ''}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="e.g., 100001"
                className="h-12 bg-background border-outline focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="institution-address" className="block text-sm font-semibold text-textMuted mb-2">Street Address</label>
              <textarea
                id="institution-address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Full street address, building name, etc."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-outline rounded-xl text-text text-sm placeholder:text-textMuted focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <Input
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  placeholder="https://lasustech.edu.ng"
                  className="h-12 pl-10 bg-background border-outline focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <Input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="info@lasustech.edu.ng"
                  className="h-12 pl-10 bg-background border-outline focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <Input
                  type="tel"
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="+234..."
                  className="h-12 pl-10 bg-background border-outline focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Accreditation & Status Section */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline bg-background/50">
            <h3 className="font-headline font-bold text-text flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Compliance & Visibility
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-textMuted mb-2">Accreditation Status</label>
              <select
                value={formData.accreditation_status || ''}
                onChange={(e) => handleChange('accreditation_status', e.target.value)}
                className="w-full h-12 px-4 bg-background border border-outline rounded-xl text-text focus:outline-none focus:border-primary transition-colors"
              >
                <option value="ACCREDITED">Fully Accredited</option>
                <option value="PROVISIONAL">Provisional</option>
                <option value="PENDING">Pending Review</option>
              </select>
            </div>
            <div className="flex items-center gap-4 h-12 mt-8">
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
