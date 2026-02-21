// VIF Activity Tracker - Service Worker
// Provides offline functionality and push notifications

const CACHE_NAME = 'vif-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Don't cache POST requests or API calls with dynamic data
          if (event.request.method !== 'GET' || event.request.url.includes('/api/activities')) {
            return fetchResponse;
          }

          // Clone and cache the response
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  let notificationData = {
    title: 'VIF Activity Tracker',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions || [
        { action: 'open', title: 'Open App' },
        { action: 'close', title: 'Close' }
      ]
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Background sync for offline activity submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');

  if (event.tag === 'sync-activities') {
    event.waitUntil(syncActivities());
  }
});

async function syncActivities() {
  try {
    // Get pending activities from IndexedDB
    const pendingActivities = await getPendingActivities();

    if (pendingActivities.length === 0) {
      return;
    }

    // Try to sync each pending activity
    for (const activity of pendingActivities) {
      try {
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(activity)
        });

        if (response.ok) {
          // Remove from pending queue
          await removePendingActivity(activity.tempId);
          console.log('Activity synced:', activity.tempId);
        }
      } catch (error) {
        console.error('Failed to sync activity:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified - full implementation would be more robust)
async function getPendingActivities() {
  // This would use IndexedDB to get pending activities
  // Simplified version for now
  return [];
}

async function removePendingActivity(tempId) {
  // This would remove the activity from IndexedDB
  console.log('Removing pending activity:', tempId);
}

// Periodic background sync (requires registration)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-activities') {
    event.waitUntil(updateActivities());
  }
});

async function updateActivities() {
  // Fetch latest activities in the background
  console.log('Periodic sync: Updating activities');
}
