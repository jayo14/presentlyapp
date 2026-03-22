/**
 * Push Notification Utilities
 * 
 * Provides functions for requesting notification permissions,
 * subscribing to push notifications, and handling FCM tokens.
 */

import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { getFirebaseMessaging, isFirebaseConfigured } from './config';

// VAPID key from Firebase Console (Cloud Messaging settings)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

/**
 * Request notification permission from the user
 * Returns the permission status: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('[Notifications] This browser does not support notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission status:', permission);
    return permission;
  } catch (error) {
    console.error('[Notifications] Error requesting permission:', error);
    return 'denied';
  }
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Get FCM token for push notifications
 * This token should be sent to your backend server for push notifications
 * 
 * @param messaging - Firebase Messaging instance
 * @returns FCM token string or null if unavailable
 */
export const getFCMToken = async (messaging: Messaging): Promise<string | null> => {
  if (!isFirebaseConfigured()) {
    console.warn('[FCM] Firebase is not configured. Cannot get FCM token.');
    return null;
  }

  if (!VAPID_KEY) {
    console.warn('[FCM] VAPID key is not configured. Cannot get FCM token.');
    console.warn('[FCM] Please set VITE_FIREBASE_VAPID_KEY in your .env.local file');
    return null;
  }

  try {
    // Get registration token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('[FCM] No registration token available. Request permission first.');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
};

/**
 * Subscribe to push notifications
 * Requests permission and gets FCM token
 * 
 * @returns Object with success status, token, and permission
 */
export const subscribeToPushNotifications = async (): Promise<{
  success: boolean;
  token: string | null;
  permission: NotificationPermission;
  error?: string;
}> => {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        token: null,
        permission: 'denied',
        error: 'Firebase is not configured. Please set up Firebase environment variables.',
      };
    }

    // Request notification permission
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      return {
        success: false,
        token: null,
        permission,
        error: 'Notification permission denied',
      };
    }

    // Get Firebase Messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return {
        success: false,
        token: null,
        permission,
        error: 'Firebase Messaging not available',
      };
    }

    // Get FCM token
    const token = await getFCMToken(messaging);
    
    if (!token) {
      return {
        success: false,
        token: null,
        permission,
        error: 'Failed to get FCM token',
      };
    }

    return {
      success: true,
      token,
      permission,
    };
  } catch (error) {
    console.error('[Push Notifications] Subscription error:', error);
    return {
      success: false,
      token: null,
      permission: 'denied',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Setup foreground message handler
 * This handles notifications when the app is open and in focus
 * 
 * @param messaging - Firebase Messaging instance
 * @param onMessageCallback - Callback function to handle incoming messages
 */
export const setupForegroundMessageHandler = (
  messaging: Messaging,
  onMessageCallback: (payload: any) => void
) => {
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message received:', payload);
    
    // Call the user-provided callback
    onMessageCallback(payload);
    
    // Show notification if the app is in focus
    if (payload.notification) {
      const { title, body, icon } = payload.notification;
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title || 'New Notification', {
          body: body || '',
          icon: icon || '/logo.png',
          badge: '/logo.png',
          data: payload.data,
        });
      }
    }
  });
};

/**
 * Send FCM token to backend server
 * Your backend should store this token to send push notifications later
 * 
 * @param token - FCM token
 * @param accessToken - Authentication token
 * @returns Success status
 */
export const sendTokenToServer = async (
  token: string,
  accessToken: string
): Promise<boolean> => {
  try {
    const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

    // Ensure API URL is configured
    if (!API_URL) {
      console.error('[FCM] API URL not configured. Cannot send token to server.');
      return false;
    }

    if (!accessToken) {
      console.error('[FCM] Access token missing. Cannot send token to server.');
      return false;
    }

    const normalizedApiUrl = API_URL.replace(/\/api(?:\/api)+$/i, '/api');
    const baseUrl = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

    const response = await fetch(`${baseUrl}/notifications/devices/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        registration_token: token,
        device_type: 'WEB',
        browser: navigator.userAgent,
        device_id: navigator.userAgent, // Use user agent as simplistic ID for now
      }),
    });

    if (response.ok) {
      console.log('[FCM] Token sent to server successfully');
      return true;
    } else {
      console.error('[FCM] Failed to send token to server:', response.statusText);
      try {
        const errorData = await response.json();
        console.error('[FCM] Server error:', errorData);
      } catch (e) {
        // Ignore json parse error
      }
      return false;
    }
  } catch (error) {
    console.error('[FCM] Error sending token to server:', error);
    return false;
  }
};

/**
 * Show a test notification (for testing purposes)
 */
export const showTestNotification = () => {
  if (Notification.permission === 'granted') {
    new Notification('Test Notification', {
      body: 'This is a test notification from Presently',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'test-notification',
    });
  }
};

/**
 * Check if push notifications are supported and enabled
 */
export const isPushNotificationSupported = (): boolean => {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

export {
  VAPID_KEY,
};
