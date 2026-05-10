import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, Edit2, Trash2, Building2, BookOpen, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Department, Institution, College } from '../../types';
import { departmentApi, collegeApi, institutionApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { DepartmentModal } from './DepartmentModal';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadColleges(selectedInstitution);
      setSelectedCollege(null);
    }
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedCollege) {
      loadDepartmentsByCollege(selectedCollege);
    } else {
      loadDepartments();
    }
  }, [selectedCollege]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instRes] = await Promise.all([
        institutionApi.getAll(),
        loadDepartments()
      ]);
      setInstitutions(instRes);
    } catch (err) {
      setError('Failed to load initial data');
      toast.error('Load failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (err) {
      setError('Failed to load departments');
    }
  };

  const loadColleges = async (instId: number) => {
    try {
      const data = await collegeApi.getByInstitution(instId);
      setColleges(data);
    } catch (err) {
      toast.error('Failed to load colleges');
    }
  };

  const loadDepartmentsByCollege = async (collegeId: number) => {
    try {
      setLoading(true);
      const data = await departmentApi.getByCollege(collegeId);
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load college departments');
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.college_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setShowModal(true);
  };

  const handleSaveDepartment = async (formData: Partial<Department>) => {
    try {
      if (editingDepartment) {
        await departmentApi.updateDepartment(editingDepartment.id, formData);
        toast.success('Department updated');
      } else {
        await departmentApi.createDepartment(formData as Omit<Department, 'id' | 'created_at' | 'updated_at' | 'college_name'>);
        toast.success('Department created');
      }

      if (selectedCollege) {
        loadDepartmentsByCollege(selectedCollege);
      } else {
        loadDepartments();
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save department');
      throw err;
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department? All associated courses will be affected.')) return;
    try {
      await departmentApi.deleteDepartment(id);
      toast.success('Department deleted');
      if (selectedCollege) {
        loadDepartmentsByCollege(selectedCollege);
      } else {
        loadDepartments();
      }
    } catch (err) {
      toast.error('Failed to delete department');
    }
  };

  const resetFilters = () => {
    setSelectedInstitution(null);
    setSelectedCollege(null);
    loadDepartments();
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="Academic Departments | Presently Admin" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">ACADEMIC UNITS</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Academic Departments
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Configure specialized units and their curricula.
           </p>
        </div>
        <Button size="lg" className="h-16 px-10 shadow-gold" onClick={handleCreateDepartment}>
          <Plus size={24} className="mr-2" />
          Add Department
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

      <ModernCard padding="lg" className="bg-warm-ivory/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-presently-black">Department Hierarchy</h3>
          {(selectedInstitution || selectedCollege) && (
            <button onClick={resetFilters} className="text-xs font-bold text-sungold hover:underline uppercase tracking-widest">
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Institution</label>
            <select
              value={selectedInstitution || ''}
              onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
              className="w-full h-14 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.short_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">College/Faculty</label>
            <select
              value={selectedCollege || ''}
              onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedInstitution}
              className="w-full h-14 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none disabled:opacity-50"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>{college.name}</option>
              ))}
            </select>
          </div>
        </div>
      </ModernCard>

      <div className="relative max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-medium focus:ring-2 focus:ring-sungold/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && departments.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-3xl" />
          ))
        ) : (
          filteredDepartments.map(dept => (
            <ModernCard
              key={dept.id}
              padding="lg"
              className="group hover:border-sungold/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditDepartment(dept)}
                      className="p-2 hover:bg-slate-50 rounded-xl border border-outline text-on-surface-variant"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-2 hover:bg-red-50 rounded-xl border border-outline text-soft-coral"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-presently-black leading-tight mb-1">{dept.name}</h3>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-sungold" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest line-clamp-1">{dept.college_name}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline flex items-center gap-4">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <BookOpen size={16} className="text-sungold" />
                    <span className="text-xs font-bold uppercase tracking-widest">{dept.courses_count || 0} COURSES</span>
                  </div>
                </div>
              </div>
            </ModernCard>
          ))
        )}
      </div>

      {!loading && filteredDepartments.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-outline">
          <GraduationCap className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h4 className="font-display text-2xl font-bold text-presently-black">No Departments</h4>
          <p className="text-on-surface-variant font-medium mt-2">Define the specialized units for each college.</p>
        </div>
      )}

      {showModal && (
        <DepartmentModal
          department={editingDepartment || undefined}
          colleges={colleges}
          onSave={handleSaveDepartment}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
