const CACHE = "dashtube-v9";
const OFFLINE = "./offline.html";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.add(OFFLINE).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Never intercept non-GET or external requests (TMDB API, CDN, ads)
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  // HTML navigation — network-first, fall back to offline page
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
    return;
  }

  // Local JS/CSS — bypass browser HTTP cache so changes deploy immediately
  const ext = url.pathname.split(".").pop().toLowerCase();
  if (ext === "js" || ext === "css") {
    e.respondWith(
      fetch(e.request, { cache: "no-store" }).catch(() => Response.error())
    );
  }
});
