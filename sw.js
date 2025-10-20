const VERSION = "v1.0.7"; 
const APP_SHELL_CACHE = `app-shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/data/products.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate"){
    event.respondWith(caches.match("/index.html", { ignoreSearch:true }).then(c => c || fetch(request)));
    return;
  }
  const url = new URL(request.url);
  if (url.pathname.startsWith("/data/")){
    event.respondWith(cacheFirstWithUpdate(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirstWithUpdate(request){
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
                                       .catch(() => cached);
  return cached || networkPromise;
}
async function staleWhileRevalidate(request){
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
                                       .catch(() => cached);
  return cached || networkPromise;
}
