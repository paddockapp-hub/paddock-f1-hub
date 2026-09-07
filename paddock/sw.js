/* PADDOCK Service Worker for Offline Resilience & PWA Support */
const CACHE_NAME = 'paddock-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/home.css',
  './css/calendar.css',
  './css/standings.css',
  './css/community.css',
  './css/admin.css',
  './js/app.js',
  './js/home.js',
  './js/calendar.js',
  './js/standings.js',
  './js/community.js',
  './js/auth.js',
  './js/team-theme.js',
  './js/firebase-config.js',
  './js/ads-config.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) return; // Network-first for APIs
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
