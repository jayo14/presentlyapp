import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Background base */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Decorative Orbs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.1] blur-[120px] animate-float bg-primary"
        style={{ animation: 'pulse-orb 8s ease-in-out infinite' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.08] blur-[120px] bg-secondary"
        style={{ animation: 'pulse-orb 12s ease-in-out infinite reverse' }}
      />
      
      {/* Mesh Gradient / Grain */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')` 
        }} 
      />
    </div>
  );
};
