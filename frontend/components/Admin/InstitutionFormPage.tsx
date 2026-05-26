import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Globe, Mail, Phone, Calendar, Award, MapPin, Hash, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { Button } from '../Button';
import { Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const InstitutionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Institution>>({
    full_name: '',
    short_name: '',
    abbreviation: '',
    description: '',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    country: '',
    state_province: '',
    city: '',
    address: '',
    established_year: undefined,
    institution_type: 'UNIVERSITY',
    accreditation_status: '',
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
      const data = await institutionsApi.getById(instId);
      setFormData(data);
    } catch (err) {
      toast.error('Failed to load institution details');
      navigate('/dashboard/institutions');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id && id !== 'new') {
        await institutionsApi.update(Number(id), formData);
        toast.success('Institution updated successfully');
      } else {
        await institutionsApi.create(formData as any);
        toast.success('Institution registered successfully');
      }
      navigate('/dashboard/institutions');
    } catch (err) {
      toast.error('Failed to save institution');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="h-96 flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardPage
      title={id && id !== 'new' ? 'Edit Institution' : 'Register Institution'}
      description="Define the identity and global configuration for an academic partner."
      seoTitle="Institution Management | Admin"
      action={
        <Button variant="outline" onClick={() => navigate('/dashboard/institutions')} className="h-14 px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      }
    >
      <form onSubmit={handleSave} className="max-w-6xl space-y-16 pb-32">
        {/* Core Identity */}
        <ModernCard padding="lg" className="space-y-10">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <Building2 className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Core Identity</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3 col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Full Institution Name</label>
              <input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. University of Lagos"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Abbreviation</label>
              <input
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                placeholder="e.g. UNILAG"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-3 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of the institution..."
                className="w-full min-h-[120px] p-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all resize-none"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        {/* Contact & Web */}
        <ModernCard padding="lg" className="space-y-10">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <Globe className="w-6 h-6 text-sky-teal" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Contact & Web</h3>
          </div>

          <ResponsiveGrid columns={3} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Official Website</label>
              <div className="relative">
                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="admin@univ.edu"
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                />
              </div>
            </div>
          </ResponsiveGrid>
        </ModernCard>

        {/* Location Details */}
        <ModernCard padding="lg" className="space-y-10 bg-warm-ivory/5">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <MapPin className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Location Details</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
             <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Country</label>
              <input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Nigeria"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">State / Province</label>
              <input
                value={formData.state_province}
                onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                placeholder="Lagos"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">City</label>
              <input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Akoka"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Postal Code</label>
              <input
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="100001"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Full Address</label>
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="University of Lagos, Akoka, Yaba..."
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        {/* Academic Details */}
        <ModernCard padding="lg" className="space-y-10">
           <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <Award className="w-6 h-6 text-sky-teal" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Institutional Status</h3>
          </div>

          <ResponsiveGrid columns={3} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Institution Type</label>
              <select
                value={formData.institution_type}
                onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none appearance-none cursor-pointer"
              >
                <option value="UNIVERSITY">University</option>
                <option value="POLYTECHNIC">Polytechnic</option>
                <option value="COLLEGE">College of Education</option>
                <option value="INSTITUTE">Research Institute</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Established Year</label>
              <input
                type="number"
                value={formData.established_year || ''}
                onChange={(e) => setFormData({ ...formData, established_year: Number(e.target.value) })}
                placeholder="1962"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Accreditation Status</label>
              <input
                value={formData.accreditation_status}
                onChange={(e) => setFormData({ ...formData, accreditation_status: e.target.value })}
                placeholder="Full Accreditation"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        {/* Assets */}
        <ModernCard padding="lg" className="space-y-10">
           <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <ImageIcon className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Branding Assets</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Logo URL</label>
              <input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cover Image URL</label>
              <input
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                placeholder="https://..."
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        <div className="flex justify-end pt-8">
           <Button type="submit" size="lg" className="h-20 px-16 shadow-gold" disabled={loading}>
             <Save className="w-5 h-5 mr-3" />
             {loading ? 'Committing...' : 'Commit Configuration'}
           </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default InstitutionFormPage;
