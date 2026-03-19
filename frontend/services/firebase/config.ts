/**
 * Firebase Configuration for Push Notifications
 * 
 * This file sets up Firebase Cloud Messaging (FCM) for web push notifications.
 * Follow the setup guide in FIREBASE_SETUP.md to configure your Firebase project.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
// These values should be set in .env.local file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase App
 * Only initializes if valid configuration is provided
 */
export const initializeFirebase = (): FirebaseApp | null => {
  // Check if Firebase is already initialized
  if (app) {
    return app;
  }

  // Validate that we have the minimum required config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[Firebase] Firebase configuration is incomplete. Authentication and Push notifications will not be available.');
    console.warn('[Firebase] Please configure Firebase environment variables. See FIREBASE_SETUP.md');
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] Firebase app initialized successfully');
    return app;
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase:', error);
    return null;
  }
};

/**
 * Get Firebase Auth instance
 */
export const getFirebaseAuth = (): Auth | null => {
  if (auth) return auth;
  
  const firebaseApp = initializeFirebase();
  if (!firebaseApp) return null;
  
  auth = getAuth(firebaseApp);
  return auth;
};

/**
 * Get Firebase Analytics instance
 * Returns null when analytics is unavailable in the current runtime
 */
export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (analytics) return analytics;

  if (typeof window === 'undefined') {
    return null;
  }

  const firebaseApp = initializeFirebase();
  if (!firebaseApp) return null;

  const supported = await isAnalyticsSupported();
  if (!supported) {
    console.warn('[Firebase] Analytics is not supported in this browser/runtime');
    return null;
  }

  try {
    analytics = getAnalytics(firebaseApp);
    return analytics;
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase Analytics:', error);
    return null;
  }
};

/**
 * Get Firebase Messaging instance
 * Returns null if messaging is not supported or Firebase is not configured
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  // Return existing instance if available
  if (messaging) {
    return messaging;
  }

  // Check if messaging is supported in this browser
  const supported = await isSupported();
  if (!supported) {
    console.warn('[Firebase] Firebase Messaging is not supported in this browser');
    return null;
  }

  // Initialize Firebase app if not already done
  const firebaseApp = initializeFirebase();
  if (!firebaseApp) {
    return null;
  }

  try {
    messaging = getMessaging(firebaseApp);
    console.log('[Firebase] Firebase Messaging initialized successfully');
    return messaging;
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase Messaging:', error);
    return null;
  }
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};

/**
 * Get the current Firebase configuration status
 */
export const getFirebaseConfigStatus = () => {
  return {
    configured: isFirebaseConfigured(),
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
    hasAppId: !!firebaseConfig.appId,
  };
};

export { app, messaging, auth, firebaseConfig, GoogleAuthProvider };
