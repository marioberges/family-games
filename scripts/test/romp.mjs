import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
const GAMES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "games");
const DIR = path.join(GAMES, "romp");
const KEY = "romp:world:v1";
const BOOK_KEY = "romp:book:v1";

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

/* ---- the doodle book: keep, name, change, drop in anywhere ---- */
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c); })()`);
eq(await g.ev("book.length"), 0, "the book starts empty");
await g.ev(`(() => { openCard(); strokes = ${J(D.ball)}; document.getElementById("nameIn").value = "  Bouncy   Bob "; syncCard(); })()`);
await g.click("#done");
eq(await g.ev("[book.length, book[0].name, chars.length, chars[0].bookId === book[0].id]"), [1, "Bouncy Bob", 1, true],
   "naming a doodle keeps it in the book, and the one dropped in belongs to that page");
await g.ev(`(() => { openCard(); strokes = ${J(D.dot)}; syncCard(); letItGo(); })()`);
eq(await g.ev("[book.length, chars.length, chars[1].bookId]"), [1, 2, null], "an unnamed doodle romps but isn't kept");
const bookSaved = JSON.parse(await g.ev("localStorage.getItem(BOOK_KEY)"));
eq([bookSaved.v, bookSaved.doodles.length, bookSaved.doodles[0].name], [1, 1, "Bouncy Bob"], "the book is saved under its own key, with a version");
await g.ev("openBook()");
eq(await g.ev("[...document.querySelectorAll('#shelf .dcard .dname')].map(n => n.textContent)"), ["Bouncy Bob"], "My doodles shows each kept doodle by name");
await g.click("#shelf .dcard .drop");
eq(await g.ev("[bookOpen, chars.length, chars[2].bookId === book[0].id]"), [false, 3, true], "'Drop in' closes the book and drops a copy into the place");
await g.ev(`(() => { const c = chars[2]; c.held = true; star.visible = true;
  c.body.setTransform(V(toM(star.x), toM(star.y)), 0); tick(STEP); })()`);
eq(await g.ev("[chars[2].stars, book[0].stars]"), [1, 1], "a star a kept doodle collects is counted on its page too");
await g.ev(`(() => { openBook(); document.querySelector("#shelf .dcard .edit").click(); })()`);
eq(await g.ev("[cardOpen, strokes.length, document.getElementById('nameIn').value]"), [true, 3, "Bouncy Bob"],
   "'Change' opens the drawing card with the doodle and its name");
await g.ev(`(() => { strokes.push(${J(D.stick[1])}); document.getElementById("nameIn").value = "Bob"; letItGo(); })()`);
eq(await g.ev("[book.length, book[0].name, book[0].strokes.length, book[0].stars, chars.length]"), [1, "Bob", 4, 1, 4],
   "changing it updates the same page (new drawing, new name, stars kept) and drops the new version in");
await g.ev("openWho(chars[1])");
ok(await g.ev("!document.getElementById('who').hidden && document.getElementById('whoKeep').textContent === 'Keep in my book'"),
   "pressing and holding a character opens its own card");
await g.ev("document.getElementById('whoName').value = 'Dot'");
await g.click("#whoKeep");
eq(await g.ev("[book.length, book[1].name, chars[1].bookId === book[1].id, document.getElementById('whoKeep').disabled]"), [2, "Dot", true, true],
   "'Keep in my book' keeps a character that's already romping");
await g.ev("document.getElementById('whoName').value = 'Dotty'; document.getElementById('whoName').dispatchEvent(new Event('input'))");
eq(await g.ev("book[1].name"), "Dotty", "renaming it on its card renames its page");
await g.ev(`(() => { const c = chars[1]; c.held = true; c.body.setTransform(V(toM(500), toM(700)), 0); })()`);
await g.click("#whoEdit");
eq(await g.ev("[cardOpen, !!editing && editing.charId === chars[1].id]"), [true, true], "'Change drawing' opens its drawing");
await g.ev(`(() => { strokes = ${J(D.mouse)}; letItGo(); })()`);
eq(await g.ev("[chars.length, chars.filter(c => c.bookId === book[1].id).length, Math.abs(toU(chars[chars.length - 1].body.getPosition().x) - 500) < 5]"),
   [4, 1, true], "the changed one takes the old one's place");
await g.ev("openWho(chars[0])");
await g.click("#whoHome");
eq(await g.ev("[chars.length, book.length, whoChar]"), [3, 2, null], "'Send home' takes it out of the world but not out of the book");
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c); save(); })()`);
eq(await g.ev("book.length"), 2, "clearing the world leaves the book alone");
await g.ev("openBook()");
await g.click("#shelf .dcard .remove");
eq(await g.ev("book.length"), 2, "removing from the book asks twice");
await g.click("#shelf .dcard .remove");
eq(await g.ev("[book.length, book[0].name, document.querySelectorAll('#shelf .dcard').length]"), [1, "Bob", 1], "and the second tap removes it");
await g.ev(`(() => { closeBook(); const c = spawn(${J(D.box)}, {bookId: book[0].id}); save(); })()`);
const keptBook = await g.ev("localStorage.getItem(BOOK_KEY)");
const keptWorld = await g.ev("localStorage.getItem(KEY)");
g.close();

g = await boot(FILE, {storage: {[BOOK_KEY]: keptBook, [KEY]: keptWorld}});
eq(quiet(g.errors), [], "boots with a book without error");
eq(await g.ev("[book.length, book[0].name, book[0].stars, chars.length, chars[0].bookId === book[0].id]"), [1, "Bob", 1, 1, true],
   "the book and the world's link to it survive a restart");
g.close();

const newerBook = JSON.stringify({v: 2, doodles: JSON.parse(keptBook).doodles, extra: 1});
g = await boot(FILE, {storage: {[BOOK_KEY]: newerBook}});
await g.ev(`(() => { paused = true; keepInBook(${J(D.dot)}, "New"); saveBook(); })()`);
eq([await g.ev("bookReadOnly"), await g.ev("localStorage.getItem(BOOK_KEY)")], [true, newerBook],
   "a book from a newer build is read-only here, never saved over");
g.close();
g = await boot(FILE);
await g.ev("paused = true; goTo('burrow')");

/* ---- saving ---- */
await g.ev(`(() => { for(const c of chars.slice()) removeChar(c);
  spawn(${J(D.ball)}); spawn(${J(D.stick)}); spawn(${J(D.worm)}); chars[1].stars = 3; save(); })()`);
const saved = JSON.parse(await g.ev("localStorage.getItem(KEY)"));
eq([saved.v, saved.layout, saved.chars.length], [2, "burrow", 3], "the world is saved with a version, the place and everyone in it");
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

const v1 = JSON.stringify({...saved, v: 1});
g = await boot(FILE, {storage: {[KEY]: v1}});
eq(await g.ev("[readOnly, chars.length]"), [false, 3], "a world saved by the first build (v1) loads");
await g.ev("paused = true; save()");
eq(JSON.parse(await g.ev("localStorage.getItem(KEY)")).v, 2, "and is saved back as v2");
g.close();

const newer = JSON.stringify({...saved, v: 3, future: true});
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
