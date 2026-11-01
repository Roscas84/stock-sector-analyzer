const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `stock-analyzer-${CACHE_VERSION}`;
const DATA_CACHE = `stock-analyzer-data-${CACHE_VERSION}`;

// Assets a cachear (críticos para funcionar offline)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/analyzer.html',
  '/check-errors.html',
  '/manifest.json',
  '/data.json',
  '/db-manager.js',
  '/export-handler.js',
  '/filters.js',
  '/history-handler.js',
  '/level1-handler.js',
  '/level2-handler.js',
  '/level3-handler.js',
  '/ui-common.js'
];

// Eventos de instalación: cachear assets críticos
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching critical assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
      .catch((err) => {
        console.error('[ServiceWorker] Cache addAll failed:', err);
      })
  );
});

// Eventos de activación: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Tomar control de todas las pestañas
  );
});

// Estrategia de fetch: Network-first para datos, Cache-first para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests a otros dominios (excepto API)
  if (url.origin !== self.location.origin && !url.host.includes('api')) {
    return;
  }

  // Estrategia: Network-first para data.json y APIs
  if (url.pathname.includes('data.json') || url.pathname.includes('api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache la respuesta exitosa
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, usar caché
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[ServiceWorker] Serving from cache (offline):', url.pathname);
                return cachedResponse;
              }
              // Fallback si no hay caché
              return new Response(
                JSON.stringify({
                  error: 'Offline - datos no disponibles',
                  cached: false
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Estrategia: Cache-first para assets estáticos (HTML, JS, CSS)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[ServiceWorker] Serving from cache:', url.pathname);
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // No cachear respuestas inválidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cachear la respuesta exitosa
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Si no hay caché y la red falla
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response(
              'Offline - recurso no disponible',
              { status: 503, statusText: 'Service Unavailable' }
            );
          });
      })
  );
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[ServiceWorker] Clearing all caches');
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});

// Sincronización en background (si el dispositivo vuelve online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      fetch('/data.json')
        .then((response) => response.json())
        .then((data) => {
          console.log('[ServiceWorker] Background sync completed');
          // Notificar al cliente que los datos fueron actualizados
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'DATA_SYNCED',
                data: data
              });
            });
          });
        })
        .catch((err) => {
          console.error('[ServiceWorker] Background sync failed:', err);
        })
    );
  }
});

console.log('[ServiceWorker] Loaded and ready');
