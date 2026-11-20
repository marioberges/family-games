import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
const GAMES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "games");
const DIR = path.join(GAMES, "romp");
const KEY = "romp:world:v1";

/* Romp loads planck.min.js from its own folder. The rig boots a copy with the
   library inlined, so it needs no file loading. Planck's own "use strict" is
   respaced so the probe lands in the game's scope, not the library's.
   Every call is awaited so this suite also runs under a browser-backed rig. */
let html = fs.readFileSync(path.join(DIR, "index.html"), "utf8");
const lib = fs.readFileSync(path.join(DIR, "planck.min.js"), "utf8").split('"use strict";').join('"use strict" ;');
const TAG = '<script src="planck.min.js"></script>';
ok(html.includes(TAG), "index.html loads planck.min.js from its own folder");
ok(!lib.includes("</script"), "the library can be inlined for the test");
ok(fs.readFileSync(path.join(DIR, "sw.js"), "utf8").includes('"./planck.min.js"'), "sw.js precaches planck.min.js");
html = html.replace(TAG, () => "<script>" + lib + "</script>");
const FILE = path.join(os.tmpdir(), "romp-under-test.html");
fs.writeFileSync(FILE, html);

const quiet = errs => errs.filter(e => !/getContext|Not implemented: HTMLCanvasElement/i.test(e));

/* ---- doodles, in pad units (0..1000), as the pad stores them ---- */
const W10 = 160;  // pen width x 10
const stroke = (pts, c = 0) => ({c, p: pts.flatMap(([x, y]) => [Math.round(x), Math.round(y), W10])});
const ring = (cx, cy, rx, ry = rx, n = 48) =>
  Array.from({length: n + 1}, (_, i) => [cx + rx * Math.cos(i / n * 2 * Math.PI), cy + ry * Math.sin(i / n * 2 * Math.PI)]);
const line = (x0, y0, x1, y1, n = 16) => Array.from({length: n + 1}, (_, i) => [x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]);
const D = {
  ball:  [stroke(ring(500, 500, 130)), stroke(ring(460, 470, 10, 10, 8)), stroke(ring(540, 470, 10, 10, 8))],
  stick: [stroke(ring(500, 250, 55)), stroke(line(500, 305, 500, 620)), stroke(line(500, 400, 410, 500)),
          stroke(line(500, 400, 590, 500)), stroke(line(500, 620, 430, 820)), stroke(line(500, 620, 570, 820))],
  worm:  [stroke([...line(120, 520, 880, 520, 40), ...line(880, 520, 880, 590, 4), ...line(880, 590, 120, 590, 40), ...line(120, 590, 120, 520, 4)])],
  box:   [stroke([...line(380, 380, 640, 380), ...line(640, 380, 640, 620), ...line(640, 620, 380, 620), ...line(380, 620, 380, 380)])],
  mouse: [stroke(ring(500, 500, 55)), stroke(ring(460, 440, 18, 18, 12)), stroke(ring(540, 440, 18, 18, 12))],
  dot:   [{c: 2, p: [500, 500, 120]}]
};
const J = x => JSON.stringify(x);

/* ---- boot ---- */
let g = await boot(FILE);
eq(quiet(g.errors), [], "boots without error");
await g.ev("paused = true");
ok(await g.ev("typeof P.World === 'function' && typeof P.Polygon === 'function'"), "Planck is loaded");
eq(await g.ev("chars.length"), 0, "a fresh world is empty");
eq(await g.ev("layoutId"), "ledges", "and starts on the Ledges");
ok(await g.ev("!document.getElementById('hint').classList.contains('gone')"), "with a hint saying what to do");
eq(await g.ev("[...document.querySelectorAll('[data-layout]')].map(b => b.dataset.layout)"), ["ledges", "gap", "burrow"], "three places to pick from");

/* ---- the places ---- */
const inside = `(pt, poly) => { let s = 0;
  for(let i = 0; i < poly.length; i++){ const a = poly[i], b = poly[(i + 1) % poly.length];
    const cr = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]);
    if(cr !== 0){ if(s && Math.sign(cr) !== s) return false; s = Math.sign(cr); } }
  return true; }`;
eq(await g.ev(`Object.values(LAYOUTS).flatMap(L => L.solids).filter(p => p.length < 3 ||
   p.some(([x, y]) => x < 0 || x > W || y < 0 || y > H)).length`), 0, "every solid sits inside the world");
eq(await g.ev(`(() => { const inside = ${inside};
   return Object.entries(LAYOUTS).filter(([k, L]) => L.solids.some(p => inside(L.star, p) || inside(L.spawn, p))).map(([k]) => k); })()`),
   [], "no star or spawn point is buried in the ground");
eq(await g.ev("Object.values(LAYOUTS).map(L => !!(L.guide && L.guide.value > 0 && L.about))"), [true, true, true], "each place has a size guide and a one-line description");

/* ---- shape decides movement ---- */
const kinds = {};
for(const [name, strokes] of Object.entries(D)){
  kinds[name] = await g.ev(`(() => { const a = analyse(${J(strokes)}); return {style: movesFor(a.traits).style,
    n: a.hull.length, t: a.traits, convex: a.hull.every((p, i, h) => { const q = h[(i + 1) % h.length], r = h[(i + 2) % h.length];
      return (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]) >= -1e-6; }) }; })()`);
}
eq(kinds.ball.style, "roller", "a round doodle rolls");
eq(kinds.stick.style, "jumper", "a tall stick figure is a jumper");
eq(kinds.worm.style, "crawler", "a long flat doodle crawls");
eq(kinds.box.style, "hopper", "a squarish doodle hops");
ok(Object.values(kinds).every(k => k.n >= 3 && k.n <= 12 && k.convex), "every collider is convex with 3–12 corners (Planck's limit)");
ok(kinds.ball.t.solidity > .85, "a drawn ring is filled in, not hollow: solidity " + kinds.ball.t.solidity.toFixed(2));
ok(kinds.stick.t.solidity < .6, "a stick figure stays spindly: solidity " + kinds.stick.t.solidity.toFixed(2));
ok(Math.max(kinds.dot.t.w, kinds.dot.t.h) >= 29, "a single dot still makes a character big enough to see");
ok(kinds.mouse.t.h < 85, "a small doodle fits the Burrow's tunnel: " + kinds.mouse.t.h.toFixed(0) + " units tall");
ok(kinds.worm.t.w > 220, "a long doodle is longer than the Gap: " + kinds.worm.t.w.toFixed(0) + " units");

/* ---- the drawing card: Apple Pencil, and no marks from a resting palm ---- */
await g.ev("openCard()");
ok(await g.ev("cardOpen && !document.getElementById('card').hidden"), "the pencil button opens the drawing card");
ok(await g.ev("document.getElementById('done').disabled"), "nothing drawn yet: 'Let it go!' waits");
await g.ev(`(() => { const r = pad.getBoundingClientRect();
  padDown({pointerId: 1, pointerType: "touch", clientX: r.left + 10, clientY: r.top + 10});
  padMove({pointerId: 1, pointerType: "touch", clientX: r.left + 60, clientY: r.top + 60});
  padUp({pointerId: 1}); })()`);
eq(await g.ev("strokes.length"), 1, "before any Pencil, a finger draws");
await g.ev(`(() => { const r = pad.getBoundingClientRect();
  padDown({pointerId: 2, pointerType: "pen", pressure: .9, clientX: r.left + 100, clientY: r.top + 100});
  padMove({pointerId: 2, pointerType: "pen", pressure: .9, clientX: r.left + 160, clientY: r.top + 150});
  padUp({pointerId: 2}); })()`);
eq(await g.ev("strokes.length"), 2, "the Pencil draws");
ok(await g.ev("strokes[1].p[2] > strokes[0].p[2]"), "a firm Pencil line is bolder than a finger line");
await g.ev(`(() => { const r = pad.getBoundingClientRect();
  padDown({pointerId: 3, pointerType: "touch", clientX: r.left + 200, clientY: r.top + 200});
  padMove({pointerId: 3, pointerType: "touch", clientX: r.left + 260, clientY: r.top + 260});
  padUp({pointerId: 3}); })()`);
eq(await g.ev("strokes.length"), 2, "once a Pencil has been used, a palm or finger leaves no mark");
ok(await g.ev("!document.getElementById('done').disabled"), "with something drawn, 'Let it go!' is ready");
await g.click("#done");
eq(await g.ev("[cardOpen, chars.length]"), [false, 1], "'Let it go!' closes the card and drops the doodle in");

/* ---- the world runs ---- */
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c);
  ${J(Object.keys(D))}.forEach(k => spawn(${J(D)}[k])); })()`);
await g.ev("for(let i = 0; i < 900; i++) tick(STEP)");
eq(await g.ev(`chars.filter(c => { const p = c.body.getPosition();
  return !isFinite(p.x) || !isFinite(p.y) || toU(p.x) < 0 || toU(p.x) > W || toU(p.y) > H; }).length`),
   0, "after 15 s on the Ledges everyone is still inside the world");
ok(await g.ev("chars.every(c => c.sprite || !document.createElement('canvas').getContext)"), "each doodle has its cut-out sticker when there is a canvas");

/* ---- the Gap: a long doodle lies across it; the pit's spring throws you out ---- */
await g.ev("goTo('gap')");
eq(await g.ev("[layoutId, chars.length, chars.every(c => !!c.body)]"), ["gap", 6, true], "moving to the Gap brings everyone along");
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c);
  const w = spawn(${J(D.worm)}); w.held = true;
  w.body.setTransform(V(toM(800), toM(560)), 0); w.body.setLinearVelocity(V(0, 0)); })()`);
await g.ev("for(let i = 0; i < 180; i++) tick(STEP)");
ok(await g.ev("toU(chars[0].body.getPosition().y) < 660"), "a doodle longer than the gap rests across it as a bridge");
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c);
  const b = spawn(${J(D.ball)}); b.held = true;
  b.body.setTransform(V(toM(800), toM(700)), 0); b.body.setLinearVelocity(V(0, 0)); })()`);
eq(await g.ev(`(() => { let top = Infinity;
  for(let i = 0; i < 240; i++){ tick(STEP); top = Math.min(top, toU(chars[0].body.getPosition().y)); }
  return top < 640; })()`), true, "anything that falls in the pit is sprung back out above the cliffs");

/* ---- the Burrow: small enough fits through the tunnel ---- */
await g.ev("goTo('burrow')");
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c);
  const m = spawn(${J(D.mouse)}); m.body.setTransform(V(toM(500), toM(860)), 0);
  m.mood = {kind: "seek", t: 1e9}; m.dir = 1; })()`);
eq(await g.ev(`(() => { for(let i = 0; i < 60 * 40; i++){ tick(STEP);
    if(toU(chars[0].body.getPosition().x) > 1320) return true; chars[0].mood = {kind: "seek", t: 1e9}; }
  return toU(chars[0].body.getPosition().x); })()`), true, "a small doodle heading for the star gets through the tunnel");

/* ---- saving ---- */
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c);
  spawn(${J(D.ball)}); spawn(${J(D.stick)}); spawn(${J(D.worm)}); chars[1].stars = 3; save(); })()`);
const saved = JSON.parse(await g.ev("localStorage.getItem(KEY)"));
eq([saved.v, saved.layout, saved.chars.length], [1, "burrow", 3], "the world is saved with a version, the place and everyone in it");
ok(saved.chars.every(c => Array.isArray(c.strokes) && Number.isFinite(c.x) && Number.isFinite(c.y)), "each character keeps its strokes and where it was");
ok(JSON.stringify(saved).length < 60000, "three characters fit easily in storage: " + JSON.stringify(saved).length + " bytes");
await g.ev(`(() => { for(let i = 0; i < 14; i++) spawn(${J(D.dot)}); })()`);
eq(await g.ev("chars.length"), 12, "at most twelve characters: the oldest leaves to make room");
g.close();

g = await boot(FILE, {storage: {[KEY]: JSON.stringify(saved)}});
eq(quiet(g.errors), [], "boots from a saved world without error");
eq(await g.ev("[layoutId, chars.length, chars[1].stars, readOnly]"), ["burrow", 3, 3, false], "everyone comes back, stars and all");
eq(await g.ev("JSON.stringify(chars.map(c => c.strokes))"), JSON.stringify(saved.chars.map(c => c.strokes)), "drawn exactly as they were");
eq(await g.ev("document.getElementById('hint').classList.contains('gone')"), true, "no 'draw someone' hint when the world has people in it");
g.close();

const newer = JSON.stringify({...saved, v: 2, future: true});
g = await boot(FILE, {storage: {[KEY]: newer}});
eq(quiet(g.errors), [], "boots from a newer build's data without error");
eq(await g.ev("readOnly"), true, "data from a newer build makes this one read-only");
await g.ev("paused = true; spawn(" + J(D.dot) + "); save()");
eq(await g.ev("localStorage.getItem(KEY)"), newer, "and it never saves over it");
g.close();

g = await boot(FILE, {storage: {[KEY]: "{not json"}});
eq([quiet(g.errors).length, await g.ev("chars.length")], [0, 0], "unreadable saved data just means a fresh world");
g.close();

process.exit(report("romp") ? 0 : 1);
