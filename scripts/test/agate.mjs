import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const GAMES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "games");
const FILE = process.argv[2] || path.join(GAMES, "agate", "index.html");

/* ---------- 1. the deck invariant: every story is true of its own fact ---------- */
{
  const g = boot(FILE);
  ok(g.errors.length === 0, "boots without error: " + g.errors.join(" | "));

  const facts = g.ev("FACTS.map(f=>({key:f.key,a:f.a,b:f.b,p:f.p}))");
  eq(facts.length, 78, "deck is 78 facts");

  const bad = [];
  for (const f of facts) {
    const s = g.ev(`(function(){const s=storyFor(BY_KEY[${JSON.stringify(f.key)}]);
      return s?{n:s.n,v:s.v,unit:s.unit,say:s.say,ask:s.ask,note:s.note,when:s.when||null}:null})()`);
    if (!s) { bad.push(`${f.key}: no story`); continue; }
    if (s.n * s.v !== f.p) bad.push(`${f.key}: story is ${s.n}x${s.v}=${s.n*s.v}, fact is ${f.p}`);
    if (!s.say || !s.ask || !s.note || !s.unit) bad.push(`${f.key}: incomplete card`);
    if (!/[.!?]$/.test((s.say||"").trim())) bad.push(`${f.key}: say has no full stop — "${s.say}"`);
    /* the sum must be writable as the sentence orders it */
    if (!((s.n===f.a&&s.v===f.b)||(s.n===f.b&&s.v===f.a))) bad.push(`${f.key}: ${s.n}x${s.v} is not this fact's pair`);
    /* stability: the same fact must draw the same card every time */
    const again = g.ev(`storyFor(BY_KEY[${JSON.stringify(f.key)}]).say`);
    if (again !== s.say) bad.push(`${f.key}: story is not stable`);
  }
  ok(bad.length === 0, `all 78 cards sound (${bad.length} bad)
      ` + bad.slice(0,12).join("\n      "));

  /* The whole game is that you read the sentence to get the number. A sentence
     that already contains the number is a card that teaches nothing, so check
     every one of them for the answer in digits AND in words. */
  const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  const words = n => {
    if (n < 20) return [ONES[n]];
    if (n < 100) return [TENS[Math.floor(n/10)] + (n%10 ? "-" + ONES[n%10] : "")];
    const rest = n % 100, h = ONES[Math.floor(n/100)] + " hundred";
    return rest ? [h + " and " + words(rest)[0], h + " " + words(rest)[0]] : [h];
  };
  const leaks = [], noWhen = [], thin = [], seen = new Map();
  for (const f of facts) {
    const c = g.ev(`(function(){const s=CARDS[${JSON.stringify(f.key)}];
      return {say:s.say,ask:s.ask,note:s.note,when:s.when||null}})()`);
    const hay = (c.say + " " + c.ask).toLowerCase();
    /* The ones are exempt, and not as a concession: 1 x n IS n, so a sentence
       that names the count has named the answer, and a sentence that does not
       name the count cannot be answered at all with the sum hidden. Stating the
       number is what the ones table teaches. Every other row has both operands
       strictly below the product, so there naming them gives nothing away. */
    if (Math.min(f.a, f.b) > 1) {
      if (new RegExp(`\\b${f.p}\\b`).test(hay)) leaks.push(`${f.key}: "${c.say}" shows ${f.p}`);
      for (const w of words(f.p))
        if (hay.includes(w)) leaks.push(`${f.key}: "${c.say}" says "${w}" (= ${f.p})`);
    }
    if (!c.when) noWhen.push(f.key);
    if (!c.note || c.note.length < 40) thin.push(f.key);
    if (seen.has(c.say)) leaks.push(`${f.key}: same sentence as ${seen.get(c.say)}`);
    seen.set(c.say, f.key);
  }
  ok(leaks.length === 0, `no card gives its own answer away (${leaks.length})\n      ` + leaks.slice(0,10).join("\n      "));
  ok(noWhen.length === 0, "every card is dated: " + noWhen.join(", "));
  ok(thin.length === 0, "every card pays out a real note: " + thin.join(", "));

  /* Variety is the point of hand-writing all 78 — if they collapse onto a
     handful of sentence shapes we may as well have kept the generator. */
  const units = new Set(facts.map(f => g.ev(`CARDS[${JSON.stringify(f.key)}].unit`)));
  ok(units.size >= 12, `cards use many units, not a few — got ${units.size}`);
  eq(facts.filter(f => Math.min(f.a, f.b) === 1).length, 12,
     "exactly twelve facts are exempt from the leak rule, and they are the ones");
  g.close();
}

/* ---------- 2. the equation toggle ---------- */
{
  const g = boot(FILE);
  eq(g.ev("state.expr"), "hide", "fresh install hides the sum");
  eq(g.ev("state.story"), "always", "fresh install tells the story");
  ok(!g.$("#expr"), "no sum on the plate before an answer");
  ok(!!g.$("#mount .say"), "the sentence is there instead");
  ok(/From the card/.test(g.$("#prompt").textContent), "prompt points at the card, not a sum");

  g.ev(`setExpr("show")`);
  ok(!!g.$("#expr"), "showing the sum puts it back");
  ok(/×/.test(g.$("#expr").textContent), "and it reads as a product");

  g.ev(`setExpr("hide"); setStory("off")`);
  ok(!!g.$("#expr"), "with the story off the sum is forced back on");
  eq(g.all("#exprSeg .segb").filter(b=>b.disabled).length, 2, "and the toggle is disabled");
  ok(!g.$("#exprNote").hidden, "with a line saying why");

  g.ev(`setStory("reveal")`);
  ok(!!g.$("#expr"), "on reveal, the sum carries the question until the story lands");
  eq(g.all("#exprSeg .segb").filter(b=>b.disabled).length, 2, "toggle still disabled on reveal");

  g.ev(`setStory("always")`);
  eq(g.all("#exprSeg .segb").filter(b=>b.disabled).length, 0, "toggle live again with the story always up");
  ok(!g.$("#expr"), "and the sum goes back into hiding");
  g.close();
}

/* ---------- 3. collecting a card ---------- */
{
  const g = boot(FILE);
  const key = g.ev("current.fact.key"), p = g.ev("current.fact.p");
  eq(g.ev("collectedCount()"), 0, "nothing collected at the start");
  eq(g.$("#albN").textContent, "0", "rail count starts at zero");

  g.ev(`answer_(${p})`);
  eq(g.ev("collectedCount()"), 1, "a right answer collects the card");
  ok(!!g.$("#mount .newcard"), "and says so on the plate");
  ok(/1 of 78/.test(g.$("#mount .newcard").textContent),
     `the badge counts the card you just earned — got "${g.$("#mount .newcard").textContent}"`);
  ok(!!g.$("#mount .note"), "the payoff line is shown");
  ok(!!g.$("#expr"), "the sum appears with the answer");
  ok(/=/.test(g.$("#expr").textContent), "written out as an equation");
  eq(g.ev("advanceTimer"), null, "a new card does NOT rush off on a timer");
  ok(g.ev(`state.cards[${JSON.stringify(key)}].c > 0`), "the moment of collection is recorded");

  /* second time round the same fact is a repeat: it may advance on its own */
  g.ev("nextCard()");
  ok(!g.$("#mount .newcard"), "the badge is gone on the next card");
  g.close();
}

/* ---------- 4. a repeat advances, and does not re-collect ---------- */
{
  const g = boot(FILE);
  const key = g.ev("current.fact.key");
  const store = {}; store["agate:deck:v1"] = JSON.stringify({
    v:1, score:0, best:0, asked:1, cards:{[key]:{b:2,d:0,r:1,w:0,f:false,t:1200,c:1}},
    answerMode:"choice", bucket:"f:easy", story:"always"});
  g.close();

  const h = boot(FILE, {storage: store});
  eq(h.ev("collectedCount()"), 1, "a saved card is still collected after a reload");
  eq(h.ev("state.expr"), "hide", "a v1 blob with no expr field takes the new default");
  /* drive to that same fact and answer it right */
  h.ev(`current = {...current, fact: BY_KEY[${JSON.stringify(key)}]};
        current.story = storyFor(current.fact);
        current.options = makeOptions(current.fact); renderPlate();`);
  h.ev(`answer_(BY_KEY[${JSON.stringify(key)}].p)`);
  ok(!h.$("#mount .newcard"), "a repeat is not announced as new");
  eq(h.ev("collectedCount()"), 1, "and does not collect twice");
  ok(h.ev("advanceTimer !== null"), "a repeat does advance on its own");
  h.close();
}

/* ---------- 5. the album ---------- */
{
  const g = boot(FILE);
  ok(g.$("#album").hidden, "the sheet starts closed");
  g.click("#albOpen");
  ok(!g.$("#album").hidden, "the rail button opens it");
  eq(g.all("#albGrid .acard").length, 78, "78 tiles, collected or not");
  eq(g.all("#albGrid .acard.locked").length, 78, "all locked at the start");
  ok(/0 of 78/.test(g.$("#albCount").textContent), "header counts them");
  ok(!g.$("#albIntro").hidden, "an empty collection explains itself");

  /* a locked tile must not give the answer away */
  const locked = g.all("#albGrid .acard.locked").map(e=>e.textContent);
  ok(!locked.some(t=>/=/.test(t)), "locked tiles show no answer");

  g.click("#albClose");
  ok(g.$("#album").hidden, "close shuts it");

  /* collect one, then look again */
  const p = g.ev("current.fact.p");
  g.ev(`answer_(${p})`);
  g.click("#albOpen");
  eq(g.all("#albGrid .acard").length - g.all("#albGrid .acard.locked").length, 1, "one tile unlocked");
  const open = g.all("#albGrid .acard:not(.locked)")[0].textContent;
  ok(/=/.test(open), "an unlocked tile shows the sum and its answer");
  ok(open.trim().length > 40, "and the story with it");
  ok(/1 of 78/.test(g.$("#albCount").textContent), "count updated");
  ok(g.$("#albIntro").hidden, "the intro line steps aside once you have one");
  eq(g.all("#albGrid .acard").length, 78, "still all 78 on show");

  /* the sheet must swallow the drill's keys */
  const before = g.ev("state.asked");
  g.doc.dispatchEvent(new g.win.KeyboardEvent("keydown", {key:"1", bubbles:true}));
  eq(g.ev("state.asked"), before, "a keypress behind the sheet does not answer the question");
  g.doc.dispatchEvent(new g.win.KeyboardEvent("keydown", {key:"Escape", bubbles:true}));
  ok(g.$("#album").hidden, "escape closes it");
  g.close();
}

process.exit(report("agate") ? 0 : 1);
