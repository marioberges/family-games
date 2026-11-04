# Hopper — guess the rule (PWA)

A static, installable web app. No build step, no dependencies, no server code.

```
index.html               the whole app: rules, machine, tape, builder, wall
sw.js                    service worker (offline)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## What it is for

A machine with a secret rule. Feed it a number, turn the crank, and see what
comes out. Every try is printed on a paper tape, and when you think you know
the rule, you show the machine how it works. It is the out-loud game "I say 3,
you say 7" turned into something an eight-year-old can play alone, without ever
meeting the word *function*.

What it teaches without saying so: one example is never enough, zero is a good
number to try first, and the gaps between the outputs give the rule away.

## Saying the rule

A child can't type "2x + 1", but can build it from tiles: one or two steps,
each an action (**add**, **take away**, **times**) and an amount, a number or
**itself**, "the number you put in". "Times itself" is the square, with no new
word needed. The rule is read back as a sentence while it's being built, and
the tape grows a *yours* column so a mismatch shows before it's sent.

The machine judges by behaviour, never by spelling: both rules are run on every
number from 0 to 100. Everything a player can build is a polynomial of degree
three at most, and two of those that agree on more than three numbers agree
everywhere, so this is a proof, not a sample. "Add itself" cracks a doubling
machine. A wrong rule gets one counter-example, the smallest untried number
where the two differ, added to the tape as a free clue.

**Predict** is the gentler setting: the machine names a number, the player
says what will come out, and three right in a row cracks it.

## Seven levels, numbered and never described

| Level | Rules | How many |
| --- | --- | --- |
| 1 | add 1 to 10 | 10 |
| 2 | take away 1 to 9; small numbers **jam** | 9 |
| 3 | take away 1 to 12; negative numbers, no jams | 12 |
| 4 | times 2 to 10 | 9 |
| 5 | times 2 to 5, then add or take away 1 to 9 | 72 |
| 6 | times itself, then maybe add or take away up to 5 | 11 |
| 7 | all of the above, plus add or take away first, then times | 186 |

The game shows only "Level 3": saying what a level holds would give the
answers away. Three cracked rules open the next level. Jams happen only in
level 2, so negatives arrive on purpose in level 3. The player only ever feeds
in 0 and up (20 by default, 100 as a setting); negatives come out, never go in.
A rule doesn't come back until its level has been used up.

## Hints, the wall, the gold gear

Three hints, about how to hunt and never what the rule is: try 0; try two
numbers next to each other; look at the gaps (which also turns on the tape's
gaps view). "Show me the rule" takes two taps, wins no card, and puts the rule
back in the pool.

Each cracked rule is a blueprint card on the workshop wall, with its fewest
cranks. Crack a straight-line rule in two cranks, or a times-itself rule in
three, with no wrong guesses, and the card gets a **gold gear**: just enough
clues.

## Offline and updates

Nothing is fetched at runtime but the fonts: the machine is inline SVG and the
sounds are made in code. Everything else is precached. Bump `VERSION` in
`sw.js` for any change to a precached file. A new build is picked up silently at
the next machine, where everything is saved.

Progress is saved under `hopper:state:v1`, including the round in progress, so
closing the app mid-round comes back to the same machine. A build that meets
data written by a newer one plays read-only rather than saving over it.

## Rebuilding the generated parts

```bash
./scripts/make-icons.py hopper   # the gold gear: 36 PNGs, read back out of sw.js
./scripts/test.sh                # including scripts/test/hopper.mjs
```
