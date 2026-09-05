import React, { useEffect, useState } from 'react';

export interface ServerWarmupBannerProps {
  backendUrl?: string;
  timeoutThresholdMs?: number;
  autoHideMs?: number;
}

export const ServerWarmupBanner: React.FC<ServerWarmupBannerProps> = ({
  backendUrl,
  timeoutThresholdMs = 1800,
  autoHideMs = 3000,
}) => {
  const [status, setStatus] = useState<'idle' | 'warming' | 'ready' | 'hidden'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let isSlow = false;
    let completed = false;

    // Derive health check URL from backend URL or environment variable
    const rawUrl =
      backendUrl ||
      import.meta.env.VITE_API_URL ||
      'https://presentlyapp-alpha.onrender.com';

    const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
    const origin = cleanUrl.replace(/\/api$/i, '');
    const healthEndpoint = `${origin}/health`;

    const controller = new AbortController();

    // Timer triggers after threshold (1.8s) if response not received yet
    timer = setTimeout(() => {
      if (!completed && isMounted) {
        isSlow = true;
        setStatus('warming');
        setMessage('⚡ Waking up cloud backend server (Render free tier may take ~30s on first load)...');
      }
    }, timeoutThresholdMs);

    // Initial pre-flight health fetch
    fetch(healthEndpoint, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((res) => {
        completed = true;
        if (timer) clearTimeout(timer);
        if (!isMounted) return;

        if (res.ok) {
          if (isSlow) {
            // Cold-start occurred & was shown: transition banner to ready and auto-hide
            setStatus('ready');
            setMessage('✅ Backend server active and ready!');
            hideTimer = setTimeout(() => {
              if (isMounted) setStatus('hidden');
            }, autoHideMs);
          } else {
            // Fast warm response (<1.8s): keep banner completely hidden
            setStatus('hidden');
          }
        } else {
          if (isSlow) {
            setMessage('⚠️ Backend check returned an unexpected status. Retrying in background...');
            hideTimer = setTimeout(() => {
              if (isMounted) setStatus('hidden');
            }, autoHideMs);
          }
        }
      })
      .catch((err) => {
        completed = true;
        if (timer) clearTimeout(timer);
        if (err.name === 'AbortError') return;

        if (isMounted && isSlow) {
          setMessage('⚡ Backend server still waking up...');
          hideTimer = setTimeout(() => {
            if (isMounted) setStatus('hidden');
          }, autoHideMs);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
      if (timer) clearTimeout(timer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [backendUrl, timeoutThresholdMs, autoHideMs]);

  if (status === 'idle' || status === 'hidden') {
    return null;
  }

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 max-w-md transition-all duration-300 ease-in-out"
    >
      {status === 'warming' && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent shrink-0" />
      )}
      {status === 'ready' && (
        <span className="text-emerald-500 font-semibold text-base shrink-0">✓</span>
      )}
      <p className="text-xs sm:text-sm font-medium leading-snug">
        {message}
      </p>
      <button
        onClick={() => setStatus('hidden')}
        className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs shrink-0"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
};

export default ServerWarmupBanner;
