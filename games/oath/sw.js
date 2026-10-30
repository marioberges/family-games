/* Oath — service worker
   Every clue and card is a string in index.html, and the map is inlined as SVG,
   so the shell is nearly the whole game. The forty-five portraits are the rest,
   and they are precached at install too — there is no separate download step,
   and Oath works offline from the first launch onward.

   The portraits live in their OWN cache, and it is not versioned with the
   shell. Bumping VERSION for a code change re-fetches index.html and the icons;
   it must not re-fetch 2.7 MB of pictures that have not changed. If a portrait
   is ever replaced, rename PORTRAITS (v1 -> v2) — that is the only thing that
   will make an installed copy fetch it again.
   Fonts are cached at runtime and deliberately unversioned too. */

const VERSION = "v1";
const SHELL = `oath-shell-${VERSION}`;
const FONTS = "oath-fonts-v1";       /* unversioned on purpose: an app update
                                        shouldn't re-download the typefaces */
const PORTRAITS = "oath-portraits-v1";

/* One per president, in order. scripts/test/oath.mjs checks this list against
   the deck and against portraits/ on disk. */
const PORTRAIT_FILES = [
  "portraits/washington.jpg",
  "portraits/jadams.jpg",
  "portraits/jefferson.jpg",
  "portraits/madison.jpg",
  "portraits/monroe.jpg",
  "portraits/jqadams.jpg",
  "portraits/jackson.jpg",
  "portraits/vanburen.jpg",
  "portraits/whharrison.jpg",
  "portraits/tyler.jpg",
  "portraits/polk.jpg",
  "portraits/taylor.jpg",
  "portraits/fillmore.jpg",
  "portraits/pierce.jpg",
  "portraits/buchanan.jpg",
  "portraits/lincoln.jpg",
  "portraits/ajohnson.jpg",
  "portraits/grant.jpg",
  "portraits/hayes.jpg",
  "portraits/garfield.jpg",
  "portraits/arthur.jpg",
  "portraits/cleveland.jpg",
  "portraits/bharrison.jpg",
  "portraits/mckinley.jpg",
  "portraits/troosevelt.jpg",
  "portraits/taft.jpg",
  "portraits/wilson.jpg",
  "portraits/harding.jpg",
  "portraits/coolidge.jpg",
  "portraits/hoover.jpg",
  "portraits/froosevelt.jpg",
  "portraits/truman.jpg",
  "portraits/eisenhower.jpg",
  "portraits/kennedy.jpg",
  "portraits/lbjohnson.jpg",
  "portraits/nixon.jpg",
  "portraits/ford.jpg",
  "portraits/carter.jpg",
  "portraits/reagan.jpg",
  "portraits/ghwbush.jpg",
  "portraits/clinton.jpg",
  "portraits/gwbush.jpg",
  "portraits/obama.jpg",
  "portraits/trump.jpg",
  "portraits/biden.jpg"
];

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
    // Portraits: only the ones not already held, so an update costs nothing.
    const art = await caches.open(PORTRAITS);
    await Promise.all(PORTRAIT_FILES.map(async f => {
      if (await art.match(f)) return;
      return art.add(f).catch(() => {});
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keep = [SHELL, FONTS, PORTRAITS];
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

  // Portraits: from their own cache, which outlives shell updates
  if (url.origin === self.location.origin && url.pathname.includes("/portraits/")) {
    event.respondWith(cacheFirst(req, PORTRAITS));
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
        "<h1>Offline</h1><p>Open Oath once while connected, then it works without a network.</p>",
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
