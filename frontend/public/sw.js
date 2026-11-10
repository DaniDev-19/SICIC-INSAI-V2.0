// Service Worker PWA SICIZ-INSAI con Auto-Actualización y Caché Inteligente
const CACHE_NAME = 'siciz-insai-pwa-v2.2';
const CORE_ASSETS = [
  '/',
  '/login',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon2.ico',
];

// 1. INSTALACIÓN: Pre-cachear activos esenciales y omitir espera de inmediato
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of CORE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW] Activo no cacheado:', asset);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Purgar versiones viejas de caché y tomar control de todos los clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché anterior:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ESTRATEGIA DE RED / CACHÉ
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // No interceptar peticiones a la API del backend, websocket o auth
  if (url.pathname.startsWith('/api') || url.pathname.includes('/auth/')) {
    return;
  }

  // A. Peticiones de navegación (cargar páginas HTML) -> NETWORK FIRST con fallback a caché
  // Esto garantiza que si hay una nueva versión desplegada, el usuario la reciba al instante.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // B. Activos estáticos (JS, CSS, Imágenes, Fuentes) -> STALE WHILE REVALIDATE
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y no hay caché, no hacer nada
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Mensajes entre la aplicación y el Service Worker (para forzar actualización inmediata)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
