const CACHE_NAME = 'scarf-shop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Vazirmatn-VariableFont_wght.ttf'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});