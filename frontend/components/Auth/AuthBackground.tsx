import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-warm-ivory">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sungold/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-sungold/5 blur-[100px] rounded-full" />
    </div>
  );
};
