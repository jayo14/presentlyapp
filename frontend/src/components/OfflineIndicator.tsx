import React, { useEffect, useRef, useState } from 'react';
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
  const [isDismissed, setIsDismissed] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(getConnectionState());
      setShowIndicator(true);
      setIsDismissed(false);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => setShowIndicator(false), 5000);
    };

    const handleOffline = () => {
      setConnectionState(getConnectionState());
      setShowIndicator(true);
      setIsDismissed(false);
    };

    const connection = (navigator as any).connection;
    const handleConnectionChange = () => {
      setConnectionState(getConnectionState());
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    connection?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      connection?.removeEventListener?.('change', handleConnectionChange);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (isDismissed) return null;
  if (!showIndicator) return null;

  const getStatusConfig = () => {
    if (!connectionState.online) {
      return {
        className: 'bg-red-500/90 text-white backdrop-blur-md border border-red-400/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        icon: <WifiOff size={16} className="animate-pulse" />,
        text: 'You are currently offline',
        dismissible: false
      };
    }
    return {
      className: 'bg-emerald-500/90 text-white backdrop-blur-md border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      icon: <Wifi size={16} />,
      text: 'Connection restored',
      dismissible: false
    };
  };

  const config = getStatusConfig();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]
        px-6 py-3 rounded-2xl shadow-2xl transition-all duration-500
        flex items-center gap-3 text-sm font-bold tracking-tight
        ${config.className}
        ${showIndicator ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};
