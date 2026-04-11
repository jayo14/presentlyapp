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
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
