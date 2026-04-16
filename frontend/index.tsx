import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './components/ThemeProvider';
import { HelmetProvider } from 'react-helmet-async';
import './src/index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { reportWebVitals } from './utils/reportWebVitals';
import { Provider } from '@/components/ui/provider';
import { getFirebaseAnalytics, isFirebaseConfigured } from './services/firebase/config';

// SEO: Initialize theme class before first render without blocking head scripts.
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('vite-ui-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const normalizeApiBaseUrl = (apiUrl?: string): string => {
  const normalizedUrl = (apiUrl || 'http://localhost:8000/api').replace(/\/+$/, '');
  const withoutDuplicateApi = normalizedUrl.replace(/\/api(?:\/api)+$/i, '/api');
  return withoutDuplicateApi.endsWith('/api') ? withoutDuplicateApi : `${withoutDuplicateApi}/api`;
};

const clearStaleServiceWorkersInDev = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }
  } catch (error) {
    console.warn('[SW] Failed to clear development service workers/caches:', error);
  }
};

// Firebase analytics bootstrap

const initializeFirebaseAnalytics = async () => {
  const analyticsEnabled = import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS === 'true';
  if (!analyticsEnabled || !isFirebaseConfigured()) return;

  try {
    await getFirebaseAnalytics();
  } catch (error) {
    console.warn('Firebase Analytics initialization skipped:', error);
  }
};

void initializeFirebaseAnalytics();

initializeTheme();


// Register Service Worker in production only.
// In development, stale SW caches can cause old chunks to be served and crash the app.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
    const serviceWorkerUrl = `/service-worker.js?apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`;

    navigator.serviceWorker.register(serviceWorkerUrl, { updateViaCache: 'none', scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.warn('SW registration failed: ', registrationError);
      });
  });
} else if (import.meta.env.DEV) {
  void clearStaleServiceWorkersInDev();
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Start monitoring Web Vitals
reportWebVitals();
