# family-games

Offline-first web games for the family, built to be installed on an iPad from
the home screen. Every game is a static PWA — no build step, no dependencies, no
server code.

## Layout

```
games/<name>/        one game, self-contained and served as-is
index.html           catalog, generated — do not hand-edit
templates/catalog.html   the catalog source, with per-target blocks
scripts/publish.sh   renders the catalog and the Sprite mirror
artifacts/           generated mirror for the Sprite preview (gitignored)
```

The repository root **is** the GitHub Pages site, so `games/hoist/` is served at
`/games/hoist/` with no copying and nothing to keep in sync.

## Working on a game

Edit files under `games/<name>/` directly, then:

```bash
./scripts/publish.sh     # refresh the Sprite preview + catalog
git commit -am "..."     # push to publish to Pages
```

Bump `VERSION` in a game's `sw.js` whenever its `index.html` changes, or
installed copies will keep serving the cached old shell.

## Two places a game runs, and why they differ

| | GitHub Pages | Sprite `artifacts/` |
|---|---|---|
| Install to home screen | yes | no |
| Service worker / offline | yes | no |
| Saved progress | yes | no |
| Purpose | the real thing | quick look from a phone |

The Sprite serves artifacts under a CSP `sandbox` without `allow-same-origin`,
which puts the page in an opaque origin: no service worker, no `localStorage`,
no install prompt, and `connect-src 'none'`. That is a deliberate security
boundary, not a misconfiguration — it keeps artifact JavaScript away from the
Sprite's own control endpoints. Treat the preview as a look, never as a test of
offline behaviour.
