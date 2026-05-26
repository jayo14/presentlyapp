import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Edit2, Trash2, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Venue, Institution } from '../../types';
import { venuesApi, institutionApi } from '../../services/api/admin';
import { toast } from 'sonner';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { VenueModal } from './VenueModal';
import { VenueMap } from './VenueMap';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const VenueManagement: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

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

  useEffect(() => {
    if (selectedVenue && !filteredVenues.some((venue) => venue.id === selectedVenue.id)) {
      setSelectedVenue(null);
    }
  }, [filteredVenues, selectedVenue]);

  return (
    <DashboardPage
      title="Physical Venues"
      description="Configure GPS coordinates and attendance geofences for campuses."
      seoTitle="Physical Venues | Presently Admin"
      action={
        <Button size="lg" className="shadow-gold" onClick={handleCreateVenue}>
          <Plus size={24} className="mr-2" />
          Add Venue
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
              placeholder="Search venues by name or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-bold text-sm focus:ring-4 focus:ring-sungold/10 outline-none transition-all shadow-sm"
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

        <section className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
              Campus Geospatial Assets
            </h2>
            {selectedVenue && (
              <Button
                variant="outline"
                className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                onClick={() => setSelectedVenue(null)}
              >
                Clear Focus
              </Button>
            )}
          </div>
          <div className="h-[460px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-outline/30 bg-surface relative z-0 shadow-premium">
            <VenueMap
              venues={filteredVenues}
              selectedVenue={selectedVenue}
              onVenueClick={setSelectedVenue}
            />
          </div>
        </section>

        <ResponsiveGrid columns={3} gap={32}>
          {loading && venues.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
          ) : (
            filteredVenues.map(venue => (
              <ModernCard
                key={venue.id}
                padding="lg"
                className={cn(
                  "group transition-all flex flex-col justify-between h-full border border-outline/30 hover:border-sungold/40",
                  selectedVenue?.id === venue.id && "border-sungold shadow-gold"
                )}
              >
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-[30%] bg-warm-ivory border border-outline flex items-center justify-center text-sungold shadow-sm">
                      <MapPin size={28} weight="bold" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditVenue(venue)}
                        className="p-3 hover:bg-surface-highest/40 rounded-xl border border-outline text-on-surface-variant transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVenue(venue.id)}
                        className="p-3 hover:bg-soft-coral/10 rounded-xl border border-outline text-soft-coral transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <button
                      type="button"
                      className="text-left w-full group/title"
                      onClick={() => setSelectedVenue(venue)}
                    >
                      <h3 className="font-display text-2xl font-bold text-presently-black leading-tight mb-2 group-hover/title:text-sungold transition-colors">
                        {venue.name}
                      </h3>
                    </button>
                    <div className="flex items-center gap-2">
                      <Building size={16} weight="bold" className="text-sungold" />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{venue.institution_name}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline/40 space-y-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation size={16} weight="bold" className="text-sungold" />
                        <span className="text-xs font-bold text-on-surface-variant tabular-nums">
                          {venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-bold">RADIUS: {venue.verification_radius}M</Badge>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </ResponsiveGrid>

        {!loading && filteredVenues.length === 0 && (
          <div className="text-center py-32 bg-surface-highest/20 rounded-[3rem] border-2 border-dashed border-outline/40">
            <MapPin className="w-24 h-24 text-outline mx-auto mb-6 opacity-20" />
            <h4 className="font-display text-3xl font-bold text-presently-black">No Venues Found</h4>
            <p className="text-on-surface-variant font-medium mt-3 max-w-sm mx-auto">Create a physical venue to enable geospatial attendance tracking.</p>
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
    </DashboardPage>
  );
};

export default VenueManagement;
