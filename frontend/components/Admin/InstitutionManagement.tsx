import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Edit2, Trash2, Globe, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Institution } from '../../types';
import { institutionApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { InstitutionModal } from './InstitutionModal';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const InstitutionManagement: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError('Failed to load institutions');
      toast.error('Load failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.short_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInstitution = () => {
    setEditingInstitution(null);
    setShowModal(true);
  };

  const handleEditInstitution = (inst: Institution) => {
    setEditingInstitution(inst);
    setShowModal(true);
  };

  const handleSaveInstitution = async (formData: Partial<Institution>) => {
    try {
      if (editingInstitution) {
        await institutionApi.updateInstitution(editingInstitution.id, formData);
        toast.success('Institution updated');
      } else {
        await institutionApi.createInstitution(formData as Omit<Institution, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Institution created');
      }
      loadInstitutions();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save institution');
      throw err;
    }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (!confirm('Are you sure you want to delete this institution? This will affect all associated data.')) return;
    try {
      await institutionApi.deleteInstitution(id);
      toast.success('Institution deleted');
      loadInstitutions();
    } catch (err) {
      toast.error('Failed to delete institution');
    }
  };

  return (
    <DashboardPage
      title="Academic Institutions"
      description="Manage universities and colleges participating in the network."
      seoTitle="Academic Institutions | Presently Admin"
      action={
        <Button size="lg" className="shadow-gold" onClick={handleCreateInstitution}>
          <Plus size={24} className="mr-2" />
          Add Institution
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

        <div className="relative max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={20} />
          <input
            type="text"
            placeholder="Search by name or short code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-bold text-sm focus:ring-4 focus:ring-sungold/10 outline-none transition-all shadow-sm"
          />
        </div>

        <ResponsiveGrid columns={3} gap={32}>
          {loading && institutions.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
          ) : (
            filteredInstitutions.map(inst => (
              <ModernCard
                key={inst.id}
                padding="lg"
                className="group hover:border-sungold/40 transition-all flex flex-col justify-between h-full border border-outline/30"
              >
                <div className="space-y-8 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-[2rem] bg-warm-ivory border border-outline flex items-center justify-center text-sungold font-display text-2xl font-bold shadow-sm">
                      {inst.short_name}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditInstitution(inst)}
                        className="p-3 hover:bg-surface-highest/40 rounded-xl border border-outline text-on-surface-variant transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteInstitution(inst.id)}
                        className="p-3 hover:bg-soft-coral/10 rounded-xl border border-outline text-soft-coral transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-display text-2xl font-bold text-presently-black leading-tight mb-3">{inst.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-bold">{inst.short_name}</Badge>
                      {inst.website && (
                        <a href={inst.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-sungold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                          <Globe size={14} weight="bold" />
                          WEBSITE
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline/40 mt-auto">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <MapPin size={16} weight="bold" className="text-sungold" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] truncate">{inst.location || 'GLOBAL'}</span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </ResponsiveGrid>

        {!loading && filteredInstitutions.length === 0 && (
          <div className="text-center py-32 bg-surface-highest/20 rounded-[3rem] border-2 border-dashed border-outline/40">
            <Building className="w-24 h-24 text-outline mx-auto mb-6 opacity-20" />
            <h4 className="font-display text-3xl font-bold text-presently-black">No Institutions</h4>
            <p className="text-on-surface-variant font-medium mt-3 max-w-sm mx-auto">Get started by registering the first university in the system.</p>
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
    </DashboardPage>
  );
};

export default InstitutionManagement;
