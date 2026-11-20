/* Romp — service worker
   The shell is the whole game plus one library: planck.min.js, the Box2D
   physics port that moves the doodles. It is a file of its own rather than
   inline so the game stays readable, and it is precached with everything else,
   so it downloads once on first launch and Romp works offline from then on.
   No web fonts: the game uses the system's rounded face. */

const VERSION = "v1";
const SHELL = `romp-shell-${VERSION}`;

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
  "./planck.min.js",
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
    // max-age=600 — without that a new worker can precache the OLD index.html.
    await Promise.all(SHELL_FILES.map(f => {
      const fresh = f === "./" || f === "./index.html";
      return cache.add(fresh ? new Request(f, { cache: "reload" }) : f).catch(() => {});
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => n === SHELL ? null : caches.delete(n)));
    await self.clients.claim();
  })());
});

async function cacheFirst(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    return Response.error();
  }
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Page loads: serve the cached shell instantly, refresh it in the background
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      const cached = await cache.match("./index.html");
      const network = fetch(req).then(res => {
        if (res && res.ok) cache.put("./index.html", res.clone());
        return res;
      }).catch(() => null);
      event.waitUntil(network);
      return cached || (await network) || new Response(
        "<h1>Offline</h1><p>Open Romp once while connected, then it works without a network.</p>",
        { headers: { "Content-Type": "text/html" } }
      );
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
  }
});

self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
