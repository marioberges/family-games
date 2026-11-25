# Lark — hum it back (PWA)

A static, installable web app. No build step, no dependencies, no server code.

```
index.html               the whole app: pitch detector, note splitter, matcher, UI
sw.js                    service worker (offline)
manifest.webmanifest     install metadata
icons/                   192, 512, maskable, apple-touch, 28 launch screens
```

## What it is for

The game will play a short tune; the player memorizes it and hums or whistles
it back, in any key. Later the same tunes carry notation and theory: the dots
the game draws for a tune are a staff from day one, and get lines and names
when the player is ready.

**This first build is the mic check**, not the game. It answers one question on
the real iPad: can a home-screen web app hear a child hum well enough to tell
which notes they meant? It shows:

- the note being heard right now, how loud and how clear it is, and a scrolling
  pitch trace;
- **Hum anything**: the notes the splitter found in a take;
- **Try a tune**: five public-domain children's tunes (See-saw, Rain rain, Hot
  cross buns, Mary had a little lamb, Twinkle). Lark plays one, then listens,
  and scores the hum note by note, in whatever key it was hummed;
- **Tuning knobs** for the splitter and the scoring, saved on the device;
- **This iPad**: whether it is running as a home-screen app, whether the
  audio-session control exists, whether the mic's voice processing really
  turned off, and how fast pitch detection runs. **Copy the last take** copies
  the pitch numbers of the last take (no sound) to paste into a chat.

Nothing is recorded or sent. Sound is turned into numbers frame by frame and
dropped.

## How it hears

1. **Pitch per frame.** The McLeod Pitch Method (McLeod and Wyvill, 2005), the
   method the MIT-licensed `pitchy` library uses, written out inline. 2048
   samples per frame, one frame per screen refresh, 65 Hz (a low adult hum) to
   2600 Hz (a high whistle). It also gives a 0–1 "clarity": high for a steady
   hum, low for breath and noise.
2. **Notes from the pitch track.** A note is a run of clear, loud-enough frames
   that stays within 70 cents of its own middle. A run also ends at silence or
   at a volume dip (a new "mm"), which is the only way two notes of the same
   pitch can be told apart. Runs shorter than 110 ms are slides between notes
   and are dropped. Octave slips are corrected; a note that drifts is kept
   whole. Defaults follow Essentia's PitchContourSegmentation (60 cents,
   0.1 s), loosened for children. Essentia itself is AGPL and a large WASM, so
   only its parameters are borrowed.
3. **Comparing with the tune.** By shape, never by key: every way of lining up
   a sung note with a tune note suggests a key shift; for each, the notes are
   aligned allowing a missed or an extra note (edit distance, as query-by-humming
   systems do), and the cheapest alignment wins. Then each tune note is right
   (within 60 cents), close (within 120), off, or missed, and each step between
   notes is checked too.

## iPad details it handles

- The mic is asked for on a tap, with echo cancellation, noise suppression and
  auto gain all off (they are tuned for calls and flatten sung notes).
- `navigator.audioSession.type` is set to `play-and-record` before capture and
  back to `playback` after, or playback stays at call volume.
- The page never changes its URL or hash while listening: in home-screen mode
  WebKit asks for the mic again on every navigation.
- The mic is let go when the app goes to the background (iPadOS mutes it
  anyway) and turned back on with a tap.
- A new build switches in only when nothing is playing or listening.

## Saved data

`lark:prefs:v1` holds `{v:1, knobs, closeMic, tune}`. Newer data than the build
understands is read, never written over.

## What comes next

The game itself, once the mic check is proven on the iPad: tunes to memorize
(Kodály order: sol–mi, then la, then do–re–mi, pentatonic), a songbook of tunes
won, spaced repetition, and **pass the iPad**: players take turns humming the
same tune and the scores are shown together at the end.
