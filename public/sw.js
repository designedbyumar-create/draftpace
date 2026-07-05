const CACHE_NAME = "draftpace-app-v1";

const APP_SHELL = [
  "/dashboard",
  "/dashboard/drafts",
  "/dashboard/explore",
  "/dashboard/progress",
  "/dashboard/settings",
  "/offline",
  "/manifest.webmanifest",
  "/logo/dp-monogram-indigo.svg",
  "/logo/dp-monogram-dark.svg"
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
  const isDashboard = url.pathname.startsWith("/dashboard");
  const isStaticAsset =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/logo/") ||
    url.pathname === "/manifest.webmanifest";

  if (isDashboard || isStaticAsset || url.pathname === "/offline") {
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
          .catch(() => cached || caches.match("/offline"));

        return cached || network;
      })
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Draftpace", {
      body: data.body || "Your planner is waiting.",
      icon: "/logo/dp-monogram-indigo.svg",
      badge: "/logo/dp-monogram-dark.svg",
      data: { url: data.url || "/dashboard" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(self.clients.openWindow(url));
});
