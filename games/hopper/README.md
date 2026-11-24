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

A child can't type "2x + 1", but can build it from tiles: up to three steps,
each an action (**add**, **take away**, **times**, **divide by**) and an amount,
a number or **itself**, "the number so far". "Times itself" is the square, with
no new word needed, and "add 2, then times itself" is (x + 2) squared, which is
how a child says it. (Until levels 8–11, "itself" meant the number put in; in
levels 1–7 it only ever comes first, where the two meanings agree, and a test
checks that no machine there changed.) Division only works when it comes out
exact; otherwise the machine jams. **Different for even and odd numbers**
splits the builder into two lanes of up to two steps each. All tiles show at
every level, so they never hint at what a level holds. The rule is read back
as a sentence while it's being built, and the tape grows a *yours* column so a
mismatch shows before it's sent.

The machine judges by behaviour, never by spelling: both rules are run on every
number from 0 to 1000, jams included. On even and on odd numbers, anything the
tiles build is a polynomial of degree eight at most, and two of those that
agree on more than eight numbers agree everywhere; where rules jam repeats in a
pattern that 1000 numbers covers for any rule worth building. "Add itself"
cracks a doubling machine. A wrong rule gets one counter-example, the smallest
untried number where the two differ, added to the tape as a free clue.

**Predict** is the gentler setting: the machine names a number, the player
says what will come out, and three right in a row cracks it.

## Eleven levels, numbered and never described

| Level | Rules | How many |
| --- | --- | --- |
| 1 | add 1 to 10 | 10 |
| 2 | take away 1 to 9; small numbers **jam** | 9 |
| 3 | take away 1 to 12; negative numbers, no jams | 12 |
| 4 | times 2 to 10 | 9 |
| 5 | times 2 to 5, then add or take away 1 to 9 | 72 |
| 6 | times itself, then maybe add or take away up to 5 | 11 |
| 7 | all of the above, plus add or take away first, then times | 186 |
| 8 | add or take away 1 to 5, then times itself; or times itself, then times 2 to 5 | 14 |
| 9 | three steps around a square, e.g. add 1, times itself, add 3 | 92 |
| 10 | divide by 2, 3, 4, 5 or 10, alone or with a step before or after; **jams** unless exact | 59 |
| 11 | one rule for even numbers, another for odd ones | 81 |

The game shows only "Level 3": saying what a level holds would give the
answers away. Any level can be picked at any time, and three cracks in a row
move you up one on their own; three dots in the machine's header count the
row. Wrong guesses on the way don't break the row; "Show me the rule" does, and
so does picking a different level. Going below zero jams only in level 2, so
negatives arrive on purpose in level 3; a division that isn't exact jams
everywhere. Division comes before even/odd so that "even" can mean "divides by
2 without jamming". No two machines in levels 8–11 secretly do the same thing.
The player only ever feeds
in 0 and up (20 by default, 100 as a setting); negatives come out, never go in.
A rule doesn't come back until its level has been used up.

## Hints, the wall, the gold gear

Three hints, about how to hunt and never what the rule is: try 0; try two
numbers next to each other; and a third that reads the tape (never the
secret): jams are clues; a zigzag means look at evens and odds apart (and opens
the tape's **Even · odd** view); gaps that grow evenly mean something is times
itself (and open the gaps view). "Show me the rule" takes two taps, wins no card, puts the rule
back in the pool, and starts the in-a-row count again.

Each cracked rule is a blueprint card on the workshop wall, with its fewest
cranks. Crack a rule from just enough numbers that came out (jams are free),
with no wrong guesses, and the card gets a **gold gear**. Just enough is one
more than the rule's degree: two for a straight line, three for a square, and
for an even/odd rule, enough for each half.

## Offline and updates

Nothing is fetched at runtime but the fonts: the machine is inline SVG and the
sounds are made in code. Everything else is precached. Bump `VERSION` in
`sw.js` for any change to a precached file. A new build is picked up silently at
the next machine, where everything is saved.

Progress is saved under `hopper:state:v1` (the key never changes; the blob
inside is version 2 since levels stopped being unlocked), including the round in progress, so
closing the app mid-round comes back to the same machine. A build that meets
data written by a newer one plays read-only rather than saving over it.

## Rebuilding the generated parts

```bash
./scripts/make-icons.py hopper   # the gold gear: 36 PNGs, read back out of sw.js
./scripts/test.sh                # including scripts/test/hopper.mjs
```
