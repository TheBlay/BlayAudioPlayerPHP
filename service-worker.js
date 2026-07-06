const CACHE_NAME = 'blay-audio-player-v4';
const ASSETS = [
  'index.html',
  'assets/js/app.js',
  'assets/js/playlists.js',
  'assets/js/songs.js',
  'assets/js/tags.js',
  'assets/js/db.js',
  'assets/js/ffmpeg.js',
  'assets/js/player.js',
  'assets/css/styles.css',
  'manifest.json',
  'assets/icons/icon.svg',
  'assets/icons/capa-default.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
.then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');

  if (request.mode === 'navigate' || relativePath === 'index.html') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (ASSETS.includes(relativePath)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === 'audio' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
