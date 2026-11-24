import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const GAMES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "games");
const FILE = path.join(GAMES, "hopper", "index.html");
const KEY = "hopper:state:v1";

/* ---- boot ---- */
let g = boot(FILE);
ok(g.errors.length === 0, "boots without error: " + g.errors.join(" | "));
ok(!!g.$("#machine") && !!g.$("#tapeBody") && !!g.$(".pad"), "machine, tape and pad rendered");
ok(g.ev("!!state.round && state.round.level === 1"), "a level-1 machine is waiting");
eq(g.all("#levelSeg .segb").length, 11, "eleven levels in the picker");
eq(g.all("#levelSeg .segb:disabled").length, 0, "every level can be picked from the start");
eq(g.all("#row3 i").length, 3, "three in-a-row dots");
eq(g.all("#row3 i.on").length, 0, "none filled yet");
ok(!/\b(add|take away|times|itself)\b/i.test(["#levelSeg", ".plate-head", ".tally", "#wall", "#band"].map(s => g.$(s).textContent).join(" ")),
   "nothing on screen says what kind of rule a level holds");

/* ---- the ladder ---- */
eq(g.ev("LEVELS.map(l => l.rules.length)"), [10, 9, 12, 9, 72, 11, 186, 14, 92, 59, 81], "rules per level");
eq(g.ev("LEVELS.filter(l => new Set(l.keys).size !== l.keys.length).length"), 0, "no rule twice in a level");
eq(g.ev(`LEVELS.flatMap(l => l.rules).flatMap(r => isSplit(r) ? [...r.even, ...r.odd] : r).filter(s =>
   (s.op === "add" || s.op === "sub") && s.n === 0 || (s.op === "mul" || s.op === "div") && (s.n === 0 || s.n === 1)).length`),
   0, "no dull rules: never add 0, take away 0, times or divide by 0 or 1");
eq(g.ev("LEVELS.map(l => l.jam)"), [false, true, false, false, false, false, false, false, false, false, false], "only level 2 jams below zero");

/* "itself" now means the number so far; no machine in levels 1-7 behaves differently */
eq(g.ev(`run(parseKey("add2,mulS"), 5, false)`), 49, "add 2, then times itself: 5 makes 49 (the voice-mode rule)");
eq(g.ev(`LEVELS.slice(0, 7).flatMap(l => l.rules).filter(r => Array.from({length:101}, (_, x) => x).some(x => {
   let v = x; for(const s of r) v = OPS[s.op].f(v, s.n === SELF ? x : s.n);
   return v !== run(r, x, false); })).length`), 0, "every machine in levels 1-7 does exactly what it did before");

/* the new levels */
eq(g.ev(`LEVELS.slice(7).map(l => l.rules.filter((a, i) => l.rules.some((b, j) => j > i && compare(a, b, l.jam, [], 100) === null)).length)`),
   [0, 0, 0, 0], "no two machines in levels 8-11 secretly do the same thing");
eq(g.ev(`L9.every(r => r.length === 3)`), true, "level 9 rules all have three steps");
eq(g.ev(`L11.every(r => isSplit(r))`), true, "level 11 rules all split even from odd");
eq(g.ev(`[0, 1, 2, 3, 4, 5].map(x => run(parseKey("sub3,mulS"), x, false))`), [9, 4, 1, 0, 1, 4], "take away 3, then times itself: falls to 0 and climbs back");
eq(g.ev(`[12, 7, 0].map(x => run(parseKey("div3"), x, false))`), [4, null, 0], "divide by 3: 12 makes 4, 7 jams, 0 makes 0");
eq(g.ev(`[3, 4].map(x => run(parseKey("add1,div2"), x, false))`), [2, null], "add 1, then divide by 2 jams on the even numbers");
eq(g.ev(`run(parseKey("sub5,div2"), 1, false)`), -2, "negatives divide too: 1 take away 5, divided by 2, is −2");
eq(g.ev(`run(parseKey("div0"), 5, false)`), null, "dividing by 0 jams");
eq(g.ev(`[6, 5].map(x => run(parseKey("even:div2;odd:mul3,add1"), x, false))`), [3, 16], "a split rule: 6 is halved, 5 becomes 16");
eq(g.ev(`sentence(parseKey("even:div2;odd:mul3,add1"))`), "Even numbers: divide by 2. Odd numbers: times 3, then add 1.", "a split rule reads back in two parts");
eq(g.ev(`[par(parseKey("add2,mulS")), par(parseKey("div5")), par(parseKey("even:div2;odd:add1"))]`), [3, 2, 4], "just enough clues: 3 for a square, 2 for a straight line, 2 for each half");
ok(g.ev(`compare(parseKey("div2,add1"), parseKey("add2,div2"), false, [], 20) === null`), "divide by 2 then add 1 is the same as add 2 then divide by 2, jams and all");
ok(g.ev(`compare(parseKey("add1,div2"), parseKey("div2,add1"), false, [], 20) !== null`), "...but not as add 1 then divide by 2, which jams elsewhere");

/* ---- running rules ---- */
eq(g.ev(`run(parseKey("mul2,add1"), 10, false)`), 21, "times 2 then add 1: 10 makes 21 (today's game)");
eq(g.ev(`run(parseKey("mulS,add1"), 8, false)`), 65, "times itself then add 1: 8 makes 65 (today's game)");
eq(g.ev(`run(parseKey("sub3"), 2, true)`), null, "take away 3 jams on 2 in level 2");
eq(g.ev(`run(parseKey("sub5"), 2, false)`), -3, "take away 5 makes -3 from 2 once negatives are in");
eq(g.ev(`LEVELS[1].rules.flatMap(r => Array.from({length:101}, (_, x) => run(r, x, true))).filter(y => y !== null && y < 0).length`),
   0, "a jamming machine never puts out a negative number");
eq(g.ev(`fmt(-3)`), "−3", "negatives print with a real minus sign");
eq(g.ev(`sentence(parseKey("mul2,add1"))`), "Times 2, then add 1.", "a rule reads back as a sentence");
eq(g.ev(`sentence(parseKey("mulS"))`), "Times itself.", "the square is 'times itself'");
eq(g.ev(`LEVELS.flatMap(l => l.keys).filter(k => ruleKey(parseKey(k)) !== k).length`), 0, "rule keys round-trip");

/* ---- the behaviour check ---- */
eq(g.ev(`compare(parseKey("mul2"), parseKey("addS"), false, [3], 20)`), null, "'add itself' is accepted for times 2");
eq(g.ev(`compare(parseKey("mulS,add1"), parseKey("mulS,add1"), false, [], 20)`),
   null, "a rule matches itself");
eq(g.ev(`compare(parseKey("mul2"), parseKey("add2"), false, [2], 20)`), 0,
   "'add 2' is refused for times 2 after only 2 → 4, and the counter-example is 0");
eq(g.ev(`compare(parseKey("mul2"), parseKey("add2"), false, [0, 1, 2], 20)`), 3,
   "the counter-example is the smallest untried number where they differ");
ok(g.ev(`compare(parseKey("add1,mul2"), parseKey("mul2,add1"), false, [], 20) !== null`), "order matters: add then times is not times then add");
eq(g.ev(`compare(parseKey("sub3"), parseKey("add1,sub4"), true, [], 20)`), null, "jams are compared too: add 1 take away 4 jams exactly where take away 3 does");
eq(g.ev(`compare(parseKey("sub3"), parseKey("sub4,add1"), true, [], 20)`), 3, "...but take away 4 then add 1 jams on 3, where take away 3 does not");
/* a cubic built from tiles can't sneak past: agree on 0, 1, 2 but not 3 */
ok(g.ev(`compare(parseKey("mulS"), parseKey("mulS,mulS"), false, [0, 1], 20) !== null`), "x² vs x³ are told apart");

/* ---- a round, through the real buttons ---- */
g.ev(`state.round.key = "add4"; state.round.tape = []; state.round.cranks = 0; paintAll()`);
ok(g.$("#know").disabled, "can't guess before the first crank");
g.click('.padk[data-k="3"]');
eq(g.$("#inNum").textContent.replace(/\D/g, ""), "3", "the pad types into the machine's In window");
g.click('.padk[data-k="go"]');
eq(g.ev("state.round.tape"), [{x:3, y:7, src:"crank"}], "3 goes in, 7 comes out, and the tape has it");
eq(g.ev("state.round.cranks"), 1, "one crank counted");
ok(/3/.test(g.$("#tapeBody").textContent) && /7/.test(g.$("#tapeBody").textContent), "the tape shows 3 → 7");
g.click('.padk[data-k="2"]'); g.click('.padk[data-k="5"]');
eq(g.ev("buf"), "2", "can't type past the biggest number (20)");
g.click('.padk[data-k="del"]');
eq(g.ev("crank(25)"), false, "the machine refuses a number over the limit");

/* a wrong guess that fits the tape: 3 → 7 is also "times 2, then add 1" */
g.click("#know");
eq(g.ev("mode"), "build", "I think I know opens the builder");
ok(g.$("#checkBtn").disabled, "can't check a rule that isn't finished");
g.click('.act[data-op="mul"][data-i="0"]');
g.click('.padk[data-k="2"]');
g.click("#addStep");
g.click('.act[data-op="add"][data-i="1"]');
g.click('.padk[data-k="1"]');
ok(g.$("#tape").classList.contains("with-yours"), "the tape grows a 'yours' column while building");
eq(g.$(".readback").textContent, "Times 2, then add 1.", "the builder reads the rule back");
ok(g.$("#tapeBody .yo.same"), "the 'yours' column shows the guess fits 3 → 7");
g.click("#checkBtn");
eq(g.ev("mode"), "feed", "a wrong guess goes back to cranking");
eq(g.ev("state.round.wrong"), 1, "the wrong guess is counted");
eq(g.ev("state.round.tape.at(-1)"), {x:0, y:4, src:"clue"}, "the machine adds its counter-example, 0 → 4, to the tape");
ok(/Your rule works for 3! But try 0: mine makes 4, yours makes 1\./.test(g.$("#band").textContent),
   "one clue isn't enough, and the band says why: " + g.$("#band").textContent);

/* the right guess */
g.click("#know");
g.click('.drop2[data-drop="1"]');
g.click('.act[data-op="add"][data-i="0"]');
g.click('.slot[data-slot="0"]'); g.click('.padk[data-k="clr"]'); g.click('.padk[data-k="4"]');
eq(g.$(".readback").textContent, "Add 4.", "the builder keeps the last guess to edit");
g.click("#checkBtn");
eq(g.ev("mode"), "verdict", "the right rule cracks it");
ok(g.ev(`!!state.wall["1|add4"]`), "its blueprint goes on the wall");
eq(g.ev(`state.wall["1|add4"].gold`), false, "no gold gear after a wrong guess");
ok(/Add 4\./.test(g.$("#wall").textContent), "the wall shows the cracked rule");
eq(g.ev("state.round.done"), true, "the round is over");

/* gold gear: cracked with just enough clues */
g.ev(`newRound(1); state.round.key = "add2"`);
g.ev("crank(5)"); g.ev("crank(6)");
g.ev(`checkGuess(parseKey("add2"))`);
eq(g.ev(`state.wall["1|add2"].gold`), true, "two cranks, no wrong guesses: gold gear");

/* three cracks in a row move you up, on their own */
eq(g.ev("state.streak"), 2, "two cracks in a row, though the first had a wrong guess on the way");
eq(g.all("#row3 i.on").length, 2, "two dots filled");
ok(/2 in a row\. One more moves you up to level 2/.test(g.$("#controls").textContent), "the verdict says one more moves you up");
eq(g.ev("state.level"), 1, "still level 1");
g.ev(`newRound(1); state.round.key = "add1"; crank(0); checkGuess(parseKey("add1"))`);
eq(g.ev("state.level"), 2, "the third crack in a row moves you up to level 2");
eq(g.ev("state.streak"), 0, "and the row starts again");
eq(g.all("#row3 i.on").length, 3, "the verdict shows the row full");
ok(/Three in a row! Next stop: level 2\./.test(g.$("#controls").textContent), "the verdict says where you're going");
ok(!g.$("#goLevel"), "nothing to pick: the next machine is already on level 2");
g.click("#nextBtn");
eq(g.ev("state.round.level"), 2, "Next machine is a level-2 machine");
ok(g.$('#levelSeg .segb[data-l="2"]').classList.contains("sel"), "the picker shows level 2");

/* equivalent spelling is accepted and named */
g.ev(`newRound(1); state.round.key = "add5"; crank(1)`);
g.ev(`checkGuess(parseKey("add2,add3"))`);
eq(g.ev("mode"), "verdict", "'add 2, then add 3' cracks an add-5 machine");
ok(/does exactly the same thing/.test(g.$("#controls").textContent), "and the verdict says the two do the same thing");

/* jams in level 2 */
g.ev(`newRound(2); state.round.key = "sub3"`);
g.ev("crank(2)");
eq(g.ev("state.round.tape.at(-1).y"), null, "2 jams a take-away-3 machine");
ok(/JAM/.test(g.$("#tapeBody").textContent), "the tape says JAM");

/* hints */
g.ev(`newRound(1); state.round.key = "add7"`);
g.click("#hintBtn");
ok(/Try 0/.test(g.$("#band").textContent), "hint 1 says try 0");
g.click("#hintBtn"); g.click("#hintBtn");
eq(g.ev("tapeView"), "gaps", "hint 3 turns on the gaps view");
ok(g.$("#hintBtn").disabled, "three hints, then no more");

/* show me: two taps, and it breaks the row */
g.ev(`newRound(1); state.round.key = "add9"; state.streak = 2; paintAll()`);
g.click("#showMe");
eq(g.ev("mode"), "feed", "one tap on Show me only asks again");
g.click("#showMe");
eq(g.ev("mode"), "verdict", "the second tap reveals the rule");
ok(/Add 9\./.test(g.$("#controls").textContent), "the rule is shown");
ok(!g.ev(`state.met[1].includes("add9")`), "a revealed rule goes back in the pool");
ok(!g.ev(`state.wall["1|add9"]`), "and wins no card");
eq(g.ev("state.streak"), 0, "Show me starts the row again");
ok(/in-a-row count starts again/.test(g.$("#controls").textContent), "and says so");

/* predicting */
g.ev(`setSetting("prove", "predict"); newRound(1); state.round.key = "add6"; crank(1)`);
g.click("#know");
eq(g.ev("mode"), "predict", "with predicting on, I think I know asks for predictions");
for(let i = 0; i < 2; i++){
  const x = g.ev("predict.x");
  eq(g.ev(`answerPredict(${x + 6})`), true, `prediction ${i + 1} is right`);
  ok(/Yes!/.test(g.$("#band").textContent), "a right prediction is cheered, and the next question asked");
}
const x3 = g.ev("predict.x");
ok(!g.ev("state.round.tape").slice(0, -2).some(t => t.x === x3), "the machine asks about a number not already on the tape");
g.ev(`answerPredict(${x3 + 6})`);
eq(g.ev("mode"), "verdict", "three right predictions crack it");
g.ev(`newRound(1); state.round.key = "add8"; crank(1)`);
g.click("#know");
g.ev(`answerPredict(-1)`);
eq(g.ev("mode"), "feed", "a wrong prediction goes back to cranking");
eq(g.ev("state.round.wrong"), 1, "and counts as a wrong guess");
g.ev(`setSetting("prove", "build")`);

/* the rule pool doesn't repeat until it's used up */
g.ev(`state.met[4] = []`);
const drawn = g.ev(`Array.from({length:9}, () => pickRule(4))`);
eq(new Set(drawn).size, 9, "nine draws from level 4 meet all nine rules before any repeats");

/* picking a level, any time */
g.ev(`state.streak = 2; paintAll()`);
g.click('#levelSeg .segb[data-l="6"]');
eq(g.ev("[state.round.level, state.level, state.streak]"), [6, 6, 0], "picking level 6 starts a level-6 machine, with the row at zero");
g.ev(`state.round.key = "mulS"; crank(3)`);
g.click('#levelSeg .segb[data-l="6"]');
eq(g.ev("state.round.cranks"), 1, "picking the level you're on doesn't throw the machine away");

/* level 7 isn't the top any more */
g.ev(`state.streak = 2; newRound(7); state.round.key = "add3"; crank(0); crank(1); checkGuess(parseKey("add3"))`);
eq(g.ev("state.level"), 8, "three in a row on level 7 moves up to level 8");
ok(/Next stop: level 8\./.test(g.$("#controls").textContent), "and says so");

/* the top level: three in a row and you stay */
g.ev(`state.streak = 2; newRound(11); state.round.key = "even:add1;odd:add2"; crank(0); crank(1); crank(2); crank(3); checkGuess(parseKey("even:add1;odd:add2"))`);
eq(g.ev("[state.level, state.streak]"), [11, 0], "three in a row on level 11 stays on level 11");
ok(/Three in a row on the top level!/.test(g.$("#controls").textContent), "and is still cheered");

/* level 9 through the real buttons: three steps */
g.ev(`newRound(9); state.round.key = "add1,mulS,add3"; crank(0); crank(1); crank(2)`);
g.click("#know");
g.click('.act[data-op="add"][data-i="0"]'); g.click('.padk[data-k="1"]');
g.click("#addStep"); g.click('.self[data-self="1"]'); g.click('.act[data-op="mul"][data-i="1"]');
g.click("#addStep"); g.click('.act[data-op="add"][data-i="2"]'); g.click('.padk[data-k="3"]');
ok(!g.$("#addStep"), "three steps, and no more");
eq(g.$(".readback").textContent, "Add 1, then times itself, then add 3.", "a three-step rule reads back");
g.click("#checkBtn");
eq(g.ev("mode"), "verdict", "add 1, times itself, add 3 cracks the level-9 machine");
eq(g.ev(`(state.wall["9|add1,mulS,add3"] || {}).gold`), true, "from three numbers: gold gear");

/* level 10: the Divide tile, and jams are free clues */
g.ev(`newRound(10); state.round.key = "div5"; crank(1); crank(2); crank(5); crank(10)`);
eq(g.ev("state.round.tape.map(t => t.y)"), [null, null, 1, 2], "divide by 5: 1 and 2 jam, 5 makes 1, 10 makes 2");
g.click("#know");
g.click('.act[data-op="div"][data-i="0"]'); g.click('.padk[data-k="5"]');
eq(g.$(".readback").textContent, "Divide by 5.", "the Divide tile");
g.click("#checkBtn");
ok(/Cracked in 4 cranks/.test(g.$("#controls").textContent), "four cranks in all");
eq(g.ev(`(state.wall["10|div5"] || {}).gold`), true, "but only two came out, so it's a gold gear: jams cost nothing");

/* level 11 through the real buttons: even and odd */
g.ev(`newRound(11); state.round.key = "even:div2;odd:add1"; [0, 1, 2, 3, 4].forEach(x => crank(x))`);
eq(g.ev("state.round.tape.map(t => t.y)"), [0, 2, 1, 4, 2], "even numbers halve, odd numbers add 1");
g.ev("state.round.hint = 2"); g.click("#hintBtn");
ok(/zigzags/.test(g.$("#band").textContent), "hint 3 sees the zigzag: " + g.$("#band").textContent);
eq(g.ev("tapeView"), "eo", "and turns on the even/odd view");
eq(g.all("#tapeBody .tgroup").map(e => e.textContent), ["Even numbers", "Odd numbers"], "the tape groups evens, then odds");
eq(g.all("#tapeBody .gap").map(e => e.textContent.replace(/\D/g, "")), ["1", "1", "2"], "with the gaps between numbers two apart");
g.click("#know");
g.click("#split");
eq(g.all(".lane").length, 2, "the builder splits into an even lane and an odd lane");
g.click('.act[data-op="div"][data-l="0"]'); g.click('.padk[data-k="2"]');
g.click('.act[data-op="add"][data-l="1"]'); g.click('.padk[data-k="1"]');
eq(g.$(".readback").textContent, "Even numbers: divide by 2. Odd numbers: add 1.", "the split rule reads back");
eq(g.all("#tapeBody .yo.diff").length, 0, "and fits the whole tape");
g.click("#unsplit");
eq(g.all(".lane").length, 0, "the split can be taken back");
eq(g.$(".readback").textContent, "Divide by 2.", "keeping the even half as the whole rule");
g.click("#split");
eq(g.$(".readback").textContent.includes("?"), false, "split again, the odd half starts empty");
g.click('.act[data-op="add"][data-l="1"]'); g.click('.padk[data-k="1"]');
g.click("#checkBtn");
eq(g.ev("mode"), "verdict", "the split rule cracks the level-11 machine");
eq(g.ev(`(state.wall["11|even:div2;odd:add1"] || {}).gold`), false, "five numbers, one more than just enough: no gold gear");

/* hint 3 reads the tape */
g.ev(`newRound(10); state.round.key = "div3"; crank(1); crank(2); crank(3); state.round.hint = 2; hint()`);
ok(/Jams are clues/.test(g.$("#band").textContent), "with jams on the tape, hint 3 talks about jams");
g.ev(`newRound(8); state.round.key = "sub3,mulS"; [0, 1, 2, 3].forEach(x => crank(x)); state.round.hint = 2; hint()`);
ok(/grow by the same amount each time \(2\)/.test(g.$("#band").textContent), "with a square, hint 3 sees the gaps grow by 2: " + g.$("#band").textContent);
eq(g.ev("tapeView"), "gaps", "and turns on the gaps view");

/* ---- saving ---- */
g.ev(`newRound(3); state.round.key = "sub5"; crank(2); crank(4)`);
g.ev(`setSetting("maxIn", 100)`);
eq(g.$("#maxSeg .sel").textContent, "Up to 100", "the setting shows after a repaint");
const saved = g.win.localStorage.getItem(KEY);
eq(JSON.parse(saved).v, 2, "the saved blob carries v");
g.close();

g = boot(FILE, {storage:{[KEY]:saved}});
ok(g.errors.length === 0, "reboots without error: " + g.errors.join(" | "));
eq(g.ev("state.round.key"), "sub5", "a round in progress comes back after a reload");
eq(g.ev("state.round.tape.map(t => t.y)"), [-3, -1], "with its tape: level 3 makes negatives, no jams");
eq(g.ev("state.maxIn"), 100, "settings survive a reload");
ok(/−3/.test(g.$("#tapeBody").textContent), "the tape shows −3");
g.ev(`state.prove = "predict"; iThinkIKnow()`);
ok(!!g.$('.padk[data-k="neg"]'), "from level 3 the prediction pad has a minus key");
g.close();

/* data from a newer build: play, never write */
const newer = JSON.stringify({v:99, level:1, open:1, wall:{"1|add4":{level:1, rule:"add4", best:2, gold:true, times:1, first:1}}, future:"keep me"});
g = boot(FILE, {storage:{[KEY]:newer}});
ok(g.errors.length === 0, "boots on newer data without error: " + g.errors.join(" | "));
eq(g.ev("readOnly"), true, "newer saved data makes the game read-only");
ok(!g.$("#roCard").hidden, "and it says so");
g.ev(`state.round.key = "add4"; crank(1)`);
eq(g.win.localStorage.getItem(KEY), newer, "nothing is written over newer data");
g.close();

/* garbage in storage must not wedge the game */
g = boot(FILE, {storage:{[KEY]:JSON.stringify({v:2, level:42, streak:40, prove:"telepathy", maxIn:7,
  round:{level:1, key:"nonsense", tape:"x"}})}});
ok(g.errors.length === 0, "boots on garbage without error: " + g.errors.join(" | "));
eq(g.ev("[state.level, state.streak, state.prove, state.maxIn]"), [11, 2, "build", 20], "bad settings are clamped to ones that exist");
ok(g.ev("LEVELS[10].keys.includes(state.round.key)"), "a broken round is replaced with a real one");
g.close();

/* data saved by the first build (v1, levels unlocked one by one) */
const v1 = JSON.stringify({v:1, level:3, open:3, prove:"predict", maxIn:100, sound:false, machines:9, met:{1:["add4"]},
  wall:{"1|add4":{level:1, rule:"add4", best:2, gold:true, times:1, first:1}},
  round:{level:3, key:"sub5", no:9, tape:[{x:2, y:-3, src:"crank"}], cranks:1, wrong:0, hint:0, done:false}});
g = boot(FILE, {storage:{[KEY]:v1}});
ok(g.errors.length === 0, "boots on v1 data without error: " + g.errors.join(" | "));
eq(g.ev("[state.v, state.open, state.streak, state.level]"), [2, undefined, 0, 3], "v1 data moves to v2: no more unlocking, row at zero, same level");
eq(g.ev("[state.prove, state.maxIn, state.sound, state.machines]"), ["predict", 100, false, 9], "settings and counts carry over");
ok(g.ev(`!!state.wall["1|add4"]`), "the wall carries over");
eq(g.ev("state.round.tape"), [{x:2, y:-3, src:"crank"}], "the round in progress carries over");
const after = JSON.parse(g.win.localStorage.getItem(KEY));
ok(after.v === 2 && !("open" in after), "and the upgraded shape is saved straight away");
g.close();

process.exit(report("hopper") ? 0 : 1);
