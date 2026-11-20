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

## Saved data

`localStorage["romp:world:v1"]` holds `{v: 1, layout, chars: [{id, strokes, x,
y, a, stars}]}`. Strokes are small integers (pad units, width × 10), so a
world of twelve stays small. Sprites and colliders are rebuilt from strokes on
load. Data from a newer build makes this one read-only.

## Tests

`scripts/test/romp.mjs` boots a copy of the page with Planck inlined and
checks the places, the shape → movement rules, palm rejection, the bridge,
the spring, the tunnel, saving and the read-only rule.
