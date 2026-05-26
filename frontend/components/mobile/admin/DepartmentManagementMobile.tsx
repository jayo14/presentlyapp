import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, GraduationCap, 
  BookOpen, Buildings
} from '@phosphor-icons/react';
import { departmentApi, institutionApi } from '../../../services/api/admin';
import { Department, Institution } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { DepartmentManagement } from '../../Admin/DepartmentManagement';
import { Badge } from '../../../src/components/ui/badge';

export const DepartmentManagementMobile: React.FC = () => {
  const isDesktop = !useBreakpoint('md');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadInitialData(); }, []);

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

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.college_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDesktop) return <DepartmentManagement />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <SEO title="Academic Units | Presently Mobile" />

      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-display font-bold text-presently-black">Units</h1>
         <p className="text-on-surface-variant font-medium text-sm">Departments and curriculum units</p>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative flex-1 group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={18} />
            <input
              placeholder="Search units..."
              className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-sungold text-presently-black shadow-gold active:scale-95 transition-all">
            <Plus size={20} weight="bold" />
         </button>
      </div>

      <div className="space-y-4 pb-24">
         {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
         ) : (
           filteredDepartments.map(dept => (
             <div key={dept.id} className="p-6 bg-surface border border-outline rounded-[2.5rem] shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-14 h-14 rounded-[30%] bg-moss-green/10 text-moss-green border border-outline flex items-center justify-center shadow-sm">
                      <GraduationCap size={28} weight="bold" />
                   </div>
                   <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold text-presently-black text-lg line-clamp-1">{dept.name}</h3>
                      <div className="flex items-center gap-2 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest mt-1">
                         <Buildings size={14} className="text-sungold" />
                         <span className="truncate">{dept.college_name}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline/40 pt-5">
                   <div className="flex items-center gap-2 text-on-surface-variant">
                      <BookOpen size={16} weight="bold" className="text-sungold" />
                      <span className="text-xs font-bold tabular-nums">{dept.courses_count || 0} active courses</span>
                   </div>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};
