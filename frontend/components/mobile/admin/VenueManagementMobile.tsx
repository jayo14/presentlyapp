import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, MapPin, 
  NavigationArrow, Buildings, CaretRight, 
  DotsThreeVertical, Trash, Pencil,
  Sliders, MapTrifold
} from '@phosphor-icons/react';

import { motion, AnimatePresence } from 'framer-motion';
import { venuesApi, institutionApi } from '../../../services/api/admin';
import { Venue, Institution } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { Sheet } from '../../Sheet';
import { VenueMap } from '../../Admin/VenueMap';

import { VenueModal } from '../../Admin/VenueModal';


export const VenueManagementMobile: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showMapSheet, setShowMapSheet] = useState(false);
  const [selectedMapVenue, setSelectedMapVenue] = useState<Venue | null>(null);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vData, iData] = await Promise.all([
        venuesApi.getAll(),
        institutionApi.getAll()
      ]);
      setVenues(vData);
      setInstitutions(iData);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInst = !selectedInstitution || v.institution === selectedInstitution;
    return matchesSearch && matchesInst;
  });

  const handleSaveVenue = async (formData: Partial<Venue>) => {
    try {
      if (editingVenue) {
        await venuesApi.updateVenue(editingVenue.id, formData);
        toast.success('Venue updated');
      } else {
        await venuesApi.createVenue(formData as any);
        toast.success('Venue created');
      }
      loadInitialData();
      setShowModal(false);
    } catch (err: any) {
      toast.error('Failed to save');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      await venuesApi.deleteVenue(id);
      toast.success('Deleted');
      loadInitialData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const openMapForVenue = (venue: Venue) => {
    setSelectedMapVenue(venue);
    setShowMapSheet(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Physical Venues | Presently Admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
           <p className="text-on-surface-variant font-medium">Geofence configuration.</p>
        </div>
        <button 
          onClick={() => { setEditingVenue(null); setShowModal(true); }}
          className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
        >
          <Plus size={24} weight="bold" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <MagnifyingGlass size={20} weight="bold" />
          </div>
          <input 
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <button 
             onClick={() => setSelectedInstitution(null)}
             className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
               !selectedInstitution ? 'bg-presently-black text-white' : 'bg-surface-container text-on-surface-variant border border-outline'
             }`}
           >
              All Universities
           </button>
           {institutions.map(inst => (
             <button 
               key={inst.id}
               onClick={() => setSelectedInstitution(inst.id)}
               className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                 selectedInstitution === inst.id ? 'bg-presently-black text-white' : 'bg-surface-container text-on-surface-variant border border-outline'
               }`}
             >
                {inst.short_name}
             </button>
           ))}
        </div>
      </div>

      {/* Venue List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-40 bg-surface-container animate-pulse rounded-3xl" />)
        ) : filteredVenues.length > 0 ? (
          filteredVenues.map((v) => (
            <motion.div 
              key={v.id}
              layout
              className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold">
                   <MapPin size={28} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg leading-tight truncate">{v.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <Buildings size={12} weight="fill" className="text-on-surface-variant opacity-50" />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {v.institution_name}
                      </span>
                   </div>
                </div>
                <button className="p-2 text-on-surface-variant">
                   <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              <div className="p-4 bg-surface-container rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <NavigationArrow size={16} weight="duotone" className="text-primary" />
                    <span className="text-xs font-bold font-mono">
                      {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-presently-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                    <Sliders size={12} />
                    {v.radius}m Radius
                 </div>
              </div>

              <div className="flex gap-2">
                 <button 
                  onClick={() => openMapForVenue(v)}
                  className="flex-1 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-primary active:scale-95 transition-all"
                 >
                   <MapTrifold size={18} weight="duotone" />
                   Map
                 </button>
                 <button 
                   onClick={() => { setEditingVenue(v); setShowModal(true); }}
                   className="flex-1 h-11 bg-surface-container rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
                 >
                    <Pencil size={18} weight="duotone" />
                    Configure
                 </button>
                 <button 
                   onClick={() => handleDelete(v.id)}
                   className="w-11 h-11 flex items-center justify-center rounded-xl text-error bg-error/5 border border-error/10 active:scale-90 transition-all"
                 >
                    <Trash size={18} weight="duotone" />
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
             <MapPin size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
             <p className="text-sm text-on-surface-variant font-medium">No venues found for this selection.</p>
          </div>
        )}
      </div>

      {showModal && (
        <VenueModal
          venue={editingVenue || undefined}
          institutions={institutions}
          onSave={handleSaveVenue}
          onClose={() => setShowModal(false)}
        />
      )}

      <Sheet
        isOpen={showMapSheet}
        onClose={() => setShowMapSheet(false)}
        side="bottom"
        title={selectedMapVenue ? `${selectedMapVenue.name} Map` : 'Venue Map'}
        description="Tap markers to inspect mapped venues."
        className="h-[88vh] max-h-[88vh]"
      >
        <div className="h-full min-h-[420px] rounded-2xl overflow-hidden border border-outline">
          <VenueMap
            venues={filteredVenues}
            selectedVenue={selectedMapVenue}
            onVenueClick={setSelectedMapVenue}
          />
        </div>
      </Sheet>
    </div>
  );
};
