/**
 * Firebase Cloud Messaging Service Worker
 * 
 * This file handles background push notifications when the app is not in focus.
 * It must be placed in the public directory and served from the root path.
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// IMPORTANT: Replace these placeholder values with your actual Firebase configuration
// before deploying to production. These values are public identifiers and safe to expose.
// Get them from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase app in service worker
try {
  firebase.initializeApp(firebaseConfig);
  console.log('[FCM SW] Firebase initialized');
} catch (error) {
  console.error('[FCM SW] Firebase initialization error:', error);
}

// Get Firebase Messaging instance
let messaging;
try {
  messaging = firebase.messaging();
  console.log('[FCM SW] Firebase Messaging initialized');
} catch (error) {
  console.warn('[FCM SW] Firebase Messaging not available:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Presently';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: payload.data?.url || '/',
        ...payload.data,
      },
      tag: payload.data?.tag || 'presently-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification click received:', event);

  event.notification.close();

  // Get the URL from notification data or default to root
  const urlToOpen = event.notification.data?.url || '/';

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Cache configuration
const CACHE_NAME = 'presently-v3-fcm';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32x32.png',
  './favicon-16x16.png'
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker with FCM support...');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(error => {
        console.error('[SW] Cache addAll failed:', error);
        // Don't fail the install if some resources fail to cache
        return Promise.resolve();
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  // Tell the active service worker to take control of the page immediately
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event - Enhanced caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const { request } = event;
  const url = new URL(request.url);

  // Handle SPA Navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            return cached || caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }

  // Cache First strategy for static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          // Return cached version and update in background
          fetch(request)
            .then(response => {
              if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {});
          return cached;
        }
        
        return fetch(request)
          .then(response => {
            if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
    );
    return;
  }

  // Network First for API requests
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200 && request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            if (cached) {
              return cached;
            }
            return new Response(JSON.stringify({ 
              error: 'Offline',
              message: 'You are currently offline. Please check your internet connection.' 
            }), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'application/json' })
            });
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for other requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse; 
      });

      return cachedResponse || fetchPromise;
    })
  );
});

console.log('[FCM SW] Service Worker script loaded');
