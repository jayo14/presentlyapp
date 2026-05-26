import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, GraduationCap, Building, Globe, Mail, Phone, Calendar, Image as ImageIcon } from 'lucide-react';
import { Button } from '../Button';
import { College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const CollegeFormPage: React.FC = () => {
  const { id, collegeId } = useParams<{ id: string; collegeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [institution, setInstitution] = useState<Institution | null>(null);
  
  const [formData, setFormData] = useState<Partial<College>>({
    name: '',
    code: '',
    abbreviation: '',
    description: '',
    dean_name: '',
    dean_email: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    building_block: '',
    office_location: '',
    established_year: undefined,
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      loadInstitution(Number(id));
    }
    if (collegeId && collegeId !== 'new') {
      loadCollege(Number(collegeId));
    }
  }, [id, collegeId]);

  const loadInstitution = async (instId: number) => {
    try {
      const data = await institutionsApi.getById(instId);
      setInstitution(data);
    } catch (err) {
      console.error('Failed to load institution', err);
    }
  };

  const loadCollege = async (cId: number) => {
    try {
      setFetching(true);
      const data = await institutionsApi.getCollegeById(cId);
      setFormData(data);
    } catch (err) {
      toast.error('Failed to load college details');
      navigate(`/dashboard/institutions/${id}`);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (collegeId && collegeId !== 'new') {
        await institutionsApi.updateCollege(Number(collegeId), formData);
        toast.success('College updated successfully');
      } else {
        await institutionsApi.createCollege(Number(id), formData as any);
        toast.success('College created successfully');
      }
      navigate(`/dashboard/institutions/${id}`);
    } catch (err) {
      toast.error('Failed to save college');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="h-96 flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardPage
      title={collegeId && collegeId !== 'new' ? 'Edit Faculty' : 'Add Faculty'}
      description={`Configuring academic unit for ${institution?.short_name || 'Institution'}.`}
      seoTitle="Faculty Management | Admin"
      action={
        <Button variant="outline" onClick={() => navigate(`/dashboard/institutions/${id}`)} className="h-14 px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      }
    >
      <form onSubmit={handleSave} className="max-w-5xl space-y-16 pb-32">
        <ModernCard padding="lg" className="space-y-10">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <Building className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Faculty Core Details</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3 col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Faculty / College Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Faculty of Engineering"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Abbreviation / Code</label>
              <input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. FOE"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
             <div className="space-y-3 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of the faculty..."
                className="w-full min-h-[100px] p-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all resize-none"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        <ModernCard padding="lg" className="space-y-10">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <GraduationCap className="w-6 h-6 text-sky-teal" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Leadership & Administration</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Dean's Name</label>
              <input
                value={formData.dean_name}
                onChange={(e) => setFormData({ ...formData, dean_name: e.target.value })}
                placeholder="Prof. Jane Doe"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Dean's Email</label>
              <input
                type="email"
                value={formData.dean_email}
                onChange={(e) => setFormData({ ...formData, dean_email: e.target.value })}
                placeholder="dean@univ.edu"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="faculty@univ.edu"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contact Phone</label>
              <input
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+234..."
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        <ModernCard padding="lg" className="space-y-10 bg-warm-ivory/5">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <Globe className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Location & Metadata</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Building / Block</label>
              <input
                value={formData.building_block}
                onChange={(e) => setFormData({ ...formData, building_block: e.target.value })}
                placeholder="Block C, Faculty Square"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Office Location</label>
              <input
                value={formData.office_location}
                onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                placeholder="Room 204, 2nd Floor"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
             <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Official Website</label>
              <input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://univ.edu/faculty"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
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
          </ResponsiveGrid>
        </ModernCard>

        <div className="flex justify-end pt-8">
           <Button type="submit" size="lg" className="h-20 px-16 shadow-gold" disabled={loading}>
             <Save className="w-5 h-5 mr-3" />
             {loading ? 'Saving...' : 'Save Faculty'}
           </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default CollegeFormPage;
