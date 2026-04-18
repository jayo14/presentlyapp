import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const getConnectionState = () => {
  const connection = (navigator as any).connection;
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || '4g',
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 50,
    saveData: Boolean(connection?.saveData),
  };
};

export const OfflineIndicator: React.FC = () => {
  const [connectionState, setConnectionState] = useState(getConnectionState());
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);
  const hideTimerRef = useRef<number | null>(null);

  const isSlowConnection = useMemo(() => {
    const slowEffectiveType = ['slow-2g', '2g'].includes(connectionState.effectiveType);
    return connectionState.online && (
      connectionState.saveData ||
      slowEffectiveType ||
      connectionState.downlink <= 1.5 ||
      connectionState.rtt >= 800
    );
  }, [connectionState]);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(getConnectionState());
      setShowIndicator(true);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setConnectionState(getConnectionState());
      setShowIndicator(true);
    };

    const connection = (navigator as any).connection;
    const handleConnectionChange = () => setConnectionState(getConnectionState());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    connection?.addEventListener?.('change', handleConnectionChange);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    } else if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      connection?.removeEventListener?.('change', handleConnectionChange);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!showIndicator && !isSlowConnection) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'fixed top-4 left-1/2 -translate-x-1/2 z-[9999]',
        'px-4 py-2 rounded-full shadow-lg transition-all duration-300',
        'flex items-center gap-2 text-sm font-medium',
        !connectionState.online
          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
          : isSlowConnection
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      ].join(' ')}
    >
      {!connectionState.online ? <WifiOff size={16} /> : <Wifi size={16} />}
      <span>
        {!connectionState.online
          ? 'You are offline'
          : isSlowConnection
            ? 'Slow connection detected'
            : 'Back online'}
      </span>
    </div>
  );
};
