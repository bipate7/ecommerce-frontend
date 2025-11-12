// Service Worker for Caching and Performance
const CACHE_NAME = "shopeasy-v1.2.0";
const API_CACHE_NAME = "shopeasy-api-v1.0.0";

// Assets to cache immediately
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/styles/main.css",
  "/styles/optimization.css",
  "/scripts/app.js",
  "/scripts/image-optimizer.js",
  "/scripts/performance-optimizer.js",
  "/manifest.json",
];

// Install event - precache critical assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching critical assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Handle API requests
  if (event.request.url.includes("fakestoreapi.com")) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(event.request));
});

// API request strategy: Cache First, then Network
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try to serve from cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      const cacheTime = cachedResponse.headers.get("sw-cache-time");

      // If cache is fresh (less than 5 minutes old), use it
      if (cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
        return cachedResponse;
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone the response to cache it
      const responseToCache = networkResponse.clone();

      // Add cache timestamp to headers
      const modifiedHeaders = new Headers(responseToCache.headers);
      modifiedHeaders.set("sw-cache-time", Date.now().toString());

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: modifiedHeaders,
      });

      // Cache the successful response
      cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    // If network fails, return cached response even if stale
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache, return error
    return new Response(
      JSON.stringify({ error: "Network failed and no cache available" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Static asset strategy: Cache First, with network fallback
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Background update from network
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {}); // Ignore network errors for background updates

    return cachedResponse;
  }

  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return offline page
    return caches.match("/offline.html");
  }
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Background sync triggered");
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync cart data or user actions
}
