import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { College, Institution } from '../../types';
import { collegeApi, institutionApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { CollegeModal } from './CollegeModal';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const CollegeManagement: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instRes] = await Promise.all([
        institutionApi.getAll(),
        loadColleges()
      ]);
      setInstitutions(instRes);
    } catch (err) {
      setError('Failed to load initial data');
      toast.error('Load failed');
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async () => {
    try {
      const data = await collegeApi.getAll();
      setColleges(data);
    } catch (err) {
      setError('Failed to load colleges');
    }
  };

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstitution = !selectedInstitution || college.institution === selectedInstitution;
    return matchesSearch && matchesInstitution;
  });

  const handleCreateCollege = () => {
    setEditingCollege(null);
    setShowModal(true);
  };

  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setShowModal(true);
  };

  const handleSaveCollege = async (formData: Partial<College>) => {
    try {
      if (editingCollege) {
        await collegeApi.updateCollege(editingCollege.id, formData);
        toast.success('College updated');
      } else {
        await collegeApi.createCollege(formData as Omit<College, 'id' | 'created_at' | 'updated_at'>);
        toast.success('College created');
      }
      loadColleges();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save college');
      throw err;
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm('Are you sure you want to delete this college? All associated departments will be affected.')) return;
    try {
      await collegeApi.deleteCollege(id);
      toast.success('College deleted');
      loadColleges();
    } catch (err) {
      toast.error('Failed to delete college');
    }
  };

  return (
    <DashboardPage
      title="Colleges & Faculties"
      description="Organize academic departments into higher-level faculties and colleges."
      seoTitle="College Management | Admin"
      action={
        <Button size="lg" className="shadow-gold" onClick={handleCreateCollege}>
          <Plus size={24} className="mr-2" />
          Add Faculty
        </Button>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        {error && (
          <div className="p-6 bg-soft-coral/10 border border-soft-coral/30 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-soft-coral mt-0.5" />
            <div>
              <p className="text-soft-coral font-bold uppercase tracking-widest text-xs mb-1">System Error</p>
              <p className="text-presently-black font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={20} />
            <input
              type="text"
              placeholder="Search by faculty name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-bold text-sm focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
            />
          </div>
          <select
            value={selectedInstitution || ''}
            onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
            className="h-16 px-8 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none appearance-none min-w-[280px] cursor-pointer"
          >
            <option value="">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.short_name}</option>
            ))}
          </select>
        </div>

        <ResponsiveGrid columns={3} gap={32}>
          {loading && colleges.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
          ) : (
            filteredColleges.map(college => (
              <ModernCard
                key={college.id}
                padding="lg"
                className="group hover:border-sungold/40 transition-all flex flex-col justify-between h-full border border-outline/30"
              >
                <div className="space-y-8 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-[2rem] bg-warm-ivory border border-outline flex items-center justify-center text-sungold font-display text-2xl font-bold shadow-sm">
                       <Building2 size={32} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCollege(college)}
                        className="p-3 hover:bg-surface-highest/40 rounded-xl border border-outline text-on-surface-variant transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(college.id)}
                        className="p-3 hover:bg-soft-coral/10 rounded-xl border border-outline text-soft-coral transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-display text-2xl font-bold text-presently-black leading-tight mb-3">{college.name}</h3>
                    <div className="flex flex-wrap gap-2">
                       <Badge variant="secondary" className="font-bold">ID: {college.id}</Badge>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline/40 mt-auto">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <GraduationCap size={16} weight="bold" className="text-sungold" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] truncate">Active Unit</span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </ResponsiveGrid>

        {!loading && filteredColleges.length === 0 && (
          <div className="text-center py-32 bg-surface-highest/20 rounded-[3rem] border-2 border-dashed border-outline/40">
            <Building2 className="w-24 h-24 text-outline mx-auto mb-6 opacity-20" />
            <h4 className="font-display text-3xl font-bold text-presently-black">No Faculties</h4>
            <p className="text-on-surface-variant font-medium mt-3 max-w-sm mx-auto">Create a college or faculty to begin organizing academic units.</p>
          </div>
        )}
      </div>

      {showModal && (
        <CollegeModal
          college={editingCollege || undefined}
          institutions={institutions}
          onSave={handleSaveCollege}
          onClose={() => setShowModal(false)}
        />
      )}
    </DashboardPage>
  );
};

export default CollegeManagement;
