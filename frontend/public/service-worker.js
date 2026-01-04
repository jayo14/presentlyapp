const CACHE_NAME = 'presently-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32x32.png',
  './favicon-16x16.png'
];

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting requested');
    self.skipWaiting();
  }
});

// Install Event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
        // Don't fail the install if some resources fail to cache
        return Promise.resolve();
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  // Tell the active service worker to take control of the page immediately.
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event - Network First with Cache Fallback for better offline support
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests that are not GET
  if (event.request.method !== 'GET') return;

  const { request } = event;
  const url = new URL(request.url);

  // Handle SPA Navigation: Return index.html for navigation requests if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(request).then(cached => {
            // If cached version exists, return it
            if (cached) {
              return cached;
            }
            // Try to serve index.html from cache
            return caches.match('./index.html').then(indexCached => {
              if (indexCached) {
                return indexCached;
              }
              // If all else fails, show offline page
              return caches.match('./offline.html') || caches.match('./');
            });
          });
        })
    );
    return;
  }

  // For assets (JS, CSS, images, fonts), use Cache First strategy
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          // Return cached version and update cache in background
          fetch(request)
            .then(response => {
              if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {
              // Network failed, but we have cached version
            });
          return cached;
        }
        
        // Not in cache, fetch from network
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
            // Network failed and not in cache
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

  // For API requests, use Network First with Cache Fallback
  // Check for API endpoints or non-same-origin requests (likely API calls)
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful GET requests
          if (response && response.status === 200 && request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then(cached => {
            if (cached) {
              return cached;
            }
            // Return offline response for API requests
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

  // Stale-While-Revalidate strategy for other requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Cache valid responses (Basic) and CORS responses (for CDN assets)
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, return cached response if available
        return cachedResponse; 
      });

      return cachedResponse || fetchPromise;
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