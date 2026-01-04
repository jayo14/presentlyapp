/**
 * React Hook for Push Notifications
 * 
 * Provides a convenient way to manage push notifications in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { getFirebaseMessaging } from '../services/firebase/config';
import {
  subscribeToPushNotifications,
  getNotificationPermission,
  setupForegroundMessageHandler,
  sendTokenToServer,
  isPushNotificationSupported,
} from '../services/firebase/notifications';

interface UsePushNotificationsReturn {
  // State
  permission: NotificationPermission;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  
  // Actions
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<void>;
}

/**
 * Hook for managing push notifications
 * 
 * Usage:
 * ```tsx
 * const { permission, requestPermission, subscribe, isSupported } = usePushNotifications();
 * 
 * // Request permission and subscribe
 * const handleEnableNotifications = async () => {
 *   await requestPermission();
 *   await subscribe();
 * };
 * ```
 */
export const usePushNotifications = (
  onMessageReceived?: (payload: any) => void
): UsePushNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
  }, []);

  // Setup foreground message handler
  useEffect(() => {
    const setupHandler = async () => {
      if (permission === 'granted' && onMessageReceived) {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          setupForegroundMessageHandler(messaging, onMessageReceived);
        }
      }
    };

    setupHandler();
  }, [permission, onMessageReceived]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await subscribeToPushNotifications();
      
      setPermission(result.permission);
      
      if (result.success && result.token) {
        setToken(result.token);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      console.error('[usePushNotifications] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Subscribe to push notifications (gets token and sends to server)
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    if (permission !== 'granted') {
      setError('Notification permission not granted');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await subscribeToPushNotifications();
      
      if (result.success && result.token) {
        setToken(result.token);
        
        // Send token to server
        // You can get userId from your auth context if needed
        const sent = await sendTokenToServer(result.token);
        
        if (!sent) {
          console.warn('[usePushNotifications] Token obtained but not sent to server');
        }
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(errorMessage);
      console.error('[usePushNotifications] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    isLoading,
    error,
    token,
    requestPermission,
    subscribe,
  };
};
