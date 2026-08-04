const CACHE_NAME = "draftpace-app-v3";

// Static, non-personalized assets only. /app and its subroutes are
// deliberately never cached here: they render authenticated, per-user
// content, and a stale-while-revalidate cache previously served an old
// signed-in page (or a different account's) before the network response
// landed. Installability and "launch to a working shell" don't need that;
// every real navigation into /app still goes through the normal network
// request and the real server-side session check.
const APP_SHELL = [
  "/offline",
  "/manifest.webmanifest",
  "/logo/icon-192.png",
  "/logo/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isStaticAsset =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/logo/") ||
    url.pathname === "/manifest.webmanifest";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      })
    );
    return;
  }

  if (url.pathname === "/offline") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Draftpace", {
      body: data.body || "Something is waiting for you.",
      icon: "/logo/icon-192.png",
      badge: "/logo/icon-192.png",
      data: { url: data.url || "/app" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app";
  event.waitUntil(self.clients.openWindow(url));
});
