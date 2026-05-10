import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, Building, GraduationCap, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { College, Institution } from '../../types';
import { collegeApi, institutionApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { CollegeModal } from './CollegeModal';

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
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());
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
        await collegeApi.createCollege(formData as Omit<College, 'id' | 'created_at' | 'updated_at' | 'institution_name'>);
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
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="Faculties & Colleges | Presently Admin" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">INSTITUTIONAL STRUCTURE</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Faculties & Colleges
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Manage high-level academic divisions within institutions.
           </p>
        </div>
        <Button size="lg" className="h-16 px-10 shadow-gold" onClick={handleCreateCollege}>
          <Plus size={24} className="mr-2" />
          Add Faculty
        </Button>
      </header>

      {error && (
        <div className="p-6 bg-soft-coral/10 border border-soft-coral/30 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-soft-coral mt-0.5" />
          <div>
            <p className="text-soft-coral font-bold uppercase tracking-widest text-xs mb-1">System Error</p>
            <p className="text-presently-black font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            type="text"
            placeholder="Search by faculty name or institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-medium focus:ring-2 focus:ring-sungold/20 outline-none"
          />
        </div>
        <select
          value={selectedInstitution || ''}
          onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
          className="h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none min-w-[240px]"
        >
          <option value="">All Institutions</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.short_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && colleges.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-3xl" />
          ))
        ) : (
          filteredColleges.map(college => (
            <ModernCard
              key={college.id}
              padding="lg"
              className="group hover:border-sungold/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold">
                    <Building2 size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCollege(college)}
                      className="p-2 hover:bg-slate-50 rounded-xl border border-outline text-on-surface-variant"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCollege(college.id)}
                      className="p-2 hover:bg-red-50 rounded-xl border border-outline text-soft-coral"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-presently-black leading-tight mb-1">{college.name}</h3>
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-sungold" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{college.institution_name}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline flex items-center gap-4">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <GraduationCap size={16} className="text-sungold" />
                    <span className="text-xs font-bold uppercase tracking-widest">{college.departments_count || 0} DEPARTMENTS</span>
                  </div>
                </div>
              </div>
            </ModernCard>
          ))
        )}
      </div>

      {!loading && filteredColleges.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-outline">
          <Building2 className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h4 className="font-display text-2xl font-bold text-presently-black">No Faculties Found</h4>
          <p className="text-on-surface-variant font-medium mt-2">Define your institutional hierarchy starting with faculties.</p>
        </div>
      )}

      {showModal && (
        <CollegeModal
          college={editingCollege || undefined}
          institutions={institutions}
          onSave={handleSaveCollege}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CollegeManagement;
