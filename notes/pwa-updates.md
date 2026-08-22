> **Status, 2026-08-22.** This was written against Hoist *before* the update
> fixes landed, so its line references point at the old `sw.js` and
> `index.html`. Recommendations 1–4 in section 6 are now implemented (worker
> registered with `updateViaCache:"none"`, re-checked on resume, silent reload
> at the next question boundary, `cache:"reload"` on the HTML precache,
> `waitUntil` on the background refresh) and the state blob is versioned. The
> analysis is kept because the *reasoning* is what will be needed for the next
> game, and because section 3 explains a failure mode that no amount of
> version-bumping fixes.

# How updates reach an installed Hoist on the iPad

Research notes, 2026-08-22. Target: `https://marioberges.github.io/family-games/games/hoist/`
installed via Safari → Add to Home Screen.

Throughout, findings are tagged:

- **[VERIFIED]** — read from the actual source files in this repo, or from a command
  I ran here, or quoted from a primary source (WebKit blog, MDN, W3C spec, web.dev).
- **[INFERRED]** — a conclusion I drew by reasoning over verified facts.
- **[UNCERTAIN]** — sources disagree, or the behaviour is only testable on the device.

Nothing under `games/` was modified. All code blocks below are proposals.

---

## 1. Does an installed PWA actually get the new version, and on which launch?

**Short answer: yes, it gets it — but the user sees new content on the SECOND cold
launch after the deploy, not the first. And on iOS, "cold launch" is much rarer than
"tap the icon."**

### The code as it stands

**[VERIFIED]** `games/hoist/sw.js` lines 105-119, the navigation handler:

```js
if (req.mode === "navigate") {
  event.respondWith((async () => {
    const cache  = await caches.open(SHELL);
    const cached = await cache.match("./index.html");
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put("./index.html", res.clone());
      return res;
    }).catch(() => null);
    return cached || (await network) || new Response(/* offline page */);
  })());
  return;
}
```

That is stale-while-revalidate: **the cached copy always wins the race** (`cached ||`
short-circuits before `network` is awaited), and the network copy is written back for
next time.

**[VERIFIED]** `games/hoist/sw.js` lines 56-63: `install` opens `hoist-shell-${VERSION}`,
`cache.add()`s each shell file, then calls `self.skipWaiting()`.

**[VERIFIED]** `games/hoist/sw.js` lines 65-72: `activate` deletes every cache not in
`[SHELL, FLAGS, FONTS]`, then `clients.claim()`.

**[VERIFIED]** `games/hoist/index.html` lines 781-784, the entire registration:

```js
if ("serviceWorker" in navigator) {
  try { await navigator.serviceWorker.register("sw.js"); }
  catch (e) { console.warn("Service worker didn't register:", e); }
}
```

No `updateViaCache`. No `updatefound` handler. No `controllerchange` handler. No
`registration.update()` anywhere. The page never learns that an update happened.

### Launch-by-launch trace

Assume: installed app controlled by SW `v1`; `hoist-shell-v1` holds the old
`index.html`. You deploy new `index.html` **and** bump `VERSION` to `v2`.

**Launch N — the first cold start after the deploy:**

1. iOS cold-starts the standalone web app. A navigation request for `./` is issued.
2. The registration's **active** worker is still `v1`. It handles the `fetch` event.
3. `cache.match("./index.html")` in `hoist-shell-v1` → **hit, old HTML** → returned
   immediately. **The user sees the OLD app.** **[INFERRED, from the code above]**
4. In parallel the browser performs a *soft update*: it re-fetches `sw.js`, sees
   byte-different content, and starts installing `v2`.
5. `v2`'s `install` opens the **new** cache name `hoist-shell-v2` and precaches the
   **new** `index.html` from the network.
6. `self.skipWaiting()` runs inside `install`'s `waitUntil`, so `v2` activates without
   waiting for the old client to close. `activate` deletes `hoist-shell-v1` and calls
   `clients.claim()`.
7. **`clients.claim()` does not reload anything.** The already-parsed DOM is still the
   old HTML. The user finishes this session on the old version.

**Launch N+1 — the second cold start:**

1. The active worker is `v2`. It handles the navigate.
2. `cache.match("./index.html")` in `hoist-shell-v2` → **new HTML**. **User sees the
   new app.** **[INFERRED]**

> **The crux: it is the second launch.** `skipWaiting()` does *not* buy you a
> first-launch update here, because the navigation response was already committed from
> the cache-first shell before the new worker existed. web.dev states this directly:
> *"skipWaiting means that your new service worker is likely controlling pages that were
> loaded with an older version"* — which is exactly what happens at step 6.
> **[VERIFIED — web.dev, "The service worker lifecycle"]**

### A finding that partly contradicts `CLAUDE.md`

**[INFERRED]** CLAUDE.md says: *"Bump `VERSION` in `sw.js` whenever `index.html` changes
… without the bump the family keeps playing the old game and nobody knows why."*

For **this** service worker that is not quite true. The stale-while-revalidate navigate
handler refreshes `./index.html` inside `hoist-shell-v1` on every launch, with or
without a version bump. So a pure-HTML change propagates on the second launch either
way. The bump matters for:

- the *other* precached shell files (icons, splash screens, manifest) — those are only
  re-fetched by `install`, so without a bump they are frozen forever;
- any change to `sw.js`'s own logic;
- forcing a clean cache when the old cached HTML is suspect.

The convention is still worth keeping — it is cheap and it makes the update explicit —
but the "nobody sees the new game" failure mode it describes is not the one you
actually have. The one you actually have is section 3.

### Two latent bugs in the current worker

**[INFERRED]** **(a) The background refresh is not kept alive.** In the navigate
handler, the `network` promise is never passed to `event.waitUntil()`. Once
`respondWith` settles with `cached`, the browser is free to terminate the worker, and
the `cache.put` may never run. On a fast launch this usually completes; on a slow
network it may not — which turns "second launch" into "third launch, sometimes."

**[INFERRED]** **(b) `install` can precache stale HTML.** `cache.add()` is an ordinary
`fetch` and goes through the HTTP cache. GitHub Pages sends `max-age=600` (verified
below). If `index.html` was fetched into the HTTP cache less than 10 minutes before the
new worker installs, `v2` can precache the **old** HTML into `hoist-shell-v2` — and then
that old HTML is what the user gets on launch N+1, with no version bump left to fix it.
Fix is `cache: "reload"` (section 6).

---

## 2. What controls the update check

### Browser-initiated re-fetch

**[VERIFIED — web.dev, "The service worker lifecycle"]** An update check fires on:

> "A navigation to an in-scope page … functional events such as push and sync, unless
> there's been an update check within the previous 24 hours."

and manually via `registration.update()`.

**[VERIFIED — same source]** The decision rule: *"Your service worker is considered
updated if it's byte-different to the one the browser already has."* A single changed
byte in `sw.js` is enough; an unchanged `sw.js` means no update, no matter what else
changed on the server.

### HTTP cache headers on `sw.js` — what GitHub Pages actually sends

**[VERIFIED — I ran this]**

```
$ curl -sD- https://marioberges.github.io/family-games/games/hoist/sw.js -o /dev/null
HTTP/2 200
content-type: application/javascript; charset=utf-8
etag: "6a897a48-fd5"
cache-control: max-age=600
expires: Sat, 22 Aug 2026 11:00:55 GMT
last-modified: Sat, 22 Aug 2026 10:30:32 GMT
```

And for the HTML:

```
$ curl -sD- https://marioberges.github.io/family-games/games/hoist/ -o /dev/null
HTTP/2 200
content-type: text/html; charset=utf-8
cache-control: max-age=600
etag: "6a897a48-a18e"
```

**`max-age=600` on both.** Ten minutes. This is good news and it defuses most of the
`updateViaCache` question: even in the worst case where Safari fully honours the HTTP
cache for the worker script, staleness is bounded at 10 minutes, not hours.

**[INFERRED]** The practical consequence is narrow but real: a deploy → re-launch loop
inside a 10-minute window can show you the previous build and make you think the deploy
failed. Wait 10 minutes, or hard-refresh in Safari proper, before concluding anything.

### The 24-hour rule

**[VERIFIED — W3C ServiceWorker spec discussion + Chrome for Developers, "Fresher
service workers, by default"]** Two distinct 24-hour behaviours, often conflated:

1. **max-age cap.** *"Updates obey the freshness headers of the worker script (such as
   max-age), unless the max-age is greater than 24 hours, in which case it is capped to
   24 hours"* — so no `max-age` can strand a user on an old worker forever. Irrelevant
   here: ours is 600, far under the cap.
2. **Update-check throttle.** The browser skips the update check on functional events if
   it has already checked within the last 24 hours. Navigations are the reliable
   trigger; push/sync are the throttled ones.

### `updateViaCache`

**[VERIFIED — MDN, `ServiceWorkerContainer.register()`]**

| value | behaviour |
|---|---|
| `"all"` | **(default)** HTTP cache consulted for the main script *and* imports |
| `"imports"` | HTTP cache consulted for imports only; main script always from network |
| `"none"` | HTTP cache bypassed entirely for the script and its imports |

**[VERIFIED]** Chrome 68+ ignores caching headers for the top-level worker script by
default regardless.

**[UNCERTAIN]** I could not find a primary WebKit statement on whether Safari matches
Chrome's default-bypass or follows the spec default of `"all"`. I am not going to guess.
Passing `updateViaCache: "none"` explicitly removes the question at zero cost, and is
recommended in section 6.

### `registration.update()`

**[VERIFIED — web.dev]** Manually forces the check, *"useful for long sessions, often
called on intervals like hourly."* This is the lever that fixes the iOS problem in
section 3, because on iOS the navigation that would otherwise trigger the check often
never happens.

---

## 3. iOS / iPadOS specifics — this is where it actually breaks

### Suspend/resume, not cold launch

**[VERIFIED — behaviour widely documented since iOS 12.2, e.g. the workbox and
create-react-app issue threads]** A standalone home-screen web app is **frozen** when
you switch away and **thawed** when you come back. Tapping the icon on a warm app is a
resume: no navigation, no page load, no service worker update check. The commonly cited
summary is that the context resumes on reopen and *"your service worker will likely not
be updated until the app unloads itself, which could be anywhere between 24 hours and 2
weeks."* **[UNCERTAIN as to exact intervals — that figure is community lore, not an
Apple statement; the qualitative behaviour is well corroborated.]**

**[INFERRED] This is the single most important gotcha in this whole document.** Section 1
concluded "second cold launch." Combine that with iOS's freezing and you get:

> Hoist needs **two cold starts** to show new content, and a daily-used iPad app may go
> for days or weeks without a single cold start. The child taps the icon, gets the frozen
> old session, and nothing about that ever changes until iOS reclaims the memory.

A cold start happens when: the device reboots, iOS evicts the app under memory pressure,
or someone swipes it out of the app switcher. None of those are things you can ask a
seven-year-old to do reliably. **This — not the missing `VERSION` bump — is why the
family would still be on the old build.**

The fix is not a new caching strategy. It is to make **resume behave like a launch**:
call `registration.update()` on `visibilitychange`. See section 6.

### Version-dependent behaviour

- **iOS/iPadOS 16.4 (Feb/Mar 2023)** — **[VERIFIED — WebKit blog, "Web Push for Web Apps
  on iOS and iPadOS," 2023-02-16]** brought Web Push, the Badging API, manifest `id`
  support, and third-party-browser Add to Home Screen. It did **not**, per that post,
  change how home-screen apps launch or how service workers update. Service workers
  themselves have shipped in iOS Safari since 11.3.
- **iOS 17 / Safari 17 (Sept 2023)** — **[VERIFIED — WebKit blog, "Updates to Storage
  Policy," 2023-08-10]** the storage rewrite covered in section 4, plus
  `navigator.storage.persist()` support.
- **Safari 18.4 (2025)** — **[VERIFIED via WebKit release notes summary]** Declarative
  Web Push and Screen Wake Lock for home-screen web apps. **[UNCERTAIN]** Apple's
  developer forums carry reports of iOS 18.4 crashing apps that use service workers; I
  could not confirm scope or resolution and would not plan around it.
- **iOS 26 / Safari 26 (2025-2026)** — **[VERIFIED via WebKit blog coverage]** every
  site added to the Home Screen now defaults to opening as a web app even with no
  manifest; there are effectively no installability requirements left. Safari 26 added
  Service Worker inspection/pausing in Web Inspector — genuinely useful for debugging
  this exact problem over USB from a Mac. Safari 26.6 lists *"improved service worker
  cleanup and performance."* **[UNCERTAIN]** whether any of that changes the
  suspend/resume update story; I found no statement that it does.
- **The `ios-pwa-freeze-bug` repo** — **[VERIFIED by reading it]** is **iOS 13.x**, a
  race in the PWA container on resume that required a service worker to reproduce. It is
  historical; do not design around it in 2026. It is worth knowing it existed, because
  it is the ancestor of the general advice "be careful what you do on resume."

### iPadOS reports as Mac

**[VERIFIED]** `games/hoist/index.html` line 753 already does the right thing:

```js
const iPad = /iPad/.test(navigator.userAgent)
          || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
```

**[INFERRED]** No change needed. Note this matters for *any* new update-related UI you
add: if you ever branch on "is this iOS" to decide update strategy, use the touch-points
test, not the UA. Better still, don't branch at all — the `visibilitychange` approach in
section 6 is correct on every platform, so there is no need to detect iOS for it.

### Nuking a stuck install

**[UNCERTAIN — widely reported, not an Apple-documented procedure]** If an installed copy
is wedged on an old build, the reliable reset is Settings → Safari → Advanced → Website
Data → remove the site's data, then delete the home-screen icon and re-add it. Treat
this as the emergency lever, not the update mechanism. Note it **destroys
`localStorage`** — see section 4.

---

## 4. Does localStorage survive an update, and what threatens it?

### Across an app update: yes

**[INFERRED, high confidence]** `localStorage` is keyed by origin, not by service worker
version or cache name. `activate` in `sw.js` deletes **Cache Storage** entries only
(`caches.delete`), which has no bearing on Web Storage. Deploying a new `index.html` and
a new `VERSION` cannot touch `hoist:deck:v1`. The only thing that can destroy it from
inside the app is your own code.

**[VERIFIED]** `games/hoist/index.html` lines 449-468 — the load/save pair, correctly
wrapped in `try`/`catch` per the project convention:

```js
const KEY = "hoist:deck:v1";
async function loadRaw(){
  if(artifactStore){ /* claude.ai artifact store branch */ }
  try{ return localStorage.getItem(KEY); }catch(e){ return null; }
}
async function save(){
  const v = JSON.stringify(state);
  if(artifactStore){ /* ... */ return; }
  try{ localStorage.setItem(KEY, v); }catch(e){ console.warn("save failed", e); }
}
async function load(){
  const raw = await loadRaw();
  if(!raw) return;
  try{ Object.assign(state, JSON.parse(raw)); }catch(e){ /* corrupt entry, start fresh */ }
}
```

### What actually threatens it on iOS

**1. The 7-day cap on script-writable storage.** **[VERIFIED — WebKit blog, "Full
Third-Party Cookie Blocking and More," March 2020]**, verbatim:

> "deleting all of a website's script-writable storage after seven days of Safari use
> without user interaction on the site."

covering *"Indexed DB, LocalStorage, Media keys, SessionStorage, Service Worker
registrations and cache."*

**2. But home-screen installation exempts you.** **[VERIFIED — same post]**, verbatim:

> "Web applications added to the home screen are not part of Safari and thus have their
> own counter of days of use. Their days of use will match actual use of the web
> application which resets the timer."

and:

> "If your web application does experience website data deletion, please let us know
> since we would consider it a serious bug."

**[INFERRED]** This is the strongest argument in the whole document for the project's
existing "install it on the iPad, the Pages URL is the real thing" rule. A kid who opens
Hoist from the home screen every few days resets the counter every time. A kid who plays
it in a Safari tab and doesn't touch it for a week can lose their entire deck. The
installed app is not merely nicer — it is the only configuration where the spaced-
repetition data is safe.

**⚠️ Sources disagree — flagging explicitly.** MDN's *"Storage quotas and eviction
criteria"* page, as I read it today, states that `localStorage` is **not** covered by the
7-day eviction rule and follows different rules from IndexedDB/Cache API. WebKit's own
blog post explicitly lists `LocalStorage` in the covered set. **I side with WebKit's
primary source** and treat `hoist:deck:v1` as subject to the cap when not installed. If
this ever becomes load-bearing, test it on a real device rather than trusting either
page.

**3. Quota / LRU eviction.** **[VERIFIED — WebKit blog, "Updates to Storage Policy,"
2023-08-10]** Since Safari 17 / iOS 17: per-origin quota up to ~60% of disk for browser
apps, overall cap ~80%; default mode is *"best-effort mode, which means their persistence
is not guaranteed and their data can be evicted"*; eviction is *"a least-recently-used
policy"* based on last user interaction or storage operation. Hoist stores a few KB of
JSON. **[INFERRED]** Quota eviction is a non-issue for this app; it matters for the
14 MB flag Cache Storage, which is a re-downloadable inconvenience, not data loss.

**4. Delete and re-add the icon.** **[INFERRED, high confidence]** Removing a home-screen
web app removes its storage. Re-adding it starts from an empty deck. Same for the
Settings → Website Data reset in section 3. There is nothing you can do about this from
JavaScript — it is the user's own destructive action. The only real mitigation is an
export/import affordance, which is out of scope for now but worth remembering if the
deck ever represents months of a child's work.

### `navigator.storage.persist()` on iOS

**[VERIFIED — WebKit, "Updates to Storage Policy," 2023-08-10; support from Safari 17.0 /
iOS 17 / iPadOS 17]** It exists and is usable. Grant policy, verbatim:

> WebKit "currently grants a request based on heuristics like whether the website is
> opened as a Home Screen Web App"

**[VERIFIED — MDN]** Safari auto-approves or auto-denies with **no user prompt**:
*"Safari and most Chromium-based browsers … automatically approve or deny the request
based on the user's history of interaction with the site and do not show any prompts to
the user."*

**[INFERRED] Verdict: worth calling, low value, zero risk.** Being a home-screen web app
is already the main heuristic that grants it, so an installed Hoist is likely persistent
already. Calling it costs one line, cannot prompt the user, and upgrades the flag cache
from best-effort to exempt-from-eviction. Do not build anything that depends on the
result. Guard it in `try`/`catch` per project convention — the sandboxed
`artifacts/` preview runs in an opaque origin where it will throw.

```js
/* Ask once. Safari grants silently for home-screen web apps; everywhere else
   this is a no-op. Never let it break init. */
try {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(
      ok => console.log("persistent storage:", ok),
      () => {}
    );
  }
} catch (e) { /* opaque origin — ignore */ }
```

---

## 5. Migrating the shape of the saved state

### The current failure mode

**[VERIFIED]** `load()` does `Object.assign(state, JSON.parse(raw))`. That is a blind
shallow merge over the default `{score, best, asked, cards}`. It has two properties worth
naming:

- **Additive changes are already safe.** Add a field to the default `state` and old saved
  blobs simply won't overwrite it — the default survives. **[INFERRED]**
- **Everything else is unsafe.** A renamed key silently keeps the stale one *and* the
  default. A changed value type (say `cards[code].d` from a timestamp to `{due, ease}`)
  is merged in wholesale and will crash or misbehave in `pick()` (line 617ff sorts on
  `state.cards[a].d`). **[INFERRED]**

### Versioned key vs. version field inside the blob

**Recommendation: a version field inside the blob, keeping the key `hoist:deck:v1`
stable.** **[INFERRED]** Reasoning:

| | versioned key (`hoist:deck:v2`) | version field in blob |
|---|---|---|
| Old app reads new data | reads `…:v1`, gets **stale data**, silently writes back over it | reads the blob, sees `v:2 > 1`, **can refuse to write** |
| Migration | must enumerate old keys to find data | one read |
| Orphaned data | old keys linger, invisible, consuming quota | none |
| Conventions | still namespaced per game ✅ | still namespaced per game ✅ |

The deciding factor is the row that matters most here.

### The forward-compat risk is real for this family

**[INFERRED]** Two iPads. One cold-launches twice and gets the new build; the other stays
warm on the old build for a week (section 3). They do not share storage — each device has
its own origin storage — so they will not corrupt each other. **But** the same *device*
can regress: a stuck-warm session running old code, resumed after the new code already
wrote a new-shaped blob during a brief cold start, will `Object.assign` the new shape
over its old-shaped defaults and write it back mangled. With a version field the old code
can detect "this data is from the future" and decline.

That only works if you **ship the guard before you ship the change**. A version field
added at the same time as the breaking change protects the *next* migration, not this
one. So: land the reader guard now, while the shape is still v1.

### Concrete code for Hoist

Drop-in replacement for lines 449-468. Preserves the `artifactStore` branch, the
`try`/`catch` convention, and the `hoist:deck:v1` key.

```js
const KEY = "hoist:deck:v1";       // key stays stable forever; version lives inside
const STATE_VERSION = 1;           // bump when the SHAPE changes

let state = {v: STATE_VERSION, score:0, best:0, asked:0, cards:{}};

/* ---- migrations: each takes the blob at version N, returns it at N+1 ---- */
const MIGRATIONS = {
  // 1: blob => { ...blob, cards: remapCards(blob.cards), v: 2 },
};

function migrate(blob){
  let v = typeof blob.v === "number" ? blob.v : 1;   // pre-versioning data is v1
  while (v < STATE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) return null;                          // gap in the chain: unmigratable
    blob = step(blob);
    v = blob.v = v + 1;
  }
  return blob;
}

async function load(){
  const raw = await loadRaw();
  if (!raw) return;

  let blob;
  try { blob = JSON.parse(raw); }
  catch (e) { return; }                              // corrupt: keep defaults, start fresh
  if (!blob || typeof blob !== "object") return;

  const incoming = typeof blob.v === "number" ? blob.v : 1;

  if (incoming > STATE_VERSION) {
    /* Data written by a NEWER build of Hoist — this device is running an old copy
       that hasn't cold-launched yet. Read what we safely can, and NEVER write back:
       a save here would destroy the newer fields. */
    readOnly = true;
    state.score = Number(blob.score) || 0;
    state.best  = Number(blob.best)  || 0;
    state.asked = Number(blob.asked) || 0;
    if (blob.cards && typeof blob.cards === "object") {
      for (const [code, c] of Object.entries(blob.cards)) {
        if (c && typeof c.d === "number") state.cards[code] = {d: c.d, n: c.n | 0};
      }
    }
    return;
  }

  const migrated = migrate(blob);
  if (!migrated) {                                   // unmigratable
    try { localStorage.setItem(KEY + ":orphan:" + Date.now(), raw); } catch (e) {}
    return;                                          // defaults; deck restarts
  }
  Object.assign(state, migrated);
  state.v = STATE_VERSION;
}

let readOnly = false;

async function save(){
  if (readOnly) return;                              // refuse to clobber newer data
  state.v = STATE_VERSION;
  const v = JSON.stringify(state);
  if (artifactStore){ try{ await artifactStore.set(KEY, v); }catch(e){ console.warn("save failed", e); } return; }
  try{ localStorage.setItem(KEY, v); }catch(e){ console.warn("save failed", e); }
}
```

Notes on the choices:

- **The forward-compat branch reads defensively field-by-field**, rather than
  `Object.assign`. That is the point: an old build has no idea what a new field means, so
  it copies only what it provably understands and coerces the types.
- **`readOnly` is the load-bearing part.** A child playing on the stale iPad still gets a
  working drill from the data that is there; they just don't persist progress until the
  app cold-launches into the new build. Losing one session's progress beats corrupting
  the deck. **[INFERRED]** — this is a judgement call, but silent corruption of a spaced-
  repetition schedule is much harder to notice and much harder to undo.
- **Unmigratable data is parked, not deleted**, under a timestamped orphan key. It is a
  few KB. If a migration turns out to be wrong you can still recover the deck by hand
  from Web Inspector. Note this does mean orphan keys accumulate if it ever loops — in
  practice it fires at most once per breaking change.
- **`MIGRATIONS` is a chain, not a switch.** v1→v3 runs v1→v2 then v2→v3, so you write
  each step once and never have to think about skipped versions — the iPad that sat in a
  drawer for six months migrates correctly.

---

## 6. Recommendation: what to actually change in Hoist

**Do we need a mechanism? Yes.** Not because updates never arrive — they do — but because
on iOS they arrive after *two cold starts*, and a daily-used home-screen app may not cold
start for weeks (section 3). That is an unbounded delay, and it is invisible: nothing
tells you the family is a build behind.

**Auto-reload or prompt?** **Silent, deferred auto-reload.** Reasoning:

- This is a family app used by kids. A "New version — tap to reload" banner is a dialog
  nobody understands and everybody dismisses. The project's own instinct — *silent and
  reliable beats a dialog nobody understands* — is right.
- The stated risk of auto-reload is losing the user's current question mid-drill. That
  risk is fully avoidable here, because Hoist has a natural safe point. **[VERIFIED]**
  `answer_()` calls `save()` at line 614 and schedules `nextCard` at line 597; `nextCard()`
  at line 617 is the top of a fresh question with `answered = false`. **At the top of
  `nextCard()` the state is already persisted and the next question has not yet been
  shown.** Reloading there costs the user literally nothing.
- So: never reload while a question is on screen. Set a flag, reload at the next card
  boundary. If the user stops playing, the reload simply happens next launch — which is
  the status quo, i.e. no worse.

### Change 1 — register with `updateViaCache: "none"`, and check for updates on resume

**This is the highest-value change in the document.** It converts every resume — the
common case on iOS — into an update check.

Replace lines 781-784 of `index.html`:

```js
/* ---- update delivery ---------------------------------------------------
   iOS freezes a home-screen web app rather than cold-launching it, so the
   navigation that would normally trigger a service-worker update check may
   not happen for days. Poll on resume instead. Everything is guarded: in the
   sandboxed artifacts/ preview there is no service worker at all. */
let updateReady = false;

if ("serviceWorker" in navigator) {
  try {
    const reg = await navigator.serviceWorker.register("sw.js", {
      updateViaCache: "none"        // never let the 600s HTTP cache hide a new worker
    });

    // A new worker has been found and is installing/installed.
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        // Only interesting if we were already controlled — otherwise it's the
        // very first install and the page is already current.
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          updateReady = true;
        }
      });
    });

    // Check on every resume, but no more than every 15 minutes.
    let lastCheck = 0;
    const maybeCheck = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastCheck < 15 * 60 * 1000) return;
      lastCheck = now;
      reg.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", maybeCheck);
    window.addEventListener("pageshow", maybeCheck);   // iOS bfcache restore
    maybeCheck();
  } catch (e) {
    console.warn("Service worker didn't register:", e);
  }
}
```

**[INFERRED]** `pageshow` is belt-and-braces: iOS restores from the back/forward cache in
ways that don't always fire `visibilitychange`. Both are cheap and idempotent behind the
15-minute throttle.

### Change 2 — reload at a safe moment, never mid-question

Add to the top of `nextCard()` (line 617):

```js
function nextCard(){
  clearTimeout(advanceTimer);

  /* A new build is cached and ready. We're between questions and `save()` has
     already run, so a reload here loses nothing the user can perceive. */
  if (updateReady) {
    updateReady = false;
    location.reload();
    return;
  }

  answered = false; hintUsed = false;
  /* ...existing body... */
}
```

**[INFERRED]** With `skipWaiting()` already in `install`, by the time `updateReady` is
set the new worker is active and `hoist-shell-vN+1` holds the new HTML — so this reload
serves the new build immediately. **Net effect: the update lands within one card of being
downloaded, on the same session, with no dialog and nothing lost.** That collapses
"second cold launch, possibly weeks away" into "next question."

### Change 3 — don't precache stale HTML

**[VERIFIED]** GitHub Pages sends `max-age=600` on `index.html`, and `cache.add()` goes
through the HTTP cache (section 1, latent bug (b)). In `sw.js`, replace line 60:

```js
// addAll is all-or-nothing; add individually so one 404 can't break install.
// cache:"reload" bypasses the 600s HTTP cache — otherwise a new worker can
// precache the OLD index.html and the version bump buys nothing.
await Promise.all(SHELL_FILES.map(f =>
  cache.add(new Request(f, { cache: "reload" })).catch(() => {})
));
```

**[INFERRED]** Consider applying `cache: "reload"` only to `"./"` and `"./index.html"`.
The 28 splash screens and the icons are large, immutable, and re-fetching them from the
network on every version bump costs the family bandwidth for no benefit — exactly the
reasoning already applied to the unversioned flag cache.

### Change 4 — keep the background shell refresh alive

In the navigate handler, so the second-launch path can't silently fail:

```js
if (req.mode === "navigate") {
  event.respondWith((async () => {
    const cache  = await caches.open(SHELL);
    const cached = await cache.match("./index.html");
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put("./index.html", res.clone());
      return res;
    }).catch(() => null);
    // Keep the worker alive until the background refresh finishes, or the
    // cache.put may never run and the shell never goes stale-free.
    event.waitUntil(network);
    return cached || (await network) || new Response(/* offline page */);
  })());
  return;
}
```

**[INFERRED]** `event.waitUntil` inside the async IIFE passed to `respondWith` is legal —
the event is still dispatching. This is the standard stale-while-revalidate shape.

### Change 5 — request persistent storage (optional, one line)

Section 4's snippet, dropped into `init()`. Low value because home-screen installation
already grants it heuristically, but it is free and it protects the 14 MB flag cache from
LRU eviction.

### Priority order

1. **Change 1** — `updateViaCache: "none"` + `registration.update()` on resume. Without
   this, nothing else matters on iOS.
2. **Change 2** — deferred reload at the `nextCard()` boundary. Turns "eventually" into
   "this session," silently.
3. **Change 3** — `cache: "reload"` on the HTML precache. Closes the stale-precache hole
   that would otherwise defeat a `VERSION` bump.
4. **Section 5's versioned-blob reader** — land it *now*, while the shape is still v1, so
   the guard exists before the first breaking change needs it.
5. **Change 4** — `waitUntil` on the background refresh. Correctness tidy-up.
6. **Change 5** — `navigator.storage.persist()`. Nice to have.

### What must be tested on the device

**[UNCERTAIN — untestable from this machine, and the project's own rules say so]** Per
`CLAUDE.md`: *"Never treat the preview as a test."* Everything above is reasoning over
source code and primary documentation. The following can only be confirmed on the actual
iPad, against the Pages URL:

- that `visibilitychange` genuinely fires on resume of a frozen standalone web app, and
  that `reg.update()` at that moment does fetch `sw.js`;
- that the deferred reload lands on the new build on the **first** session rather than
  the second;
- that `navigator.storage.persisted()` returns `true` once installed.

Safari 26's Web Inspector service-worker inspection (section 3) makes this materially
easier than it used to be: attach the iPad over USB, watch the worker install.

---

## Sources

- [The service worker lifecycle — web.dev](https://web.dev/articles/service-worker-lifecycle)
- [ServiceWorkerContainer.register() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register)
- [Storage quotas and eviction criteria — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Full Third-Party Cookie Blocking and More — WebKit, March 2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [Updates to Storage Policy — WebKit, 2023-08-10](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [Web Push for Web Apps on iOS and iPadOS — WebKit, 2023-02-16](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
- [Fresher service workers, by default — Chrome for Developers](https://developer.chrome.com/blog/fresher-sw)
- [24 hour spontaneous update doesn't seem specced — w3c/ServiceWorker#514](https://github.com/w3c/ServiceWorker/issues/514)
- [ios-pwa-freeze-bug (iOS 13, historical)](https://github.com/djsweet/ios-pwa-freeze-bug)
- [Safari is using memory cache instead of service worker — workbox#1744](https://github.com/GoogleChrome/workbox/issues/1744)
- Live HTTP headers for `sw.js` and `index.html`, captured with `curl` on 2026-08-22.
