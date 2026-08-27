const CACHE = 'source-to-recall-gate-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon/128.png', '/assets/press-gate-820.webp', '/assets/press-gate-1200.webp', '/assets/press-gate-1200.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const html = await (await fetch('/')).text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)["?#]/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const path = new URL(event.request.url).pathname;
    const cached = await cache.match(path);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(path, response.clone());
      return response;
    } catch {
      return event.request.mode === 'navigate' ? (await cache.match('/index.html') ?? Response.error()) : Response.error();
    }
  })());
});
