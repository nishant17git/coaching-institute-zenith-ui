
// Name/version of the cache
const CACHE_NAME = 'infinity-classes-v1';

// Files to precache (update hashed filenames after each build)
const urlsToCache = [
  '/',                       // App shell
  '/index.html',             // Main HTML
  '/manifest.json',          // Web app manifest
  '/icon-192x192.png',       // PWA icons
  '/icon-512x512.png',
  '/icon.png',
  '/src/App.tsx',
  '/src/main.tsx',
  '/src/App.css'
];

// Install event: precache assets & activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event: remove old caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event: network-first for navigations, cache-first for other assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // SPA navigation: try network, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkRes => {
          // Update cache with the latest index.html
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/', resClone));
          return networkRes;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Static assets: serve from cache, then network
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
  );
});
