/**
 * Push Notification Settings Component
 * 
 * Allows users to enable/disable push notifications and view their status
 */

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { isFirebaseConfigured, getFirebaseConfigStatus } from '../../services/firebase/config';

interface PushNotificationSettingsProps {
  onNotificationReceived?: (payload: any) => void;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  onNotificationReceived
}) => {
  const {
    permission,
    isSupported,
    isLoading,
    error,
    token,
    requestPermission,
    subscribe,
  } = usePushNotifications(onNotificationReceived);

  const [firebaseStatus, setFirebaseStatus] = useState(getFirebaseConfigStatus());
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    // Update Firebase status
    setFirebaseStatus(getFirebaseConfigStatus());
  }, []);

  const handleEnableNotifications = async () => {
    await requestPermission();
    if (permission === 'granted') {
      await subscribe();
    }
  };

  // Check if everything is ready for push notifications
  const ENABLE_FCM_SIMULATION = import.meta.env.VITE_ENABLE_FCM_SIMULATION === 'true' || import.meta.env.DEV;
  const isFullyConfigured = isSupported && (firebaseStatus.configured || ENABLE_FCM_SIMULATION);

  return (
    <div className="bg-surface text-text rounded-lg p-6 border border-outline">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-headline text-lg font-semibold mb-2">Push Notifications</h3>
          <p className="text-sm text-textMuted mb-4">
            Stay updated with real-time notifications about attendance, sessions, and important updates.
          </p>

          {/* Status Indicators */}
          <div className="space-y-2 mb-4">
            {/* Browser Support */}
            <div className="flex items-center gap-2 text-sm">
              {isSupported ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-textMuted">Browser supports push notifications</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-textMuted">Browser does not support push notifications</span>
                </>
              )}
            </div>

            {/* Firebase Configuration */}
            <div className="flex items-center gap-2 text-sm">
              {firebaseStatus.configured ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-textMuted">Firebase is configured</span>
                </>
              ) : ENABLE_FCM_SIMULATION ? (
                <>
                  <Check className="w-4 h-4 text-blue-500" />
                  <span className="text-textMuted">Push simulation active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-textMuted">Firebase needs configuration</span>
                </>
              )}
            </div>

            {/* Permission Status */}
            <div className="flex items-center gap-2 text-sm">
              {permission === 'granted' ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-textMuted">Notifications are enabled</span>
                </>
              ) : permission === 'denied' ? (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-textMuted">Notifications are blocked</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-textMuted" />
                  <span className="text-textMuted">Notification permission not requested</span>
                </>
              )}
            </div>

            {/* Token Status */}
            {token && (
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-textMuted">Device registered for notifications</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Firebase Configuration Warning */}
          {!firebaseStatus.configured && !ENABLE_FCM_SIMULATION && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Configuration Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Firebase Cloud Messaging needs to be configured. Please contact your administrator or see the Firebase Setup documentation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permission Denied Warning */}
          {permission === 'denied' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <BellOff className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Notifications Blocked</p>
                  <p className="text-sm text-red-700 mt-1">
                    You have blocked notifications. To enable them, go to your browser settings and allow notifications for this site.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col gap-3">
            {permission === 'granted' && token ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Notifications are enabled and working
                </span>
              </div>
            ) : isFullyConfigured && permission !== 'denied' ? (
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Enable Push Notifications</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 px-4 py-2 bg-surfaceLow text-textMuted font-medium rounded-lg cursor-not-allowed"
              >
                <BellOff className="w-4 h-4" />
                <span>Notifications Unavailable</span>
              </button>
            )}

            {/* Show Token (for debugging) */}
            {token && (
              <div className="mt-2">
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs text-textMuted hover:text-textMuted underline"
                >
                  {showToken ? 'Hide' : 'Show'} device token (for debugging)
                </button>
                {showToken && (
                  <div className="mt-2 p-2 bg-surfaceLow rounded text-xs font-mono break-all">
                    {token}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
