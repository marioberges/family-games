#!/usr/bin/env bash
# Render the two faces of this repo. Games live in games/ and are never copied
# for the live site — the repo root IS the GitHub Pages site, so a game is served
# straight out of its source directory at /games/<name>/.
#
#   ./index.html           catalog for GitHub Pages   (the installable origin)
#   ./artifacts/           mirror for the Sprite's read-only preview browser
#
# The Sprite mirror has to be a copy: its server refuses symlinks that leave the
# artifacts root, and it renders HTML sandboxed, so the preview cannot install,
# cache offline, or save progress. That is what the .zip button there is for.
set -euo pipefail
cd "$(dirname "$0")/.."
root=$PWD

render() {  # render <out> <base> <cta> <footer> <blocks-to-keep...>
  python3 - "$@" <<'PY'
import re, sys
out, base, cta, footer, *keep = sys.argv[1:]
s = open('templates/catalog.html').read()
for block in ('PREVIEW', 'LIVE', 'ZIP'):
    if block in keep:
        # unwrap: drop a marker that owns its line outright, else just the marker
        s = re.sub(r'(?m)^[ \t]*<!--/?%s-->[ \t]*\n' % block, '', s)
        s = re.sub(r'<!--/?%s-->' % block, '', s)
    else:
        s = re.sub(r'[ \t]*<!--%s-->.*?<!--/%s-->\n?' % (block, block), '', s, flags=re.S)
s = s.replace('{{BASE}}', base).replace('{{CTA}}', cta).replace('{{FOOTER}}', footer)
open(out, 'w').write(s)
PY
}

mkdir -p artifacts
for dir in games/*/; do
  game=$(basename "$dir")
  rm -rf "artifacts/${game:?}"
  cp -r "$dir" "artifacts/$game"
  ( cd games && zip -qr "$root/artifacts/$game/$game-pwa.zip" "$game" )
done

render index.html           'games/'      'Play'         'Built at home. Add to Home Screen in Safari.'         LIVE
render artifacts/index.html '/artifacts/' 'Open preview' 'Source of truth: <code>~/family-games/games/</code>'  PREVIEW ZIP

echo "published $(ls -d games/*/ | wc -l) game(s): ./index.html (Pages) + artifacts/ (Sprite preview)"
