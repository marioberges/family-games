# Lattice — times tables drill (PWA)

A static, installable web app. No build step, no dependencies, no server code.

```
index.html               the whole app
sw.js                    service worker (offline)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## The deck is 78 facts, not 144

`6 × 7` and `7 × 6` share one record and one due date. Commutativity is a
property of the material rather than two separate things to memorise, and it
halves the mastery bar to something a child can finish. Which way round a fact is
*shown* is decided fresh each time, so both directions still get drilled.

## How it drills

A six-box Leitner scheduler. Get a fact right and it moves up a box and comes
back later — 45 seconds, 8 minutes, 45 minutes, 5 hours, a day, three days. Miss
it and it drops to box 0 and is flagged for review until you have had it right
twice.

Answer speed is measured and never shown. There is no clock and no timer, because
a child working a fact out on their fingers does not need to be hurried. What the
timing does instead is decide when a fact is genuinely finished: a fact you answer
correctly but slowly stops short of the three-day box and keeps coming back, and
one you answer instantly the very first time skips ahead. The only thing you can
observe is that the easy facts stop appearing.

## Three settings

- **How you answer** — four choices, or type it on a number pad. The wrong
  answers are the mistakes children actually make: one row off, one column off,
  a step lost while skip-counting, the right last digit on the wrong number.
- **Which facts** — one table at a time, a group (`2, 5, 10` up to `9, 11, 12`,
  or the squares), or all 78. Narrowing changes which questions get asked; it
  never changes which wrong answers are offered, or "Easy · 2, 5, 10" would offer
  four options all ending in 0 or 5.
- **Dot array** — off, on reveal, or always. `6 × 7` drawn as six rows of seven
  dots is what the fact actually means. On reveal is the default: miss a fact and
  you see why the answer is 42. Always leaves it up from the start, to count or
  chunk. Whatever the setting, the **Hint** button reaches the array for half
  points. The array is captioned — "6 rows of 7", becoming "6 rows of 7 makes
  42" once answered — because an uncaptioned array is decoration.

## Build it yourself

Under the answer buttons is a 12 × 12 pegboard. Drag anywhere on it and an array
grows from the top-left corner to meet your finger; the line underneath says what
you have actually made, updating as you go. Build the array the question is
asking for and it turns green.

No precision is needed and nothing is scored. It is somewhere to try the question
out with your hands before committing to an answer, and it is the one place where
`6 × 7` stops being a string to recall and becomes a shape you made.

Building the array the other way round is accepted too, and says so — *"7 × 6 =
42 — the same, turned round."* That is not a leniency; it is the idea the whole
deck is built on.

Hide it from the header if it is in the way; the choice is remembered.

## Put it on an HTTPS host

A service worker only runs over **HTTPS** (or `http://localhost`). Any static host
works — this one lives on GitHub Pages in a subfolder, and every path here is
relative so that works without changes.

```bash
cd games/lattice
python3 -m http.server 8000
# open http://localhost:8000  — localhost counts as a secure context
```

## Install on iPhone or iPad

1. Open the URL in **Safari**. Chrome and Firefox on iOS can't install web apps.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. Launch it from the home screen. It opens full screen with no browser chrome.

There is nothing to download afterwards. The dot array is drawn, not fetched, so
the app shell is the entire game — once it has loaded once it runs in airplane
mode. The only thing that comes off the network is the three fonts, cached as
they are used, with a system fallback if they never were.

### Built for both sizes

- **Rotation** is unlocked. The sum and the array both size against viewport
  height as well as width, so landscape on a phone doesn't push the keypad off
  screen, and short landscape viewports get tighter padding.
- **iPad portrait** keeps the side panels in two columns rather than stacking
  them into one long scroll. The same rule handles Split View and Slide Over,
  since it keys off width, not device.
- **Launch screens** for 28 device size and orientation combinations. Without
  them iOS shows a white flash on every cold start. They're precached, so they
  work offline too.
- iPadOS identifies itself as a Mac in the user agent, so device detection checks
  touch points rather than trusting the UA string.

## Progress

Saved in `localStorage` under `lattice:deck:v1`. The key never changes; the
version lives inside the JSON. A build that meets data written by a *newer*
version plays read-only and says so in the rail, rather than saving over fields
it has never heard of — which is what two iPads updating a week apart looks like.

**Clear progress** wipes the score and every fact learned but keeps the three
settings. Losing what you have learned should not also send the difficulty ladder
back to the beginning.

iOS may evict data from web apps that go unused for several weeks; opening it
occasionally is enough to keep it.

## Updating it later

Bump `VERSION` in `sw.js` whenever anything precached changes — and in practice
whenever `index.html` changes at all, because a byte-identical `sw.js` is a worker
the browser never notices, and the update then waits for a cold launch that iOS
may not give you for weeks. A new build is picked up silently at the next question
boundary.

## The art

`../../scripts/make-icons.py lattice` regenerates all 36 PNGs. It is pure Python
standard library — nothing in this repo can otherwise rasterize an image — and it
reads the file list back out of `sw.js`, so the precache list and the icons on
disk cannot drift apart. Output is deterministic; re-running it changes nothing.
