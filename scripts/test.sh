#!/usr/bin/env bash
# Run every game's test suite.
#
# The games themselves have no dependencies and never will — this is the rig
# only, and it lives OUTSIDE the tree on purpose so that `npm` never gets a
# reason to write into a directory GitHub Pages serves. First run installs jsdom
# into ~/.local/gametest; after that it is offline like everything else.
#
# What this can and cannot tell you: it executes the real index.html, so it
# catches dead references, broken state transitions and markup that never
# renders. It does NOT lay anything out, so it says nothing about how the game
# LOOKS, and nothing at all about the service worker, install or offline. Those
# are still only true on the iPad, against the Pages URL.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
rig=${GAMETEST_DIR:-$HOME/.local/gametest}

if [ ! -d "$rig/node_modules/jsdom" ]; then
  echo "installing the test rig into $rig (once)…"
  mkdir -p "$rig"
  ( cd "$rig" && npm init -y >/dev/null 2>&1 && npm i jsdom --no-audit --no-fund >/dev/null )
fi

"$here/check-js.sh" "$here"/../games/*/index.html

ln -sfn "$rig/node_modules" "$here/test/node_modules"
trap 'rm -f "$here/test/node_modules"' EXIT

rc=0
for t in "$here"/test/*.mjs; do
  case "$(basename "$t")" in harness.mjs) continue;; esac
  node "$t" || rc=1
done
exit $rc
