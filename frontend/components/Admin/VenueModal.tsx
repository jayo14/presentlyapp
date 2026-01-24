import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, MapPin, Map as MapIcon } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Venue, Institution } from '../../types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface VenueModalProps {
  venue?: Venue;
  institutions: Institution[];
  onSave: (data: Partial<Venue>) => Promise<void>;
  onClose: () => void;
  initialLocation?: {lat: number; lng: number} | null;
  initialBoundary?: number[][] | null;
}

export const VenueModal: React.FC<VenueModalProps> = ({
  venue,
  institutions,
  onSave,
  onClose,
  initialLocation,
  initialBoundary
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMapHelper, setShowMapHelper] = useState(false);
  
  const { modalRef, modalProps } = useModalAccessibility(true, onClose);
  
  const [formData, setFormData] = useState<Partial<Venue>>({
    institution_id: venue?.institution_id || institutions[0]?.id || 0,
    name: venue?.name || '',
    code: venue?.code || '',
    description: venue?.description || '',
    building_name: venue?.building_name || '',
    floor_number: venue?.floor_number || '',
    room_number: venue?.room_number || '',
    capacity: venue?.capacity || undefined,
    latitude: initialLocation?.lat || venue?.latitude || 0,
    longitude: initialLocation?.lng || venue?.longitude || 0,
    elevation: venue?.elevation || undefined,
    boundary_coordinates: initialBoundary || venue?.boundary_coordinates || [],
    verification_radius: venue?.verification_radius || 100,
    is_active: venue?.is_active !== false,
  });

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const [boundaryInput, setBoundaryInput] = useState('');

  useEffect(() => {
    if (initialBoundary) {
      setBoundaryInput(JSON.stringify(initialBoundary, null, 2));
    } else if (venue?.boundary_coordinates) {
      setBoundaryInput(JSON.stringify(venue.boundary_coordinates, null, 2));
    }
  }, [venue, initialBoundary]);

  const handleChange = (field: keyof Venue, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBoundaryChange = (value: string) => {
    setBoundaryInput(value);
    try {
      if (value.trim()) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setFormData(prev => ({ ...prev, boundary_coordinates: parsed }));
        }
      } else {
        setFormData(prev => ({ ...prev, boundary_coordinates: [] }));
      }
    } catch (e) {
      // Invalid JSON, don't update
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleChange('latitude', position.coords.latitude);
          handleChange('longitude', position.coords.longitude);
          if (position.coords.altitude) {
            handleChange('elevation', position.coords.altitude);
          }
          setLoading(false);
        },
        (error) => {
          setError('Failed to get current location: ' + error.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      setError('Venue name is required');
      return;
    }
    if (!formData.code?.trim()) {
      setError('Venue code is required');
      return;
    }
    if (!formData.institution_id) {
      setError('Institution is required');
      return;
    }
    if (formData.latitude == null || formData.longitude == null) {
      setError('Latitude and longitude are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save venue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        {...modalProps}
        aria-labelledby="modal-title"
        className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900">
          <h2 id="modal-title" className="text-xl font-bold text-foreground">
            {venue ? 'Edit Venue' : 'Create Venue'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Institution *
                </label>
                <select
                  value={formData.institution_id}
                  onChange={(e) => handleChange('institution_id', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.short_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Venue Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Main Lecture Hall"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Venue Code *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="e.g., MLH-101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Building Name
                </label>
                <Input
                  type="text"
                  value={formData.building_name}
                  onChange={(e) => handleChange('building_name', e.target.value)}
                  placeholder="e.g., Science Block A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Floor Number
                </label>
                <Input
                  type="text"
                  value={formData.floor_number}
                  onChange={(e) => handleChange('floor_number', e.target.value)}
                  placeholder="e.g., Ground Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Room Number
                </label>
                <Input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => handleChange('room_number', e.target.value)}
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => handleChange('capacity', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Maximum capacity"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the venue"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary min-h-[80px]"
              />
            </div>
          </div>

          {/* Geolocation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Geolocation Data *</h3>
              <Button
                type="button"
                onClick={getCurrentLocation}
                className="gap-2 text-sm"
                disabled={loading}
              >
                <MapPin className="w-4 h-4" />
                Use Current Location
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Latitude *
                </label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', Number(e.target.value))}
                  placeholder="e.g., 7.5629"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Longitude *
                </label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', Number(e.target.value))}
                  placeholder="e.g., 4.5200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Elevation (meters)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.elevation || ''}
                  onChange={(e) => handleChange('elevation', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Height above sea level"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Verification Radius (meters)
              </label>
              <Input
                type="number"
                value={formData.verification_radius}
                onChange={(e) => handleChange('verification_radius', Number(e.target.value))}
                placeholder="100"
                min="1"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Used if no boundary polygon is defined
              </p>
            </div>
          </div>

          {/* Boundary Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Boundary Polygon (Optional)</h3>
              <button
                type="button"
                onClick={() => setShowMapHelper(!showMapHelper)}
                className="text-primary text-sm hover:underline"
              >
                {showMapHelper ? 'Hide' : 'Show'} Helper
              </button>
            </div>

            {showMapHelper && (
              <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 text-sm text-zinc-400">
                <p className="font-semibold text-foreground mb-2">How to define boundary:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use online tools like geojson.io or Google Maps</li>
                  <li>Draw a polygon around your venue</li>
                  <li>Copy coordinates as array of [latitude, longitude] pairs</li>
                  <li>Paste JSON below (must have at least 3 coordinate pairs)</li>
                </ul>
                <p className="mt-2">
                  Example: [[7.5629, 4.5200], [7.5630, 4.5201], [7.5631, 4.5199]]
                </p>
              </div>
            )}

            <textarea
              value={boundaryInput}
              onChange={(e) => handleBoundaryChange(e.target.value)}
              placeholder='[[7.5629, 4.5200], [7.5630, 4.5201], [7.5631, 4.5199], [7.5629, 4.5200]]'
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary min-h-[120px] font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">
              JSON array of coordinate pairs defining the venue boundary. First and last points should match to close the polygon.
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-zinc-400">
              Venue is active and available for use
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : venue ? 'Update Venue' : 'Create Venue'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueModal;
