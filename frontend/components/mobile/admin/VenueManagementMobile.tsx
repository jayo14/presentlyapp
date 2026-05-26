import React, { useState, useEffect } from 'react';
import { 
  Plus, MagnifyingGlass, MapPin, 
  NavigationArrow, Buildings,
  MapTrifold
} from '@phosphor-icons/react';
import { venuesApi, institutionApi } from '../../../services/api/admin';
import { Venue, Institution } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { VenueManagement } from '../../Admin/VenueManagement';
import { Badge } from '../../../src/components/ui/badge';

export const VenueManagementMobile: React.FC = () => {
  const isDesktop = !useBreakpoint('md');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDesktop) return <VenueManagement />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <SEO title="Campus Assets | Presently Mobile" />

      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-display font-bold text-presently-black">Venues</h1>
         <p className="text-on-surface-variant font-medium text-sm">Manage campus geofences</p>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative flex-1 group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={18} />
            <input
              placeholder="Search venues..."
              className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface border border-outline shadow-sm active:scale-95 transition-all text-on-surface-variant">
            <MapTrifold size={20} weight="bold" />
         </button>
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
           filteredVenues.map(venue => (
             <div key={venue.id} className="p-6 bg-surface border border-outline rounded-[2.5rem] shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-14 h-14 rounded-[30%] bg-warm-ivory border border-outline flex items-center justify-center text-sungold shadow-sm">
                      <MapPin size={28} weight="bold" />
                   </div>
                   <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold text-presently-black text-lg line-clamp-1">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest mt-1">
                         <Buildings size={14} className="text-sungold" />
                         <span className="truncate">{venue.institution_name}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline/40 pt-5">
                   <div className="flex items-center gap-2 text-on-surface-variant">
                      <NavigationArrow size={16} weight="bold" className="text-sungold" />
                      <span className="text-xs font-bold tabular-nums">{venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}</span>
                   </div>
                   <Badge variant="secondary" className="font-bold">R: {venue.verification_radius}M</Badge>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};
