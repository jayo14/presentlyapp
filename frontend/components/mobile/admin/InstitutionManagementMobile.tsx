import React, { useState, useEffect } from 'react';
import {
  Plus,
  MagnifyingGlass,
  Buildings,
  MapPin,
  Globe,
  Trash,
  Pencil,
  CaretLeft,
  GraduationCap,
  BuildingOffice,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { institutionApi, collegeApi, departmentApi } from '../../../services/api/admin';
import { Institution, College, Department } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { InstitutionModal } from '../../Admin/InstitutionModal';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { InstitutionManagement } from '../../Admin/InstitutionManagement';
import { cn } from '../../../src/components/ui/utils';

type ViewMode = 'institutions' | 'colleges' | 'departments';

const getInstitutionName = (inst: Institution) =>
  (inst as any).name || inst.full_name || 'Institution';

const getInstitutionWebsite = (inst: Institution) =>
  (inst as any).website || inst.website_url;

const getInstitutionLocation = (inst: Institution) =>
  (inst as any).location || [inst.city, inst.state_province, inst.country].filter(Boolean).join(', ') || 'N/A';

export const InstitutionManagementMobile: React.FC = () => {
  const isDesktop = !useBreakpoint('md');
  const [viewMode, setViewMode] = useState<ViewMode>('institutions');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await institutionApi.getAll();
      setInstitutions(data);
    } catch (err) {
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstitution = async (inst: Institution) => {
    setSelectedInstitution(inst);
    setViewMode('colleges');
    try {
      setLoadingChildren(true);
      const data = await collegeApi.getByInstitution(inst.id);
      setColleges(data);
    } catch (err) {
      toast.error('Failed to load colleges');
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleSelectCollege = async (college: College) => {
    setSelectedCollege(college);
    setViewMode('departments');
    try {
      setLoadingChildren(true);
      const data = await departmentApi.getByCollege(college.id);
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleBack = () => {
    if (viewMode === 'departments') {
      setViewMode('colleges');
      setSelectedCollege(null);
    } else if (viewMode === 'colleges') {
      setViewMode('institutions');
      setSelectedInstitution(null);
    }
  };

  if (isDesktop) return <InstitutionManagement />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <SEO title="Academic Directory | Presently Mobile" />

      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-display font-bold text-presently-black">
           {viewMode === 'institutions' ? 'Schools' : viewMode === 'colleges' ? 'Colleges' : 'Units'}
         </h1>
         <p className="text-on-surface-variant font-medium text-sm">
           {viewMode === 'institutions' ? 'Manage global network' : selectedInstitution ? getInstitutionName(selectedInstitution) : ''}
         </p>
      </div>

      <div className="flex items-center gap-3">
         {viewMode !== 'institutions' && (
           <button
             onClick={handleBack}
             className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface border border-outline shadow-sm active:scale-95 transition-all"
           >
              <CaretLeft size={20} weight="bold" />
           </button>
         )}
         <div className="relative flex-1 group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={18} />
            <input
              placeholder="Search..."
              className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-sungold text-presently-black shadow-gold active:scale-95 transition-all">
            <Plus size={20} weight="bold" />
         </button>
      </div>

      <div className="space-y-4">
         <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
               {viewMode === 'institutions' && institutions.map(inst => (
                 <div
                   key={inst.id}
                   onClick={() => handleSelectInstitution(inst)}
                   className="p-6 bg-surface border border-outline rounded-[2rem] shadow-sm active:scale-98 transition-all"
                 >
                    <div className="flex items-start gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold font-display font-bold text-lg">
                          {inst.short_name?.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-presently-black text-lg line-clamp-1">{getInstitutionName(inst)}</h3>
                          <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-medium text-xs">
                             <MapPin size={14} className="text-sungold" />
                             <span>{getInstitutionLocation(inst)}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}

               {viewMode === 'colleges' && colleges.map(college => (
                 <div
                   key={college.id}
                   onClick={() => handleSelectCollege(college)}
                   className="p-6 bg-surface border border-outline rounded-[2rem] shadow-sm active:scale-98 transition-all"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-sky-teal/10 text-sky-teal flex items-center justify-center">
                          <BuildingOffice size={20} weight="bold" />
                       </div>
                       <h3 className="font-bold text-presently-black">{college.name}</h3>
                    </div>
                 </div>
               ))}

               {viewMode === 'departments' && departments.map(dept => (
                 <div
                   key={dept.id}
                   className="p-6 bg-surface border border-outline rounded-[2rem] shadow-sm active:scale-98 transition-all"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-moss-green/10 text-moss-green flex items-center justify-center">
                          <GraduationCap size={20} weight="bold" />
                       </div>
                       <h3 className="font-bold text-presently-black">{dept.name}</h3>
                    </div>
                 </div>
               ))}

               {(loading || loadingChildren) && (
                 <div className="py-12 flex flex-col items-center gap-4 opacity-40">
                    <div className="w-8 h-8 border-4 border-sungold border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Loading Catalog...</span>
                 </div>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
};
