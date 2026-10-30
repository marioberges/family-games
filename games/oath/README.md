# Oath — US presidents (PWA)

A static, installable web app. No build step, no dependencies, no server code.
Lattice's chassis — the Leitner scheduler and the hidden answer timing —
Agate's collection, and Hoist's map, turned on the forty-five presidents.

```
index.html               the whole app: deck, clues, cards, and the inlined map
sw.js                    service worker (offline)
manifest.webmanifest     install metadata
portraits/               45 public-domain portraits, 2.7 MB, self-hosted
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## What it is for

Knowing the presidents in order, knowing who each one was, and knowing where
each one came from. The order is the spine; the stories make it stick; the map
ties it to the country itself.

## Forty-five people, forty-seven numbers

Grover Cleveland (22nd and 24th) and Donald Trump (45th and 47th) each served
two terms that were not one after the other. The deck is built on people, the
way Lattice's is built on unordered pairs: one record each, holding one number
or two. A two-term president is asked about one term at a time, and his other
number is never offered as a wrong answer — it is true of him, just not of the
term being asked about.

## Three games, one wall

Each keeps its own spaced-repetition deck, because knowing Lincoln is sixteenth
says nothing about knowing he was born in Kentucky. All three pay into the same
collection.

- **Timeline** — "Who was the 16th president?" and "What number was Lincoln?",
  decided per showing. A strip of five numbered slots sits under the question.
  Before the answer it shows numbers only, because the neighbours either side
  are exactly the wrong answers on offer; after it, every face fills in. Wrong
  answers are next door, two doors down, the same surname (Adams for Adams), and
  the same era.
- **Who Am I** — a clue in the president's own voice, and four names. Each
  president has a ladder of four clues — *famous*, *notable*, *deeper*,
  *obscure* — and a rung opens only once the one below it is solved. The setting
  caps the highest rung in play. A clue never contains its own answer, and a
  president the clue names ("my vice president was John Adams") is never offered
  as a wrong answer.
- **Born Where** — find the state on a map of all fifty, Alaska and Hawaii
  included as insets. Wrong answers are the states next door, read straight off
  the map's shared borders, plus one of the states that produced several
  presidents. Get the state right and, with towns on, a bonus question asks for
  the town.

**How you answer** is four choices, or drag: pick the portrait up and drop it
into the gap in the strip, onto its number, or onto a state. A tap still works
everywhere — dragging is how it feels, never the only way in.

## The wall

Seven cards per president: the four clues, the birthplace, the town — and the
portrait, which is Timeline's card. Place a president correctly for the first
time and their picture goes up on the wall in its spot in the line. The wall is
laid out in order, all forty-seven numbers, so browsing it is a third, quieter
way of learning the sequence. A frame shows no name until something of that
president's has been won, so the wall never answers a question for you.

Win all seven and the portrait gets a wax seal. Find every president born in
Virginia, or every one born in Ohio, and that state's card is yours: both claim
to be the Mother of Presidents, and the cards say so.

A card won for the first time stops the game and waits for Next. A repeat moves
on by itself after a couple of seconds. A won card is never lost; the **Known**
meter is a different thing and drops when you miss.

## Settings

- **Which presidents** — from No. 1 (to 10, 20, 30 or 40), an era at a time, or
  everyone. A president is in if either of their numbers is.
- **How you answer** — four choices or drag (Timeline and Born Where).
- **Hardest clue** — Famous to Obscure (Who Am I).
- **Towns** — state only, or state and town (Born Where).

**Hint** gives the years in office, or the region of the country, for half
points.

## Content

Every fact was looked up, and `../../notes/oath-coverage.md` gives the source
and the passage for each card. The clues are written for a nine-year-old: plain,
specific, never unkind about anyone, and recent presidents get exactly the same
treatment as everyone else. Legends are left out; the one that appears (Taft
and the bathtub) is labelled untrue.

## Offline and updates

Everything but the fonts is precached at install, portraits included, so it
works in airplane mode from the first launch. The portraits sit in their own
cache, `oath-portraits-v1`, which is **not** versioned with the shell: bump
`VERSION` in `sw.js` for any code change and only `index.html` and the icons
are fetched again. Rename the portrait cache only if a portrait itself changes.
A new build is picked up silently at the next question boundary.

Progress is saved under `oath:deck:v1`. A build that meets data written by a
newer one plays read-only rather than saving over it.

## Rebuilding the generated parts

```bash
./scripts/build-map.py oath     # the US map, from us-atlas (Census Bureau, public domain)
./scripts/make-icons.py oath    # the seal: 36 PNGs, read back out of sw.js
./scripts/test.sh               # including scripts/test/oath.mjs
```
