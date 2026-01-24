import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, Building, AlertCircle, Loader, Map, List, Grid } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Venue, Institution } from '../../types';
import { venueApi } from '../../services/api/venues';
import { institutionsApi } from '../../services/api/institutions';
import VenueModal from './VenueModal';
import VenueMap from './VenueMap';

export const VenueManagement: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [newVenueLocation, setNewVenueLocation] = useState<{lat: number; lng: number} | null>(null);

  // Load institutions and venues
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadVenues(selectedInstitution);
    } else {
      loadVenues();
    }
  }, [selectedInstitution]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [institutionsData, venuesData] = await Promise.all([
        institutionsApi.getAllInstitutions(),
        venueApi.getAll()
      ]);
      setInstitutions(Array.isArray(institutionsData) ? institutionsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVenues = async (institutionId?: number) => {
    try {
      setLoading(true);
      const filters = institutionId ? { institution: institutionId } : undefined;
      const data = await venueApi.getAll(filters);
      setVenues(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load venues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = Array.isArray(venues) ? venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.building_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleCreateVenue = () => {
    setEditingVenue(null);
    setNewVenueLocation(null);
    setShowModal(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    // When clicking on map, prepare to create venue at that location
    setNewVenueLocation({ lat, lng });
    setEditingVenue(null);
    setShowModal(true);
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setShowModal(true);
  };

  const handleSaveVenue = async (formData: Partial<Venue>) => {
    try {
      if (editingVenue) {
        await venueApi.update(editingVenue.id, formData);
      } else {
        await venueApi.create(formData);
      }
      await loadVenues(selectedInstitution || undefined);
      setShowModal(false);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to save venue');
    }
  };

  const handleDeleteVenue = async (id: number) => {
    if (!confirm('Are you sure you want to delete this venue?')) {
      return;
    }

    try {
      await venueApi.delete(id);
      await loadVenues(selectedInstitution || undefined);
    } catch (err) {
      setError('Failed to delete venue');
      console.error(err);
    }
  };

  if (loading && venues.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Venue Management</h2>
            <p className="text-sm text-zinc-400">Manage venue locations with geolocation data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-primary text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleCreateVenue} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Venue
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-500 font-semibold">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedInstitution || ''}
          onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
        >
          <option value="">All Institutions</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.short_name}</option>
          ))}
        </select>
      </div>

      {/* Map or Grid View */}
      {viewMode === 'map' ? (
        <div className="flex-1 min-h-[500px] md:min-h-[600px] bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative">
          <VenueMap
            venues={filteredVenues}
            onVenueClick={handleVenueClick}
            onMapClick={handleMapClick}
            selectedVenue={selectedVenue}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {filteredVenues.map(venue => (
          <div
            key={venue.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{venue.name}</h3>
                  <p className="text-xs text-zinc-400">{venue.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditVenue(venue)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Edit venue"
                >
                  <Edit2 className="w-4 h-4 text-zinc-400" />
                </button>
                <button
                  onClick={() => handleDeleteVenue(venue.id)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Delete venue"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {venue.building_name && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Building className="w-4 h-4" />
                  <span>{venue.building_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-zinc-400">
                <Map className="w-4 h-4" />
                <span>
                  {Number(venue.latitude).toFixed(6)}, {Number(venue.longitude).toFixed(6)}
                  {venue.elevation && ` @ ${venue.elevation}m`}
                </span>
              </div>

              {venue.capacity && (
                <div className="text-zinc-400">
                  Capacity: {venue.capacity} people
                </div>
              )}

              {venue.boundary_coordinates && venue.boundary_coordinates.length > 0 && (
                <div className="text-green-400 text-xs">
                  ✓ Boundary mapped ({venue.boundary_coordinates.length} points)
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
                <span className={`px-2 py-1 rounded text-xs ${
                  venue.is_active 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {venue.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {filteredVenues.length === 0 && !loading && viewMode === 'grid' && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No venues found</p>
          <p className="text-zinc-500 text-sm mt-1">Create your first venue to get started</p>
        </div>
      )}

      {/* Venue Modal */}
      {showModal && (
        <VenueModal
          venue={editingVenue || undefined}
          institutions={institutions}
          onSave={handleSaveVenue}
          onClose={() => {
            setShowModal(false);
            setNewVenueLocation(null);
          }}
          initialLocation={newVenueLocation}
        />
      )}
    </div>
  );
};

export default VenueManagement;
