/**
 * Service Worker Update Notifier
 * 
 * Shows a notification when a new version of the app is available
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const ServiceWorkerUpdateNotifier: React.FC = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
      return;
    }

    // Check for updates on page load
    const checkForUpdates = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    };

    checkForUpdates();

    // Listen for service worker updates
    const onUpdateFound = (registration: ServiceWorkerRegistration) => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New service worker is waiting to activate
            console.log('[SW Update] New content is available');
            setWaitingWorker(installingWorker);
            setShowUpdatePrompt(true);
          } else {
            // First time install
            console.log('[SW Update] Content is cached for offline use');
          }
        }
      };
    };

    // Register update listener
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        onUpdateFound(registration);
      });

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdatePrompt(true);
      }
    });

    // Note: We deliberately do NOT listen to 'controllerchange' here to avoid reload loops.
    // The update button triggers SKIP_WAITING, which activates the new SW.
    // The user will get the new version on next navigation or refresh.

    // Check for updates every 60 minutes
    const updateInterval = setInterval(() => {
      checkForUpdates();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
      
      // Reload the page to load the new version
      // We do this on explicit user action, so it's safe from infinite loops
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="bg-surface text-text rounded-lg shadow-lg border border-outline p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-headline font-semibold mb-1">Update Available</h4>
            <p className="text-sm text-textMuted mb-3">
              A new version of Presently is available. Refresh to get the latest features and improvements.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary-fixedlack text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Now</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-textMuted hover:text-text text-sm font-medium rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-textMuted hover:text-textMuted"
            aria-label="Dismiss update notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
