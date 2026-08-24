# Agate — sports numbers drill (PWA)

A static, installable web app. No build step, no dependencies, no server code.
Lattice's chassis — the same 78-fact deck and the same Leitner scheduler —
asking the same questions a different way.

```
index.html               the whole app
sw.js                    service worker (offline)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## What it is for

`7 × 8` is a string to memorise. *Eight converted touchdowns — how many points?*
is a question with an answer somebody once cared about. Agate never shows a sum
without saying where the number comes from, and the answer carries its unit:
not 56 but **56 points**, not 110 but **110 yards**.

Every number in the game is real and was looked up. Nothing is invented, and
where a line is arithmetic over a rule rather than a quoted statistic, that is
said. The sources are in `../../notes/agate-coverage.md`.

## The deck is 78 facts, not 144

`6 × 7` and `7 × 6` share one record and one due date. Commutativity is a
property of the material rather than two separate things to memorise, and it
halves the mastery bar to something a child can finish.

Which way round the sum is *written* is not a free choice here, as it is in
Lattice. "Twelve clubs, eleven a side" has to be written `12 × 11` or the
sentence and the numbers disagree — and a child believes the sentence. So the
story fixes the orientation, and only with the story switched **off** does the
coin get tossed and both directions get drilled.

## Where the questions come from

Three kinds of frame, in the order they are preferred:

- **Set pieces** — written for one fact and one fact only. Ten touchdowns in the
  1966 Washington–Giants game (`6 × 10`). Five overtimes of five minutes,
  Bucks–SuperSonics, 9 November 1989 (`5 × 5`). The NFL field, ten first downs
  long (`10 × 10`); the CFL's, eleven (`10 × 11`). Sixteen of them.
- **Rates** — generative: *n of these, worth v each*. Three-pointers, free
  throws, touchdowns, overs, first downs, the four bases of a home run.
- **Sides** — *n teams, so many a side*: futsal's five, rugby sevens' seven, a
  heat's eight lanes, baseball's nine, football's eleven, Canadian football's
  twelve.

Each rate carries a **ceiling on the count**, and that ceiling is the reason the
table is not just a list of scoring values. Nobody has ever scored eleven
touchdowns, so 6 stops being usable at `n = 11` and `6 × 11` has to find another
frame — it becomes eleven overs, sixty-six balls. The ceilings come from records
that were looked up: 28 free throws and 36 field goals by Chamberlain, 14 threes
by Klay Thompson, ten touchdowns by a team.

A fact keeps its story. `7 × 8` is always the touchdown card, because a story
that changed on every showing would be a new question every time, and the point
of the story is that it is the handle you remember the fact by.

## How it drills

A six-box Leitner scheduler, unchanged from Lattice. Get a fact right and it
moves up a box and comes back later — 45 seconds, 8 minutes, 45 minutes, 5
hours, a day, three days. Miss it and it drops to box 0 and is flagged for review
until you have had it right twice.

Answer speed is measured and never shown. There is no clock, because a child
working a fact out on their fingers does not need to be hurried. What the timing
decides is when a fact is genuinely finished: correct but slow stops short of the
three-day box; instantly right the first time skips ahead.

## Three settings

- **How you answer** — four choices, or type it on a number pad. The wrong
  answers are the mistakes children actually make: one row off, one column off,
  a step lost while skip-counting, the right last digit on the wrong number.
- **Which facts** — one table, a group (`2, 5, 10` up to `9, 11, 12`, or the
  squares), or all 78. Narrowing changes which questions get asked; it never
  changes which wrong answers are offered.
- **The story** — always, on reveal, or off. **Always** is the default and is the
  game: the sentence is the question. **On reveal** makes it a plain drill that
  pays out a fact afterwards. **Off** is the drill with nothing round it, which
  is what you want on the fifth pass through a table. On **reveal**, the **Hint**
  button is what brings the story out early, for half points; where the story is
  already up or switched off, Hint gives the arithmetic instead — leaning on the
  row below.

The line that explains the number — *"The length of an NFL field between the goal
lines"* — is only ever shown **after** an answer. Most of them give the number
away.

## Put it on an HTTPS host

A service worker only runs over **HTTPS** (or `http://localhost`). Any static
host works — this one lives on GitHub Pages in a subfolder, and every path here
is relative so that works without changes.

```bash
cd games/agate
python3 -m http.server 8000
# open http://localhost:8000  — localhost counts as a secure context
```

## Install on iPhone or iPad

1. Open the URL in **Safari**. Chrome and Firefox on iOS can't install web apps.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. Launch it from the home screen. It opens full screen with no browser chrome.

There is nothing to download afterwards. Every story is a string in
`index.html` — there are no images and no data file — so the app shell is the
entire game, and once it has loaded once it runs in airplane mode. The only
thing that comes off the network is the three fonts, cached as they are used,
with a system fallback if they never were.

### Built for both sizes

- **Rotation** is unlocked. Short landscape viewports shrink the sentence first,
  because the sum is the thing that has to stay on screen.
- **iPad portrait** keeps the side panels in two columns rather than stacking
  them into one long scroll. The same rule handles Split View and Slide Over,
  since it keys off width, not device.
- **Launch screens** for 28 device size and orientation combinations. Without
  them iOS shows a white flash on every cold start. They're precached, so they
  work offline too.
- iPadOS identifies itself as a Mac in the user agent, so device detection checks
  touch points rather than trusting the UA string.

## Progress

Saved in `localStorage` under `agate:deck:v1` — its own key, separate from
Lattice's, because both games share the origin `marioberges.github.io`. The key
never changes; the version lives inside the JSON. A build that meets data written
by a *newer* version plays read-only and says so in the rail, rather than saving
over fields it has never heard of — which is what two iPads updating a week apart
looks like.

**Clear progress** wipes the score and every fact learned but keeps the three
settings.

iOS may evict data from web apps that go unused for several weeks; opening it
occasionally is enough to keep it.

## Updating it later

Bump `VERSION` in `sw.js` whenever anything precached changes — and in practice
whenever `index.html` changes at all, because a byte-identical `sw.js` is a
worker the browser never notices, and the update then waits for a cold launch
that iOS may not give you for weeks. A new build is picked up silently at the
next question boundary.

## The art

`../../scripts/make-icons.py agate` regenerates all 36 PNGs — the bands of the
stone the game is named for, which is also the shape of a target and of a ring
of seats. It is pure Python standard library, and it reads the file list back out
of `sw.js`, so the precache list and the icons on disk cannot drift apart. Output
is deterministic; re-running it changes nothing.
