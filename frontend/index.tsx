import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './src/index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { reportWebVitals } from './utils/reportWebVitals';
import { Provider } from '@/components/ui/provider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const normalizeApiBaseUrl = (apiUrl?: string): string => {
  const normalizedUrl = (apiUrl || 'http://localhost:8000/api').replace(/\/$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
};

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
    const serviceWorkerUrl = `/service-worker.js?apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`;

    navigator.serviceWorker.register(serviceWorkerUrl)
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.warn('SW registration failed: ', registrationError);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Start monitoring Web Vitals
reportWebVitals();