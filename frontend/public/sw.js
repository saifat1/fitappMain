// FitApp service worker (minimal, safe defaults).
// Strategy:
//  - /api/* requests are NEVER cached or intercepted (always go to network).
//  - Navigations: network-first, fall back to cached app shell when offline.
//  - Other GET assets: stale-while-revalidate.

const CACHE = "fitapp-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin GET requests; let the API and everything else pass through.
    if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
        return;
    }

    // App navigations: network-first with offline shell fallback.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put("/index.html", copy));
                    return response;
                })
                .catch(() => caches.match("/index.html"))
        );
        return;
    }

    // Static assets: stale-while-revalidate.
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
