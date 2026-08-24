import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";

/* Boots a game's index.html in jsdom and hands back the window. Nothing here is
   shipped: the games have no dependencies, this is the test rig only. */
export function boot(file, {storage = null, verbose = false} = {}) {
  let html = fs.readFileSync(file, "utf8");
  /* The probe has to live INSIDE the game's own scope. Each game wraps
     everything in an IIFE under "use strict", so nothing is on window and
     nothing is script-scoped either — a probe appended after the IIFE sees an
     empty room. Defining it right after the prologue works because a closure
     resolves its names when it is CALLED, by which time the whole body has run.
     This is the only change the rig makes to the page. */
  const anchor = html.indexOf('"use strict";');
  if (anchor < 0) throw new Error("no strict-mode prologue to probe: " + file);
  const at = anchor + '"use strict";'.length;
  html = html.slice(0, at) +
    "\n/* test probe */ window.__ev = function(src){ return eval(src); };\n" +
    html.slice(at);
  const vc = new VirtualConsole();
  const errors = [];
  vc.on("jsdomError", e => errors.push(String(e.detail || e)));
  vc.on("error", (...a) => errors.push(a.map(String).join(" ")));
  if (verbose) {
    vc.on("log", (...a) => console.log("[page]", ...a));
    vc.on("warn", (...a) => console.log("[warn]", ...a));
  }
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: "https://example.test/games/x/",
    virtualConsole: vc,
    beforeParse(win) {
      win.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
      win.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
      win.cancelAnimationFrame = id => clearTimeout(id);
      Object.defineProperty(win.navigator, "serviceWorker", {
        value: { register: () => Promise.reject(new Error("no sw in test")),
                 addEventListener(){}, controller: null },
        configurable: true });
      if (storage) for (const [k, v] of Object.entries(storage)) win.localStorage.setItem(k, v);
    }
  });
  const win = dom.window;
  return {
    dom, win, doc: win.document, errors,
    ev: expr => win.__ev(expr),
    $: sel => win.document.querySelector(sel),
    all: sel => [...win.document.querySelectorAll(sel)],
    click(sel) {
      const el = win.document.querySelector(sel);
      if (!el) throw new Error("no element " + sel);
      el.dispatchEvent(new win.MouseEvent("click", {bubbles:true}));
      return el;
    },
    close: () => dom.window.close()
  };
}

let pass = 0, fail = 0;
const fails = [];
export function ok(cond, msg) {
  if (cond) { pass++; } else { fail++; fails.push(msg); }
}
export function eq(a, b, msg) { ok(Object.is(a,b) || JSON.stringify(a)===JSON.stringify(b),
  `${msg} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); }
export function report(name) {
  console.log(`\n${name}: ${pass} passed, ${fail} failed`);
  for (const f of fails) console.log("  FAIL  " + f);
  return fail === 0;
}
