# Romp — doodles that come alive (PWA)

A static, installable web app. No build step, no server code, and one library.

```
index.html               the whole game: drawing card, shapes, brains, places
planck.min.js            Planck.js 1.6.0 (Box2D port, MIT) — the physics
sw.js                    service worker (offline; precaches planck.min.js too)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## What it is for

Not a teaching game: a toy for the whole family. Someone draws a little
character on the iPad, taps **Let it go!**, and it drops into a place and
starts moving about. Someone else draws another, and they meet, say hello, and
get in each other's way. The twist is that you see the place first and draw
*for* it, because the shape of a doodle decides how it moves.

## Shape decides movement

A doodle becomes a physics body shaped like its outline (the convex hull, at
most 12 corners — Planck's limit), so most of the behaviour is real physics:

- **Round** doodles roll, and bounce a little.
- **Tall** ones jump high and wobble, because they keep upright less firmly.
- **Long, flat** ones crawl, and lie across a gap like a bridge.
- **Everything else** hops along.
- More ink makes a doodle heavier; bumpy, spindly edges grip better.

The player never sees a number. They find out by watching.

## The places

| Place | What's there | Who does well |
|---|---|---|
| Ledges | Steps up to a star on a high shelf; a ramp on the left | Tall jumpers climb the steps; rollers have the ramp |
| Gap | Two cliffs with a pit between; a spring in the pit throws you back out | Long doodles bridge it; jumpers leap it |
| Burrow | A hill with a low tunnel under it, 85 units high | Small doodles go through; tall jumpers go over |

While drawing, the pad shows the place's key size faintly at the same scale
("one step", "the gap", "the tunnel"), so a child can see how small small
enough is. Switching places brings everyone along: they drop in from the sky.

## Drawing

Apple Pencil first. Its pressure sets the line width, and once a Pencil has
touched the pad, fingers and palms are ignored there, so a resting hand leaves
no marks. Fingers draw too, for anyone without the Pencil. Six colours, Undo,
Start over.

The finished doodle is cut out as a sticker: the strokes are painted into a
grid, the outside is flood-filled, and whatever the flood can't reach is body
— so a drawn circle becomes a solid ball, and a stick figure stays spindly.

## Playing with them

Grab a character with a finger and toss it. Tap one and it hops. Characters
wander, rest, follow a friend, and head for the star; touching it earns a star
over their head, and it comes back a few seconds later. Twelve at most; the
oldest leaves to make room. **Clear** asks twice, without a dialog.

## My doodles: the book

The doodles worth keeping live in a book, apart from any one world, so
clearing the world never touches them.

- **Keeping one.** Type a name in the drawing card before **Let it go!**, or
  press and hold a character that's already romping about: its own card opens,
  with a name field and **Keep in my book**.
- **The book.** **My doodles** at the top shows every kept doodle as a sticker
  with its name and every star it has ever collected. Tap one, or **Drop in**,
  and a copy drops into whatever place is open.
- **Changing one.** **Change** opens the drawing card with the doodle already
  drawn, ready to add to, undo, or rename. The book keeps the new version and
  its stars, and the new version drops in. Copies already in the world stay as
  they were drawn. From a character's own card, **Change drawing** does the
  same and the new version takes the old one's place.
- **Send home** takes a character out of the world, not out of the book.
  **Remove from book** asks twice.
- A kept character shows its name for a moment when it arrives, while it is
  held, and while its card is open. Up to 60 doodles.

## Saved data

Two keys, each with a `v` inside and each going read-only when it meets data
from a newer build:

- `localStorage["romp:world:v1"]` — the world: `{v: 2, layout, chars: [{id,
  strokes, x, y, a, stars, book?}]}`. v2 added `book`, the page a character
  came from; a v1 world loads unchanged and is saved back as v2.
- `localStorage["romp:book:v1"]` — the book: `{v: 1, doodles: [{id, name,
  strokes, stars, made, edited?}]}`.

Strokes are small integers (pad units, width × 10), so both stay small.
Sprites and colliders are rebuilt from strokes on load.

## Tests

`scripts/test/romp.mjs` boots a copy of the page with Planck inlined and
checks the places, the shape → movement rules, palm rejection, the bridge,
the spring, the tunnel, the doodle book (keep, rename, change, drop in, send
home, remove), saving, the v1 → v2 migration and the read-only rule.
