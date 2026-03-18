import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the "back online" indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={[
        'fixed top-4 left-1/2 -translate-x-1/2 z-[9999]',
        'px-4 py-2 rounded-full shadow-lg transition-all duration-300',
        'flex items-center gap-2 text-sm font-medium',
        isOnline
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse',
      ].join(' ')}
    >
      {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{isOnline ? 'Back online' : 'You are offline'}</span>
    </div>
  );
};
