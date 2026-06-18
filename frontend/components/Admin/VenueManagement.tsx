import React, { useState, useEffect, lazy, Suspense } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, Building, AlertCircle, Loader, Map as MapIcon, List, Grid, X as CloseIcon, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Venue, Institution } from '../../types';
import { venueApi } from '../../services/api/venues';
import { institutionsApi } from '../../services/api/institutions';
import { SEO } from '../SEO';

// Lazy load heavy components
const VenueModal = lazy(() => import('./VenueModal'));
const VenueMap = lazy(() => import('./VenueMap'));

export const VenueManagement: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [newVenueLocation, setNewVenueLocation] = useState<{lat: number; lng: number} | null>(null);
  const [newVenueBoundary, setNewVenueBoundary] = useState<number[][] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [activeVenueIds, setActiveVenueIds] = useState<Set<number>>(new Set());

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load initial data
  useEffect(() => {
    loadData();
    fetchActiveSessions();
    
    // Refresh active sessions every minute
    const interval = setInterval(fetchActiveSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const ids = await venueApi.getActiveSessions();
      setActiveVenueIds(new Set(ids));
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
    }
  };

  // Filter-driven loading
  useEffect(() => {
    loadVenues(selectedInstitution || undefined);
  }, [selectedInstitution]);

  const loadData = async () => {
    try {
      setLoading(true);
      const institutionsData = await institutionsApi.getAllInstitutions();
      const currentInstitutions = Array.isArray(institutionsData) ? institutionsData : [];
      setInstitutions(currentInstitutions);
      
      // If no institutions, still finish loading
      if (currentInstitutions.length === 0) {
          setLoading(false);
      }
      // loadVenues will be triggered by selectedInstitution effect if institutions exists
      setError(null);
    } catch (err) {
      setError('Failed to load institutions');
      console.error(err);
      setLoading(false);
    }
  };

  const loadVenues = async (institutionId?: number) => {
    try {
      setLoading(true);
      const filters: any = {};
      if (institutionId) filters.institution = institutionId;
      
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

  const getFilteredVenues = (term: string) => {
    if (!Array.isArray(venues)) return [];
    const search = term.toLowerCase();
    return venues.filter(venue => {
      if (!venue) return false;
      const nameMatch = venue.name?.toLowerCase().includes(search) ?? false;
      const codeMatch = venue.code?.toLowerCase().includes(search) ?? false;
      const buildingMatch = venue.building_name?.toLowerCase().includes(search) ?? false;
      return nameMatch || codeMatch || buildingMatch;
    });
  };

  const filteredVenues = getFilteredVenues(debouncedSearchTerm);
  const displayVenues = getFilteredVenues(searchTerm);

  const handleCreateVenue = () => {
    setEditingVenue(null);
    setNewVenueLocation(null);
    setNewVenueBoundary(null);
    setIsDrawing(false);
    setShowModal(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    // When clicking on map in non-drawing mode, create venue at that location (point mode)
    if (!isDrawing) {
      setNewVenueLocation({ lat, lng });
      setNewVenueBoundary(null);
      setEditingVenue(null);
      setShowModal(true);
    }
  };

  const handleBoundaryComplete = (coords: number[][]) => {
    if (coords.length > 0) {
        if (isDrawing) {
            if (selectedVenue) {
              // Update selected venue boundary directly from drawing mode
              setIsDrawing(false);
              handleSaveVenue({ ...selectedVenue, boundary_coordinates: coords });
            } else {
              // New venue via drawing
              setNewVenueLocation({ lat: coords[0][0], lng: coords[0][1] });
              setNewVenueBoundary(coords);
              setEditingVenue(null);
              setIsDrawing(false);
              setShowModal(true);
            }
        } else if (selectedVenue) {
            // Updating existing venue boundary directly on map
            handleSaveVenue({ ...selectedVenue, boundary_coordinates: coords });
        }
    }
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsDrawing(false);
    setNewVenueBoundary(null);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setIsDrawing(false);
    setNewVenueBoundary(null);
    setShowModal(true);
  };

  const handleSaveVenue = async (formData: Partial<Venue>) => {
    try {
      let savedVenue: Venue;
      // Determine if we are updating or creating
      // Use formData.id if present (e.g. from map update), otherwise check editingVenue
      const idToUpdate = formData.id || editingVenue?.id;

      // Ensure all required fields are present and properly formatted
      const cleanedData: Partial<Venue> = {
        ...formData,
        name: formData.name?.trim() || '',
        code: formData.code?.trim() || '',
        latitude: formData.latitude !== undefined ? Number(formData.latitude) : 0,
        longitude: formData.longitude !== undefined ? Number(formData.longitude) : 0,
      };

      if (idToUpdate) {
        savedVenue = await venueApi.update(idToUpdate, cleanedData);
      } else {
        savedVenue = await venueApi.create(cleanedData);
      }
      await loadVenues(selectedInstitution || undefined);
      setSelectedVenue(savedVenue);
      setViewMode('map');
      setShowModal(false);
    } catch (err: any) {
      console.error('Save venue error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to save venue';
      throw new Error(errorMsg);
    }
  };

  const handleDeleteVenue = async (id: number) => {
    if (!confirm('Are you sure you want to delete this venue?')) {
      return;
    }

    try {
      await venueApi.delete(id);
      if (selectedVenue?.id === id) {
        setSelectedVenue(null);
      }
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
      <SEO title="Venues | Admin | Presently" description="Manage campus venues with geolocation and polygon boundary mapping." />
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-headline text-2xl font-bold text-text flex items-center gap-2">
              Venue Management
              <span className="text-xs font-normal bg-surfaceHigh px-2 py-1 rounded-full text-textMuted">
                {filteredVenues.length}
              </span>
            </h2>
            <p className="text-sm text-textMuted">Manage venue locations with geolocation data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surfaceHigh rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-primary text-background' 
                  : 'text-muted-foreground hover:text-background'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-background' 
                  : 'text-muted-foreground hover:text-background'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {
                loadData();
                loadVenues(selectedInstitution || undefined);
            }}
            disabled={loading}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {viewMode === 'map' && (
            <Button 
              variant={isDrawing ? 'primary' : 'secondary'} 
              onClick={() => setIsDrawing(!isDrawing)}
              className="gap-2"
            >
              <MapIcon className="w-4 h-4" />
              {isDrawing ? 'Cancel Drawing' : 'Draw Boundary'}
            </Button>
          )}
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
      <div className="bg-surface/50 border border-outline p-4 rounded-xl flex flex-col md:flex-row gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name, code or building..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedVenue(null); // Clear selection on search
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-outline rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => {
                  setSearchTerm('');
                  setSelectedVenue(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-text transition-colors"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-textMuted hidden md:block" />
            <select
              value={selectedInstitution || ''}
              onChange={(e) => {
                  setSelectedInstitution(e.target.value ? Number(e.target.value) : null);
                  setSearchTerm(''); // Clear search when switching institutions
              }}
              className="px-4 py-2 bg-background border border-outline rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-w-[200px]"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.short_name}</option>
              ))}
            </select>
        </div>

        {(searchTerm || selectedInstitution) && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                    setSearchTerm('');
                    setSelectedInstitution(null);
                }}
                className="text-textMuted hover:text-text"
            >
                Reset
            </Button>
        )}
      </div>

      {/* Map or Grid View */}
      {viewMode === 'map' ? (
        <div className="flex-1 min-h-[500px] md:min-h-[600px] bg-surface border border-outline rounded-lg overflow-hidden relative flex flex-col h-full">
          <Suspense fallback={
            <div className="absolute inset-0 bg-surface border border-outline rounded-lg overflow-hidden flex flex-col items-center justify-center gap-4">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse"></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                <div className="text-textMuted font-medium animate-pulse">Initializing Map Engine...</div>
              </div>
            </div>
          }>
            <VenueMap
              venues={filteredVenues}
              activeSessions={activeVenueIds}
              onVenueClick={handleVenueClick}
              onMapClick={handleMapClick}
              selectedVenue={selectedVenue}
              drawingMode={isDrawing}
              onBoundaryComplete={handleBoundaryComplete}
              isFullScreen={isMapFullScreen}
              onToggleFullScreen={() => setIsMapFullScreen(!isMapFullScreen)}
            />
          </Suspense>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {displayVenues.map(venue => (
          <div
            key={venue.id}
            className="bg-surface border border-outline rounded-lg p-4 hover:border-outline transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-headline font-semibold text-text">{venue.name}</h3>
                  <p className="text-xs text-textMuted">{venue.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedVenue(venue);
                    setViewMode('map');
                  }}
                  className="p-2 hover:bg-surfaceHigh rounded-lg transition-colors text-primary"
                  title="View on map"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditVenue(venue)}
                  className="p-2 hover:bg-surfaceHigh rounded-lg transition-colors"
                  title="Edit venue"
                >
                  <Edit2 className="w-4 h-4 text-textMuted" />
                </button>
                <button
                  onClick={() => handleDeleteVenue(venue.id)}
                  className="p-2 hover:bg-surfaceHigh rounded-lg transition-colors"
                  title="Delete venue"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {venue.building_name && (
                <div className="flex items-center gap-2 text-textMuted">
                  <Building className="w-4 h-4" />
                  <span>{venue.building_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-textMuted">
                <MapIcon className="w-4 h-4" />
                <span>
                  {venue.latitude && venue.longitude ? (
                    <>
                      {Number(venue.latitude).toFixed(6)}, {Number(venue.longitude).toFixed(6)}
                      {venue.elevation && ` @ ${venue.elevation}m`}
                    </>
                  ) : (
                    'No coordinates set'
                  )}
                </span>
              </div>

              {venue.capacity && (
                <div className="text-textMuted">
                  Capacity: {venue.capacity} people
                </div>
              )}

              {venue.boundary_coordinates && venue.boundary_coordinates.length > 0 && (
                <div className="text-green-400 text-xs">
                  ✓ Boundary mapped ({venue.boundary_coordinates.length} points)
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline">
                <span className={`px-2 py-1 rounded text-xs ${
                  venue.is_active 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-surfaceHigh text-muted-foreground'
                }`}>
                  {venue.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {filteredVenues.length === 0 && !loading && (
        <div className="text-center py-12 bg-surface/30 border border-dashed border-outline rounded-2xl">
          <MapPin className="w-16 h-16 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted font-medium">
            {venues.length === 0 
              ? "No venues created yet" 
              : `No venues match your filters (${venues.length} total venues)`}
          </p>
          <p className="text-textMuted text-sm mt-1">
            {venues.length === 0 
              ? "Create your first venue to start mapping your campus" 
              : "Try adjusting your search term or institution filter"}
          </p>
          <div className="flex justify-center gap-3 mt-6">
            {venues.length > 0 && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedInstitution(null);
                }} 
                variant="ghost" 
                size="sm"
              >
                Clear all filters
              </Button>
            )}
            <Button onClick={handleCreateVenue} variant="secondary" size="sm">
              <Plus size={16} className="mr-2" /> 
              {venues.length === 0 ? "Create First Venue" : "Add New Venue"}
            </Button>
          </div>
        </div>
      )}

      {/* Venue Modal */}
      {showModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <VenueModal
            venue={editingVenue || undefined}
            institutions={institutions}
            onSave={handleSaveVenue}
            onClose={() => {
              setShowModal(false);
              setNewVenueLocation(null);
              setNewVenueBoundary(null);
            }}
            initialLocation={newVenueLocation}
            initialBoundary={newVenueBoundary}
            drawMode={newVenueBoundary ? 'polygon' : 'point'}
          />
        </Suspense>
      )}
    </div>
  );
};

export default VenueManagement;
