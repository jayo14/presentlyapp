import React, { useState, useEffect } from 'react';
import { X, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Venue, Institution } from '../../types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { geolocationService } from '../../services/geolocation';

interface VenueModalProps {
  venue?: Venue;
  institutions: Institution[];
  onSave: (data: Partial<Venue>) => Promise<void>;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number } | null;
  initialBoundary?: number[][] | null;
  drawMode?: 'point' | 'polygon';
}

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
];

export const VenueModal: React.FC<VenueModalProps> = React.memo(({
  venue,
  institutions,
  onSave,
  onClose,
  initialLocation,
  initialBoundary,
  drawMode,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { modalRef, modalProps } = useModalAccessibility(true, onClose);

  const [formData, setFormData] = useState<Partial<Venue>>({
    institution:
      venue?.institution ||
      venue?.institution_id ||
      (institutions.length > 0 ? institutions[0].id : undefined),
    name: venue?.name || '',
    code: venue?.code || '',
    description: venue?.description || '',
    building_name: venue?.building_name || '',
    floor_number: venue?.floor_number || '',
    room_number: venue?.room_number || '',
    capacity: venue?.capacity || undefined,
    latitude: initialLocation?.lat ?? venue?.latitude ?? 0,
    longitude: initialLocation?.lng ?? venue?.longitude ?? 0,
    elevation: venue?.elevation || undefined,
    boundary_coordinates: initialBoundary || venue?.boundary_coordinates || [],
    verification_radius: venue?.verification_radius || 100,
    venue_color: venue?.venue_color || '#6366f1',
    venue_opacity: venue?.venue_opacity ?? 0.15,
    border_width: venue?.border_width ?? 2,
    is_active: venue?.is_active !== false,
  });

  const [boundaryInput, setBoundaryInput] = useState('');

  useEffect(() => {
    if (initialBoundary && initialBoundary.length > 0) {
      setBoundaryInput(JSON.stringify(initialBoundary, null, 2));
      setFormData((prev) => ({
        ...prev,
        boundary_coordinates: initialBoundary,
      }));
    } else if (venue?.boundary_coordinates && venue.boundary_coordinates.length > 0) {
      setBoundaryInput(JSON.stringify(venue.boundary_coordinates, null, 2));
    } else {
      setBoundaryInput('');
    }
  }, [venue, initialBoundary]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleChange = (field: keyof Venue, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBoundaryChange = (value: string) => {
    setBoundaryInput(value);
    try {
      if (value.trim()) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setFormData((prev) => ({ ...prev, boundary_coordinates: parsed }));
        }
      } else {
        setFormData((prev) => ({ ...prev, boundary_coordinates: [] }));
      }
    } catch {
      // Invalid JSON, ignore
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await geolocationService.getCurrentPosition();
      handleChange('latitude', position.latitude);
      handleChange('longitude', position.longitude);
      if (position.altitude) handleChange('elevation', position.altitude);
    } catch (err: any) {
      setError('Failed to get current location: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setError('Venue name is required');
      return;
    }
    if (!formData.code?.trim()) {
      setError('Venue code is required');
      return;
    }
    if (!formData.institution) {
      setError(
        'Please select an institution. If none exist, please create one first in the Institutions tab.',
      );
      return;
    }
    const hasBoundaryNow = !!(formData.boundary_coordinates && formData.boundary_coordinates.length >= 3);
    if (!hasBoundaryNow && (formData.latitude == null || formData.longitude == null)) {
      setError('Latitude and longitude are required when boundary polygon is not provided');
      return;
    }
    if (!hasBoundaryNow && !formData.verification_radius) {
      setError('Verification radius is required when boundary polygon is not provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: Partial<Venue> = { ...formData };

      if (hasBoundaryNow && (payload.latitude == null || payload.longitude == null)) {
        const [firstLat, firstLng] = payload.boundary_coordinates![0];
        payload.latitude = firstLat;
        payload.longitude = firstLng;
      }
      if (!payload.boundary_coordinates?.length) {
        delete payload.boundary_coordinates;
      }
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to save venue');
    } finally {
      setLoading(false);
    }
  };

  const hasBoundary = !!(
    formData.boundary_coordinates && formData.boundary_coordinates.length >= 3
  );
  const isPolygonMode = hasBoundary || drawMode === 'polygon';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div
        {...modalProps}
        aria-labelledby="venue-modal-title"
        className="bg-surface border border-outline rounded-lg max-w-3xl w-full max-h-[92vh] overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-outline bg-surface z-10">
          <div>
            <h2 id="venue-modal-title" className="font-headline text-xl font-bold text-text">
              {venue ? 'Edit Venue' : 'Create Venue'}
            </h2>
            {drawMode && (
              <p className="text-xs text-textMuted mt-0.5">
                Mode:{' '}
                <span className="text-primary font-medium">
                  {isPolygonMode ? 'Polygon (drawn on map)' : 'Point + radius'}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-text transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* ── Basic Information ─────────────────────────────────── */}
          <section>
            <h3 className="font-headline text-lg font-semibold text-text mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">
                  Institution *
                </label>
                <select
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-surfaceHigh border border-outline rounded-lg text-text focus:outline-none focus:border-primary"
                  required
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.short_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">
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
                <label className="block text-sm font-medium text-textMuted mb-2">
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
                <label className="block text-sm font-medium text-textMuted mb-2">
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
                <label className="block text-sm font-medium text-textMuted mb-2">
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
                <label className="block text-sm font-medium text-textMuted mb-2">
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
                <label className="block text-sm font-medium text-textMuted mb-2">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) =>
                    handleChange(
                      'capacity',
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  placeholder="Maximum capacity"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-textMuted mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the venue"
                className="w-full px-4 py-2 bg-surfaceHigh border border-outline rounded-lg text-text focus:outline-none focus:border-primary min-h-[80px]"
              />
            </div>
          </section>

          {/* ── Geolocation ──────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-lg font-semibold text-text">
                Geolocation Data {isPolygonMode ? '(Optional)' : '*'}
              </h3>
              {!isPolygonMode && (
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  className="gap-2 text-sm"
                  disabled={loading}
                >
                  <MapPin className="w-4 h-4" />
                  Use Current Location
                </Button>
              )}
            </div>

            {!isPolygonMode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">
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
                  <label className="block text-sm font-medium text-textMuted mb-2">
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
                  <label className="block text-sm font-medium text-textMuted mb-2">
                    Elevation (m)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.elevation || ''}
                    onChange={(e) =>
                      handleChange(
                        'elevation',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="Height above sea level"
                  />
                </div>
              </div>
            )}

            {/* Radius – show when no polygon drawn */}
            {!isPolygonMode && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-textMuted mb-2">
                  Verification Radius (metres)
                </label>
                <Input
                  type="number"
                  value={formData.verification_radius}
                  onChange={(e) =>
                    handleChange('verification_radius', Number(e.target.value))
                  }
                  placeholder="100"
                  min="1"
                />
                <p className="text-xs text-textMuted mt-1">
                  Used when no boundary polygon is defined. Draw a polygon on the map to use
                  polygon-based verification instead.
                </p>
              </div>
            )}
            {isPolygonMode && (
              <p className="text-xs text-textMuted mt-2">
                Boundary polygon is set, so latitude/longitude and verification radius are optional.
              </p>
            )}
          </section>

          {/* ── Boundary Polygon ─────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-lg font-semibold text-text">
                Boundary Polygon{' '}
                <span className="text-sm font-normal text-textMuted">(Optional)</span>
              </h3>
              {hasBoundary && (
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                  ✓ {formData.boundary_coordinates!.length} points
                </span>
              )}
            </div>

            <textarea
              value={boundaryInput}
              onChange={(e) => handleBoundaryChange(e.target.value)}
              placeholder='[[7.5629, 4.5200], [7.5630, 4.5201], [7.5631, 4.5199], [7.5629, 4.5200]]'
              className="w-full px-4 py-2 bg-surfaceHigh border border-outline rounded-lg text-text focus:outline-none focus:border-primary min-h-[100px] font-mono text-sm"
            />
            <p className="text-xs text-textMuted mt-1">
              JSON array of [latitude, longitude] pairs. The polygon is closed automatically.
              You can also draw directly on the map using the "Draw Boundary" button.
            </p>
          </section>

          {/* ── Display Settings ─────────────────────────────────── */}
          <section>
            <h3 className="font-headline text-lg font-semibold text-text mb-4">Display Settings</h3>

            {/* Colour picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-textMuted mb-2">
                Venue Colour
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleChange('venue_color', c)}
                    className={`w-7 h-7 rounded-full border-border transition-transform ${
                      formData.venue_color === c
                        ? 'border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select colour ${c}`}
                  />
                ))}
                {/* Free-form hex input */}
                <input
                  type="color"
                  value={formData.venue_color || '#6366f1'}
                  onChange={(e) => handleChange('venue_color', e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border border-outline"
                  title="Custom colour"
                />
                <span className="text-sm text-textMuted font-mono">
                  {formData.venue_color}
                </span>
              </div>
            </div>

            {/* Opacity slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-textMuted mb-2">
                Fill Opacity –{' '}
                <span className="text-text font-mono">
                  {Math.round((formData.venue_opacity ?? 0.15) * 100)}%
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.venue_opacity ?? 0.15}
                onChange={(e) => handleChange('venue_opacity', Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Border thickness */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">
                Border Width –{' '}
                <span className="text-text font-mono">{formData.border_width ?? 2}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={formData.border_width ?? 2}
                onChange={(e) => handleChange('border_width', Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Live preview */}
            <div className="mt-4 flex items-center gap-3">
              <div
                className="w-24 h-12 rounded border-outline transition-all"
                style={{
                  backgroundColor: formData.venue_color || '#6366f1',
                  opacity: formData.venue_opacity ?? 0.15,
                  borderColor: formData.venue_color || '#6366f1',
                  borderWidth: `${formData.border_width ?? 2}px`,
                }}
              />
              <span className="text-xs text-textMuted">Polygon preview</span>
            </div>
          </section>

          {/* ── Status ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="venue-is-active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-outline bg-surfaceHigh text-primary focus:ring-primary"
            />
            <label htmlFor="venue-is-active" className="text-sm text-textMuted">
              Venue is active and available for use
            </label>
          </div>

          {/* ── Actions ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-4 border-t border-outline">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving…' : venue ? 'Update Venue' : 'Create Venue'}
            </Button>
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

VenueModal.displayName = 'VenueModal';

export default VenueModal;
