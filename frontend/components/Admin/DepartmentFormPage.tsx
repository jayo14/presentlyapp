import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, GraduationCap, Building, Globe, Mail, Phone, MapPin, Award } from 'lucide-react';
import { Button } from '../Button';
import { Department, College } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import { toast } from 'sonner';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const DepartmentFormPage: React.FC = () => {
  const { id, collegeId, deptId } = useParams<{ id: string; collegeId: string; deptId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
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
    established_year: undefined,
    accreditation_status: '',
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
      toast.error('Failed to load department details');
      navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (deptId && deptId !== 'new') {
        await institutionsApi.updateDepartment(Number(deptId), formData);
        toast.success('Department updated successfully');
      } else {
        await institutionsApi.createDepartment(Number(collegeId), formData as any);
        toast.success('Department created successfully');
      }
      navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`);
    } catch (err) {
      toast.error('Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="h-96 flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardPage
      title={deptId && deptId !== 'new' ? 'Edit Department' : 'Add Department'}
      description={`Configuring specialized academic unit for ${college?.name || 'College'}.`}
      seoTitle="Department Management | Admin"
      action={
        <Button variant="outline" onClick={() => navigate(`/dashboard/institutions/${id}/colleges/${collegeId}`)} className="h-14 px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      }
    >
      <form onSubmit={handleSave} className="max-w-5xl space-y-16 pb-32">
        <ModernCard padding="lg" className="space-y-10">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <GraduationCap className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Department Identity</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3 col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Department Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Abbreviation / Code</label>
              <input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CSC"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                required
              />
            </div>
             <div className="space-y-3 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of the department..."
                className="w-full min-h-[100px] p-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all resize-none"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        <ModernCard padding="lg" className="space-y-10">
          <div className="flex items-center gap-4 border-b border-outline/40 pb-6">
            <Building className="w-6 h-6 text-sky-teal" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Leadership & Administration</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">HOD's Name</label>
              <input
                value={formData.head_of_department_name}
                onChange={(e) => setFormData({ ...formData, head_of_department_name: e.target.value })}
                placeholder="Dr. John Smith"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">HOD's Email</label>
              <input
                type="email"
                value={formData.head_of_department_email}
                onChange={(e) => setFormData({ ...formData, head_of_department_email: e.target.value })}
                placeholder="hod@univ.edu"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="csc@univ.edu"
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
            <MapPin className="w-6 h-6 text-sungold" />
            <h3 className="text-2xl font-bold font-display text-presently-black">Location & Academic Stats</h3>
          </div>

          <ResponsiveGrid columns={2} gap={32}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Office Location</label>
              <input
                value={formData.office_location}
                onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                placeholder="Room 101, CSC Block"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
             <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Official Website</label>
              <input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://univ.edu/csc"
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
             <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Accreditation Status</label>
              <input
                value={formData.accreditation_status}
                onChange={(e) => setFormData({ ...formData, accreditation_status: e.target.value })}
                placeholder="NUC Accredited"
                className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              />
            </div>
          </ResponsiveGrid>
        </ModernCard>

        <div className="flex justify-end pt-8">
           <Button type="submit" size="lg" className="h-20 px-16 shadow-gold" disabled={loading}>
             <Save className="w-5 h-5 mr-3" />
             {loading ? 'Saving...' : 'Save Department'}
           </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default DepartmentFormPage;
