const CACHE_NAME = 'blay-audio-player-v2';
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const CORE_ASSETS = [
  'index.php',
  'buscar_musicas.php',
  'assets/js/controle.js',
  'assets/js/app.js',
  'assets/js/storage.js',
  'assets/js/models.js',
  'assets/css/styles.css',
  'manifest.json',
  'assets/icons/icon.svg',
  'assets/icons/capa-default.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
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
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== location.origin) {
    return;
  }

  const relativePath = getRelativePath(url);

  if (relativePath === 'buscar_musicas.php') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (relativePath === 'index.php' || request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === 'audio' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (CORE_ASSETS.includes(relativePath)) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

function getRelativePath(url) {
  let pathname = url.pathname;
  if (pathname.startsWith(SCOPE_PATH)) {
    pathname = pathname.slice(SCOPE_PATH.length);
  }
  if (pathname === '' || pathname === '/') {
    return 'index.php';
  }
  return pathname.startsWith('/') ? pathname.slice(1) : pathname;
}


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
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'PRELOAD_AUDIO') {
    return;
  }
  event.waitUntil(preloadAudioFile(event.data.url));
});

async function preloadAudioFile(url) {
  if (!url) {
    return;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const request = new Request(url, { mode: 'same-origin' });
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.warn('Audio preload failed:', error);
  }
}
