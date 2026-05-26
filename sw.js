// Silver Cat Tools - Service Worker
// Khi sửa file này (dù chỉ 1 ký tự), trình duyệt sẽ tự động phát hiện
// và cập nhật service worker ở lần truy cập sau.
// Thay đổi CACHE_VERSION để force re-cache toàn bộ tài nguyên.
const CACHE_VERSION = 'v20260526';
const CACHE_NAME = 'silvercat-tools-' + CACHE_VERSION;

// Tài nguyên cần cache ngay khi cài đặt
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './i18n.js',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png',
  './logo.jpg',
  './robots.txt',
  './sitemap.xml'
];

// Install event - Pre-cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - Clean old caches and notify clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
    .then(() => {
      // Thông báo cho các tab đang mở rằng đã có bản cập nhật
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return;

  // Skip browser-sync and analytics
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('ko-fi.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses (HTML, CSS, JS, images)
        if (response && response.status === 200) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/html') || 
              contentType.includes('text/css') || 
              contentType.includes('application/javascript') || 
              contentType.includes('image/') ||
              contentType.includes('application/json') ||
              event.request.url.includes('manifest.json')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then(cached => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
