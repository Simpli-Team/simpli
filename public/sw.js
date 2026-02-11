const CACHE_NAME = 'simplidocs-v1';
const ASSETS_CACHE = 'simplidocs-assets-v1';
const DOCS_CACHE = 'simplidocs-docs-v1';

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/', '/index.html', '/simplidocs-logo.png', '/manifest.json']);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME && name !== ASSETS_CACHE && name !== DOCS_CACHE) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Helper to handle cache strategies
  const handleFetch = async () => {
    // 1. Image Caching (Cache First)
    if (event.request.destination === 'image') {
      const cache = await caches.open(ASSETS_CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (e) {
        return new Response('', { status: 404 });
      }
    }

    // 2. Documentation/Markdown (Stale-While-Revalidate)
    if (
      url.pathname.startsWith('/docs') ||
      url.pathname.endsWith('.md') ||
      url.pathname.endsWith('.mdx')
    ) {
      const cache = await caches.open(DOCS_CACHE);
      const cached = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    }

    // 3. JS/CSS Assets (Stale-While-Revalidate)
    if (event.request.destination === 'script' || event.request.destination === 'style') {
      const cache = await caches.open(ASSETS_CACHE);
      const cached = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    }

    // Default: Network First
    try {
      return await fetch(event.request);
    } catch {
      return (await caches.match(event.request)) || new Response('Offline', { status: 503 });
    }
  };

  event.respondWith(handleFetch());
});
