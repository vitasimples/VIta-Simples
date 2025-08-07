// Serviço simples para o PWA - cache básico

const CACHE_NAME = "vita-simples-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/main.js",
  "/style.css",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
