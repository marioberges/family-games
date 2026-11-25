# Patch — test a skincare claim (PWA)

A static, installable web app. No build step, no dependencies, no server code.

```
index.html               the whole app: skin model, lessons, investigations, cards, journal
claims.json              the claims, one file, fetched from this repo when online
sw.js                    service worker (offline; claims network-first)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## What it is for

Patch is for a teenager, first a 13-year-old. Skincare is the hook, not the
subject: the game teaches a way of thinking that carries over to any claim.
Build a model, make a prediction, look at the evidence, change your mind (or
say why not), and decide.

It opens with a real claim of the kind a 13-year-old has already met, and pulls
lessons in when an investigation needs them. Design doc: "Skin science game —
design doc" (Claude doc).

## Two modes

**Foundations.** A schematic skin cross-section where every part can be tapped,
named and read about at three depths, each with a label saying how settled the
science is. Five lessons: three layers; the barrier, with a water-loss cartoon;
cells on the move; from jar to target (the eight-link chain); mechanism is not
proof.

**Investigations.** Twelve steps for each claim: where you heard it, a precise
version, a first confidence (no default position, locked once you move on), the
parts of the model it depends on, the chain, the evidence one item at a time,
size and cost, unknowns, a new confidence, what moved you, what would change your
mind, and a decision. The result is a saved card stamped with the patch, and a
shareable verdict image. The card gets a gold edge and a bow when the number
moved because of a named piece of evidence, or held still for a stated reason.
The bow appears nowhere else: the patch is the game's mark, the bow is earned. There's no score
for landing on the "right" number.

## Reading aloud

Every lesson and investigation screen reads itself aloud after a tap brings it
up, with the paragraph being read highlighted. Tapping any paragraph reads it
again; the speaker button in the top bar reads the screen or stops. The switch
on Home ("Read to me") turns it off. It uses the iPad's own voices (Web Speech),
so it works offline; Settings > Accessibility > Spoken Content > Voices can add a
better English voice, and Patch prefers Samantha, Ava and the "Enhanced" ones.

## Watch, pink and bows (24 Nov 2026)

- **Watch** plays a lesson as a narrated animation: one sentence at a time as a
  caption, the parts of the skin it names lit up, and a pause at each question.
  Lessons 1 and 3 only, as a test of whether she uses it.
- **Bows** appear on gold cards, on finished lessons, in the ribbon picker and in
  the shower of bows and hearts when a card or lesson is earned. Never on the
  icon, the name or the claim note, where the patch is the mark. Her ribbon color
  (pink, lilac, peach, cherry) colors every bow, including the share image's.
- **Moving parts:** a month of cell journey in lesson 3, and a drop test in
  lesson 4. Lessons whose steps change carry a `rev`: a finished lesson stays
  finished, and one in progress restarts so saved answers can't land on the
  wrong step.

## Her own products (24 Nov 2026)

Home > Your products > Look up a product. `products.json` (in this folder, like
`claims.json`, fetched network-first) holds two things:

- **products**: name, brand, the label's claim, and the ingredient list exactly
  as printed, with a `source` link and the date it was checked. Only add a
  product whose whole list you could see.
- **ingredients**: the guide. Each entry has the label names it matches (`aka`,
  lower case), what it does, the parts of the skin model it acts on, an evidence
  level (`strong`, `some`, `thin`, `na`), how to use it, cautions and sources.

She investigates **one ingredient at a time**: her claim, a precise version, a
first number, the model, her own sources (kind, people, who paid, and whether
each moved her), a "Use it well" step with the AAD patch test, a new number and
a decision. The card can be copied as text to send for review. A product she
adds stays on the iPad; "Copy for Patch's product list" gives the JSON to paste
into `products.json` after checking it.

## Adding a claim

Claims live in `claims.json`, not in the app, so a new one ships with a commit
and a push and no new build. Each claim has an `opens` date (the player's local
date) and appears on Home from that day. A claim that fails validation is
skipped, not shown broken; `scripts/test/patch.mjs` checks every claim, and
fails if any evidence link is missing from `notes/patch-sources.md`.

A claim needs: `heard`, three `precise` rewrites with exactly one testable
(`ok: true`), `nodes.answer` (parts of the model), eight `chain` links rated
`plausible`, `unclear`, `implausible` or `trials`, `evidence` (each with a
`type`, `source.url`, `found` and `catch`), `effect`, `costs`, `unknowns` and a
one-line `stands`.

Players can't submit claims through the app yet. For now, a player's own
investigation goes to the author by hand and is reviewed in person before it
goes into `claims.json`.

## Saved data

One key, `patch:state:v1`, with `v` inside (v2 since 24 Nov 2026: `prefs` and
`own` were added). A build that meets newer data runs read-only. The last good `claims.json` is also kept under `patch:claims`, so a
claim still works offline even if the service worker didn't install. The
journal never leaves the device unless the player copies it.

## Sources

Every fact and figure: `notes/patch-sources.md`.
