const CACHE_NAME = 'presently-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-32x32.png',
];

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // 1. Dev Server / HMR / Source Bypassing
  // Bypass Vite internal files, hot updates, and source files in development
  if (
    url.pathname.includes('@vite') || 
    url.pathname.includes('hot-update') || 
    url.pathname.startsWith('/src/') ||
    url.hostname === 'localhost' && url.port === '3000' && !url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|json|ico)$/)
  ) {
    return;
  }

  // 2. API & Auth Bypassing - Always Network
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // 3. Navigation (SPA) - Network First, falling back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseToCache));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/offline.html');
        })
    );
    return;
  }

  // 4. Static Assets - Cache First, then Network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      });
    }).catch(() => {
      // If both fail, return a basic error response instead of undefined
      return new Response('Resource not available', { status: 404 });
    })
  );
});


// Push Notification Event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Presently Notification';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);
  
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendanceData());
  } else if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sync attendance data when back online
 * 
 * Note: This implementation needs authentication headers to work properly.
 * In a production environment, you should:
 * 1. Store auth tokens in IndexedDB
 * 2. Retrieve them in the service worker
 * 3. Add them to the fetch headers
 * 4. Implement token refresh logic if needed
 */
async function syncAttendanceData() {
  try {
    // Get pending attendance records from IndexedDB or cache
    const pendingRecords = await getPendingAttendanceRecords();
    
    if (pendingRecords.length === 0) {
      console.log('[Service Worker] No pending attendance records to sync');
      return;
    }

    // Sync each record with the backend
    for (const record of pendingRecords) {
      try {
        // TODO: Add authentication headers
        // const authToken = await getAuthToken(); // Retrieve from IndexedDB
        const response = await fetch('/api/attendance/check-in/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(record),
        });

        if (response.ok) {
          console.log('[Service Worker] Synced attendance record:', record.id);
          await removePendingRecord(record.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync record:', error);
      }
    }

    // Show notification to user
    self.registration.showNotification('Sync Complete', {
      body: `Synced ${pendingRecords.length} attendance record(s)`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

/**
 * Sync other offline actions when back online
 */
async function syncOfflineActions() {
  try {
    console.log('[Service Worker] Syncing offline actions...');
    // Implement your offline action sync logic here
  } catch (error) {
    console.error('[Service Worker] Failed to sync offline actions:', error);
  }
}

/**
 * Get pending attendance records (placeholder - implement with IndexedDB)
 */
async function getPendingAttendanceRecords() {
  // TODO: Implement IndexedDB retrieval
  // For now, return empty array
  return [];
}

/**
 * Remove synced record (placeholder - implement with IndexedDB)
 */
async function removePendingRecord(recordId) {
  // TODO: Implement IndexedDB removal
  console.log('[Service Worker] Record removed:', recordId);
}