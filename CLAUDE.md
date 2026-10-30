# family-games — working notes

Offline-first web games for the family, installed on an iPad from the home
screen. Every game is a static PWA: no build step, no dependencies, no server
code. A game is a directory of files that a browser can open, and that property
is worth protecting — it is why these are still going to work in five years.

Live site: <https://marioberges.github.io/family-games/>

## The loop

```bash
$EDITOR games/<name>/index.html   # edit the game in place
./scripts/publish.sh              # re-render both catalogs + the Sprite mirror
git commit -am "..."              # history lives in the local repo
git push                          # Pages rebuilds in ~30 s
```

`publish.sh` is safe to run any time; it regenerates `index.html` and
`artifacts/` from `games/` and `templates/catalog.html`. `git push` is a real push, over SSH, using a
deploy key scoped to this repository — see Credentials.

## Layout

```
games/<name>/            one game, self-contained, served as-is
index.html               catalog for Pages — GENERATED, do not hand-edit
templates/catalog.html   the catalog source; per-target blocks below
scripts/publish.sh       renders both catalogs + the Sprite mirror
artifacts/               Sprite preview mirror — GENERATED, gitignored
```

The repository root **is** the Pages site. `games/hoist/` is served at
`/games/hoist/` straight out of its source directory: nothing is copied, so
nothing can drift. Do not introduce a `docs/` or `dist/` copy.

`templates/catalog.html` carries three conditional blocks — `<!--LIVE-->`,
`<!--PREVIEW-->`, `<!--ZIP-->` — plus `{{BASE}}`, `{{CTA}}`, `{{FOOTER}}`.
`publish.sh` keeps `LIVE` for Pages and `PREVIEW ZIP` for the Sprite.

## Two places a game runs, and only one of them is real

| | GitHub Pages | Sprite `artifacts/` |
|---|---|---|
| Install to home screen | yes | no |
| Service worker / offline | yes | no |
| `localStorage` | yes | no |
| `fetch()` | yes | no (`connect-src 'none'`) |
| Purpose | the real thing | a look from a phone |

The Sprite serves HTML artifacts under `Content-Security-Policy: sandbox
allow-scripts allow-popups` **without** `allow-same-origin` (verify with
`curl -sD- http://localhost:8080/artifacts/<game>/ -o /dev/null`). That puts the
page in an opaque origin, which costs it exactly the three things a PWA is made
of. It is a deliberate security boundary — it keeps artifact JavaScript away
from the Sprite's own `/restart` and `/sleep` endpoints — so do not try to
work around it, and never propose relaxing that CSP.

**Never treat the preview as a test.** Offline behaviour, install, and saved
progress can only be judged on the device, against the Pages URL.

## Conventions that bite

- **Everything relative.** `start_url`, `scope`, and `id` in the manifest are
  `"./"`; icons, splash screens, and the service worker's precache list are all
  relative paths. This is what lets a game live in a subdirectory of a shared
  origin. A single leading `/` breaks it, silently, only once deployed.
- **Bump `VERSION` in `sw.js` whenever anything precached changes.** It names the
  shell cache, so bumping it is what forces a fresh precache of the icons, the
  splash screens and the manifest — the assets nothing else will ever refresh.
  Check before deploying: `git diff --stat HEAD~1 -- games/<name>/` — if the
  precached set moved and `sw.js` didn't, stop.
- **Getting a new build onto an installed iPad is its own problem.** The shell is
  served cache-first, so new HTML would surface only on the *second* cold launch
  — and iOS freezes a home-screen app rather than cold-launching it, so that
  second launch can be weeks away, invisibly. Hoist's answer, worth copying:
  register the worker with `updateViaCache:"none"`, call `registration.update()`
  on `visibilitychange`/`pageshow` (throttled), and when a new worker reaches
  `installed` while one is already in control, reload at the **next question
  boundary** — a point where state is saved and nothing is on screen to lose.
  Silent, no dialog: a kid will dismiss a banner without reading it.
- **Namespace `localStorage` per game.** All games share the origin
  `marioberges.github.io` (a public suffix, so the origin spans every repo of
  yours on that host). Hoist uses `hoist:deck:v1`. A bare `state` key would
  collide.
- **Version the saved blob from the start, and keep the key stable.** Put a `v`
  inside the JSON, migrate oldest-first on read, and stamp it on write. The key
  itself never changes — a new key silently abandons the old progress. The case
  that makes this worth doing is two iPads updating at different times: a build
  that meets data newer than it understands must go read-only rather than save
  over fields it has never heard of. Hoist does this in `load()`.
- **Guard storage and service-worker calls in `try`/`catch`.** Not defensive
  padding: it is what lets the sandboxed preview degrade to a playable demo
  instead of a blank screen.
- **Version cache names by purpose, not uniformly.** Hoist versions its shell
  cache and deliberately leaves the flag-art cache unversioned, so an app update
  doesn't force a 14 MB re-download over the family's data plan.
- **iPad first, phone second.** Rotation unlocked; art resolution chosen from
  device pixels; splash screens for every size that matters, or iOS flashes
  white on every cold start. iPadOS reports itself as a Mac in the user agent —
  detect touch points, never the UA string.
- **Keep third-party assets to a minimum**, and cache what you use at runtime so
  the first offline launch isn't a surprise.

## Testing

```bash
./scripts/test.sh           # every game: syntax check, then the real thing in jsdom
```

First run installs `jsdom` into `~/.local/gametest` — **outside the tree**, so
that `npm` never gets a reason to write into a directory Pages serves, and so a
game keeps its "a browser can just open this" property. Suites live in
`scripts/test/`, one per game.

The rig boots the actual `index.html` and drives it: it catches dead references,
broken state transitions, settings that do not survive a repaint, and markup
that never renders. It also checks each game's own invariants — for Agate, that
all 78 cards multiply out to the fact they are attached to and that no question
contains its own answer; for Oath, that the 45 people cover numbers 1–47 exactly,
that no clue names its own president, and that every birth state is a region on
the map.

`./scripts/build-map.py` takes a target — `hoist` (the default, the world) or
`oath` (the fifty states). Both read their deck back out of the game's
`index.html`, so run it again after changing countries or birthplaces.

To reach a game's internals the rig injects one probe line after `"use strict";`.
It has to go *inside* the IIFE: everything is function-scoped, so nothing is on
`window` and a probe appended after the closing `})();` sees an empty room.

**It is not a substitute for the iPad.** Nothing is laid out, so it says nothing
about how a game looks, and there is no service worker, install or offline. Those
are still only true on the device, against the Pages URL.

## Adding a game

1. `games/<name>/` with `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`.
2. Add a card to `templates/catalog.html` — copy Hoist's block, change the
   `{{BASE}}<name>/` hrefs and the blurb.
3. `./scripts/publish.sh && git add -A && git commit && git push`
4. Test the install on the actual iPad before telling anyone it works.

Prefer one self-contained `index.html` per game with inline CSS and JS, as Hoist
does. It keeps a game readable in one pass and removes a whole class of
path bugs.

## Sprite rules

- **Never take port 8080.** The `waker` service holds it and is what makes the
  Sprite reachable at all, Remote Control included. To show something, write it
  into `artifacts/` — do not start a web server.
- **`artifacts/` is readable by every member of the org**, and the URL can be
  made public in one command. Never put a credential there. It is generated
  output, so treat anything you place by hand as temporary.
- **Checkpoint after anything that works**, before anything risky:
  `sprite-env checkpoints create --comment "..."`.

## Credentials

Two, both outside the tree, both narrower than they look. Neither may ever be
committed or written into `artifacts/`; both persist in Sprite checkpoints.

- **`~/.ssh/family-games-deploy`** (mode 600) — an ed25519 **deploy key** with
  write access to this repository and nothing else. No API access, no other
  repo. This is what `git push` uses; `git config core.sshCommand` pins it to
  this repository so it cannot leak into another. Revoke by deleting key
  `160990795` through the connector, and nothing else is affected.
- **`~/.config/family-games/gateway.env`** (mode 600) — the Sprites GitHub
  connector URL, exported as `GH_GATEWAY`. **The URL is the credential.** Its
  OAuth scopes are `repo, read:org`, but the connector's access policy pins it
  to repositories named `family-*`, so the blast radius is this repo and future
  siblings — not the whole account. Nothing routine uses it: it is for repo
  administration — enabling Pages, and minting the deploy key below.

Before any deploy that touches new files:

```bash
grep -rl "$(sed -n 's/.*gateway\/github\///p' ~/.config/family-games/gateway.env)" $(git ls-files) artifacts/
```

## Deploying

`git push` is the deploy. GitHub Pages rebuilds from `main` at the repo root,
so there is nothing else to trigger and no deploy script to run. There was one
once — it assembled commits out of blobs and trees through the connector's REST
API, because that looked like the only door open. It was removed: it could not
rebase or merge, it wrote commits the local repository never learned about, and
a machine that can only append to a branch is a machine that will eventually
clobber something.

Why the connector cannot carry a push, so nobody rebuilds that road:

- The gateway fronts **`api.github.com` only**. Git's smart-HTTP endpoints live
  on `github.com`. Send a `receive-pack` path through the gateway and GitHub's
  own 404 comes back — the request arrived, at a host with no git endpoints.
- Git's transport was never the obstacle. `github.com:22` and
  `ssh.github.com:443` are reachable from the Sprite, and `git fetch` / `clone`
  / `ls-remote` over HTTPS work unauthenticated because the repository is
  public. Only push ever needed a credential.

### Restoring push access

A fresh or restored Sprite has no key. Mint a new one — the connector exists for
exactly this, and it is the only routine use it has:

```bash
ssh-keygen -t ed25519 -N '' -C 'family-games deploy key (sprite)' \
  -f ~/.ssh/family-games-deploy
G=$(sed -n 's/^GH_GATEWAY=//p' ~/.config/family-games/gateway.env)
python3 - "$G" <<'EOF'
import json, pathlib, sys, urllib.request
pub = (pathlib.Path.home() / '.ssh/family-games-deploy.pub').read_text().strip()
req = urllib.request.Request(
    sys.argv[1].rstrip('/') + '/repos/marioberges/family-games/keys',
    data=json.dumps({'title': 'sprite:family-games (push)',
                     'key': pub, 'read_only': False}).encode(), method='POST',
    headers={'Accept': 'application/vnd.github+json',
             'Content-Type': 'application/json'})
print(json.load(urllib.request.urlopen(req, timeout=30))['id'])
EOF
git config core.sshCommand "ssh -i /home/sprite/.ssh/family-games-deploy -o IdentitiesOnly=yes"
git remote set-url origin git@github.com:marioberges/family-games.git
ssh -i ~/.ssh/family-games-deploy -o IdentitiesOnly=yes -T git@github.com   # expect: Hi marioberges/family-games!
```

Revoke the old key at the same time — `DELETE /repos/marioberges/family-games/keys/<id>`
through the connector returns 204, and a key you cannot account for should not
keep write access. List them with `GET .../keys`.
