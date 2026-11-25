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
const PRODUCTS_TEXT = fs.readFileSync(path.join(GAME, "products.json"), "utf8");
const productsData = JSON.parse(PRODUCTS_TEXT);

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
ok(!!g.doc.querySelector(".shower use"), "saving a card sets off a shower of bows and hearts");
ok(g.ev(`state.cards["collagen-drinks"].gold`), "moved 40 points and named the evidence: gold edge");
ok(!!g.$(".card.gold > .bow") && !g.$(".card > .sticker"), "a gold card gets the bow, not the patch");
ok(/#patch/.test(g.ev(`cardMark({gold:false})`)) && !/#bow/.test(g.ev(`cardMark({gold:false})`)), "a plain card gets the patch, not the bow");
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

/* ---- v1 data (before 24 Nov 2026) moves to v2 and keeps everything ---- */
g = boot(FILE, {storage:{[KEY]:JSON.stringify({v:1, lessons:{organ:{i:5, done:true, a:{}}}, cards:{x:{id:"x", title:"T", gold:true, initial:1, updated:9}}, journal:[{id:"j1", at:"2026-11-20", text:"hi"}]})}});
eq(g.ev("state.v"), 2, "v1 data migrates to v2");
ok(g.ev("state.lessons.organ.done && state.cards.x.gold && state.journal.length === 1"), "...keeping lessons, cards and journal");
eq(g.ev("state.prefs.read"), true, "reading aloud starts on");
ok(g.ev("typeof state.own.products === 'object' && typeof state.own.inv === 'object'"), "...and there's room for her own products");
g.close();

/* ---- reading aloud, with a stand-in voice ---- */
function fakeVoice(win){
  const said = [];
  const synth = {spoken:said, cancelled:0, speak(u){ said.push(u); }, cancel(){ this.cancelled++; }, getVoices(){ return []; }, addEventListener(){}};
  Object.defineProperty(win, "speechSynthesis", {value:synth, configurable:true});
  Object.defineProperty(win, "SpeechSynthesisUtterance", {value:function(t){ this.text = t; }, configurable:true});
  return synth;
}
g = boot(FILE);
const voice = fakeVoice(g.win);
g.ev("render()");
ok(!!g.$('[data-act="readpref"]'), "home has the Read to me switch");
eq(voice.spoken.length, 0, "home doesn't read itself out");
g.click('[data-act="lesson"][data-id="barrier"]');
ok(voice.spoken.length >= 3, "a lesson screen reads itself after a tap");
ok(/Bricks and mortar/.test(voice.spoken[0].text), "it starts with the heading");
voice.spoken[1].onstart();
ok(g.$(".reading") && /outermost layer/.test(g.$(".reading").textContent), "the paragraph being read is highlighted");
const before = voice.cancelled;
g.click('[data-act="speak"]');
ok(voice.cancelled > before && !g.$(".reading"), "the speaker button stops reading");
g.click('[data-act="lnext"]');
const n = voice.spoken.length;
g.click('.opt[data-k="0"]');
ok(voice.spoken.length > n && voice.spoken.slice(n).every(u => !/Predict/.test(u.text)), "after an answer, only the explanation is read");
const m = voice.spoken.length;
g.$(".why p").dispatchEvent(new g.win.MouseEvent("click", {bubbles:true}));
eq(voice.spoken.length, m + 1, "tapping a paragraph reads it again");
g.click('[data-act="home"]');
g.click('[data-act="readpref"]');
eq(g.ev("state.prefs.read"), false, "the switch turns reading off");
const k = voice.spoken.length;
g.click('[data-act="lesson"][data-id="organ"]');
eq(voice.spoken.length, k, "with it off, nothing is read");
g.close();

/* ---- lessons whose steps changed: finished stays finished, in-progress restarts ---- */
g = boot(FILE, {storage:{[KEY]:JSON.stringify({v:2, prefs:{read:false}, own:{products:{}, inv:{}},
  lessons:{change:{i:4, done:true, a:{1:"keratinocytes"}}, jar:{i:3, done:false, a:{1:1}}}})}});
g.ev(`go({s:"lesson", id:"change"})`);
ok(/Lesson done/.test(g.$("#app").textContent), "a finished lesson stays finished after a step is added");
eq(g.ev("state.lessons.change.rev"), 2, "...and records the lesson's new rev");
g.ev(`go({s:"lesson", id:"jar"})`);
eq(g.ev("[state.lessons.jar.i, Object.keys(state.lessons.jar.a).length]"), [0, 0], "a lesson in progress starts again");

/* ---- home: bows on finished lessons, Watch on two, the ribbon picker ---- */
g.ev(`go({s:"home"})`);
eq(g.all("ol.lessons .minibow").length, 1, "a finished lesson wears a little bow");
eq(g.all('.watchbtn').map(b => b.dataset.id), ["organ", "change"], "Watch is offered for lessons 1 and 3 only");
eq(g.all(".ribbon").length, 4, "four ribbon colors to choose from");
g.click('.ribbon[data-id="lilac"]');
eq(g.ev("state.prefs.ribbon"), "lilac", "picking a ribbon saves it");
eq(g.doc.documentElement.style.getPropertyValue("--bow"), "#B79BE3", "and the bows change color");
ok(g.all('.brand use, .hero use').every(u => u.getAttribute("href") === "#patch"), "the patch stays the mark beside the name");

/* ---- the cell journey and the drop test ---- */
g.ev(`state.lessons.change = {i:1, done:false, a:{}, rev:2}; go({s:"lesson", id:"change"})`);
ok(g.all("#journeyArt ellipse").length >= 12 && /Week 1/.test(g.$("#week").textContent), "the cell journey draws cells and a week counter");
ok(g.ev(`paintJourney(JOURNEY_MS * 0.8), /Week 4/.test($("#week").textContent)`), "late in the month it says week 4");
g.ev(`state.lessons.jar = {i:4, done:false, a:{}, rev:2}; go({s:"lesson", id:"jar"})`);
eq(g.ev(`LESSON.jar.steps[4].t`), "drop", "lesson 4 has the drop test");
g.click('.mol[data-id="collagen"]');
ok(Number(g.$('circle[data-mol="collagen"]').getAttribute("cy")) < 96, "collagen stays on top of the bricks");
ok(/300,000/.test(g.$("#dropSays").textContent), "and says why");
g.click('.mol[data-id="niacinamide"]');
ok(Number(g.$('circle[data-mol="niacinamide"]').getAttribute("cy")) > 122, "niacinamide gets through");
g.close();

/* ---- Watch: a narrated lesson, with a stand-in voice ---- */
g = boot(FILE);
const v2 = fakeVoice(g.win);
g.ev("render()");
g.click('.watchbtn[data-id="organ"]');
eq(g.ev("view.s"), "watch", "Watch opens");
eq(g.$("#caption").textContent, "Skin is an organ", "the first caption is the heading");
eq(v2.spoken.at(-1).text, "Skin is an organ", "and the voice says it");
const drain = () => { let guard = 0; while(guard++ < 40 && !g.ev("WT.waiting") && g.ev("WT.sent < WT.lines.length")) v2.spoken.at(-1).onend(); };
drain();
ok(g.ev("WT.sent >= WT.lines.length"), "it reads every sentence of the first part");
g.ev("advanceWatch()");
drain(); v2.spoken.at(-1).onend();
ok(g.ev("WT.waiting") && g.all("#ask .opt").length === 3, "it stops at the question and waits");
g.click('#ask .opt[data-k="1"]');
ok(/^Yes\./.test(v2.spoken.at(-1).text), "her answer gets its explanation, read aloud");
eq(g.ev("state.lessons.organ.a[1]"), 1, "the answer is saved to the lesson");
v2.spoken.at(-1).onend();
g.ev("advanceWatch()");
drain(); v2.spoken.at(-1).onend();
ok(g.ev("WT.waiting"), "it waits for a tap on the picture");
g.$('.skin [data-node="capillary"]').dispatchEvent(new g.win.MouseEvent("click", {bubbles:true}));
eq(g.ev("state.lessons.organ.a[2]"), "capillary", "the tap is saved");
ok(!!g.$(".skin .lbl.on"), "the tapped part is named");
for(let k = 0; k < 3; k++) g.click('[data-act="wnext"]');
ok(/That's the lesson/.test(g.$("#app").textContent) && g.ev("state.lessons.organ.done"), "the end of the video finishes the lesson");
g.click('[data-act="home"]');
eq(g.ev("view.s"), "home", "home again");
g.click('.watchbtn[data-id="change"]');
g.click('[data-act="wclick"]');
eq(g.ev("view.s"), "lesson", "Click through instead switches to the lesson");
g.close();

/* ---- the product database and the ingredient guide ---- */
g = boot(FILE);
ok(g.ev(`setProducts(${PRODUCTS_TEXT})`), "products.json loads and validates");
ok(productsData.ingredients.every(i => i.sources.every(s => NOTES.includes(s.url))), "every guide source is recorded in notes/patch-sources.md");
ok(productsData.products.every(p => NOTES.includes(p.source.url)), "every product's ingredient-list source is recorded too");
ok(NOTES.includes(productsData.patchTest.source.url), "and the patch-test source");
const akas = productsData.ingredients.flatMap(i => i.aka);
eq(new Set(akas).size, akas.length, "no label name points at two guide entries");
eq(g.ev(`findIng("Adapalene 0.1%").g.id`), "adapalene", "label names with a percentage match the guide");
eq(g.ev(`findIng("Aqua (Water)").kind`), "basic", "Aqua (Water) is a basic, not a mystery");
eq(g.ev(`findIng("Ceramide NP").g.id`), "ceramides", "each ceramide on a label finds the ceramides entry");
eq(g.ev(`findIng("Sodium Hyaluronate").g.id`), "hyaluronic-acid", "sodium hyaluronate is hyaluronic acid");
eq(g.ev(`findIng("Methylparaben").kind`), "unknown", "an ingredient the guide doesn't have says so");
ok(productsData.products.every(p => p.ingredients.some(r => g.ev(`findIng(${JSON.stringify(r)}).kind`) === "guide")), "every product has at least one ingredient the guide knows");

/* ---- looking up a product, through the real buttons ---- */
g.ev("render()");
g.click('[data-act="products"]');
eq(g.all("#plist .claimrow").length, productsData.products.length, "every product is listed");
const search = g.$("#psearch"); search.value = "ordinary"; search.dispatchEvent(new g.win.Event("input", {bubbles:true}));
eq(g.all("#plist .claimrow").length, 1, "search narrows the list");
g.click('#plist .claimrow');
eq(g.all(".ings .ing").length, 11, "the product's ingredients are chips");
ok(g.all(".ings .ing.guide").length >= 1, "ingredients in the guide are marked");
g.click('.ing[data-name="Niacinamide"]');
ok(/vitamin B3/.test(g.$(".panel").textContent) && g.all(".panel h3").length >= 2, "the guide shows what it is, how to use it and its sources");
ok(!!g.$(".skin.focus"), "and lights up where it acts");
g.ev(`go({s:"ing", pid:"the-ordinary-niacinamide-zinc", name:"Chlorphenesin"})`);
ok(/Not in Patch's guide yet/.test(g.$("#app").textContent) && g.all('a[href*="pubmed"]').length === 1, "an unknown ingredient says so and points to where to look");

/* ---- investigating one ingredient of her own ---- */
g.ev(`go({s:"ing", pid:"the-ordinary-niacinamide-zinc", name:"Niacinamide"})`);
g.click('[data-act="oinv"]');
eq(g.ev("view.s"), "oinv", "the investigation opens");
eq(g.$("#o-claim").value, productsData.products[2].claim, "the label's claim is filled in to start");
ok(g.$("#next").disabled, "it waits for where she heard it");
g.click('[data-act="ofield"][data-f="source"]');
g.click("#next");
const typeO = (sel, text) => { const el = g.$(sel); el.value = text; el.dispatchEvent(new g.win.Event("input", {bubbles:true})); };
typeO("#o-pWhat", "less oily skin"); typeO("#o-pLong", "8 weeks");
ok(/less oily skin, within 8 weeks, compared with not using it\./.test(g.$("#ownPrecise").textContent), "her precise claim is built as she types");
g.click("#next");
g.ev(`setSlider($(".slider"), 60)`); g.click("#next");
g.$('.skin [data-node="sebaceous"]').dispatchEvent(new g.win.MouseEvent("click", {bubbles:true}));
g.click('[data-act="onodes"]');
ok(/acts on/.test(g.$(".why").textContent), "her picks are compared with the guide");
g.click("#next");
ok(g.$("#next").disabled, "at least one source is needed");
typeO("#d-title", "The brand's page");
g.click('[data-act="odraft"][data-v="brand"]'); g.click('[data-act="osrcadd"]');
ok(/Climb the ladder/.test(g.$("#app").textContent), "only brand sources: a nudge to climb the evidence ladder");
typeO("#d-title", "Nicotinic acid/niacinamide and the skin, 2004 review");
g.click('[data-act="odraft"][data-v="review"]'); g.click('[data-act="odraft"][data-v="Independent"]'); g.click('[data-act="osrcadd"]');
eq(g.ev(`state.own.inv["the-ordinary-niacinamide-zinc|niacinamide"].f.sources.length`), 2, "two sources added");
ok(g.$("#next").disabled, "each source needs a reaction");
g.click('[data-act="osrceffect"][data-k="0"][data-v="same"]'); g.click('[data-act="osrceffect"][data-k="1"][data-v="down"]');
g.click("#next");
ok(/Patch-test it first/.test(g.$("#app").textContent) && /7 to 10 days/.test(g.$("#app").textContent), "Use it well explains the patch test");
g.click("#next");
g.ev(`setSlider($(".slider"), 35)`); g.click("#next");
g.click('[data-act="ofield"][data-v="s1"]');
typeO("#o-belief", "The review was about barrier and oil, not about breakouts."); typeO("#o-changeMind", "A trial in teens.");
g.click("#next");
g.click('[data-act="ofield"][data-f="decision"]'); typeO("#o-verdict", "Niacinamide: maybe less oily, not an acne fix.");
g.click("#next");
eq(g.ev("view.s"), "card", "her own card is saved");
const own = g.ev(`state.cards["own:the-ordinary-niacinamide-zinc|niacinamide"]`);
ok(own && own.own && own.gold && own.sources.length === 2, "it's hers, it keeps her sources, and a reasoned move earns gold");
ok(!!g.$('[data-act="copyreview"]'), "her card can be copied to send for review");
ok(/2\. Nicotinic acid.*Single|Review of many studies.*Independent/.test(g.ev(`reviewText(state.cards["own:the-ordinary-niacinamide-zinc|niacinamide"])`)), "the review text lists each source with its kind and who paid");

/* ---- adding a product she owns ---- */
g.ev(`go({s:"addprod"})`);
ok(g.$("#next").disabled, "a product needs a name and ingredients");
typeO("#ap-name", "Glow Toner"); typeO("#ap-ings", "Water, Glycolic Acid, Fragrance.");
ok(!g.$("#next").disabled, "then it can be saved");
g.click("#next");
eq(g.ev("view.s"), "product", "it opens straight away");
eq(g.all(".ings .ing").length, 3, "its ingredients are split at the commas");
eq(g.all(".ings .ing.guide").length, 2, "glycolic acid and fragrance are in the guide");
ok(!!g.$('[data-act="copyproduct"]'), "it can be copied for Patch's product list");
g.close();

/* ---- a newer build's data is never written over ---- */
g = boot(FILE, {storage:{[KEY]:JSON.stringify({v:99, cards:{}, future:true})}});
ok(g.ev("readOnly"), "newer saved data: read-only");
g.ev(`go({s:"journal"})`);
ok(JSON.parse(g.win.localStorage.getItem(KEY)).future === true, "and it stays as it was");
g.close();

/* ---- journal ---- */
g = boot(FILE);
eq(g.all(".brand use, .hero use").map(u => u.getAttribute("href")), ["#patch", "#patch"], "home wears the patch, not the bow");
g.ev(`go({s:"journal"})`);
const note = g.$("#note"); note.value = "Pores don't open and close."; note.dispatchEvent(new g.win.Event("input", {bubbles:true}));
g.click('[data-act="addnote"]');
eq(g.all(".entry").length, 1, "a note is saved");
ok(!g.$('[data-act="shareentry"]') && !/parent/i.test(g.$("#app").textContent), "no 'share with a parent' button (she asked for it gone)");
ok(!!g.$('[data-act="copyall"]'), "the whole journal can still be copied");
g.close();

process.exit(report("patch") ? 0 : 1);
