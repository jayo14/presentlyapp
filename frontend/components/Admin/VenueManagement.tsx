import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, Building, Navigation, Loader, AlertCircle, X } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Venue, Institution } from '../../types';
import { venuesApi, institutionApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { VenueModal } from './VenueModal';

export const VenueManagement: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instRes] = await Promise.all([
        institutionApi.getAll(),
        loadVenues()
      ]);
      setInstitutions(instRes);
    } catch (err) {
      setError('Failed to load initial data');
      toast.error('Load failed');
    } finally {
      setLoading(false);
    }
  };

  const loadVenues = async () => {
    try {
      const data = await venuesApi.getAll();
      setVenues(data);
    } catch (err) {
      setError('Failed to load venues');
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        venue.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstitution = !selectedInstitution || venue.institution === selectedInstitution;
    return matchesSearch && matchesInstitution;
  });

  const handleCreateVenue = () => {
    setEditingVenue(null);
    setShowModal(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setShowModal(true);
  };

  const handleSaveVenue = async (formData: Partial<Venue>) => {
    try {
      if (editingVenue) {
        await venuesApi.updateVenue(editingVenue.id, formData);
        toast.success('Venue updated');
      } else {
        await venuesApi.createVenue(formData as Omit<Venue, 'id' | 'created_at' | 'updated_at' | 'institution_name'>);
        toast.success('Venue created');
      }
      loadVenues();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save venue');
      throw err;
    }
  };

  const handleDeleteVenue = async (id: number) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    try {
      await venuesApi.deleteVenue(id);
      toast.success('Venue deleted');
      loadVenues();
    } catch (err) {
      toast.error('Failed to delete venue');
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="Physical Venues | Presently Admin" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">GEOSPATIAL ASSETS</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Physical Venues
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Configure GPS coordinates and attendance geofences.
           </p>
        </div>
        <Button size="lg" className="h-16 px-10 shadow-gold" onClick={handleCreateVenue}>
          <Plus size={24} className="mr-2" />
          Add Venue
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
            placeholder="Search venues by name or institution..."
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
        {loading && venues.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />
          ))
        ) : (
          filteredVenues.map(venue => (
            <ModernCard
              key={venue.id}
              padding="lg"
              className="group hover:border-sungold/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold">
                    <MapPin size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditVenue(venue)}
                      className="p-2 hover:bg-slate-50 rounded-xl border border-outline text-on-surface-variant"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteVenue(venue.id)}
                      className="p-2 hover:bg-red-50 rounded-xl border border-outline text-soft-coral"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-presently-black leading-tight mb-1">{venue.name}</h3>
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-sungold" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{venue.institution_name}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-sungold" />
                      <span className="text-xs font-medium text-on-surface-variant">
                        {venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">RADIUS: {venue.radius}M</Badge>
                  </div>
                </div>
              </div>
            </ModernCard>
          ))
        )}
      </div>

      {!loading && filteredVenues.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-outline">
          <MapPin className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h4 className="font-display text-2xl font-bold text-presently-black">No Venues Found</h4>
          <p className="text-on-surface-variant font-medium mt-2">Create a physical venue to enable attendance tracking.</p>
        </div>
      )}

      {showModal && (
        <VenueModal
          venue={editingVenue || undefined}
          institutions={institutions}
          onSave={handleSaveVenue}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default VenueManagement;
