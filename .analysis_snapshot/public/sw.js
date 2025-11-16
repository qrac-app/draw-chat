const CACHE_NAME = 'chat-app-v1'
const STATIC_CACHE = 'chat-app-static-v1'
const DYNAMIC_CACHE = 'chat-app-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/chats',
  '/login',
  '/settings',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (isAPIRequest(request.url)) {
    // Network first for API requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  } else {
    // Network first for navigation requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  }
})

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncOfflineMessages())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: 'explore',
          title: 'Open Chat',
          icon: '/logo192.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon.ico',
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow(event.notification.data.url || '/chats'))
  }
})

// Helper functions
function isStaticAsset(url) {
  return (
    url.includes('/static/') ||
    url.includes('/assets/') ||
    url.endsWith('.css') ||
    url.endsWith('.js') ||
    url.endsWith('.png') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.svg') ||
    url.endsWith('.ico') ||
    url.endsWith('.woff') ||
    url.endsWith('.woff2')
  )
}

function isAPIRequest(url) {
  return url.includes('/api/') || url.includes('convex')
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('Network request failed:', error)
    throw error
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return (
        caches.match('/') ||
        new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        })
      )
    }

    throw error
  }
}

async function syncOfflineMessages() {
  // This would sync messages stored in IndexedDB when offline
  console.log('Background sync: Syncing offline messages')
  // Implementation would go here
}
