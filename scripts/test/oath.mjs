import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const GAMES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "games");
const DIR = path.join(GAMES, "oath");
const FILE = process.argv[2] || path.join(DIR, "index.html");

/* Put a chosen president on the plate in a chosen shape, as pick() would. */
const force = (g, id, extra = "") => g.ev(`(function(){
  const p = BY_ID[${JSON.stringify(id)}];
  current = state.mode === "who" ? makeWho(p) : state.mode === "born" ? makeBorn(p) : makeTimeline(p);
  ${extra}
  hintUsed = false; justWon = []; justSealed = null; renderPlate(); return current.p.id; })()`);

/* ---------- 1. the deck ---------- */
{
  const g = boot(FILE);
  ok(g.errors.length === 0, "boots without error: " + g.errors.join(" | "));
  const P = g.ev(`PRESIDENTS.map(p=>({id:p.id, n:p.n, first:p.first, last:p.last, alias:p.alias||[],
    born:p.born, r:p.r, years:p.years}))`);
  eq(P.length, 45, "45 presidents");
  eq(new Set(P.map(p=>p.id)).size, 45, "45 different ids");

  const nums = P.flatMap(p=>p.n).sort((a,b)=>a-b);
  eq(nums, Array.from({length:47}, (_,i)=>i+1), "the numbers cover 1 to 47, each exactly once");
  eq(P.filter(p=>p.n.length===2).map(p=>p.id).sort(), ["cleveland","trump"],
     "exactly two people hold two numbers, and they are Cleveland and Trump");
  eq(P.map(p=>p.n[0]), P.map(p=>p.n[0]).slice().sort((a,b)=>a-b), "the deck is in order");

  /* Who Am I is worthless if the clue names its own answer. Check every clue
     for the surname anywhere (so "Reaganomics" counts), each real first name
     as a word (initials like the S. in Ulysses S. are not names), and every
     alias the record lists — the nicknames that are names, Teddy, Ike, Cal. */
  const leaks = [], shape = [], seen = new Map();
  for(const p of P){
    if(p.r.length !== 4) shape.push(`${p.id}: ${p.r.length} clues`);
    const words = [...p.first.split(/\s+/).filter(w => !/^[A-Z]\.$/.test(w)), ...p.alias];
    p.r.forEach((c, i) => {
      const tag = `${p.id} clue ${i+1}`;
      if(!c.say || !c.note || !c.when) shape.push(`${tag}: incomplete`);
      if(!/[.!?”"]$/.test(c.say.trim())) shape.push(`${tag}: no full stop — "${c.say}"`);
      if(c.note.length < 15) shape.push(`${tag}: thin note`);
      const hay = c.say.toLowerCase();
      if(hay.includes(p.last.toLowerCase())) leaks.push(`${tag} names "${p.last}": ${c.say}`);
      for(const w of words)
        if(new RegExp(`\\b${w.replace(/\./g,"\\.")}\\b`, "i").test(c.say)) leaks.push(`${tag} says "${w}": ${c.say}`);
      if(seen.has(c.say)) leaks.push(`${tag}: same clue as ${seen.get(c.say)}`);
      seen.set(c.say, tag);
    });
  }
  ok(shape.length === 0, `every clue is complete (${shape.length})\n      ` + shape.slice(0,10).join("\n      "));
  ok(leaks.length === 0, `no clue gives its own answer away (${leaks.length})\n      ` + leaks.slice(0,10).join("\n      "));

  /* Birthplaces: every one is a state the map can answer with. */
  const regions = g.ev("Object.keys(MAP.paths).filter(c=>!MAP.inert.includes(c))");
  eq(regions.length, 50, "the map has fifty answerable states");
  ok(regions.includes("AK") && regions.includes("HI"), "Alaska and Hawaii are on the map");
  const badSt = P.flatMap(p => [p.born.st, ...(p.born.alsoSt||[])].filter(s => !regions.includes(s)).map(s=>`${p.id}:${s}`));
  ok(badSt.length === 0, "every birth state is a real map region: " + badSt.join(", "));
  const badDate = P.filter(p => !/^\d{4}-\d\d-\d\d$/.test(p.born.date) || !p.born.town || !p.born.townLine);
  ok(badDate.length === 0, "every birthplace has a date, a town and a town card: " + badDate.map(p=>p.id).join(", "));
  /* A colony is named exactly when the birth came before the Declaration. */
  const colonyWrong = P.filter(p => !!p.born.colony !== (p.born.date < "1776-07-04"));
  ok(colonyWrong.length === 0, "colonies are named for exactly the presidents born before 1776: "
     + colonyWrong.map(p=>p.id).join(", "));
  eq(P.filter(p=>p.born.colony).length, 8, "eight presidents were born in colonies");

  /* Facts the clues and cards state that the deck itself can confirm. */
  const by = st => P.filter(p => p.born.st === st).length;
  eq(by("VA"), 8, "eight born in Virginia, as its state card says");
  eq(by("OH"), 7, "seven born in Ohio, as its state card says");
  eq(by("NH"), 1, "Pierce is the only president born in New Hampshire, as his clue says");
  const ohio = P.filter(p=>p.born.st==="OH").map(p=>+p.born.date.slice(0,4));
  ok(Math.min(...ohio) === 1822 && Math.max(...ohio) === 1865, "Ohio's seven were born between 1822 and 1865");
  const in1700s = P.filter(p => p.born.date < "1800");
  eq(in1700s[in1700s.length-1].id, "buchanan", "Buchanan was the last born in the 1700s");
  eq(P.filter(p => p.born.date.slice(5) === "07-04").map(p=>p.id), ["coolidge"], "only Coolidge born on the Fourth of July");
  eq(g.ev(`SPECIALS.map(s=>s.say.match(/^(\\w+)/)[1])`), ["Eight","Seven"], "the state cards' counts are written as checked above");

  /* Portraits: one per president, on disk, and in the service worker's list. */
  const missing = P.filter(p => !fs.existsSync(path.join(DIR, "portraits", p.id + ".jpg")));
  ok(missing.length === 0, "a portrait on disk for everyone: " + missing.map(p=>p.id).join(", "));
  const sw = fs.readFileSync(path.join(DIR, "sw.js"), "utf8");
  const listed = [...sw.matchAll(/"portraits\/([a-z]+)\.jpg"/g)].map(m=>m[1]);
  eq(listed, P.map(p=>p.id), "sw.js precaches exactly the 45 portraits, in order");
  const onDisk = fs.readdirSync(path.join(DIR, "portraits")).sort();
  eq(onDisk, P.map(p=>p.id+".jpg").sort(), "and nothing else sits in portraits/");
  g.close();
}

/* ---------- 2. Timeline ---------- */
{
  const g = boot(FILE);
  eq(g.ev("state.mode"), "timeline", "a fresh install opens on Timeline");
  eq(g.ev("state.bucket"), "r:10", "starting with No. 1 to No. 10");

  force(g, "lincoln", `current.dir="who"; current.n=16; current.win=[14,15,16,17,18]; current.options=whoOptions(current.p,16);`);
  eq(g.all("#strip .slot").length, 5, "the strip has five slots");
  ok(g.$("#strip .slot.target"), "the gap is marked");
  ok(!g.all("#strip img").length, "no faces in the strip before the answer — the neighbours are the wrong answers");
  const opts = g.ev("current.options.map(p=>p.id)");
  eq(opts.length, 4, "four portraits to choose from");
  ok(opts.includes("lincoln"), "the answer is among them");
  ok(/16th/.test(g.$("#mount .ask").textContent), "the question names the number as an ordinal");

  g.click(`#tiles [data-v="lincoln"]`);
  ok(g.ev("current.right"), "tapping Lincoln answers 16th correctly");
  eq(g.all("#strip img").length, 5, "the strip fills in with every face");
  ok(g.ev("!!state.won['lincoln:seat']"), "his portrait goes up on the wall");
  ok(/New portrait on the wall/.test(g.$("#mount .newcard").textContent), "and the plate says so");
  eq(g.ev("advanceTimer"), null, "a new card holds the plate until Next");
  ok(/after James Buchanan, before Andrew Johnson/.test(g.$("#mount .reveal").textContent), "the card names his neighbours");

  /* a repeat moves on by itself and collects nothing */
  g.click("#next");
  force(g, "lincoln", `current.dir="who"; current.n=16; current.win=[14,15,16,17,18]; current.options=whoOptions(current.p,16);`);
  g.click(`#tiles [data-v="lincoln"]`);
  ok(!g.$("#mount .newcard"), "a repeat is not announced");
  ok(g.ev("advanceTimer !== null"), "a repeat advances on its own");

  /* a miss */
  g.ev("nextCard()");
  force(g, "grant", `current.dir="num"; current.n=18; current.win=[16,17,18,19,20]; current.options=numOptions(current.p,18);`);
  ok(!/18/.test(g.$("#mount .sitter").textContent + g.$("#mount .ask").textContent),
     "the number question does not show the number beside the portrait");
  const wrong = g.ev("current.options.find(n=>n!==18)");
  g.click(`#choices [data-v="${wrong}"]`);
  ok(!g.ev("current.right"), "a wrong number is wrong");
  ok(g.$("#mount .stamp"), "and flagged");
  ok(!g.ev("state.won['grant:seat']"), "and wins nothing");
  ok(g.ev("state.decks.timeline.grant.f"), "Grant is flagged for review in Timeline");
  ok(/Grant/.test(g.$("#review").textContent), "and listed in the rail");
  eq(g.ev("advanceTimer"), null, "a miss waits for Next");

  /* two numbers, one person */
  for(let i = 0; i < 30; i++){
    const o = g.ev(`numOptions(BY_ID.cleveland, 22)`);
    if(o.includes(24)){ ok(false, "Cleveland's other number is never offered as a wrong answer"); break; }
  }
  force(g, "cleveland", `current.dir="num"; current.n=24; current.win=[22,23,24,25,26]; current.options=numOptions(current.p,24);`);
  ok(/the second time/.test(g.$("#mount .ask").textContent), "a two-term president is asked about one term at a time");
  g.click(`#choices [data-v="24"]`);
  ok(/Cleveland again/.test(g.$("#strip").textContent), "the strip shows him twice, the second time marked");

  /* drag mode: the numbered slots are the targets, and a tap on one answers */
  g.ev(`setAnswer("drag")`);
  force(g, "polk", `current.dir="num"; current.n=11; current.win=[9,10,11,12,13]; current.options=numOptions(current.p,11);`);
  eq(g.all("#strip .slot.drop").length, 5, "in drag mode every slot is a drop target");
  ok(g.$("#mount [data-drag]"), "and the portrait can be picked up");
  ok(!g.$("#choices"), "with no number buttons");
  g.click(`#strip .slot[data-k="11"]`);
  ok(g.ev("current.right"), "a tap on the right slot is a right answer");
  g.close();
}

/* ---------- 3. Who Am I ---------- */
{
  const g = boot(FILE);
  g.ev(`setMode("who")`);
  eq(g.ev("current.mode"), "who", "switching mode deals a Who Am I question");
  ok(g.$("#howBox").hidden && !g.$("#rungBox").hidden, "the rail shows the clue setting, not the answer style");

  force(g, "washington");
  eq(g.ev("current.rung"), 1, "a president you have never solved starts at the first clue");
  ok(g.$("#mount .cue"), "the clue is on the plate");
  ok(!/Washington/.test(g.$("#mount").textContent), "and does not name him");
  g.click(`#choices [data-v="washington"]`);
  ok(g.ev("!!state.won['washington:r1']"), "solving it wins the Famous card");
  ok(/Federal Hall/.test(g.$("#mount .reveal").textContent), "and the note pays out");

  g.ev("nextCard()");
  force(g, "washington");
  eq(g.ev("current.rung"), 2, "the next clue up opens once the one below is solved");
  g.ev(`state.won["washington:r2"]=1`);
  force(g, "washington");
  eq(g.ev("current.rung"), 3, "and the next");
  /* Clue 3 names John Adams. He must not be offered as the wrong answer. */
  for(let i = 0; i < 20; i++){
    const o = g.ev(`makeWho(BY_ID.washington)`);
    if(o.rung === 3 && o.options.some(q => q.id === "jadams")){ ok(false, "a president named in the clue is never a wrong answer"); break; }
  }
  eq(g.ev(`mentioned("I became president when Franklin Roosevelt died.", BY_ID.truman).map(p=>p.id)`),
     ["froosevelt"], "a shared surname needs the first name too — FDR is named, Theodore is not");

  g.ev(`setRung(1)`);
  force(g, "washington");
  eq(g.ev("current.rung"), 1, "capping at Famous keeps every question on the first clue");
  g.close();
}

/* ---------- 4. Born Where ---------- */
{
  const g = boot(FILE);
  g.ev(`setMode("born")`);
  ok(!g.$("#townBox").hidden, "the rail offers the town setting");
  ok(g.$("#map"), "the map is on the plate");
  eq(g.all("#map path").length, 51, "fifty states and the District");

  force(g, "lincoln");
  const opts = g.ev("current.options");
  eq(new Set(opts).size, 4, "four different states");
  ok(opts.includes("KY"), "Kentucky is among them");
  ok(!opts.includes("DC"), "the District is never offered");
  eq(g.all("#map path.m-live").length, 4, "with four choices, only those four light up");
  ok(/Lincoln/.test(g.$("#mount .ask").textContent), "the question names him");

  g.click(`#choices [data-v="KY"]`);
  ok(g.ev("!!state.won['lincoln:state']"), "the right state wins the birthplace card");
  eq(g.ev("current.stage"), "town", "with towns on, the town question follows");
  const towns = g.ev("current.towns");
  eq(new Set(towns).size, 4, "four different towns");
  ok(towns.includes("Hodgenville"), "Hodgenville among them");
  g.click(`#towns [data-town="Hodgenville"]`);
  ok(g.ev("!!state.won['lincoln:town']"), "the right town wins the town card");
  ok(/Sinking Spring/.test(g.$("#mount .reveal").textContent), "and the town line pays out");
  ok(g.$("#map path.m-ans"), "Kentucky is marked on the map");

  /* the disputed birthplace: both Carolinas count */
  g.ev("nextCard()");
  force(g, "jackson", `current.options = ["NC","SC","VA","GA"];`);
  g.click(`#choices [data-v="NC"]`);
  ok(g.ev("current.right"), "North Carolina counts for Jackson");
  ok(/Nobody is certain/.test(g.ev(`BY_ID.jackson.born.line`)), "and the card says why");
  for(let i = 0; i < 20; i++){
    if(g.ev(`makeBorn(BY_ID.jackson).options.filter(s=>s==="NC"||s==="SC").length`) !== 1){
      ok(false, "only one Carolina is ever offered for Jackson"); break; }
  }

  /* a wrong state: no town question, a stamp, nothing won */
  g.ev("nextCard()");
  force(g, "obama", `current.options = ["HI","CA","VA","OH"];`);
  g.click(`#choices [data-v="CA"]`);
  eq(g.ev("current.stage"), "done", "a wrong state ends the question");
  ok(g.$("#mount .stamp"), "and flags it");
  ok(g.$("#map path.m-miss"), "the miss is marked in red");

  /* drag mode lights all fifty, and a tap on any state answers */
  g.ev(`setAnswer("drag")`);
  force(g, "carter");
  eq(g.all("#map path.m-live").length, 50, "in drag mode every state is live");
  ok(!g.$("#choices"), "with no buttons");
  g.ev(`chooseState("GA")`);
  ok(g.ev("current.right"), "Georgia for Carter");

  g.ev(`setTown("off")`);
  g.ev("nextCard()");
  force(g, "carter");
  g.ev(`chooseState("GA")`);
  eq(g.ev("current.stage"), "done", "with towns off the state is the whole question");
  g.close();
}

/* ---------- 5. the wall, seals and state cards ---------- */
{
  const g = boot(FILE);
  ok(g.$("#album").hidden, "the wall starts closed");
  g.click("#albOpen");
  eq(g.all("#wall .wtile").length, 47, "forty-seven frames, one per number");
  ok(!g.$("#albIntro").hidden, "an empty wall explains itself");
  ok(g.all("#wall .wtile .nm").every(e => e.textContent.trim() === ""), "no names before anything is won");
  ok(!g.all("#wall img").length, "and no faces");
  g.click("#albClose");

  /* six of Lincoln's seven, then the seventh through play */
  g.ev(`["r1","r2","r3","r4","state","town"].forEach(k => state.won["lincoln:"+k] = 1)`);
  force(g, "lincoln", `current.dir="who"; current.n=16; current.win=[14,15,16,17,18]; current.options=whoOptions(current.p,16);`);
  g.click(`#tiles [data-v="lincoln"]`);
  eq(g.ev("justSealed && justSealed.id"), "lincoln", "the seventh card seals him");
  ok(/Sealed/.test(g.$("#mount .newcard").textContent), "and the plate says so");

  g.click("#albOpen");
  const t16 = g.$(`#wall .wtile:nth-child(16)`);
  ok(/Abraham Lincoln/.test(t16.textContent), "his frame now has his name");
  ok(t16.querySelector("img") && t16.querySelector(".seal"), "his portrait, and the seal");
  eq(g.$("#albN").textContent, "1", "one sealed in the rail");

  g.click(`#wall .wtile:nth-child(16)`);
  ok(!g.$("#detail").hidden, "tapping a frame opens that president");
  eq(g.all("#detail .acard").length, 7, "seven cards");
  eq(g.all("#detail .acard.locked").length, 0, "all of them open");
  g.doc.dispatchEvent(new g.win.KeyboardEvent("keydown", {key:"Escape", bubbles:true}));
  ok(g.$("#detail").hidden && !g.$("#album").hidden, "escape steps back to the wall first");

  /* a frame for someone not met shows nothing of them */
  g.click(`#wall .wtile:nth-child(3)`);
  eq(g.all("#detail .acard.locked").length, 7, "a president not met has seven closed cards");
  ok(!/Jefferson/.test(g.$("#detail").textContent), "and no name");

  /* the sheet must swallow the game's keys */
  const before = g.ev("state.asked");
  g.doc.dispatchEvent(new g.win.KeyboardEvent("keydown", {key:"1", bubbles:true}));
  eq(g.ev("state.asked"), before, "a keypress behind the wall does not answer the question");
  g.click("#albClose");

  /* every Virginian found -> Virginia's card */
  g.ev(`setMode("born")`);
  const va = g.ev(`PRESIDENTS.filter(p=>p.born.st==="VA").map(p=>p.id)`);
  g.ev(`${JSON.stringify(va.slice(0,-1))}.forEach(id => state.won[id+":state"] = 1)`);
  ok(!g.ev("state.won['state:VA']"), "seven of eight Virginians is not enough");
  force(g, va[va.length-1], `current.options = ["VA","NC","MD","OH"];`);
  g.click(`#choices [data-v="VA"]`);
  ok(g.ev("!!state.won['state:VA']"), "the eighth wins Virginia's state card");
  g.close();
}

/* ---------- 6. saving ---------- */
{
  const g = boot(FILE);
  g.ev(`setMode("born"); setBucket("e:founders"); setAnswer("drag"); setTown("off")`);
  g.ev(`state.won["washington:r1"] = 5`);
  g.ev("save()");
  const blob = g.ev(`localStorage.getItem("oath:deck:v1")`);
  ok(blob && JSON.parse(blob).v === 1, "saved under oath:deck:v1 with v inside");
  g.close();

  const h = boot(FILE, {storage:{"oath:deck:v1": blob}});
  eq(h.ev("[state.mode, state.bucket, state.answer, state.town]"), ["born","e:founders","drag","off"],
     "settings survive a reload");
  ok(h.ev("!!state.won['washington:r1']"), "and so does the collection");
  ok(h.ev("PRESIDENTS.filter(p=>p.n[0]<=6).some(p=>p.id===current.p.id)"), "the question comes from the saved era");
  h.close();

  const future = JSON.stringify({v:99, mode:"who", won:{"x:y":1}, decks:{}});
  const r = boot(FILE, {storage:{"oath:deck:v1": future}});
  ok(r.ev("readOnly"), "data from a newer build makes this one read-only");
  ok(!r.$("#roCard").hidden, "and it says so");
  r.ev("state.score = 500; save()");
  eq(r.ev(`localStorage.getItem("oath:deck:v1")`), future, "and it never writes over it");
  r.close();

  const junk = boot(FILE, {storage:{"oath:deck:v1": JSON.stringify({v:1, mode:"nope", bucket:"zzz", rung:9, decks:7})}});
  eq(junk.ev("[state.mode, state.bucket, state.rung]"), ["timeline","r:10",4], "unknown settings fall back rather than wedge");
  ok(junk.errors.length === 0, "and nothing throws: " + junk.errors.join(" | "));
  junk.close();
}

process.exit(report("oath") ? 0 : 1);
