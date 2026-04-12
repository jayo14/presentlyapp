import React, { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  const showIosTip = useMemo(() => isIos() && !installed, [installed]);
  const showInstallPrompt = useMemo(() => !!deferredPrompt && !dismissed && !installed, [deferredPrompt, dismissed, installed]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (!showInstallPrompt && !showIosTip) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[70] max-w-xs animate-slide-up">
      <div className="rounded-xl border border-outline bg-surface/95 backdrop-blur p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Download size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-headline font-semibold text-text mb-1">Install Presently</h4>
            {showInstallPrompt ? (
              <>
                <p className="text-xs text-textMuted mb-3">Add Presently to your home screen for faster loading and offline support.</p>
                <button
                  type="button"
                  onClick={installApp}
                  className="px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-semibold hover:opacity-90"
                >
                  Install App
                </button>
              </>
            ) : (
              <p className="text-xs text-textMuted">
                On iOS Safari, tap <strong>Share</strong> then <strong>Add to Home Screen</strong>.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-textMuted hover:text-text"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
