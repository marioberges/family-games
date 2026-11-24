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

import math
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
SEAL = (0xA5, 0x0E, 0x26)    # wax: --red taken a shade deeper, as the wall's seal is
PRESSED = (0xD5, 0x4A, 0x5E) # the same wax where the stamp pressed it — a real
                             # seal is one colour, and a gold star on red reads
                             # as somebody's flag

# A game's mark is the whole idea of the game in the smallest space it fits.
# Lattice draws a `cols` x `rows` grid of dots with the top row picked out in the
# accent, so it reads as "rows of four" rather than as decoration. Agate draws
# the bands of the stone it is named for, which is also the shape of a target,
# a ring of seats, and a ball's stitching seen end on. Oath draws a wax seal
# with a star on it — the same seal a president's portrait gets on the wall
# once all seven of their cards are won. Hopper draws the gold gear a blueprint
# earns when a rule is cracked from just enough clues.
MILK = (0xFF, 0xF8, 0xF9)     # Patch's ground, and its splash background
BLUSH = (0xFB, 0xE4, 0xE9)
RIBBON = (0xE9, 0x8A, 0xA2); RIBBON_HI = (0xF4, 0xB6, 0xC6)
RIBBON_LO = (0xD9, 0x71, 0x8D); KNOT = (0xC9, 0x58, 0x7A)

SPECS = {
    "patch": {
        # Patch draws the bow every finished card is tied with.
        "icon": dict(bg=BLUSH, mark="bow"),
        "splash": dict(bg=MILK, mark="bow"),
    },
    "romp": {
        "icon": dict(bg=INK, body=GOLD, line=INK, eye=GLASS_HI, mark="doodle"),
        "splash": dict(bg=GLASS, body=GOLD, line=INK, eye=(0xFF, 0xFF, 0xFF), mark="doodle"),
    },
    "hopper": {
        "icon": dict(bg=INK, gear=GOLD, ring=INK, hub=GLASS_HI, mark="gear"),
        "splash": dict(bg=GLASS, gear=GOLD, ring=INK, hub=GLASS, mark="gear"),
    },
    "oath": {
        "icon": dict(bg=INK, wax=SEAL, accent=PRESSED, mark="seal"),
        "splash": dict(bg=GLASS, wax=SEAL, accent=PRESSED, mark="seal"),
    },
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
                self._blend(row, x, rgb, hits / n)

    def polygon(self, pts, rgb):
        """Filled polygon, even-odd, supersampled inside its bounding box like
        circle(). Only Oath's star uses it, so it favours plain over fast."""
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        x0, x1 = max(0, int(min(xs)) - 1), min(self.w - 1, int(max(xs)) + 1)
        y0, y1 = max(0, int(min(ys)) - 1), min(self.h - 1, int(max(ys)) + 1)
        edges = list(zip(pts, pts[1:] + pts[:1]))
        step = 1.0 / SS
        half = step / 2.0
        n = SS * SS
        for y in range(y0, y1 + 1):
            row = self.rows[y]
            for x in range(x0, x1 + 1):
                hits = 0
                for sy in range(SS):
                    py = y + half + sy * step
                    for sx in range(SS):
                        px = x + half + sx * step
                        inside = False
                        for (ax, ay), (bx, by) in edges:
                            if (ay > py) != (by > py) and px < (bx - ax) * (py - ay) / (by - ay) + ax:
                                inside = not inside
                        hits += inside
                if hits:
                    self._blend(row, x, rgb, hits / n)

    @staticmethod
    def _blend(row, x, rgb, a):
        i = x * 3
        if a >= 1:
            row[i:i + 3] = bytes(rgb)
        else:
            for k in range(3):
                row[i + k] = int(round(row[i + k] * (1 - a) + rgb[k] * a))


def star(cx, cy, r_out, r_in, points=5):
    """The vertices of a star, first point straight up."""
    out = []
    for i in range(points * 2):
        a = -math.pi / 2 + i * math.pi / points
        r = r_in if i % 2 else r_out
        out.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return out


def draw_seal(cv, cx, cy, box, spec):
    """A wax seal: a disc with a scalloped rim, a thin ring pressed into it, and
    a star in the middle. The scallops are just circles round the edge — the
    disc painted over them is what turns them into a rim."""
    r = box / 2.0
    lobes = 12
    for i in range(lobes):
        a = i / lobes * 2 * math.pi
        cv.circle(cx + 0.76 * r * math.cos(a), cy + 0.76 * r * math.sin(a), 0.26 * r, spec["wax"])
    cv.circle(cx, cy, 0.80 * r, spec["wax"])
    cv.circle(cx, cy, 0.64 * r, spec["accent"])
    cv.circle(cx, cy, 0.585 * r, spec["wax"])
    cv.polygon(star(cx, cy, 0.46 * r, 0.19 * r), spec["accent"])


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


def gear(cx, cy, r, teeth):
    """The outline of a gear: each tooth is four points, two on the root circle
    and two on the tip circle, the same shape the game draws in SVG."""
    ri, pts = r * 0.78, []
    for i in range(teeth):
        a, w = i / teeth * 2 * math.pi - math.pi / 2, math.pi / teeth
        for ang, rad in ((a - w * .55, ri), (a - w * .3, r), (a + w * .3, r), (a + w * .55, ri)):
            pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts


def draw_gear(cv, cx, cy, box, spec):
    """A gold gear with a ring cut round its hub, outlined in ink by painting a
    slightly larger ink gear underneath it."""
    r = box / 2.0
    cv.polygon(gear(cx, cy, r * 1.045, 10), spec["ring"])
    cv.polygon(gear(cx, cy, r, 10), spec["gear"])
    cv.circle(cx, cy, 0.42 * r, spec["ring"])
    cv.circle(cx, cy, 0.35 * r, spec["hub"])
    cv.circle(cx, cy, 0.11 * r, spec["ring"])


def wobble(cx, cy, rx, ry, n=72):
    """A hand-drawn circle: the radius breathes a little as it goes round, the
    way a felt-tip circle never quite closes on itself."""
    pts = []
    for i in range(n):
        a = i / n * 2 * math.pi
        k = 1 + 0.035 * math.sin(3 * a + 0.6) + 0.02 * math.sin(5 * a)
        pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    return pts


def draw_doodle(cv, cx, cy, box, spec):
    """Romp's mark is a doodle come alive: a gold blob with two feet and two
    eyes looking up, outlined in ink as if drawn with a pen."""
    r = box / 2.0
    by = cy - 0.06 * r
    for fx in (-0.34, 0.34):                      # feet, ink then gold
        cv.circle(cx + fx * r, by + 0.80 * r, 0.21 * r, spec["line"])
        cv.circle(cx + fx * r, by + 0.80 * r, 0.15 * r, spec["body"])
    cv.polygon(wobble(cx, by, 0.84 * r, 0.76 * r), spec["line"])
    cv.polygon(wobble(cx, by, 0.76 * r, 0.68 * r), spec["body"])
    for ex in (-0.27, 0.27):
        cv.circle(cx + ex * r, by - 0.12 * r, 0.20 * r, spec["line"])
        cv.circle(cx + ex * r, by - 0.12 * r, 0.155 * r, spec["eye"])
        cv.circle(cx + ex * r + 0.03 * r, by - 0.19 * r, 0.075 * r, spec["line"])


def cubic(p0, p1, p2, p3, n=24):
    """Points along a cubic Bezier, end point included, start point left out."""
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
                    u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]))
    return out


def draw_bow(cv, cx, cy, box, spec):
    """The bow from Patch's index.html (#bow, a 120 x 80 symbol), as polygons."""
    k = box / 120.0
    ox, oy = cx - 60 * k, cy - 42 * k
    P = lambda pts: [(ox + x * k, oy + y * k) for x, y in pts]
    def loop(a, c1, c2, b, c3, c4, e):
        return P([a] + cubic(a, c1, c2, b) + cubic(b, c3, c4, e))
    for sign in (1, -1):
        m = (lambda x: x) if sign == 1 else (lambda x: 120 - x)
        L = lambda pts: [(m(x), y) for x, y in pts]
        cv.polygon(P(L([(55, 42), (36, 76), (46, 72), (52, 78), (60, 44)])), RIBBON_LO)
    for sign in (1, -1):
        m = (lambda x: x) if sign == 1 else (lambda x: 120 - x)
        q = lambda x, y: (m(x), y)
        cv.polygon(loop(q(58, 36), q(40, 10), q(8, 6), q(8, 28), q(8, 46), q(36, 48), q(58, 40)), RIBBON)
        cv.polygon(loop(q(58, 36), q(44, 22), q(20, 18), q(18, 28), q(17, 36), q(36, 40), q(58, 39)), RIBBON_HI)
    cv.polygon(P([(51, 30), (69, 30), (69, 46), (51, 46)]), KNOT)


def draw_mark(cv, cx, cy, box, spec):
    """A cols x rows lattice of dots, centred on (cx, cy) and fitted to `box`
    (the length of the square the mark may occupy)."""
    if spec.get("mark") == "bands":
        return draw_bands(cv, cx, cy, box, spec)
    if spec.get("mark") == "seal":
        return draw_seal(cv, cx, cy, box, spec)
    if spec.get("mark") == "gear":
        return draw_gear(cv, cx, cy, box, spec)
    if spec.get("mark") == "doodle":
        return draw_doodle(cv, cx, cy, box, spec)
    if spec.get("mark") == "bow":
        return draw_bow(cv, cx, cy, box, spec)
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
