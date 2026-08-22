#!/usr/bin/env python3
"""Publish the committed tree to GitHub, and thus to GitHub Pages.

There is no git transport from the Sprite — the Sprites connector proxies the
GitHub REST API only — so a commit is assembled by hand: a blob per changed
file, one tree, one commit on top of the current remote head, then the ref.
Blobs already present in the remote tree are not re-uploaded, which matters
because a game's splash screens are forty-odd files that never change.

The connector URL is deliberately NOT in this repository: the repository is
public, and the URL is the credential. It lives in

    ~/.config/family-games/gateway.env      (GH_GATEWAY=...)

or in the GH_GATEWAY environment variable.

    ./scripts/deploy.py "commit message"
"""
import base64, json, os, pathlib, subprocess, sys, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

REPO, BRANCH = "marioberges/family-games", "main"

def gateway():
    if os.environ.get("GH_GATEWAY"):
        return os.environ["GH_GATEWAY"].rstrip("/")
    cfg = pathlib.Path.home() / ".config/family-games/gateway.env"
    if cfg.exists():
        for line in cfg.read_text().splitlines():
            if line.startswith("GH_GATEWAY="):
                return line.split("=", 1)[1].strip().rstrip("/")
    sys.exit(f"No connector URL. Set GH_GATEWAY or write it to {cfg}")

G = gateway()

def api(path, payload=None, method=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        f"{G}{path}", data=data, method=method or ("POST" if data else "GET"),
        headers={"Accept": "application/vnd.github+json", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        sys.exit(f"{req.method} {path} -> {e.code}: {e.read().decode()[:400]}")

def git(*args):
    return subprocess.run(("git",) + args, capture_output=True, text=True, check=True).stdout

root = pathlib.Path(git("rev-parse", "--show-toplevel").strip())
os.chdir(root)
if git("status", "--porcelain").strip():
    sys.exit("Working tree is dirty — commit first, so local and remote agree.")

message = sys.argv[1] if len(sys.argv) > 1 else git("log", "-1", "--pretty=%B").strip()
head = api(f"/repos/{REPO}/git/ref/heads/{BRANCH}")["object"]["sha"]
remote = {e["path"]: e["sha"]
          for e in api(f"/repos/{REPO}/git/trees/{head}?recursive=1")["tree"]
          if e["type"] == "blob"}

local = [(m.split()[0], m.split()[1], p)                    # (mode, local sha, path)
         for m, p in (l.split("\t", 1) for l in git("ls-files", "-s").splitlines())]

def upload(item):
    mode, _, path = item
    content = base64.b64encode(pathlib.Path(path).read_bytes()).decode()
    sha = api(f"/repos/{REPO}/git/blobs", {"content": content, "encoding": "base64"})["sha"]
    return {"path": path, "mode": mode, "type": "blob", "sha": sha}

# git's blob sha is content-addressed the same way GitHub's is, so an unchanged
# file can be pointed at its existing sha without uploading anything.
fresh = [i for i in local if remote.get(i[2]) != i[1]]
keep = [{"path": p, "mode": m, "type": "blob", "sha": s}
        for m, s, p in local if remote.get(p) == s]
with ThreadPoolExecutor(max_workers=8) as pool:
    uploaded = list(pool.map(upload, fresh))
print(f"{len(uploaded)} file(s) uploaded, {len(keep)} unchanged")

if not uploaded and sorted(remote) == sorted(p for _, _, p in local):
    print("nothing to deploy")
    sys.exit(0)

tree = api(f"/repos/{REPO}/git/trees", {"tree": keep + uploaded})["sha"]
commit = api(f"/repos/{REPO}/git/commits",
             {"message": message, "tree": tree, "parents": [head]})
api(f"/repos/{REPO}/git/refs/heads/{BRANCH}", {"sha": commit["sha"]}, method="PATCH")
print(f"deployed {commit['sha'][:8]} -> https://marioberges.github.io/family-games/")
