const CACHE_NAME = 'ordalee-v1';
const STATIC_ASSET_PATTERNS = [/\/_next\/static\//, /\.(?:png|jpg|jpeg|svg|webp|ico)$/];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only GET is safe to cache — a cached POST/PATCH response would mean
  // a receipt creation or a business update silently replaying stale
  // data instead of actually hitting the server. Anything else passes
  // through to the network untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isStaticAsset = STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(url.pathname));

  if (isStaticAsset) {
    // Cache-first: Next.js content-hashes these filenames, so a cached
    // copy is never stale — it's either exactly the right file or a
    // file that doesn't exist under this name yet.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Pages and API GETs: try the network first since this is live
  // business data, but fall back to the last cached copy if the network
  // fails — a slightly stale dashboard beats a blank error screen on a
  // bad connection.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error()))
  );
});