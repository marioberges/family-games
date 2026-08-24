#!/usr/bin/env bash
# Extract every inline <script> block from a game's index.html and syntax-check
# it with node. No build step: this is the only thing standing between a typo
# and a blank plate on the iPad.
set -euo pipefail
for f in "$@"; do
  tmp=$(mktemp -d)
  python3 - "$f" "$tmp" <<'PY'
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2])
n = 0
for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', src, re.S):
    n += 1
    (out / f'block{n}.js').write_text(m.group(1))
print(f'{sys.argv[1]}: {n} inline script block(s)')
PY
  for js in "$tmp"/*.js; do node --check "$js" || { echo "SYNTAX FAIL in $f ($js)"; exit 1; }; done
  rm -rf "$tmp"
  echo "  ok"
done
