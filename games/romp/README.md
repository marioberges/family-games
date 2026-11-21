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

While drawing, the bottom of the pad shows the place's tricky bit faintly, at
exactly the size it has in the world, with a measuring arrow and a plain label:
"A step is this tall", "The gap is this wide", "The tunnel is this low". A
doodle drawn next to it lands in the world at that same size, so a child can
see whether it will jump the step, bridge the gap, or fit the tunnel. Switching places brings everyone along: they drop in from the sky.

## Drawing

Apple Pencil first. Its pressure sets the line width, and once a Pencil has
touched the pad, fingers and palms are ignored there, so a resting hand leaves
no marks. Fingers draw too, for anyone without the Pencil. Six colours, an
**Eraser** that rubs out just the bits of line it passes over (splitting a line
in two through the middle), **Undo** that steps back one whole action at a
time (a line, an eraser swipe, or Start over), and **Start over**. Picking a
colour puts the eraser away.

Two things keep the Pencil from being interrupted (fixed 20 Nov 2026):

- **Scribble.** iPadOS Scribble watches every Pencil touch to see whether it
  is handwriting, and while it decides it can swallow the pen's next
  pointerdown: lift the pen, come back quickly, and nothing draws for a
  moment. The pad cancels its touch events (`touchstart`/`touchmove`,
  non-passive), which tells Scribble it isn't a place for handwriting; pointer
  events still arrive. See WebKit bug 217430.
- **Palms.** The Pencil always wins: if a palm got to the pad first (before
  any Pencil this session) and started a line, that line is taken back when
  the Pencil lands. And once a Pencil has been used, a touch that is down when
  the pen lands, or lands while the pen is down or within half a second of it
  lifting, is treated as a palm: the tap it would make on the card's buttons
  (Not now, a colour, Undo…) is swallowed, and it can't focus the name field.
  Nothing on the card scrolls or zooms, so a resting hand can't start a
  gesture that cancels the pen.

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

## Squiggle

A section of Romp behind its own **Squiggle** button at the top. The game
hands over a random squiggle and the player finishes it into whatever they
see in it: a monster, a face, a fish. It lives inside Romp rather than as an
app of its own because home-screen apps on an iPad don't share storage, and so
it can use the same drawing pad.

- **Squiggles.** Two or three hand-wobbly pieces (blob, wave, zigzag, spiral,
  hook, loopy line), each starting on or near the one before, then checked:
  its box covers 22–48% of the page, at least two loose ends, not too
  symmetric (a mirror test), at most three crossings, not long and thin. One
  that fails is rebuilt from the same random stream, so the same seed always
  makes the same squiggle. A fresh one scribbles itself in over 1.4 s.
- **A turn.** The squiggle sits on the pad in graphite and can't be erased,
  undone or wiped; only the player's own lines can. **New squiggle** swaps it
  (asking twice if something's drawn). **I'm done!** keeps it in the gallery,
  named "Squiggle 7" if no name was typed. **My squiggles** leaves the one in
  progress exactly as it is, for later.
- **The gallery.** Every finished drawing, newest first, with the squiggle
  traced in gold. Tap one for a big view with **Before / After**, rename it, or
  remove it (asks twice). Up to 100.
- **Send to Romp.** The player picks which ones go. **Send to Romp** puts the
  whole drawing (squiggle lines in graphite, the seventh colour, which isn't a
  pen) into the doodle book as a new page; **Play with it** drops it into the
  place. Renaming it in the gallery renames its page. If the page is later
  removed from the book, it can be sent again.

## Saved data

Three keys, each with a `v` inside and each going read-only when it meets data
from a newer build:

- `localStorage["romp:world:v1"]` — the world: `{v: 2, layout, chars: [{id,
  strokes, x, y, a, stars, book?}]}`. v2 added `book`, the page a character
  came from; a v1 world loads unchanged and is saved back as v2.
- `localStorage["romp:book:v1"]` — the book: `{v: 1, doodles: [{id, name,
  strokes, stars, made, edited?}]}`.
- `localStorage["romp:squiggle:v1"]` — Squiggle: `{v: 1, count, drawings:
  [{id, name, seed, base, strokes, made, book}], current: {seed, base,
  strokes, name} | null}`. `base` is the squiggle's lines, kept as drawn so a
  later change to the squiggle maker never alters a saved drawing; `book` is
  the page it was sent to.

Strokes are small integers (pad units, width × 10), so both stay small.
Sprites and colliders are rebuilt from strokes on load.

## Tests

`scripts/test/romp.mjs` boots a copy of the page with Planck inlined and
checks the places, the shape → movement rules, palm rejection, the bridge,
the spring, the tunnel, the doodle book (keep, rename, change, drop in, send
home, remove), the Pencil-wins and palm-tap rules, Squiggle (300 squiggles
against the rules, a turn, the gallery, sending to the book), saving, the v1 →
v2 migration and the read-only rules.
