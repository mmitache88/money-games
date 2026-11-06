// The service worker. The build fills in the version and the file list, so every
// deploy is a new worker with a new cache. Only this app's caches are touched:
// saved progress is in localStorage, which is never involved.
const CACHE = 'kmg-hub-19dc91cdc891';
const OLD_CACHE_PREFIX = 'kmg-hub-';
const FILES = ["./","index.html","app.js","app.css","manifest.webmanifest","icons/192x192.png","icons/512x512.png","icons/apple-touch-icon.png","voice/shared.js","voice/coin-sorter.js","voice/party-planner.js","voice/play-shop.js","voice/pocket-money-month.js","voice/price-detective.js"];

self.addEventListener('install', (event) => {
  // cache: 'reload' goes past the browser's HTTP cache. GitHub Pages sends a
  // 10-minute lifetime, so otherwise an old app.js could land in the new cache.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.indexOf(OLD_CACHE_PREFIX) === 0 && name !== CACHE)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

// Whether an address is the hub's own page: the site's folder, or its
// index.html. Other pages on the site, such as privacy.html (added by hand
// beside the build, and linked from the Amazon listings), are not the hub and
// must never be answered with it.
function isHubPage(url) {
  const scope = new URL(self.registration.scope).pathname;
  return url.pathname === scope || url.pathname === `${scope}index.html`;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request, { ignoreSearch: true });
      if (hit) return hit;
      if (request.mode === 'navigate' && isHubPage(url)) {
        const page = await cache.match('index.html');
        if (page) return page;
      }
      return fetch(request);
    })
  );
});
