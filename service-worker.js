const CACHE_NAME = "pwa-cache-v3"; // eskiyse v1 -> v2 yap
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./offline.html",
  "./birthday.html",      // <- ekledik
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let loaded = 0;
    const total = ASSETS.length;
    for (const url of ASSETS) {
      try {
        const response = await fetch(url);
        await cache.put(url, response.clone());
        loaded++;
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: "CACHE_PROGRESS", loaded, total });
          });
        });
      } catch (err) {
        console.error("Cache yükleme hatası:", url, err);
      }
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
    )
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match("./offline.html"));
    })
  );
});
