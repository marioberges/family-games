/* Lattice — service worker
   The shell IS the whole game: the dot array is DOM, not images, so there are no
   runtime assets to fetch and nothing to bulk-download. Precache it and Lattice
   works offline from the first launch onward.
   Fonts are the one exception, cached at runtime and deliberately unversioned. */

const VERSION = "v1";
const SHELL = `lattice-shell-${VERSION}`;
const FONTS = "lattice-fonts-v1";   /* unversioned on purpose: an app update
                                       shouldn't re-download the typefaces */

const SPLASH = [
  "icons/splash/320x568@2x.png",
  "icons/splash/375x667@2x.png",
  "icons/splash/414x736@3x.png",
  "icons/splash/375x812@3x.png",
  "icons/splash/390x844@3x.png",
  "icons/splash/393x852@3x.png",
  "icons/splash/402x874@3x.png",
  "icons/splash/414x896@2x.png",
  "icons/splash/414x896@3x.png",
  "icons/splash/428x926@3x.png",
  "icons/splash/430x932@3x.png",
  "icons/splash/440x956@3x.png",
  "icons/splash/744x1133@2x.png",
  "icons/splash/1133x744@2x.png",
  "icons/splash/768x1024@2x.png",
  "icons/splash/1024x768@2x.png",
  "icons/splash/810x1080@2x.png",
  "icons/splash/1080x810@2x.png",
  "icons/splash/820x1180@2x.png",
  "icons/splash/1180x820@2x.png",
  "icons/splash/834x1112@2x.png",
  "icons/splash/1112x834@2x.png",
  "icons/splash/834x1194@2x.png",
  "icons/splash/1194x834@2x.png",
  "icons/splash/1024x1366@2x.png",
  "icons/splash/1366x1024@2x.png",
  "icons/splash/1032x1376@2x.png",
  "icons/splash/1376x1032@2x.png"
];

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/apple-touch-icon-120.png",
  "./icons/apple-touch-icon-152.png",
  "./icons/apple-touch-icon-167.png",
  "./icons/apple-touch-icon-180.png",
  ...SPLASH.map(f => "./" + f)
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // addAll is all-or-nothing; add individually so one 404 can't break install.
    // The HTML goes through with cache:"reload" because Pages serves it with
    // max-age=600 — without that a new worker can precache the OLD index.html
    // and the version bump buys nothing at all.
    await Promise.all(SHELL_FILES.map(f => {
      const fresh = f === "./" || f === "./index.html";
      return cache.add(fresh ? new Request(f, { cache: "reload" }) : f).catch(() => {});
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keep = [SHELL, FONTS];
    const names = await caches.keys();
    await Promise.all(names.map(n => keep.includes(n) ? null : caches.delete(n)));
    await self.clients.claim();
  })());
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
    return res;
  } catch (err) {
    return hit || Response.error();
  }
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts stylesheet + font files
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(req, FONTS));
    return;
  }

  // Page loads: serve the cached shell instantly, refresh it in the background
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      const cached = await cache.match("./index.html");
      const network = fetch(req).then(res => {
        if (res && res.ok) cache.put("./index.html", res.clone());
        return res;
      }).catch(() => null);
      // Keep the worker alive for the background refresh; returning the cached
      // shell first would otherwise let the event settle and kill the fetch.
      event.waitUntil(network);
      return cached || (await network) || new Response(
        "<h1>Offline</h1><p>Open Lattice once while connected, then it works without a network.</p>",
        { headers: { "Content-Type": "text/html" } }
      );
    })());
    return;
  }

  // Everything else same-origin
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, SHELL));
  }
});

self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
