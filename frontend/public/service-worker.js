const STATIC_CACHE = 'presently-static-v8';
const RUNTIME_CACHE = 'presently-runtime-v8';
const API_CACHE = 'presently-api-v8';
const CACHE_PREFIX = 'presently-';

const ASSETS_TO_CACHE = ['/', '/index.html', '/offline.html', '/manifest.json', '/logo.png', '/favicon.ico'];

const resolveApiBaseUrl = () => {
  const configuredUrl = new URL(self.location.href).searchParams.get('apiBaseUrl') || 'http://localhost:8000/api';
  const normalizedUrl = configuredUrl.replace(/\/$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(ASSETS_TO_CACHE);
      } catch (error) {
        console.warn('[SW] Failed to precache one or more assets:', error);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(name))
          .map((name) => caches.delete(name))
      );

      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })()
  );
});

const isStaticAsset = (request) =>
  ['style', 'script', 'font', 'image', 'worker'].includes(request.destination);

const isNavigationRequest = (request) =>
  request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');

const isApiRequest = (url) => url.href.startsWith(API_BASE_URL) || url.pathname.startsWith('/api/');

const canCacheResponse = (response) => response && (response.status === 200 || response.type === 'opaque');

const networkFirst = async (request, cacheName, fallbackUrl) => {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (canCacheResponse(networkResponse)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (canCacheResponse(networkResponse)) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cached || (await networkPromise) || new Response('Resource unavailable', { status: 404 });
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.includes('@vite') || url.pathname.includes('hot-update') || url.pathname.startsWith('/src/')) {
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) return preloadResponse;

        return networkFirst(request, RUNTIME_CACHE, '/offline.html');
      })()
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (isStaticAsset(request) || url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Presently Notification';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((client) => client.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(targetUrl);
        return;
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendanceData());
  } else if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncAttendanceData() {
  try {
    const pendingRecords = await getPendingAttendanceRecords();
    if (pendingRecords.length === 0) return;

    for (const record of pendingRecords) {
      try {
        const response = await fetch(`${API_BASE_URL}/attendance/check-in/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });

        if (response.ok) {
          await removePendingRecord(record.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync attendance record:', error);
      }
    }

    self.registration.showNotification('Sync Complete', {
      body: `Synced ${pendingRecords.length} attendance record(s)`,
      icon: '/logo.png',
      badge: '/logo.png',
    });
  } catch (error) {
    console.error('[SW] Attendance sync failed:', error);
  }
}

async function syncOfflineActions() {
  try {
    console.log('[SW] Syncing offline actions...');
  } catch (error) {
    console.error('[SW] Failed to sync offline actions:', error);
  }
}

async function getPendingAttendanceRecords() {
  return [];
}

async function removePendingRecord(recordId) {
  console.log('[SW] Record removed:', recordId);
}
