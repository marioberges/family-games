# Hoist — flag recognition drill (PWA)

A static, installable web app. No build step, no dependencies, no server code.

```
index.html               the whole app
sw.js                    service worker (offline)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch
```

## Put it on an HTTPS host

A service worker only runs over **HTTPS** (or `http://localhost`). Any static host works:

- **GitHub Pages** — push these files to a repo, then Settings → Pages → deploy from branch. Works in a subfolder; every path here is relative.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder onto the dashboard.
- **Your own server** — copy the folder into the web root. Serve `manifest.webmanifest` as `application/manifest+json` if your server doesn't already.

Local test:

```bash
cd hoist
python3 -m http.server 8000
# open http://localhost:8000  — localhost counts as a secure context
```

## Install on iPhone or iPad

1. Open the URL in **Safari**. Chrome and Firefox on iOS can't install web apps — the option won't appear.
2. Tap **Share** → **Add to Home Screen** → **Add**. On iPhone the Share button is in the bottom bar; on iPad it's in the top toolbar. The app detects which device you're on and says so.
3. Launch it from the home screen. It opens full screen with no browser chrome.

Then tap **Save all flags** in the Offline panel while you still have signal, so the drill works in airplane mode. Download size depends on the device: **~6 MB** on iPhone, **~14 MB** on iPad, because iPad gets higher-resolution flag art.

### Built for both sizes

- **Flag resolution** is chosen per device. Anything with more than 1200 physical pixels across gets the 1280px art instead of 640px, so flags stay crisp on an iPad Pro without making iPhones download art they can't resolve.
- **Rotation** is unlocked. Landscape on a phone would normally push the answer buttons off screen, so the flag scales against viewport height as well as width, and short landscape viewports get tighter padding.
- **iPad portrait** keeps the side panels in two columns rather than stacking them into one long scroll. The same rule handles Split View and Slide Over, since it keys off width, not device.
- **Launch screens** are included for 28 device size and orientation combinations. Without them iOS shows a white flash on every cold start. They're precached by the service worker so they work offline too.
- **Home screen icons** ship at 120, 152, 167, and 180 px — iPad Pro and iPad mini ask for different sizes than iPhone.
- iPadOS identifies itself as a Mac in the user agent, so device detection checks touch points rather than trusting the UA string.

## How offline works

- The app shell (HTML, icons, manifest) is precached on first visit and served cache-first, so launches are instant and work with no network.
- Flag images and Google Fonts are cached as they're used — any flag you've been quizzed on once is already saved. The Offline panel fetches the remaining ones in bulk.
- If a flag image is genuinely unavailable, the plate falls back to the Unicode flag emoji rather than showing a broken image.
- Progress lives in `localStorage` under `hoist:deck:v1`, so it survives closing the app. iOS may evict data from web apps that go unused for several weeks — opening it occasionally is enough to keep it.

## Updating it later

Bump `VERSION` in `sw.js` when you change `index.html`. The new worker takes over on the next launch (`skipWaiting` + `clients.claim`). The flag and font caches are deliberately unversioned so an app update doesn't force a 6 MB re-download.

## Notes

- Flag art comes from [flagcdn.com](https://flagcdn.com) (public domain images). To go fully self-hosted, drop the PNGs into `flags/` and change `flagURL()` in `index.html` — the service worker's `flagcdn.com` rule can then be deleted, since same-origin files are already cached.
- The country list is 197 entries: UN members plus Kosovo, Palestine, Taiwan, and Vatican City.
