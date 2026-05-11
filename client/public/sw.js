// public/sw.js — Service Worker for Medico Guidance PWA

const CACHE_NAME = "medico-guidance-v2";

// Files to cache for offline use
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install: cache static assets ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: skip all navigation requests (SPA — React Router handles routing)
// Only cache static assets like icons/manifest, never HTML or JS chunks
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Let the browser handle: navigations, API calls, JS/CSS chunks
  if (
    event.request.method !== "GET" ||
    event.request.mode === "navigate" ||
    url.includes("/api/") ||
    url.includes(".js") ||
    url.includes(".css") ||
    url.includes(".jsx")
  ) {
    return;
  }

  // Only cache icons and manifest
  if (url.includes("/icons/") || url.includes("/manifest.json")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});