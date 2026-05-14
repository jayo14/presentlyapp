import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, Buildings, 
  MapPin, Globe, CaretRight, 
  DotsThreeVertical, Trash, Pencil
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { institutionApi } from '../../../services/api/admin';
import { Institution } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';

import { InstitutionModal } from '../../Admin/InstitutionModal';


export const InstitutionManagementMobile: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  useEffect(() => { loadInstitutions(); }, []);

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

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.short_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveInstitution = async (formData: Partial<Institution>) => {
    try {
      if (editingInstitution) {
        await institutionApi.updateInstitution(editingInstitution.id, formData);
        toast.success('Institution updated');
      } else {
        await institutionApi.createInstitution(formData as any);
        toast.success('Institution created');
      }
      loadInstitutions();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this institution?')) return;
    try {
      await institutionApi.deleteInstitution(id);
      toast.success('Deleted');
      loadInstitutions();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Institutions | Presently Admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
           <p className="text-on-surface-variant font-medium">Manage university network.</p>
        </div>
        <button 
          onClick={() => { setEditingInstitution(null); setShowModal(true); }}
          className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
        >
          <Plus size={24} weight="bold" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <MagnifyingGlass size={20} weight="bold" />
        </div>
        <input 
          type="text"
          placeholder="Search institutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-surface-container animate-pulse rounded-3xl" />)
        ) : filteredInstitutions.length > 0 ? (
          filteredInstitutions.map((inst) => (
            <motion.div 
              key={inst.id}
              layout
              className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold font-bold">
                   {inst.short_name}
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg leading-tight truncate">{inst.name}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                         <MapPin size={12} weight="fill" className="text-sungold" />
                         {inst.location || 'N/A'}
                      </div>
                      {inst.website && (
                         <a href={inst.website} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            <Globe size={12} />
                            Site
                         </a>
                      )}
                   </div>
                </div>
                <button className="p-2 text-on-surface-variant">
                   <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={() => { setEditingInstitution(inst); setShowModal(true); }}
                   className="flex-1 h-11 bg-surface-container rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
                 >
                    <Pencil size={18} weight="duotone" />
                    Edit
                 </button>
                 <button 
                   onClick={() => handleDelete(inst.id)}
                   className="w-11 h-11 flex items-center justify-center rounded-xl text-error bg-error/5 border border-error/10 active:scale-90 transition-all"
                 >
                    <Trash size={18} weight="duotone" />
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
             <Buildings size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
             <p className="text-sm text-on-surface-variant font-medium">No institutions found.</p>
          </div>
        )}
      </div>

      {showModal && (
        <InstitutionModal
          institution={editingInstitution || undefined}
          onSave={handleSaveInstitution}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
