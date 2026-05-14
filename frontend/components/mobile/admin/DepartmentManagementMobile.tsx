import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, GraduationCap, 
  BookOpen, Buildings, CaretRight, 
  DotsThreeVertical, Trash, Pencil,
  Funnel
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { departmentApi, institutionApi, collegeApi } from '../../../services/api/admin';
import { Department, Institution, College } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';

import { DepartmentModal } from '../../Admin/DepartmentModal';


export const DepartmentManagementMobile: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (selectedInstitution) loadColleges(selectedInstitution);
  }, [selectedInstitution]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instRes, deptRes] = await Promise.all([
        institutionApi.getAll(),
        departmentApi.getAll()
      ]);
      setInstitutions(instRes);
      setDepartments(deptRes);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async (id: number) => {
    try {
      const data = await collegeApi.getByInstitution(id);
      setColleges(data);
    } catch (e) {}
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.college_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveDepartment = async (formData: Partial<Department>) => {
    try {
      if (editingDepartment) {
        await departmentApi.updateDepartment(editingDepartment.id, formData);
        toast.success('Department updated');
      } else {
        await departmentApi.createDepartment(formData as any);
        toast.success('Department created');
      }
      loadInitialData();
      setShowModal(false);
    } catch (err: any) {
      toast.error('Failed to save');
      throw err;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Academic Units | Presently Admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Units</h1>
           <p className="text-on-surface-variant font-medium">Manage departments.</p>
        </div>
        <button 
          onClick={() => { setEditingDepartment(null); setShowModal(true); }}
          className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
        >
          <Plus size={24} weight="bold" />
        </button>
      </div>

      {/* Filters Overlay Toggle */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <MagnifyingGlass size={20} weight="bold" />
          </div>
          <input 
            type="text"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <select 
             value={selectedInstitution || ''} 
             onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
             className="px-4 py-2.5 bg-surface-container border border-outline rounded-full text-[10px] font-black uppercase tracking-widest outline-none"
           >
              <option value="">All Uni</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.short_name}</option>)}
           </select>
           <select 
             value={selectedCollege || ''} 
             onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
             disabled={!selectedInstitution}
             className="px-4 py-2.5 bg-surface-container border border-outline rounded-full text-[10px] font-black uppercase tracking-widest outline-none disabled:opacity-50"
           >
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-surface-container animate-pulse rounded-3xl" />)
        ) : filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => (
            <motion.div 
              key={dept.id}
              layout
              className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold">
                   <GraduationCap size={28} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg leading-tight truncate">{dept.name}</h3>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">{dept.college_name}</p>
                </div>
                <button className="p-2 text-on-surface-variant">
                   <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <BookOpen size={16} weight="duotone" className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{dept.courses_count || 0} Courses</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingDepartment(dept); setShowModal(true); }}
                      className="p-2.5 rounded-xl bg-surface-container border border-outline text-on-surface-variant active:scale-90 transition-all"
                    >
                       <Pencil size={18} weight="duotone" />
                    </button>
                    <button 
                      className="p-2.5 rounded-xl bg-error/5 border border-error/10 text-error active:scale-90 transition-all"
                    >
                       <Trash size={18} weight="duotone" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
             <GraduationCap size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
             <p className="text-sm text-on-surface-variant font-medium">No units found.</p>
          </div>
        )}
      </div>

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
