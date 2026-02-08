import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, MapPin, QrCode, Hash, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '../Switch';

export const CreateAttendanceSessionPageRedesign: React.FC = () => {
  const navigate = useNavigate();
  const [qrEnabled, setQrEnabled] = useState(true);
  const [digitCodeEnabled, setDigitCodeEnabled] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(250);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeofenceRadius(Number(e.target.value));
  };

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4 pb-6 border-b border-zinc-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors -ml-2"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="flex-1 text-white text-xl font-bold ml-2">
          New Attendance Session
        </h1>
      </div>

      <div className="px-6">
        {/* Course Selection */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-3">Course Selection</h3>
          <button className="w-full bg-surface border border-primary/40 rounded-3xl p-5 flex items-center justify-between hover:bg-zinc-800 transition-colors">
            <span className="text-text-secondary text-base">Search course...</span>
            <ChevronDown size={24} className="text-text-muted" />
          </button>
        </div>

        {/* Lecture Hall */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-3">Lecture Hall</h3>
          <button className="w-full bg-surface border border-primary/40 rounded-3xl p-5 flex items-center justify-between hover:bg-zinc-800 transition-colors">
            <span className="text-text-secondary text-base">Select location</span>
            <MapPin size={24} className="text-text-muted" />
          </button>
        </div>

        {/* Verification Methods */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-4">Verification Methods</h3>

          <div className="space-y-3">
            {/* QR Code */}
            <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mr-3">
                  <QrCode size={20} className="text-primary" />
                </div>
                <span className="text-white font-semibold text-base">
                  QR Code
                </span>
              </div>
              <Switch 
                checked={qrEnabled}
                onCheckedChange={setQrEnabled}
              />
            </div>

            {/* 8-Digit Code */}
            <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mr-3">
                  <Hash size={20} className="text-primary" />
                </div>
                <span className="text-white font-semibold text-base">
                  8-Digit Code
                </span>
              </div>
              <Switch 
                checked={digitCodeEnabled}
                onCheckedChange={setDigitCodeEnabled}
              />
            </div>

            {/* GPS Verification */}
            <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mr-3">
                  <Crosshair size={20} className="text-primary" />
                </div>
                <span className="text-white font-semibold text-base">
                  GPS Verification
                </span>
              </div>
              <Switch 
                checked={gpsEnabled}
                onCheckedChange={setGpsEnabled}
              />
            </div>
          </div>
        </div>

        {/* Geofence Radius Slider */}
        {gpsEnabled && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white text-xl font-bold">Geofence Radius</h3>
              <span className="text-primary text-xl font-bold">{geofenceRadius}m</span>
            </div>

            {/* Custom Styled Slider */}
            <div className="relative py-2">
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={geofenceRadius}
                onChange={handleSliderChange}
                className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #C1B66D 0%, #C1B66D ${((geofenceRadius - 50) / 450) * 100}%, #3f3f46 ${((geofenceRadius - 50) / 450) * 100}%, #3f3f46 100%)`
                }}
              />

              {/* Labels */}
              <div className="flex justify-between mt-3">
                <span className="text-text-muted text-xs">50m</span>
                <span className="text-text-muted text-xs">500m</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Session Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-background border-t border-zinc-800 max-w-3xl mx-auto">
        <button 
          onClick={() => {
            // Handle session creation
            navigate(-1);
          }}
          className="w-full bg-primary hover:bg-primary/90 rounded-3xl py-5 flex items-center justify-center transition-colors"
        >
          <span className="text-black text-lg font-bold">
            Create Session
          </span>
        </button>
      </div>
    </div>
  );
};
