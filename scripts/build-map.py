#!/usr/bin/env python3
"""Generate Hoist's inline world map from Natural Earth, and splice it into
games/hoist/index.html between the GENERATED markers.

    ./scripts/build-map.py

Why the map is generated rather than pasted: the geometry, the sub-region
table, the framing boxes and the marker list all have to agree with the game's
197-country deck, and the only way to keep them agreeing is to derive them from
one source in one pass. Re-running is idempotent.

SOURCE — world-atlas@2 countries-110m (ISC packaging over public-domain Natural
Earth). It is *topologically* simplified, so neighbouring countries share arcs
and their borders stay welded. Simplifying separate polygons instead pulls
shared borders apart and leaves slivers of background between neighbours.

WHY 110m AND NOT 50m: 50m is 472 KB before simplification, and simplifying it
enough to fit deletes exactly the microstates it would have been fetched for.
Measured, the two give identical tappability at every size threshold — 50m adds
the 29 missing microstates only as sub-pixel specks. Markers solve that problem;
resolution does not.

Cached under scripts/.mapcache/ (gitignored) so a rebuild needs no network.
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "scripts", ".mapcache")
TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
TARGET = os.path.join(ROOT, "games", "hoist", "index.html")

# Equirectangular into a 2000-wide space; y follows the same scale so the whole
# globe is 2000x1000 and one degree is 5.5556 units on both axes.
W = 2000.0
DEG = W / 360.0
PREC = 1          # 0.1 unit. At 1.0 the error becomes ~24 visible px once a
                  # sub-region view is zoomed in, which reads as jaggedness.

# ISO 3166-1 numeric-3 -> alpha-2, derived once from Natural Earth's ISO_N3_EH /
# ISO_A2_EH pairing (the _EH variants; plain ISO_A2 is -99 for France and Norway
# among others). Inlined so a rebuild needs only the 108 KB topology.
N3 = {
    4:"af",8:"al",10:"aq",12:"dz",24:"ao",31:"az",32:"ar",36:"au",40:"at",
    44:"bs",50:"bd",51:"am",56:"be",64:"bt",68:"bo",70:"ba",72:"bw",76:"br",
    84:"bz",90:"sb",96:"bn",100:"bg",104:"mm",108:"bi",112:"by",116:"kh",
    120:"cm",124:"ca",140:"cf",144:"lk",148:"td",152:"cl",156:"cn",158:"tw",
    170:"co",178:"cg",180:"cd",188:"cr",191:"hr",192:"cu",196:"cy",203:"cz",
    204:"bj",208:"dk",214:"do",218:"ec",222:"sv",226:"gq",231:"et",232:"er",
    233:"ee",238:"fk",242:"fj",246:"fi",250:"fr",260:"tf",262:"dj",266:"ga",
    268:"ge",270:"gm",275:"ps",276:"de",288:"gh",300:"gr",304:"gl",320:"gt",
    324:"gn",328:"gy",332:"ht",340:"hn",348:"hu",352:"is",356:"in",360:"id",
    364:"ir",368:"iq",372:"ie",376:"il",380:"it",384:"ci",388:"jm",392:"jp",
    398:"kz",400:"jo",404:"ke",408:"kp",410:"kr",414:"kw",417:"kg",418:"la",
    422:"lb",426:"ls",428:"lv",430:"lr",434:"ly",440:"lt",442:"lu",450:"mg",
    454:"mw",458:"my",466:"ml",478:"mr",484:"mx",496:"mn",498:"md",499:"me",
    504:"ma",508:"mz",512:"om",516:"na",524:"np",528:"nl",540:"nc",548:"vu",
    554:"nz",558:"ni",562:"ne",566:"ng",578:"no",586:"pk",591:"pa",598:"pg",
    600:"py",604:"pe",608:"ph",616:"pl",620:"pt",624:"gw",626:"tl",630:"pr",
    634:"qa",642:"ro",643:"ru",646:"rw",682:"sa",686:"sn",688:"rs",694:"sl",
    703:"sk",704:"vn",705:"si",706:"so",710:"za",716:"zw",724:"es",728:"ss",
    729:"sd",732:"eh",740:"sr",748:"sz",752:"se",756:"ch",760:"sy",762:"tj",
    764:"th",768:"tg",780:"tt",784:"ae",788:"tn",792:"tr",795:"tm",800:"ug",
    804:"ua",807:"mk",818:"eg",826:"gb",834:"tz",840:"us",854:"bf",858:"uy",
    860:"uz",862:"ve",887:"ye",894:"zm"
}

# Geometry present in the atlas but not in the deck: drawn, never answerable.
INERT = {"eh", "fk", "gl", "nc", "pr"}
# Dropped outright — inert AND outside the framed latitudes, so pure weight.
DROP = {"aq", "tf"}
# Separate adjacent polygons in Natural Earth, not holes. Left out they punch
# visible bites in their neighbours, so they are welded on by name.
MERGE = {"Somaliland": "so", "N. Cyprus": "cy"}
# The one deck country the atlas carries with no ISO id at all.
BY_NAME = {"Kosovo": "xk"}


def source():
    """The topology, from cache if we have it, else fetched once."""
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, "countries-110m.json")
    if not os.path.exists(path):
        sys.stderr.write("fetching %s\n" % TOPO_URL)
        with urllib.request.urlopen(TOPO_URL, timeout=60) as r:
            open(path, "wb").write(r.read())
    return json.load(open(path))


def decode(topo):
    """TopoJSON -> {alpha2: (path_d, largest_polygon_bbox)}.

    Arcs are delta-encoded and shared between neighbours; a negative index means
    traverse that arc backwards. Quantised coordinates are undone by the
    transform. This is the whole of TopoJSON, and it is why no runtime library
    is needed.
    """
    sc, tr = topo["transform"]["scale"], topo["transform"]["translate"]
    arcs = []
    for a in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in a:
            x += dx; y += dy
            pts.append(((x * sc[0] + tr[0] + 180) * DEG, (90 - (y * sc[1] + tr[1])) * DEG))
        arcs.append(pts)

    def ring(idxs):
        pts = []
        for i in idxs:
            a = arcs[~i][::-1] if i < 0 else arcs[i]
            pts += a[1:] if pts else a
        return pts

    out = {}
    for g in topo["objects"]["countries"]["geometries"]:
        name = g["properties"]["name"]
        code = BY_NAME.get(name) or MERGE.get(name)
        if not code:
            gid = g.get("id")
            code = N3.get(int(gid)) if gid is not None else None
        if not code or code in DROP:
            continue
        polys = [g["arcs"]] if g["type"] == "Polygon" else g["arcs"]
        # Longitudes are unwrapped against the country's own label point, so a
        # country that straddles the antimeridian (Russia, Fiji, Kiribati) gets
        # its true extent instead of a box the full width of the world.
        anchor = (PTS[code][0] + 180) * DEG if code in PTS else W / 2
        d, best, best_area = "", None, -1.0
        for poly in polys:
            for r in poly:
                pts = ring(r)
                if len(pts) < 4:
                    continue
                pts = unwrap(pts, pts[0][0])
                area = abs(sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
                               for i in range(len(pts) - 1))) / 2
                xs = [p[0] for p in pts]
                # A ring unwrapped past either edge is drawn again one world
                # over, so a seam-crossing country appears whole on both sides
                # instead of as a streak across the map.
                shifts = [0.0]
                if max(xs) > W:
                    shifts.append(-W)
                if min(xs) < 0:
                    shifts.append(W)
                for dx in shifts:
                    seg, prev = [], None
                    for x, y in pts:
                        k = (round(x + dx, PREC), round(y, PREC))
                        if k == prev:
                            continue
                        seg.append(("M" if not seg else "L") + fmt(k[0]) + " " + fmt(k[1]))
                        prev = k
                    if len(seg) >= 4:
                        d += "".join(seg) + "Z"
                if area > best_area:          # framing follows the main landmass,
                    best_area = area          # so Alaska does not drag the USA's
                    a = unwrap(pts, anchor)   # box across the Pacific
                    axs = [p[0] for p in a]
                    ays = [p[1] for p in a]
                    best = [min(axs), min(ays), max(axs), max(ays)]
        if not d:
            continue
        if code in out:                       # a MERGE target: weld the two
            prev_d, prev_box = out[code]      # polygons into one country
            d = prev_d + d
            if prev_box:
                best = ([min(prev_box[0], best[0]), min(prev_box[1], best[1]),
                         max(prev_box[2], best[2]), max(prev_box[3], best[3])]
                        if best else prev_box)
        out[code] = (d, best)
    return out


def unwrap(pts, ref):
    """Shift each x by whole worlds until it sits nearest `ref`, so a polyline
    crossing +/-180 stays continuous instead of jumping the width of the map."""
    out = []
    for x, y in pts:
        while x - ref > W / 2:
            x -= W
        while ref - x > W / 2:
            x += W
        out.append((x, y))
        ref = x                # follow the line, don't snap every point to one point
    return out

def fmt(v):
    s = ("%.*f" % (PREC, v)).rstrip("0").rstrip(".")
    return s if s not in ("", "-0") else "0"


# Interior label points (lon, lat) for all 197 deck countries, from Natural
# Earth 50m largest-polygon centroids with an interior grid-search fallback
# where the centroid fell outside a concave country (il, vn, mh). These anchor
# the marker layer, and are the ONLY hit target a country gets when its polygon
# is too small to tap at the current zoom — which at world zoom is nearly all
# of them. Not Natural Earth's tiny_countries set: that misses Cabo Verde and
# is full of non-country noise.
PTS = {
    "ad":(1.56,42.542),"ae":(54.307,23.904),"af":(66.005,33.835),
    "ag":(-61.79,17.078),"al":(20.05,41.142),"am":(44.929,40.29),
    "ao":(17.564,-12.332),"ar":(-65.156,-35.18),"at":(14.127,47.586),
    "au":(134.355,-25.573),"az":(47.664,40.344),"ba":(17.769,44.175),
    "bb":(-59.56,13.181),"bd":(90.224,23.898),"be":(4.639,50.64),
    "bf":(-1.755,12.27),"bg":(25.215,42.769),"bh":(50.542,26.042),
    "bi":(29.875,-3.359),"bj":(2.328,9.642),"bn":(114.592,4.49),
    "bo":(-64.685,-16.708),"br":(-53.117,-10.841),"bs":(-78.038,24.701),
    "bt":(90.402,27.411),"bw":(23.799,-22.184),"by":(28.032,53.531),
    "bz":(-88.719,17.195),"ca":(-102.366,57.935),"cd":(23.644,-2.877),
    "cf":(20.468,6.568),"cg":(15.22,-0.838),"ch":(8.209,46.798),
    "ci":(-5.57,7.629),"cl":(-71.311,-35.748),"cm":(12.74,5.691),
    "cn":(103.797,36.617),"co":(-73.081,3.914),"cr":(-84.192,9.976),
    "cu":(-78.943,21.614),"cv":(-23.637,15.082),"cy":(33.006,34.917),
    "cz":(15.312,49.733),"de":(10.372,51.088),"dj":(42.561,11.749),
    "dk":(9.356,56.24),"dm":(-61.358,15.44),"do":(-70.506,18.894),
    "dz":(2.617,28.159),"ec":(-78.39,-1.445),"ee":(25.832,58.686),
    "eg":(29.862,26.496),"er":(38.838,15.36),"es":(-3.563,40.4),
    "et":(39.601,8.623),"fi":(26.284,64.505),"fj":(177.973,-17.823),
    "fm":(158.232,6.886),"fr":(2.453,46.62),"ga":(11.789,-0.587),
    "gb":(-2.507,53.938),"gd":(-61.682,12.117),"ge":(43.508,42.169),
    "gh":(-1.217,7.954),"gm":(-15.396,13.45),"gn":(-10.941,10.436),
    "gq":(10.47,1.565),"gr":(22.585,39.479),"gt":(-90.365,15.694),
    "gw":(-14.924,12.064),"gy":(-58.982,4.794),"hn":(-86.616,14.824),
    "hr":(16.424,45.159),"ht":(-72.676,18.928),"hu":(19.396,47.163),
    "id":(114.014,-0.191),"ie":(-8.134,53.174),"il":(34.605,31.077),
    "in":(79.586,22.909),"iq":(43.743,33.04),"ir":(54.273,32.58),
    "is":(-18.574,64.996),"it":(12.149,43.529),"jm":(-77.315,18.157),
    "jo":(36.771,31.246),"jp":(137.985,36.65),"ke":(37.795,0.601),
    "kg":(74.532,41.458),"kh":(104.908,12.721),"ki":(-157.374,1.854),
    "km":(43.339,-11.654),"kn":(-62.748,17.327),"kp":(127.193,40.154),
    "kr":(127.871,36.461),"kw":(47.562,29.317),"kz":(67.293,48.157),
    "la":(103.738,18.502),"lb":(35.88,33.923),"lc":(-60.97,13.895),
    "li":(9.536,47.137),"lk":(80.703,7.609),"lr":(-9.322,6.453),
    "ls":(28.227,-29.58),"lt":(23.892,55.326),"lu":(6.072,49.767),
    "lv":(24.912,56.851),"ly":(18.009,27.031),"ma":(-8.456,29.838),
    "mc":(7.406,43.753),"md":(28.457,47.195),"me":(19.239,42.789),
    "mg":(46.703,-19.375),"mh":(171.081,7.123),"mk":(21.682,41.595),
    "ml":(-3.543,17.346),"mm":(96.489,21.221),"mn":(103.053,46.827),
    "mr":(-10.347,20.258),"mt":(14.443,35.89),"mu":(57.571,-20.278),
    "mv":(73.503,4.197),"mw":(34.289,-13.22),"mx":(-102.505,23.941),
    "my":(114.724,3.615),"mz":(35.533,-17.273),"na":(17.21,-22.13),
    "ne":(9.386,17.419),"ng":(8.09,9.595),"ni":(-85.031,12.847),
    "nl":(5.642,52.282),"no":(13.908,64.238),"np":(83.916,28.249),
    "nr":(166.933,-0.519),"nz":(170.528,-43.973),"om":(56.085,20.575),
    "pa":(-80.112,8.524),"pe":(-74.382,-9.153),"pg":(144.244,-6.606),
    "ph":(121.415,15.957),"pk":(69.34,29.95),"pl":(19.39,52.128),
    "ps":(35.248,31.948),"pt":(-7.978,39.677),"pw":(134.581,7.513),
    "py":(-58.4,-23.228),"qa":(51.185,25.306),"ro":(24.973,45.852),
    "rs":(20.79,44.221),"ru":(99.062,61.661),"rw":(29.92,-1.99),
    "sa":(44.539,24.125),"sb":(160.169,-9.624),"sc":(55.476,-4.661),
    "sd":(29.941,15.99),"se":(16.735,62.825),"sg":(103.817,1.359),
    "si":(14.804,46.115),"sk":(19.479,48.706),"sl":(-11.785,8.572),
    "sm":(12.459,43.942),"sn":(-14.473,14.366),"so":(45.707,4.751),
    "sr":(-55.912,4.131),"ss":(30.248,7.309),"st":(6.607,0.238),
    "sv":(-88.872,13.739),"sy":(38.505,35.023),"sz":(31.482,-26.558),
    "td":(18.645,15.333),"tg":(0.962,8.525),"th":(101.006,15.134),
    "tj":(71.014,38.529),"tl":(125.923,-8.81),"tm":(59.373,39.116),
    "tn":(9.548,34.12),"to":(-175.217,-21.167),"tr":(35.422,38.991),
    "tt":(-61.293,10.421),"tv":(179.206,-8.504),"tw":(120.962,23.752),
    "tz":(34.798,-6.276),"ua":(31.253,49.16),"ug":(32.369,1.275),
    "us":(-99.144,39.526),"uy":(-56.018,-32.8),"uz":(63.133,41.757),
    "va":(12.434,41.902),"vc":(-61.196,13.254),"ve":(-66.187,7.119),
    "vn":(108.53,13.658),"vu":(166.85,-15.226),"ws":(-172.437,-13.631),
    "xk":(20.872,42.571),"ye":(47.541,15.936),"za":(25.157,-29.01),
    "zm":(27.775,-13.458),"zw":(29.851,-19.004)
}


def deck(html):
    """The game's country list, read back out of index.html so this script can
    never drift from it. Tuples are [code, name, region, subregion]."""
    block = html[html.index("const COUNTRIES"):html.index("].map((")]
    rows = re.findall(r'\["([a-z]{2})","([^"]+)","([^"]+)","([^"]+)"\]', block)
    if not rows:
        sys.exit("could not parse COUNTRIES — has the tuple shape changed?")
    return {c: (n, r, s) for c, n, r, s in rows}


def main():
    html = open(TARGET).read()
    countries = deck(html)
    geo = decode(source())

    paths = {c: d for c, (d, _) in geo.items()}
    boxes = {c: [round(v, 1) for v in b] for c, (_, b) in geo.items() if b}
    pts = {c: (round((lon + 180) * DEG, 1), round((90 - lat) * DEG, 1))
           for c, (lon, lat) in PTS.items()}

    # --- the assertions that make this script worth running -----------------
    missing = sorted(set(countries) - set(pts))
    if missing:
        sys.exit("no marker point for deck countries: %s" % missing)
    stray = sorted(set(paths) - set(countries) - INERT)
    if stray:
        sys.exit("geometry for unknown codes (add to INERT or DROP): %s" % stray)
    for group in ("region", "subregion"):
        idx = 1 if group == "region" else 2
        for key in {v[idx] for v in countries.values()}:
            members = [c for c, v in countries.items() if v[idx] == key]
            if not any(c in pts for c in members):
                sys.exit("bucket %r has no framable member" % key)

    payload = {
        "paths": paths,
        "box": boxes,
        "pt": pts,
        "inert": sorted(INERT & set(paths)),
        "w": int(W),
    }
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    block = ("/* ==BEGIN GENERATED MAP DATA== built by scripts/build-map.py\n"
             "   Natural Earth via world-atlas 110m, public domain. Do not hand-edit:\n"
             "   re-run the script instead, it is idempotent. */\n"
             "const MAP = %s;\n"
             "/* ==END GENERATED MAP DATA== */" % body)

    start = html.index("/* ==BEGIN GENERATED MAP DATA==")
    end = html.index("/* ==END GENERATED MAP DATA== */") + len("/* ==END GENERATED MAP DATA== */")
    open(TARGET, "w").write(html[:start] + block + html[end:])

    with_poly = len(set(countries) & set(paths))
    print("map: %d polygons (%d deck, %d inert), %d marker points, %d KB of data"
          % (len(paths), with_poly, len(payload["inert"]), len(pts), len(body) // 1024))
    print("     %d deck countries are marker-only" % (len(countries) - with_poly))


if __name__ == "__main__":
    main()
