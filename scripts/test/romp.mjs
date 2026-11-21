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
eq(await g.ev("Object.values(LAYOUTS).map(L => L.guide.kind + ': ' + /is this (tall|wide|low)$/.test(L.guide.label))"),
   ["step: true", "gap: true", "tunnel: true"], "each guide says in plain words what it measures");

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

/* ---- the eraser, and undo by whole actions ---- */
const drag = (id, type, pts) => `(() => { const r = pad.getBoundingClientRect(), w = r.width || padPx, h = r.height || padPx;
  const at = ([x, y]) => ({pointerId: ${id}, pointerType: "${type}", pressure: .5, clientX: r.left + x / PAD * w, clientY: r.top + y / PAD * h});
  const pts = ${J(pts)};
  padDown(at(pts[0])); for(const q of pts.slice(1)) padMove(at(q)); padUp(at(pts[pts.length - 1])); })()`;
await g.ev("closeCard(); openCard()");
await g.ev(drag(20, "pen", line(100, 500, 900, 500, 60)));
const full = await g.ev("strokes[0].p.length");
eq(await g.ev("[strokes.length, document.getElementById('undo').disabled]"), [1, false], "a line drawn; Undo is ready");
await g.click("#eraser");
eq(await g.ev("[erasing, document.getElementById('eraser').getAttribute('aria-pressed')]"), [true, "true"], "the eraser switches on");
await g.ev(drag(21, "pen", line(500, 380, 500, 620, 12)));
eq(await g.ev("strokes.length"), 2, "rubbing across the middle of a line splits it in two");
eq(await g.ev("strokes.every(s => { for(let i = 0; i < s.p.length; i += 3) if(Math.abs(s.p[i] - 500) < 20) return false; return true; })"), true,
   "and nothing is left where the eraser went");
await g.ev(drag(22, "pen", line(100, 100, 300, 120, 8)));
eq(await g.ev("[strokes.length, history.length]"), [2, 2], "rubbing where there's nothing changes nothing and adds no undo step");
await g.click("#undo");
eq(await g.ev("[strokes.length, strokes[0].p.length]"), [1, full], "Undo brings the whole line back");
await g.ev(drag(23, "pen", line(80, 500, 920, 500, 60)));
eq(await g.ev("[strokes.length, document.getElementById('done').disabled]"), [0, true], "rubbing along the whole line rubs it all out");
await g.click("#undo");
await g.ev("document.querySelectorAll('#swatches .sw')[2].click()");
eq(await g.ev("[erasing, colorIdx]"), [false, 2], "picking a colour puts the eraser away");
await g.click("#wipe");
eq(await g.ev("strokes.length"), 0, "Start over clears the pad");
await g.click("#undo");
eq(await g.ev("strokes.length"), 1, "and Undo brings it back");
await g.ev("closeCard()");

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

/* ---- the pad: the Pencil wins, a palm can't press buttons, Scribble stays out ---- */
const SQ_KEY = "romp:squiggle:v1";
g = await boot(FILE);
await g.ev("paused = true; openCard()");
await g.ev(`(() => { const r = pad.getBoundingClientRect();
  padDown({pointerId: 1, pointerType: "touch", clientX: r.left + 10, clientY: r.top + 10});
  padMove({pointerId: 1, pointerType: "touch", clientX: r.left + 80, clientY: r.top + 80});
  padDown({pointerId: 2, pointerType: "pen", pressure: .5, clientX: r.left + 200, clientY: r.top + 200});
  padMove({pointerId: 1, pointerType: "touch", clientX: r.left + 120, clientY: r.top + 120});
  padMove({pointerId: 2, pointerType: "pen", pressure: .5, clientX: r.left + 260, clientY: r.top + 240});
  padUp({pointerId: 1}); padUp({pointerId: 2}); })()`);
eq(await g.ev("[strokes.length, strokes[0].p[0] > 150, history.length]"), [1, true, 1],
   "a palm that lands first draws until the Pencil comes down; then its line is taken back and the Pencil draws");
const fire = (sel, type, pointerType, id) => `document.querySelector(${J(sel)}).dispatchEvent(new PointerEvent(${J(type)},
  {bubbles: true, cancelable: true, pointerType: ${J(pointerType)}, pointerId: ${id}}))`;
await g.ev(`(() => { ${fire("#pad", "pointerdown", "pen", 7)}; ${fire("#cancel", "pointerdown", "touch", 8)};
  ${fire("#pad", "pointerup", "pen", 7)}; ${fire("#cancel", "pointerup", "touch", 8)};
  document.getElementById("cancel").click(); })()`);
eq(await g.ev("cardOpen"), true, "a palm resting on 'Not now' while the Pencil draws doesn't close the card");
await g.ev("swallowUntil = 0; penLiftedAt = -1e9");
await g.ev(`(() => { ${fire("#swatches .sw:nth-child(3)", "pointerdown", "touch", 9)}; ${fire("#swatches .sw:nth-child(3)", "pointerup", "touch", 9)};
  document.querySelector("#swatches .sw:nth-child(3)").click(); })()`);
eq(await g.ev("colorIdx"), 2, "a real tap, away from the Pencil, still picks a colour");
eq(await g.ev(`["touchstart", "touchmove"].map(t => { const e = new Event(t, {bubbles: true, cancelable: true});
  pad.dispatchEvent(e); return e.defaultPrevented; })`), [true, true],
   "touches on the pad are cancelled, so Scribble doesn't hold back the Pencil");
eq(await g.ev("document.querySelectorAll('#swatches .sw').length"), 6, "six pens to pick from; graphite is only for squiggles");
g.close();

/* ---- Squiggle: making squiggles ---- */
g = await boot(FILE);
await g.ev("paused = true");
eq(await g.ev("JSON.stringify(makeSquiggle(4242).strokes) === JSON.stringify(makeSquiggle(4242).strokes)"), true, "same seed, same squiggle");
eq(await g.ev("JSON.stringify(makeSquiggle(1).strokes) !== JSON.stringify(makeSquiggle(2).strokes)"), true, "different seeds, different squiggles");
const sweep = await g.ev(`(() => { let bad = [], shape = 0, ink = 0;
  for(let i = 1; i <= 300; i++){
    const seed = i * 104729, r = sqRng(seed);
    const q = makeSquiggle(seed);
    if(!validStrokes(q.strokes)) shape++;
    if(!q.strokes.every(s => s.c === SQ_INK && s.p.every((v, k) => k % 3 === 2 || (v >= 0 && v <= 1000)))) ink++;
    if(q.tries >= 40) bad.push(seed);
  } return {bad: bad.length, shape, ink}; })()`);
eq(sweep, {bad: 0, shape: 0, ink: 0}, "300 squiggles: every one passes the rules, in graphite, on the page");
eq(await g.ev("[2, 3].includes(makeSquiggle(77).strokes.length)"), true, "a squiggle is two or three pieces");

/* ---- Squiggle: a turn ---- */
await g.click("#sqBtn");
eq(await g.ev("[sqOpen, cardOpen, !document.getElementById('sq').hidden]"), [true, false, true],
   "the Squiggle door opens the gallery, with both ways to play");
await g.click("#sqDraw");
eq(await g.ev("[cardOpen, sqMode, sqBase.length > 1, document.getElementById('card').classList.contains('sq')]"), [true, true, true, true],
   "'New squiggle' opens the drawing card with a squiggle on it");
eq(await g.ev("[document.getElementById('done').textContent, document.getElementById('cancel').textContent, document.getElementById('done').disabled]"),
   ["I'm done!", "My squiggles", true], "nothing drawn yet: 'I'm done!' waits");
const firstBase = await g.ev("JSON.stringify(sqBase)");
await g.ev(drag(11, "pen", [[100, 100], [300, 300], [600, 650]]));
eq(await g.ev("[strokes.length, document.getElementById('done').disabled]"), [1, false], "the player's lines go on top");
await g.ev("setEraser(true)");
await g.ev(drag(12, "pen", [[0, 0], [250, 250], [500, 500], [750, 750], [1000, 1000], [0, 1000], [1000, 0]]));
await g.ev("setEraser(false)");
eq(await g.ev("JSON.stringify(sqBase)"), firstBase, "the eraser can't touch the squiggle");
await g.ev("document.getElementById('wipe').click()");
eq(await g.ev("[strokes.length, JSON.stringify(sqBase) === " + J(firstBase) + "]"), [0, true], "and neither can Start over");
await g.ev(drag(13, "pen", [[200, 200], [400, 260], [500, 500]]));
await g.ev("document.getElementById('cancel').click()");
eq(await g.ev("[cardOpen, sqOpen, !document.getElementById('sq').hidden]"), [false, true, true], "'My squiggles' goes to the gallery");
eq(await g.ev("document.getElementById('sqDraw').textContent"), "Keep drawing", "with the squiggle in progress waiting");
const midway = JSON.parse(await g.ev("localStorage.getItem(SQ_KEY)"));
eq([midway.v, midway.current && midway.current.strokes.length, J(midway.current.base) === firstBase], [2, 1, true],
   "a squiggle in progress is saved, lines and all");
await g.click("#sqDraw");
eq(await g.ev("[sqMode, strokes.length, JSON.stringify(sqBase) === " + J(firstBase) + "]"), [true, 1, true], "and comes back as it was left");
await g.click("#sqNew");
eq(await g.ev("JSON.stringify(sqBase) === " + J(firstBase)), true, "'New squiggle' asks twice when something's drawn");
await g.click("#sqNew");
eq(await g.ev("[JSON.stringify(sqBase) !== " + J(firstBase) + ", strokes.length]"), [true, 0], "the second tap swaps in a fresh one");
await g.ev(drag(14, "pen", [[150, 150], [500, 200], [850, 820]]));
await g.ev("document.getElementById('nameIn').value = 'Spiky Dino'");
await g.click("#done");
eq(await g.ev("[cardOpen, sqData.drawings.length, sqData.drawings[0].name, sqCurrent, sqOpen, sqViewId === sqData.drawings[0].id]"),
   [false, 1, "Spiky Dino", null, true, true], "'I'm done!' keeps it, named, and shows it");
eq(await g.ev("sqViewMode"), "before", "first as the squiggle it started from");
await new Promise(r => setTimeout(r, 1300));
eq(await g.ev("sqViewMode"), "after", "then as what it became");
eq(await g.ev("[...document.querySelectorAll('#sqShelf .dname')].map(n => n.textContent)"), ["Spiky Dino"], "the gallery shows it by name");
await g.ev("closeSqView(); openSquiggle()");
await g.ev(drag(15, "pen", [[300, 300], [700, 700]]));
await g.click("#done");
eq(await g.ev("sqData.drawings[1].name"), "Squiggle 2", "one with no name gets a number");
const saved2 = JSON.parse(await g.ev("localStorage.getItem(SQ_KEY)"));
eq([saved2.v, saved2.drawings.length, saved2.drawings.every(d => d.base.length && d.strokes.length && d.seed), saved2.current],
   [2, 2, true, null], "the gallery is saved under its own key, each with its squiggle and seed");
eq(await g.ev("localStorage.getItem(BOOK_KEY)"), null, "nothing goes to the doodle book by itself");

/* ---- Squiggle: sending one to Romp ---- */
await g.ev("openSqView(sqData.drawings[0].id)");
eq(await g.ev("[document.getElementById('sqSend').textContent, document.getElementById('sqPlay').hidden]"), ["Send to Romp", true], "a drawing can be sent to Romp");
await g.click("#sqSend");
eq(await g.ev(`(() => { const d = sqData.drawings[0], p = bookEntry(d.book);
  return [book.length, p && p.name, p && p.strokes.length === d.base.length + d.strokes.length, p && p.strokes[0].c]; })()`),
   [1, "Spiky Dino", true, 6], "'Send to Romp' puts the whole drawing in the book, squiggle and all, in graphite");
eq(await g.ev("[document.getElementById('sqSend').textContent, document.getElementById('sqSend').disabled, document.getElementById('sqPlay').hidden]"),
   ["In Romp ✓", true, false], "the button says it's there, and offers to play with it");
await g.ev("document.getElementById('sqName').value = 'Dino'; document.getElementById('sqName').dispatchEvent(new Event('input'))");
eq(await g.ev("[sqData.drawings[0].name, book[0].name]"), ["Dino", "Dino"], "renaming it renames its page in the book too");
await g.ev("closeSqView()");
eq(await g.ev("document.querySelector('#sqShelf .dcard[data-id=\"' + sqData.drawings[0].id + '\"] .dbadge').textContent"), "In Romp ✓", "its card in the gallery says so");
await g.ev("openSqView(sqData.drawings[0].id)");
await g.click("#sqPlay");
eq(await g.ev("[sqOpen, chars.length, chars[0].bookId === book[0].id]"), [false, 1, true], "'Play with it' drops it into the place");
await g.ev("removeFromBook(book[0].id); openSqShelf(); openSqView(sqData.drawings[0].id)");
eq(await g.ev("document.getElementById('sqSend').textContent"), "Send to Romp", "taken out of the book, it can be sent again");
await g.ev("openSquiggle(); closeCard(); openSqShelf(); onWorldDown({pointerId: 1, clientX: 600, clientY: 600})");
eq(await g.ev("grab"), null, "the world can't be grabbed through the gallery");
await g.ev("openSqView(sqData.drawings[1].id)");
await g.click("#sqRemove");
eq(await g.ev("sqData.drawings.length"), 2, "removing a drawing asks twice");
await g.click("#sqRemove");
eq(await g.ev("[sqData.drawings.length, document.getElementById('sqView').hidden]"), [1, true], "and the second tap removes it");
const keptSq = await g.ev("localStorage.getItem(SQ_KEY)");
g.close();

g = await boot(FILE, {storage: {[SQ_KEY]: keptSq}});
eq(quiet(g.errors), [], "boots with squiggles without error");
eq(await g.ev("[sqData.drawings.length, sqData.drawings[0].name, sqData.count]"), [1, "Dino", 2], "the gallery survives a restart");
g.close();

const newerSq = JSON.stringify({...JSON.parse(keptSq), v: 3, future: true});
g = await boot(FILE, {storage: {[SQ_KEY]: newerSq}});
await g.ev("paused = true; openSquiggle()");
await g.ev(drag(16, "pen", [[300, 300], [700, 700]]));
await g.click("#done");
eq([await g.ev("sqReadOnly"), await g.ev("localStorage.getItem(SQ_KEY)")], [true, newerSq], "squiggles from a newer build are looked at, never saved over");
g.close();

g = await boot(FILE, {storage: {[SQ_KEY]: "{not json"}});
eq([quiet(g.errors).length, await g.ev("sqData.drawings.length")], [0, 0], "unreadable squiggles just mean an empty gallery");
g.close();

/* ---- Pencil only: a lock instead of guessing ---- */
g = await boot(FILE);
await g.ev("paused = true; openCard()");
eq(await g.ev("[penLock, document.getElementById('penLock').getAttribute('aria-pressed')]"), [false, "false"], "a new iPad starts unlocked: fingers draw");
await g.ev(drag(1, "touch", [[100, 100], [300, 300]]));
eq(await g.ev("strokes.length"), 1, "a finger draws while unlocked");
await g.ev(drag(2, "pen", [[400, 400], [600, 500]]));
eq(await g.ev("[penLock, JSON.parse(localStorage.getItem('romp:prefs:v1')).penLock]"), [true, true],
   "the first Pencil ever turns the lock on by itself, and the iPad remembers");
await g.ev(drag(3, "touch", [[100, 600], [300, 800]]));
eq(await g.ev("[strokes.length, document.getElementById('penLock').classList.contains('nudge')]"), [2, true],
   "locked: a finger leaves no mark, and the lock button shakes to say why");
await g.ev("swallowUntil = 0; penLiftedAt = -1e9");
await g.click("#penLock");
eq(await g.ev("[penLock, JSON.parse(localStorage.getItem('romp:prefs:v1')).penLock]"), [false, false], "a tap on the button unlocks it");
await g.ev(drag(4, "pen", [[500, 100], [700, 200]]));
eq(await g.ev("penLock"), false, "once someone has chosen, the Pencil doesn't lock it again");
await g.ev(drag(5, "touch", [[100, 900], [300, 950]]));
eq(await g.ev("strokes.length"), 4, "unlocked: fingers and the Pencil both draw");
await g.click("#penLock");
const prefs = await g.ev("localStorage.getItem('romp:prefs:v1')");
g.close();
g = await boot(FILE, {storage: {"romp:prefs:v1": prefs}});
await g.ev("paused = true; openCard()");
eq(await g.ev("[penLock, document.getElementById('penLock').getAttribute('aria-pressed')]"), [true, "true"], "the lock survives a restart");
await g.ev(drag(1, "touch", [[100, 100], [300, 300]]));
eq(await g.ev("strokes.length"), 0, "and still keeps fingers off the pad");
g.close();

/* ---- Squiggle for two: one makes it, the other finishes it ---- */
g = await boot(FILE);
await g.ev("paused = true; openSqShelf()");
await g.click("#sqMake");
eq(await g.ev("[cardOpen, sqMake, sqMode, document.getElementById('done').textContent, colorIdx]"), [true, true, false, "Pass it on", 6],
   "'Make one for a friend' opens an empty pad that draws in graphite");
await g.ev(drag(1, "pen", [[200, 300], [400, 200], [500, 400]]));
await g.ev(drag(2, "pen", [[500, 400], [700, 600]]));
await g.ev(drag(3, "pen", [[300, 700], [350, 800]]));
await g.ev(drag(4, "pen", [[600, 800], [800, 850]]));
eq(await g.ev("[strokes.length, strokes.every(s => s.c === 6)]"), [3, true], "three lines at most, so it stays a squiggle");
await g.ev("document.getElementById('undo').click()");
await g.ev(drag(5, "pen", [[100, 100], [900, 100], [900, 900], [100, 900], [100, 150], [850, 150], [850, 850], [150, 850]]));
eq(await g.ev("inkOf(strokes) <= SQ_MAKE_INK + 40"), true, "and a little ink: a long line just stops");
await g.ev("document.getElementById('nameIn').value = 'Ana'");
await g.click("#done");
eq(await g.ev("[cardOpen, !document.getElementById('sqPass').hidden, document.getElementById('sqPassWho').textContent.includes('Ana')]"),
   [false, true, true], "'Pass it on' hides the pad and asks for the other player");
eq(await g.ev("onWorldDown({pointerId: 1, clientX: 600, clientY: 600}); grab"), null, "nothing behind the hand-off can be grabbed");
await g.click("#sqReady");
eq(await g.ev("[sqMode, sqBase.length, strokes.length, sqCurrent.by, colorIdx]"), [true, 3, 0, "Ana", 0],
   "'I'm ready' gives the other player Ana's squiggle to finish, in their own colours");
eq(await g.ev("document.getElementById('cardTitle').textContent.startsWith('Ana made you a squiggle')"), true, "the card says who made it");
await g.ev(drag(6, "pen", [[450, 450], [520, 520]]));
await g.click("#done");
eq(await g.ev("[sqData.drawings[0].by, sqData.drawings[0].seed, sqData.drawings[0].base.length]"), ["Ana", 0, 3], "kept in the gallery with Ana's squiggle");
eq(await g.ev("document.querySelector('#sqShelf .dby').textContent"), "squiggle by Ana", "its card says whose squiggle it was");
await g.ev("closeSqView()");
await g.click("#sqMake");
await g.ev(drag(7, "pen", [[300, 300], [600, 600]]));
await g.click("#cancel");
eq(await g.ev("[cardOpen, sqMake, sqOpen, colorIdx, sqCurrent]"), [false, false, true, 0, null], "'Never mind' goes back to the gallery and forgets it");
await g.ev("openSquiggle()");
await g.ev(drag(8, "pen", [[300, 300], [600, 600]]));
await g.ev("closeCard(); openSqShelf()");
await g.click("#sqMake");
eq(await g.ev("sqMake"), false, "with a drawing in progress, 'Make one for a friend' asks twice");
await g.click("#sqMake");
eq(await g.ev("sqMake"), true, "and the second tap goes ahead");
g.close();

const v1sq = JSON.stringify({v: 1, count: 1, current: null, drawings: [{id: "s1", name: "Old", seed: 5,
  base: [{c: 6, p: [100, 100, 120, 300, 300, 120]}], strokes: [{c: 1, p: [200, 200, 80, 400, 400, 80]}], made: 1, book: null}]});
g = await boot(FILE, {storage: {[SQ_KEY]: v1sq}});
eq(await g.ev("[sqReadOnly, sqData.drawings[0].by, sqData.drawings[0].name]"), [false, null, "Old"], "a v1 gallery loads, every squiggle the game's");
g.close();

process.exit(report("romp") ? 0 : 1);
