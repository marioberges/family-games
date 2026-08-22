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
scripts/deploy.py        fallback deploy over the REST API — see below
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
- **Bump `VERSION` in `sw.js` whenever `index.html` changes.** Installed copies
  serve the cached shell first; without the bump the family keeps playing the old
  game and nobody knows why. Check before deploying:
  `git diff --stat HEAD~1 -- games/<name>/` — if `index.html` moved and `sw.js`
  didn't, stop.
- **Namespace `localStorage` per game.** All games share the origin
  `marioberges.github.io` (a public suffix, so the origin spans every repo of
  yours on that host). Hoist uses `hoist:deck:v1`. A bare `state` key would
  collide.
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

## Adding a game

1. `games/<name>/` with `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`.
2. Add a card to `templates/catalog.html` — copy Hoist's block, change the
   `{{BASE}}<name>/` hrefs and the blurb.
3. `./scripts/publish.sh && git add -A && git commit && ./scripts/deploy.py`
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
  connector URL, read by `deploy.py` as `GH_GATEWAY`. **The URL is the
  credential.** Its OAuth scopes are `repo, read:org`, but the connector's
  access policy pins it to repositories named `family-*`, so the blast radius
  is this repo and future siblings — not the whole account. Used for the
  fallback deploy and for repo administration (enabling Pages, managing keys).

Before any deploy that touches new files:

```bash
grep -rl "$(sed -n 's/.*gateway\/github\///p' ~/.config/family-games/gateway.env)" $(git ls-files) artifacts/
```

## Deploying, and why `deploy.py` still exists

`git push` is the deploy. GitHub Pages rebuilds from `main` at the repo root,
so there is nothing else to trigger.

That works because git's transport is reachable from the Sprite even though the
connector cannot carry it. Worth knowing, because it is not obvious:

- The gateway fronts **`api.github.com` only**. Git's smart-HTTP endpoints live
  on `github.com`. Send a `receive-pack` path through the gateway and you get
  GitHub's own 404 — the request arrived, at a host with no git endpoints.
- But `github.com:22` and `ssh.github.com:443` are both reachable from here, and
  `git fetch`/`clone`/`ls-remote` over HTTPS work unauthenticated because the
  repository is public. Only push ever needed a credential, which the deploy key
  now supplies.

`scripts/deploy.py` is kept as the fallback for a Sprite without SSH egress, or
a lost key. It assembles a commit out of blobs, a tree, and a ref through the
connector's REST API; it is incremental (unchanged files are matched by blob
sha and never re-sent) and it refuses to run on a dirty tree. It cannot rebase,
force-push, or merge — if it is ever the only path again, treat the remote as
append-only.

**Never interleave the two.** `deploy.py` builds its commit server-side, so the
local repository never learns that commit's sha; push afterwards and git sees
two unrelated histories with identical content. That is exactly what the
switchover hit — three REST-built commits, same trees, different shas. The fix
is not a force-push: `git fetch` and then

```bash
git rebase --empty=drop origin/main
```

replays local work onto the real remote history and drops the duplicates, after
which an ordinary `git push` fast-forwards.
