import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(HERE, "..", "..", "games", "patch");
const FILE = path.join(GAME, "index.html");
const KEY = "patch:state:v1";
const CLAIMS_TEXT = fs.readFileSync(path.join(GAME, "claims.json"), "utf8");
const NOTES = fs.readFileSync(path.join(HERE, "..", "..", "notes", "patch-sources.md"), "utf8");
const SW = fs.readFileSync(path.join(GAME, "sw.js"), "utf8");
const claimsData = JSON.parse(CLAIMS_TEXT);

/* ---- boot ---- */
let g = boot(FILE);
ok(g.errors.length === 0, "boots without error: " + g.errors.join(" | "));
ok(!!g.$(".brand") && !!g.$(".hero"), "home rendered: brand and hero");
eq(g.all("ol.lessons li").length, 5, "five lessons listed");
ok(g.ev(`setClaims(${CLAIMS_TEXT})`), "claims.json loads");
g.ev("render()");
ok(!!g.$(".hero q"), "a claim is offered on the home screen");

/* ---- the skin model ---- */
eq(g.ev("NODE_ORDER.length"), g.ev("Object.keys(NODES).length"), "every node is in NODE_ORDER");
g.ev(`go({s:"explore"})`);
eq(g.all(".skin [data-node]").map(n => n.dataset.node).sort(), g.ev("NODE_ORDER.slice().sort()"), "every node is drawn, once");
eq(g.all(".skin .lbl").length, g.ev("NODE_ORDER.length"), "every node has a name label");
ok(g.ev("Object.values(NODES).every(n => STATUS[n.status] && n.intuition && n.core && n.deeper)"), "every node has a status and three layers of text");
ok(g.all(".skin [data-node] .hit").length >= g.ev("NODE_ORDER.length"), "every node has something to tap");

/* ---- lessons ---- */
ok(g.ev(`LESSONS.every(l => l.nodes.every(n => NODES[n]))`), "every node a lesson names exists");
ok(g.ev(`LESSONS.flatMap(l => l.steps).filter(s => s.t === "choice").every(s => s.opts.filter(o => o.ok).length === 1 && s.opts.every(o => o.why))`),
   "every choice has exactly one answer, and every option explains itself");
ok(g.ev(`LESSONS.flatMap(l => l.steps).filter(s => s.t === "choice").every(s => !s.q.toLowerCase().includes(s.opts.find(o => o.ok).text.toLowerCase()))`),
   "no question contains its own answer");
ok(g.ev(`LESSONS.flatMap(l => l.steps).filter(s => s.t === "tap").every(s => s.answer.length && s.answer.every(n => NODES[n]) && Object.keys(s.notes || {}).every(n => NODES[n]))`),
   "every tap step's answers and notes name real nodes");
ok(g.ev(`Object.values(BRUSH).every(id => LESSON[id])`), "every brush-up points at a lesson");
eq(g.ev("CHAIN.length"), 8, "the chain has eight links");

/* a lesson, through the real buttons */
g.ev(`go({s:"lesson", id:"organ"})`);
g.click('[data-act="lnext"]');
g.click('.opt[data-k="0"]');
ok(!!g.$(".why") && !!g.$(".opt.right"), "a wrong pick shows why, and marks the right one");
g.click('[data-act="lnext"]');
ok(g.$("#check").disabled, "can't check a tap step before tapping");
g.$('.skin [data-node="keratinocytes"]').dispatchEvent(new g.win.MouseEvent("click", {bubbles:true}));
ok(!g.$("#check").disabled, "a tap enables Check");
g.click("#check");
ok(/no blood vessels/.test(g.$(".why").textContent), "tapping the epidermis explains it has no blood vessels");
g.click('[data-act="lnext"]');
g.click('.opt[data-k="1"]'); g.click('[data-act="lnext"]');
g.click('.opt[data-k="1"]'); g.click('[data-act="lnext"]');
ok(g.ev(`state.lessons.organ.done`), "lesson 1 finishes");
ok(/Lesson done/.test(g.$(".step").textContent), "the done screen shows");

/* ---- the barrier cartoon goes the right way ---- */
ok(g.ev(`simModel({lip:20, hum:50, harsh:0, occl:false}).loss > simModel({lip:90, hum:50, harsh:0, occl:false}).loss`), "damaged mortar loses more water");
ok(g.ev(`simModel({lip:90, hum:50, harsh:90, occl:false}).loss > simModel({lip:90, hum:50, harsh:0, occl:false}).loss`), "a harsh cleanser loses more water");
ok(g.ev(`simModel({lip:30, hum:50, harsh:0, occl:true}).loss < simModel({lip:30, hum:50, harsh:0, occl:false}).loss`), "an occlusive layer cuts water loss");
eq(g.ev(`simModel({lip:30, hum:50, harsh:0, occl:true}).irrit`), g.ev(`simModel({lip:30, hum:50, harsh:0, occl:false}).irrit`), "...but doesn't repair the mortar");
ok(g.ev(`simModel({lip:60, hum:90, harsh:0, occl:false}).loss < simModel({lip:60, hum:10, harsh:0, occl:false}).loss`), "humid air loses less water");

/* ---- claims ---- */
for(const c of claimsData.claims){
  ok(g.ev(`validClaim(${JSON.stringify(c)})`), `claim ${c.id} is valid`);
  eq(new Set(c.evidence.map(e => e.id)).size, c.evidence.length, `${c.id}: evidence ids are unique`);
  ok(c.evidence.every(e => !e.aside || g.ev(`!!ASIDES[${JSON.stringify(e.aside)}]`)), `${c.id}: every aside exists`);
  ok(Object.keys(c.nodes.notes || {}).every(n => g.ev(`!!NODES[${JSON.stringify(n)}]`)), `${c.id}: every node note names a real node`);
  ok(c.evidence.every(e => NOTES.includes(e.source.url)), `${c.id}: every evidence link is recorded in notes/patch-sources.md`);
  ok(c.evidence.every(e => e.year && e.found && e.catch), `${c.id}: every evidence item says what it found and the catch`);
  ok(["topical", "oral"].includes(c.route), `${c.id}: route is topical or oral`);
}
ok(!g.ev(`validClaim({id:"x", heard:"x", opens:"2026-01-01", precise:[{ok:true},{ok:true}]})`), "a claim with two right answers is refused");
ok(/claims\.json/.test(SW), "the service worker caches claims.json");

/* ---- an investigation, through the real buttons ---- */
g.ev(`go({s:"inv", id:"collagen-drinks"})`);
ok(g.$("#next").disabled, "step 1 waits for a source");
g.click('[data-act="field"][data-f="source"]');
ok(!g.$("#next").disabled, "picking a source enables Next");
g.click("#next");
g.click('[data-act="precise"][data-k="0"]');
ok(g.$("#next").disabled, "a vague rewrite doesn't let you on");
g.click('[data-act="precise"][data-k="1"]');
g.click("#next");
ok(g.$("#next").disabled && g.$("#bigN").textContent === "?", "confidence starts unset");
ok(!g.$(".slider .thumb"), "no thumb until the slider is touched");
g.ev(`setSlider($(".slider"), 70)`);
eq(g.$("#bigN").textContent, "70", "the slider sets the number");
g.click("#next");
g.click('[data-act="iprev"]');
eq(g.$(".slider").getAttribute("aria-disabled"), "true", "the first number is locked after moving on");
g.click("#next");
["capillary", "fibroblast", "stratum-corneum"].forEach(n => g.$(`.skin [data-node="${n}"]`).dispatchEvent(new g.win.MouseEvent("click", {bubbles:true})));
eq(g.ev(`tapPick.slice().sort()`), ["capillary", "fibroblast", "stratum-corneum"], "taps pick parts");
g.click('[data-act="nodescheck"]');
ok(/never touches the surface/.test(g.$(".why").textContent), "a wrong part gets its note");
ok(!g.$('.route[data-route="oral"]').hasAttribute("hidden") && g.$('.route[data-route="topical"]').hasAttribute("hidden"), "the oral route lights up, not the topical one");
g.click("#next");
for(let k = 0; k < 8; k++) g.click(`[data-act="rate"][data-k="${k}"][data-v="unclear"]`);
g.click('[data-act="chainshow"]');
eq(g.all(".chain .mine").length, 8, "our take shows for all eight links");
g.click("#next");
const nEv = claimsData.claims.find(c => c.id === "collagen-drinks").evidence.length;
for(let k = 0; k < nEv; k++){
  ok(g.$("#next").disabled, `evidence ${k + 1} waits for a reaction`);
  g.click('[data-act="evreact"][data-v="down"]');
  g.click("#next");
}
g.click('[data-act="field"][data-f="matters"]'); g.click("#next");
g.click("#next");                                  /* unknowns are optional */
ok(!!g.$(".slider .ghost"), "the first number shows as a ghost");
g.ev(`setSlider($(".slider"), 30)`); g.click("#next");
g.click('[data-act="field"][data-v="ajm-2025"]');
ok(g.$("#next").disabled, "a reason is required");
const typeIn = (sel, text) => { const t = g.$(sel); t.value = text; t.dispatchEvent(new g.win.Event("input", {bubbles:true})); };
typeIn("#belief", "The independent trials found nothing.");
g.click("#next");
typeIn("#changeMind", "An independent trial measuring wrinkles.");
g.click("#next");
g.click('[data-act="field"][data-f="decision"]');
typeIn("#verdict", "Collagen drinks: a bit for dryness, nothing for wrinkles.");
g.click("#next");
eq(g.ev("view.s"), "card", "saving opens the card");
ok(g.ev(`state.cards["collagen-drinks"].gold`), "moved 40 points and named the evidence: gold edge");
eq(g.ev(`[state.cards["collagen-drinks"].initial, state.cards["collagen-drinks"].updated]`), [70, 30], "the card keeps both numbers");
ok(g.ev(`!state.inv["collagen-drinks"]`), "the finished investigation is cleared");
eq(g.ev(`state.journal[0].kind`), "card", "the card lands in the journal");

/* ---- saved progress survives a reload ---- */
g.ev("save()");
const saved = g.win.localStorage.getItem(KEY);
g.close();
g = boot(FILE, {storage:{[KEY]:saved}});
ok(g.errors.length === 0, "reboots without error: " + g.errors.join(" | "));
eq(g.ev("view.s"), "card", "comes back to the screen it left");
ok(!!g.$(".card.gold"), "the card is still there, gold");
eq(g.ev("state.lessons.organ.done"), true, "lesson progress kept");
g.close();

/* ---- a newer build's data is never written over ---- */
g = boot(FILE, {storage:{[KEY]:JSON.stringify({v:99, cards:{}, future:true})}});
ok(g.ev("readOnly"), "newer saved data: read-only");
g.ev(`go({s:"journal"})`);
ok(JSON.parse(g.win.localStorage.getItem(KEY)).future === true, "and it stays as it was");
g.close();

/* ---- journal ---- */
g = boot(FILE);
g.ev(`go({s:"journal"})`);
const note = g.$("#note"); note.value = "Pores don't open and close."; note.dispatchEvent(new g.win.Event("input", {bubbles:true}));
g.click('[data-act="addnote"]');
eq(g.all(".entry").length, 1, "a note is saved");
ok(!!g.$('[data-act="shareentry"]'), "each entry can be shared with a parent");
g.close();

process.exit(report("patch") ? 0 : 1);
