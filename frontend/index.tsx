import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './src/index.css';
import App from './App';
import { reportWebVitals } from './utils/reportWebVitals';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker during idle time to prevent blocking initial render
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.warn('SW registration failed: ', registrationError);
      });
  };

  // Use requestIdleCallback if available, otherwise fallback to setTimeout
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => registerSW());
  } else {
    window.addEventListener('load', () => {
      setTimeout(registerSW, 1000);
    });
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Start monitoring Web Vitals
reportWebVitals();