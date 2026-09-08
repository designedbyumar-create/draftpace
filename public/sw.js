const CACHE_NAME = "draftpace-app-v4";

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

  /**
   * A navigation with no connection. Without this branch the browser
   * showed its own error page for every route, which meant /offline was
   * cached on install and then never served: an installed app handing
   * back a browser error is the loudest way to tell somebody it is not
   * really an app.
   *
   * Network first, always. /app renders authenticated, per-user content
   * and must never be served from a cache (see APP_SHELL's own note), so
   * this adds no caching of navigations at all. It only replaces the
   * failure: the request still goes to the network every time, and the
   * cached /offline page appears only when that genuinely cannot be
   * reached.
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then(
          (cached) =>
            cached ||
            // Only if the shell itself never cached, e.g. a first visit
            // that failed. Better than the browser's error, still honest.
            new Response("<!doctype html><meta charset=utf-8><title>Offline</title><p>You are offline.", {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
        )
      )
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
