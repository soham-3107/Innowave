/**
 * ORCA Marine Intelligence - Service Worker
 * Caches the complete Application Shell for offline zero-connectivity operations at sea.
 */

const CACHE_NAME = "orca-marine-shell-v1";

const APP_SHELL_ASSETS = [
  "/",
  "/copilot",
  "/analytics",
  "/research",
  "/login",
  "/signup",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
];

// Install Event: Cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ORCA SW] Pre-caching Application Shell assets...");
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        console.warn("[ORCA SW] Some assets failed to pre-cache:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[ORCA SW] Removing outdated cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent offline caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST /api/chat or POST /api/reports)
  if (request.method !== "GET") {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with Cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log("[ORCA SW] Offline mode active: Serving cached page for", request.url);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to root application shell if exact page not cached
          const rootCached = await caches.match("/");
          if (rootCached) {
            return rootCached;
          }
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>ORCA Marine - Offline</title><style>body{font-family:sans-serif;background:#0B1528;color:#fff;text-align:center;padding:50px 20px;}h1{color:#38bdf8;}p{color:#94a3b8;}</style></head><body><h1>ORCA Marine Intelligence (Offline)</h1><p>You are currently operating offshore with zero connectivity. Launching cached marine intelligence...</p><script>window.location.href="/";</script></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 2. Next.js Static JS/CSS Chunks and Fonts: Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/") || 
    url.pathname.includes(".css") || 
    url.pathname.includes(".js") ||
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Images and static icons: Cache-First
  if (
    request.destination === "image" || 
    url.pathname.endsWith(".png") || 
    url.pathname.endsWith(".jpg") || 
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        }).catch(() => new Response("", { status: 408, statusText: "Offline image unavailable" }));
      })
    );
    return;
  }

  // 4. Other GET requests (e.g. backend /api/map, /api/reports): Network-first with Cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Listen for custom postMessage events (e.g. SKIP_WAITING or CACHE_SYNC)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
