import { boot, ok, eq, report } from "./harness.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const GAMES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "games");
const DIR = path.join(GAMES, "lark");
const FILE = path.join(DIR, "index.html");
const KEY = "lark:prefs:v1";

/* No microphone here, so the ear is tested with made-up voices: a synthesizer
   that hums like a person does, with harmonics stronger than the fundamental,
   vibrato, slides between notes, a dip in volume between repeated notes,
   breath noise, and the odd octave slip. It runs inside the page, through the
   same detect() and splitNotes() the iPad runs. Every call is awaited so this
   suite also runs under a browser-backed rig. */
const SYNTH = `
window.__rng = (() => { let s = 12345; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; })();
window.__hum = function(notes, o = {}){
  const sr = o.sr || 48000, harm = o.harm || [0.6, 1, 0.5, 0.3, 0.15];
  const vib = o.vib === undefined ? 0.25 : o.vib, glide = o.glide === undefined ? 0.06 : o.glide;
  const dips = o.dips !== false, noise = o.noise === undefined ? 0.01 : o.noise;
  const lead = 0.3, tail = 0.4;
  const total = lead + notes.reduce((a, n) => a + n[1], 0) + tail;
  const out = new Float32Array(Math.ceil(total * sr));
  let ph = 0, t0 = lead, prev = notes[0][0];
  const starts = notes.map(n => { const s = t0; t0 += n[1]; return s; });
  for(let i = 0; i < out.length; i++){
    const t = i / sr;
    let k = -1;
    for(let q = 0; q < notes.length; q++) if(t >= starts[q] && t < starts[q] + notes[q][1]) k = q;
    let amp = 0, m = prev;
    if(k >= 0){
      const [mm, len] = notes[k], st = starts[k], into = t - st;
      const from = k > 0 ? notes[k - 1][0] : mm;
      m = into < glide ? from + (mm - from) * into / glide : mm;
      if(o.drift && into > 0) m += o.drift * into / len;
      m += vib * Math.min(1, into / 0.2) * Math.sin(2 * Math.PI * 5.5 * t);
      amp = Math.min(1, into / 0.04);
      const next = notes[k + 1];
      const dipHere = dips && next && (Math.abs(next[0] - mm) < 0.5 || o.dipAll);
      if(dipHere && len - into < 0.07) amp *= 0.12;
      if(!next && len - into < 0.06) amp *= (len - into) / 0.06;
      prev = m;
    }
    ph += 2 * Math.PI * 440 * Math.pow(2, (m - 69) / 12) / sr;
    let v = 0;
    for(let h = 0; h < harm.length; h++) v += harm[h] * Math.sin((h + 1) * ph);
    out[i] = 0.12 * amp * v + noise * (window.__rng() * 2 - 1);
  }
  return out;
};
window.__frames = function(sig, sr = 48000, slip){
  const N = 2048, hop = 800, fr = [];
  for(let s = 0; s + N <= sig.length; s += hop){
    const f = detect(sig.subarray(s, s + N), sr);
    f.t = (s + N) / sr;
    fr.push(f);
  }
  if(slip) for(const i of slip) if(fr[i] && fr[i].hz > 0) fr[i] = {...fr[i], hz: fr[i].hz * 2};
  return fr;
};
window.__tone = function(hz, secs = 0.1, sr = 48000, harm = [1]){
  const out = new Float32Array(Math.ceil(secs * sr));
  for(let i = 0; i < out.length; i++){ let v = 0; for(let h = 0; h < harm.length; h++) v += harm[h] * Math.sin(2 * Math.PI * hz * (h + 1) * i / sr); out[i] = 0.2 * v; }
  return out;
};
window.__notes = (notes, o = {}, k) => splitNotes(__frames(__hum(notes, o), o.sr || 48000, o.slip), k || state.knobs).map(n => Math.round(n.midi * 100) / 100);
true;`;

/* ---- boot ---- */
let g = await boot(FILE);
const quiet = errs => errs.filter(e => !/getContext|Not implemented: HTMLCanvasElement/i.test(e));
ok(quiet(g.errors).length === 0, "boots without error: " + quiet(g.errors).join(" | "));
eq(await g.ev(`["#micBtn","#freeBtn","#playBtn","#againBtn","#trace","#diag","#copyBtn"].every(s => !!document.querySelector(s))`), true, "mic, listen, play, trace, diagnostics and copy are on the page");
eq(await g.ev(`document.querySelectorAll("#tunes .chip").length`), 5, "five tunes to try");
eq(await g.ev(`document.querySelectorAll("#knobList input[type=range]").length`), 6, "six tuning knobs");
eq(await g.ev(`[mic.on, mode, mic.turnOns]`), [false, "idle", 0], "the mic is not asked for until a tap");
eq(await g.ev(`document.querySelector("#tunes [aria-pressed=true]").dataset.tune`), "rain", "Rain, rain is picked to start");
ok(/Home-screen app/.test(await g.ev(`document.querySelector("#diag").textContent`)), "diagnostics rendered");
await g.ev(SYNTH);

/* ---- tunes ---- */
eq(await g.ev(`TUNES.every(t => t.notes.length >= 4 && t.notes.every(([m, b]) => m >= 55 && m <= 79 && b > 0))`), true, "every tune is a short phrase in a child's range");
eq(await g.ev(`TUNES.find(t => t.id === "rain").notes.map(n => n[0])`), [67, 67, 64, 69, 67, 64], "Rain, rain is sol sol mi la sol mi");
eq(await g.ev(`new Set(TUNES.map(t => t.id)).size`), 5, "tune ids are unique");

/* ---- pitch per frame ---- */
const cents = (a, b) => Math.abs(1200 * Math.log2(a / b));
let r = await g.ev(`detect(__tone(220, 0.0427), 48000)`);
ok(cents(r.hz, 220) < 5 && r.c > 0.95, `a 220 Hz tone reads 220 Hz, clearly (got ${r.hz.toFixed(1)}, ${r.c.toFixed(2)})`);
r = await g.ev(`detect(__tone(110, 0.0427, 48000, [0.6, 1, 0.5, 0.3]), 48000)`);
ok(cents(r.hz, 110) < 10, `a hum whose second harmonic is louder than its fundamental still reads 110 Hz, not 220 (got ${r.hz.toFixed(1)})`);
r = await g.ev(`detect(__tone(82, 0.0427, 48000, [0.5, 1, 0.6]), 48000)`);
ok(cents(r.hz, 82) < 10, `a low adult hum at 82 Hz (got ${r.hz.toFixed(1)})`);
r = await g.ev(`detect(__tone(1760, 0.0427), 48000)`);
ok(cents(r.hz, 1760) < 10, `a whistle at 1760 Hz (got ${r.hz.toFixed(1)})`);
r = await g.ev(`detect(__tone(330, 0.0465, 44100).subarray(0, 2048), 44100)`);
ok(cents(r.hz, 330) < 5, `the same at 44.1 kHz (got ${r.hz.toFixed(1)})`);
r = await g.ev(`(() => { const a = new Float32Array(2048); for(let i = 0; i < a.length; i++) a[i] = 0.2 * (__rng() * 2 - 1); return detect(a, 48000); })()`);
ok(r.c < 0.6, `breath noise is not clear (clarity ${r.c.toFixed(2)})`);
eq(await g.ev(`detect(new Float32Array(2048), 48000).hz`), 0, "silence has no pitch");
ok(await g.ev(`Math.abs(midiOf(440) - 69) < 1e-9 && Math.abs(hzOf(60) - 261.6256) < 1e-3`), "A4 is 69, middle C is 261.6 Hz");
eq(await g.ev(`[nameOf(60), nameOf(69), nameOf(70), nameOf(66.4), nameOf(48)]`), ["C4", "A4", "B♭4", "F♯4", "C3"], "note names");

/* ---- notes from a hum ---- */
const near = (got, want, tol = 0.3) => got.length === want.length && got.every((v, i) => Math.abs(v - want[i]) <= tol);
const RAIN = [[67,.5],[67,.5],[64,1],[69,.5],[67,.5],[64,1]];
const down = (ns, d) => ns.map(([m, s]) => [m + d, s]);
let got = await g.ev(`__notes(${JSON.stringify(down(RAIN, -7))})`);
ok(near(got, [60, 60, 57, 62, 60, 57]), `Rain, rain hummed low, with vibrato and slides: six notes, the repeated ones apart (got ${got})`);
got = await g.ev(`__notes(${JSON.stringify(down(RAIN, 12))}, {harm:[1, 0.05], vib:0.1})`);
ok(near(got, [79, 79, 76, 81, 79, 76]), `the same whistled an octave up (got ${got})`);
got = await g.ev(`__notes(${JSON.stringify(RAIN)}, {sr:44100})`);
ok(near(got, [67, 67, 64, 69, 67, 64]), `the same at 44.1 kHz (got ${got})`);
got = await g.ev(`__notes([[62,.6],[64,.6],[62,.6]], {glide:0.15})`);
ok(near(got, [62, 64, 62]), `slow 150 ms slides between notes don't become notes (got ${got})`);
got = await g.ev(`__notes([[60,1.2]], {drift:0.6})`);
ok(near(got, [60.3], 0.35), `a long note that drifts 60 cents flat-to-sharp is still one note (got ${got})`);
got = await g.ev(`__notes([[64,.5],[62,.5],[60,1]], {slip:[20, 21, 45]})`);
ok(near(got, [64, 62, 60]), `octave slips in the detector don't add notes (got ${got})`);
got = await g.ev(`__notes([[60,.5],[60,.5]], {dips:false})`);
eq(got.length, 1, "two same notes sung with no break between them are one note (a known limit: hum a new 'mm')");
got = await g.ev(`__notes([[60,.5],[61,.5],[60,.5]])`);
ok(near(got, [60, 61, 60]), `a semitone step is two notes (got ${got})`);
got = await g.ev(`__notes([[64,.5],[62,.5],[60,1]], {noise:0.05})`);
ok(near(got, [64, 62, 60]), `a noisy room (got ${got})`);
got = await g.ev(`__notes([[60, .06], [64, .5]])`);
ok(near(got, [64]), `a 60 ms blip is too short to be a note (got ${got})`);
eq(await g.ev(`splitNotes([], state.knobs).length`), 0, "no frames, no notes");

/* ---- matching ---- */
let m = await g.ev(`match([67,67,64,69,67,64], [60,60,57,62,60,57], 60)`);
eq([m.right, m.extras, Math.round(m.offset), m.intervalsRight], [6, 0, -7, 5], "the right tune, seven semitones down: all right, in any key");
m = await g.ev(`match([67,67,64,69,67,64], [60,60,57,64,60,57], 60)`);
eq(m.notes.map(x => x.status), ["ok","ok","ok","off","ok","ok"], "one note too high is that note, not the whole tune");
ok(m.notes[3].err > 1.5, "and it is marked high");
eq(m.intervalsRight, 3, "the two steps around it are wrong, the other three right");
m = await g.ev(`match([67,67,64,69,67,64], [60,60,57,60,57], 60)`);
eq([m.notes.filter(x => x.status === "missed").length, m.right, m.extras], [1, 5, 0], "a missed note is one missed, five right");
m = await g.ev(`match([64,62,60], [64,63,62,60], 60)`);
eq([m.right, m.extras], [3, 1], "an extra note in a slide is an extra, the tune still right");
m = await g.ev(`match([60,60,67,67,69,69,67], [72.2,72.1,79.3,79,81.4,80.9,79.2], 60)`);
eq([m.right, Math.round(m.offset)], [7, 12], "Twinkle whistled an octave up, a little sharp, is all right");
m = await g.ev(`match([64,62,60], [], 60)`);
eq(m.notes.map(x => x.status), ["missed","missed","missed"], "nothing heard: all missed");
m = await g.ev(`match([64,62,60], [60,62,64], 60)`);
ok(m.right < 3, "the tune upside down is not the tune");
m = await g.ev(`match([64,62,60], [64.9,63,61], 60)`);
eq(m.notes.map(x => x.status), ["ok","ok","ok"], "a hum that is 0.9 off in key throughout is right: only the shape counts");
m = await g.ev(`match([64,62,60], [64,62.9,60], 60)`);
eq(m.notes[1].status, "close", "a note 90 cents out is close at a 60-cent tolerance");

/* ---- the whole ear, end to end ---- */
const TWINKLE = [[60,.45],[60,.45],[67,.45],[67,.45],[69,.45],[69,.45],[67,.9]];
m = await g.ev(`(() => { const s = __notes(${JSON.stringify(down(TWINKLE, 5).map(([a, b], i) => [i === 4 ? a - 0.3 : a, b]))}); return match(TUNES.find(t => t.id === "twinkle").notes.map(n => n[0]), s, state.knobs.tolCents); })()`);
eq([m.right, m.extras, m.notes.filter(x => x.status === "missed").length], [7, 0, 0], "Twinkle hummed five semitones up, one note 30 cents flat: seven of seven");
const MARY = [[64,.6],[62,.2],[60,.4],[62,.4],[64,.4],[64,.4],[64,.8]];
m = await g.ev(`(() => { const s = __notes(${JSON.stringify(down(MARY, -12))}); return match([64,62,60,62,64,64,64], s, state.knobs.tolCents); })()`);
eq([m.right, m.extras], [7, 0], "Mary hummed an octave down, with its short second note and three repeats");

/* ---- a take, as the screen shows it ---- */
await g.ev(`(() => {
  const sig = __hum(${JSON.stringify(down(RAIN, -3))});
  lastTake = {kind:"tune", tune:"rain", frames:__frames(sig), t0:0};
  analyseTake(lastTake); renderTakeOut(lastTake); return true; })()`);
let txt = await g.ev(`document.querySelector("#tuneOut").textContent`);
ok(/6 of 6/.test(txt) && /3 semitones lower/.test(txt) && /any key counts/.test(txt), "the verdict says 6 of 6 and that a lower key is fine: " + txt.slice(0, 160));
eq(await g.ev(`document.querySelectorAll("#tuneOut svg circle").length`), 12, "rings for the tune, dots for the hum");
let js = JSON.parse(await g.ev(`takeJson(lastTake)`));
ok(js.app === "lark-mic-check" && js.frames.length > 100 && js.frames[0].length === 4 && js.notes.length === 6 && js.result.right === 6,
   "Copy the last take gives frames, notes and the score, as numbers");
ok(!/data:audio|base64/.test(JSON.stringify(js)), "the copied take holds no sound");
await g.ev(`(() => { lastTake = {kind:"free", frames:__frames(__hum([[60,.5],[64,.5],[67,.8]])), t0:0}; analyseTake(lastTake); renderTakeOut(lastTake); return true; })()`);
eq(await g.ev(`[...document.querySelectorAll("#freeOut .note")].map(n => n.firstChild.textContent)`), ["C4", "E4", "G4"], "Hum anything lists the notes by name");
await g.ev(`(() => { lastTake = {kind:"tune", tune:"buns", frames:__frames(__hum([[76,.5],[74,.5],[72,1]], {harm:[1,.05]})), t0:0}; analyseTake(lastTake); renderTakeOut(lastTake); return true; })()`);
ok(/1 octave higher/.test(await g.ev(`document.querySelector("#tuneOut").textContent`)), "an octave up is called an octave");

/* ---- knobs re-score the last take ---- */
await g.ev(`(() => { lastTake = {kind:"free", frames:__frames(__hum([[64,.6],[62,.2],[60,.6]])), t0:0}; analyseTake(lastTake); renderTakeOut(lastTake); return true; })()`);
eq(await g.ev(`lastTake.notes.length`), 3, "a take with a 0.2 s note in it: three notes");
await g.ev(`(() => { const el = document.querySelector("#k_minNoteMs"); el.value = 300; el.dispatchEvent(new Event("input", {bubbles:true})); el.dispatchEvent(new Event("change", {bubbles:true})); return true; })()`);
eq(await g.ev(`state.knobs.minNoteMs`), 300, "a knob changes its setting");
eq(await g.ev(`lastTake.notes.length`), 2, "and the last take is split again with it: the 0.2 s note is now too short");
eq(JSON.parse(await g.ev(`localStorage.getItem("${KEY}")`)).knobs.minNoteMs, 300, "knobs are saved");
await g.click("#resetKnobs");
eq(await g.ev(`state.knobs.minNoteMs`), 110, "Put them back restores the defaults");
await g.ev(`(() => { document.querySelector('[data-tune="mary"]').dispatchEvent(new MouseEvent("click", {bubbles:true})); return true; })()`);
eq(await g.ev(`[state.tune, document.querySelector("#tunes [aria-pressed=true]").dataset.tune]`), ["mary", "mary"], "picking a tune");
g.close();

/* ---- saved data ---- */
g = await boot(FILE, {storage: {[KEY]: JSON.stringify({v:1, knobs:{clarity:0.7, splitCents:9999, junk:1}, closeMic:true, tune:"twinkle"})}});
eq(await g.ev(`[state.knobs.clarity, state.knobs.splitCents, "junk" in state.knobs, state.closeMic, state.tune, readOnly]`),
   [0.7, 150, false, true, "twinkle", false], "saved settings load, clamped to the knob's range, unknown ones dropped");
eq(await g.ev(`document.querySelector("#closeMic").checked`), true, "the close-the-mic box shows the saved choice");
g.close();
g = await boot(FILE, {storage: {[KEY]: JSON.stringify({v:9, knobs:{clarity:0.7}, future:true})}});
eq(await g.ev(`readOnly`), true, "settings from a newer build: read-only");
await g.click("#resetKnobs");
ok(JSON.parse(await g.ev(`localStorage.getItem("${KEY}")`)).future === true, "and never written over");
g.close();
g = await boot(FILE, {storage: {[KEY]: "{not json"}});
ok(quiet(g.errors).length === 0 && await g.ev(`state.knobs.clarity === 0.82`), "a broken blob falls back to the defaults");
g.close();

/* ---- the shell ---- */
const sw = fs.readFileSync(path.join(DIR, "sw.js"), "utf8");
const pre = [...sw.matchAll(/"\.?\/?(icons\/[^"]+\.png)"/g)].map(x => x[1]);
ok(pre.length === 36 && pre.every(f => fs.existsSync(path.join(DIR, f))), `sw.js precaches 36 icons and launch screens, all present (${pre.length})`);
ok(/const VERSION = "v\d+"/.test(sw) && /lark-shell-/.test(sw), "the shell cache is versioned and named for Lark");
const man = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.webmanifest"), "utf8"));
eq([man.start_url, man.scope, man.id], ["./", "./", "./"], "manifest paths are relative");
const html = fs.readFileSync(FILE, "utf8");
ok(!/(src|href)="\//.test(html), "no root-relative paths in the page");
ok(!/location\.hash|history\.(push|replace)State/.test(html), "the page never changes its URL (home-screen WebKit re-asks for the mic on every navigation)");
ok(/echoCancellation:false/.test(html) && /noiseSuppression:false/.test(html) && /autoGainControl:false/.test(html), "the mic is asked for with its call processing off");
ok(/play-and-record/.test(html) && /setSession\("playback"\)/.test(html), "the audio session is switched for capture and back");
ok(!/fonts\.googleapis|<script src=/.test(html), "no third-party fonts or scripts");

process.exit(report("lark") ? 0 : 1);
