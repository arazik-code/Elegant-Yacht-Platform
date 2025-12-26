// Enhanced Service Worker for PWA
// Runtime caching, offline fallback, and cache management

const CACHE_VERSION = 'v2'
const STATIC_CACHE = `bimo-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `bimo-dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `bimo-images-${CACHE_VERSION}`
const API_CACHE = `bimo-api-${CACHE_VERSION}`

// Cache limits
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 100
const MAX_API_CACHE_SIZE = 30

// Cache expiration times (in seconds)
const API_CACHE_TTL = 60 * 5 // 5 minutes

// Static assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/yachts',
  '/charter',
  '/contact',
  '/about',
]

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /\/api\/yachts(\?.*)?$/,
  /\/api\/yachts\/[^/]+$/,
]

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      
      for (const url of PRECACHE_ASSETS) {
        try {
          await cache.add(url)
        } catch (error) {
          console.warn(`[SW] Failed to cache ${url}:`, error)
        }
      }
      
      console.log('[SW] Precaching complete')
    })()
  )
  
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      
      await Promise.all(
        cacheNames
          .filter(name => !name.includes(CACHE_VERSION))
          .map(name => {
            console.log(`[SW] Deleting old cache: ${name}`)
            return caches.delete(name)
          })
      )
      
      await self.clients.claim()
      console.log('[SW] Activation complete')
    })()
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip Chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  // Skip admin routes and auth routes
  if (url.pathname.startsWith('/admin') || url.pathname.includes('clerk')) {
    return
  }

  // Handle API requests - network first with cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle images - cache first with network fallback
  if (isImageRequest(request, url)) {
    event.respondWith(handleImageRequest(request))
    return
  }

  // Handle page navigations - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle static assets - cache first
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Default - stale-while-revalidate
  event.respondWith(handleDynamicRequest(request))
})

// Helper functions
function isImageRequest(request, url) {
  return (
    request.destination === 'image' ||
    url.hostname === 'res.cloudinary.com' ||
    /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname)
  )
}

function isStaticAsset(request) {
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'worker'
  )
}

function shouldCacheApi(url) {
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname))
}

// API Request Handler: Network-first with cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  if (!shouldCacheApi(url)) {
    return fetch(request)
  }

  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      const responseToCache = networkResponse.clone()
      
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cached-at', Date.now().toString())
      
      const cachedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      })
      
      await cache.put(request, cachedResponse)
      await trimCache(API_CACHE, MAX_API_CACHE_SIZE)
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get('sw-cached-at')
      const age = cachedAt ? (Date.now() - parseInt(cachedAt)) / 1000 : Infinity
      
      if (age < API_CACHE_TTL) {
        console.log('[SW] Serving cached API response:', request.url)
        return cachedResponse
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Network error', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Image Request Handler: Cache-first with network fallback
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    updateCacheInBackground(request, IMAGE_CACHE)
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      await trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE)
    }
    
    return networkResponse
  } catch (error) {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect fill="#1a1a1a" width="400" height="300"/>
        <text fill="#c4a052" x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14">
          Image unavailable offline
        </text>
      </svg>`,
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    )
  }
}

// Navigation Request Handler: Network-first with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const offlinePage = await caches.match('/offline')
    if (offlinePage) {
      return offlinePage
    }
    
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Bimo Yacht</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
          }
          .container { max-width: 400px; }
          h1 { font-size: 2rem; margin-bottom: 1rem; color: #c4a052; }
          p { color: #888; line-height: 1.6; margin-bottom: 1.5rem; }
          button {
            background: #c4a052;
            color: #0a0a0a;
            border: none;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          button:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You're Offline</h1>
          <p>It seems you've lost your internet connection. Please check your connection and try again.</p>
          <button onclick="location.reload()">Try Again</button>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}

// Static Request Handler: Cache-first
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    return new Response('', { status: 503 })
  }
}

// Dynamic Request Handler: Stale-while-revalidate
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      await trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE)
    }
    return networkResponse
  }).catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

function updateCacheInBackground(request, cacheName) {
  fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      await cache.put(request, networkResponse)
    }
  }).catch(() => {})
}

async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxSize) {
    const toDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(toDelete.map(key => cache.delete(key)))
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'inquiry-sync') {
    event.waitUntil(syncOfflineInquiries())
  }
})

async function syncOfflineInquiries() {
  try {
    const db = await openDB()
    const pendingInquiries = await getAllPending(db)
    
    for (const inquiry of pendingInquiries) {
      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inquiry.data),
        })
        
        if (response.ok) {
          await deletePending(db, inquiry.id)
          console.log('[SW] Synced offline inquiry:', inquiry.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync inquiry:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error)
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bimo-yacht-offline', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending-inquiries')) {
        db.createObjectStore('pending-inquiries', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-inquiries'], 'readonly')
    const store = transaction.objectStore('pending-inquiries')
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function deletePending(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-inquiries'], 'readwrite')
    const store = transaction.objectStore('pending-inquiries')
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bimo Yacht', {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data,
      actions: data.actions,
      requireInteraction: data.requireInteraction || false,
    })
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches())
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls))
  }
})

async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(name => caches.delete(name)))
  console.log('[SW] All caches cleared')
}

async function cacheUrls(urls) {
  const cache = await caches.open(STATIC_CACHE)
  for (const url of urls) {
    try {
      await cache.add(url)
    } catch (error) {
      console.warn('[SW] Failed to cache:', url)
    }
  }
}

console.log('[SW] Service worker loaded:', CACHE_VERSION)
