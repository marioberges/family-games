#!/usr/bin/env python3
"""Render a game's icons and iOS launch screens.

Nothing in this repo can rasterize an image — no Pillow, no ImageMagick, no
headless browser — and a game needs 36 PNGs before it can be installed. So this
is a PNG encoder and a small rasterizer built out of `zlib` and `struct`, which
means it runs on a bare Sprite with no network and no install step, the same
property that makes scripts/build-map.py worth trusting.

    ./scripts/make-icons.py lattice

The file list is not written down here: it is read back out of the game's own
sw.js, and the script fails if the precache list names a file it did not
produce. That check is the real reason this exists rather than hand-made art —
it makes "sw.js and icons/ agree" mechanically true, which is the drift CLAUDE.md
warns about.

Output is deterministic: same input, byte-identical PNGs, no timestamp chunk.

Hoist's art is NOT regenerated here. Its 36 PNGs were made outside this repo and
committed as binaries; a different rasterizer cannot reproduce them byte for
byte, and rewriting them would churn the file for no gain. New games use this.
"""

import os
import re
import struct
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- the marks

INK = (0x0B, 0x1E, 0x2D)     # --ink    house dark
GLASS = (0xD6, 0xDF, 0xDB)   # --glass  house ground, and the splash background
GLASS_HI = (0xE7, 0xEC, 0xE8)
GOLD = (0xFF, 0xB6, 0x12)    # --gold

# A game's mark is the whole idea of the game in the smallest space it fits.
# Lattice draws a `cols` x `rows` grid of dots with the top row picked out in the
# accent, so it reads as "rows of four" rather than as decoration. Agate draws
# the bands of the stone it is named for, which is also the shape of a target,
# a ring of seats, and a ball's stitching seen end on.
SPECS = {
    "agate": {
        "icon": dict(bg=INK, band=GLASS_HI, accent=GOLD, mark="bands"),
        "splash": dict(bg=GLASS, band=INK, accent=GOLD, mark="bands"),
    },
    "lattice": {
        # on the home screen the icon has to hold its own against everything
        # else, so it is the dark field with light dots
        "icon": dict(bg=INK, dot=GLASS_HI, accent=GOLD, cols=4, rows=3),
        # the launch screen has to match manifest background_color exactly or
        # there is a visible seam at every cold start
        "splash": dict(bg=GLASS, dot=INK, accent=GOLD, cols=4, rows=3),
    },
}

# ---------------------------------------------------------------- png writer


def png(path, w, h, rows):
    """Write 8-bit truecolour PNG. `rows` is a list of bytearray, RGB, len 3*w."""
    raw = bytearray()
    for r in rows:
        raw.append(0)          # filter type 0 (None) — flat art compresses fine
        raw += r

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    out = b"\x89PNG\r\n\x1a\n"
    out += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    out += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    out += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(out)


# ---------------------------------------------------------------- rasterizer

SS = 4          # supersampling factor per axis, for antialiased edges


class Canvas:
    def __init__(self, w, h, bg):
        self.w, self.h = w, h
        row = bytes(bg) * w
        self.rows = [bytearray(row) for _ in range(h)]

    def circle(self, cx, cy, r, rgb):
        """Filled circle, supersampled only inside its bounding box — cost
        follows the ink, not the area of the canvas."""
        if r <= 0:
            return
        x0, x1 = max(0, int(cx - r) - 1), min(self.w - 1, int(cx + r) + 1)
        y0, y1 = max(0, int(cy - r) - 1), min(self.h - 1, int(cy + r) + 1)
        rr = r * r
        step = 1.0 / SS
        half = step / 2.0
        n = SS * SS
        for y in range(y0, y1 + 1):
            row = self.rows[y]
            for x in range(x0, x1 + 1):
                hits = 0
                for sy in range(SS):
                    dy = y + half + sy * step - cy
                    dy2 = dy * dy
                    if dy2 > rr:
                        continue
                    for sx in range(SS):
                        dx = x + half + sx * step - cx
                        if dx * dx + dy2 <= rr:
                            hits += 1
                if not hits:
                    continue
                i = x * 3
                if hits == n:
                    row[i:i + 3] = bytes(rgb)
                else:
                    a = hits / n
                    for k in range(3):
                        row[i + k] = int(round(row[i + k] * (1 - a) + rgb[k] * a))


def draw_bands(cv, cx, cy, box, spec):
    """Concentric bands, painted outside in — each circle covers the middle of
    the one before it, so the rings are what is left over. Cheap, and it means
    the edge of every band is antialiased by the same code path."""
    r = box / 2.0
    rings = [
        (1.00, spec["band"]),
        (0.80, spec["bg"]),
        (0.63, spec["band"]),
        (0.44, spec["bg"]),
        (0.26, spec["accent"]),
    ]
    for frac, rgb in rings:
        cv.circle(cx, cy, r * frac, rgb)


def draw_mark(cv, cx, cy, box, spec):
    """A cols x rows lattice of dots, centred on (cx, cy) and fitted to `box`
    (the length of the square the mark may occupy)."""
    if spec.get("mark") == "bands":
        return draw_bands(cv, cx, cy, box, spec)
    cols, rows = spec["cols"], spec["rows"]
    pitch = box / max(cols, rows)          # square cells, so dots stay circular
    r = pitch * 0.32
    w, h = pitch * cols, pitch * rows
    left, top = cx - w / 2 + pitch / 2, cy - h / 2 + pitch / 2
    for j in range(rows):
        for i in range(cols):
            rgb = spec["accent"] if j == 0 else spec["dot"]
            cv.circle(left + i * pitch, top + j * pitch, r, rgb)


def render_icon(size, spec, inset=1.0):
    cv = Canvas(size, size, spec["bg"])
    draw_mark(cv, size / 2, size / 2, size * 0.62 * inset, spec)
    return cv


def render_splash(w, h, spec):
    cv = Canvas(w, h, spec["bg"])
    short = min(w, h)
    draw_mark(cv, w / 2, h / 2, short * 0.30, spec)
    return cv


# ---------------------------------------------------------------- sw.js is the spec


def wanted_files(game):
    """Read the precache list out of the game's own service worker, so this
    script and sw.js cannot drift apart."""
    sw = open(os.path.join(ROOT, "games", game, "sw.js")).read()
    splash = re.findall(r'"(icons/splash/[^"]+\.png)"', sw)
    icons = re.findall(r'"\./(icons/[^"/]+\.png)"', sw)
    if not splash or not icons:
        sys.exit(f"could not find a precache list in games/{game}/sw.js")
    return icons, splash


def splash_pixels(name):
    """`1024x1366@2x.png` is a 1024x1366 point screen at DPR 2 — so 2048x2732."""
    m = re.match(r"(\d+)x(\d+)@(\d+)x\.png$", os.path.basename(name))
    if not m:
        sys.exit(f"cannot read a size out of {name}")
    w, h, s = (int(g) for g in m.groups())
    return w * s, h * s


ICON_SIZES = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "icon-maskable-512.png": 512,
    "apple-touch-icon.png": 180,
    "apple-touch-icon-120.png": 120,
    "apple-touch-icon-152.png": 152,
    "apple-touch-icon-167.png": 167,
    "apple-touch-icon-180.png": 180,
}


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in SPECS:
        sys.exit(f"usage: {sys.argv[0]} <{'|'.join(SPECS)}>")
    game = sys.argv[1]
    spec = SPECS[game]
    icons, splash = wanted_files(game)

    base = os.path.join(ROOT, "games", game)
    os.makedirs(os.path.join(base, "icons", "splash"), exist_ok=True)

    made = set()
    for rel in icons:
        name = os.path.basename(rel)
        if name not in ICON_SIZES:
            sys.exit(f"sw.js precaches {rel}, which this script does not know how to draw")
        size = ICON_SIZES[name]
        # a maskable icon is cropped to a circle by the platform, so the mark has
        # to sit inside the 80% safe zone
        inset = 0.8 if "maskable" in name else 1.0
        cv = render_icon(size, spec["icon"], inset)
        png(os.path.join(base, rel), size, size, cv.rows)
        made.add(rel)
        print(f"  {rel}  {size}x{size}")

    for rel in splash:
        w, h = splash_pixels(rel)
        cv = render_splash(w, h, spec["splash"])
        png(os.path.join(base, rel), w, h, cv.rows)
        made.add(rel)
        print(f"  {rel}  {w}x{h}")

    # The check this script exists for: everything sw.js promises to precache is
    # something that now exists on disk.
    missing = [f for f in icons + splash if not os.path.exists(os.path.join(base, f))]
    if missing:
        sys.exit("sw.js precaches files that were not produced: " + ", ".join(missing))
    print(f"\n{len(made)} files written to games/{game}/icons/")


if __name__ == "__main__":
    main()
