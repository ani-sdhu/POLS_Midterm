// webR runtime: replays the book's code chapter by chapter against the real data.
import { WebR } from "https://webr.r-wasm.org/v0.6.0/webr.mjs";

const ROOT = "../../";                       // quiz lives at <root>/Midterm Prep/quiz/
const PRELUDE = `
.qcache <- new.env()
# The book predates R 4.0: read.csv made factors. Memoize reads so chapter replays are cheap.
read.csv <- function(file, ...) {
  key <- normalizePath(file)
  if (is.null(.qcache[[key]])) .qcache[[key]] <- utils::read.csv(file, stringsAsFactors = TRUE, ...)
  .qcache[[key]]
}
.qrun <- function(code, env, seed) {
  set.seed(seed)
  exprs <- tryCatch(parse(text = code), error = function(e) e)
  if (inherits(exprs, "error")) return(paste("Error:", conditionMessage(exprs)))
  out <- character()
  for (e in exprs) {
    res <- tryCatch(capture.output({
      v <- withVisible(eval(e, env))
      if (v$visible) print(v$value)
    }), error = function(err) c(out, paste("Error:", conditionMessage(err))))
    out <- c(out, res)
    if (length(res) && startsWith(res[length(res)], "Error:")) break
  }
  paste(out, collapse = "\\n")
}
pdf(NULL)
`;

// A dropped download shouldn't take every dataset down with it: retry, then carry on without the file.
async function fetchRetry(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { cache: "no-store" }); if (r.ok) return await r.arrayBuffer(); } catch {}
    await new Promise(res => setTimeout(res, 400 * (i + 1)));
  }
  return null;
}

export class Runtime {
  constructor(bookcode) {
    this.book = bookcode;
    this.pos = {};                              // chapter -> index (into its step list) of last replayed step
    this.byCh = {};
    for (const s of bookcode.steps) (this.byCh[s.ch] ??= []).push(s);
  }

  async init(onStatus = () => {}) {
    onStatus("Starting R (webR)…");
    this.webR = new WebR();
    await this.webR.init();
    await this.webR.evalRVoid(PRELUDE);
    onStatus("Loading textbook data sets…");
    for (const ch of this.book.chapters) {
      for (const [name, path] of Object.entries(ch.files)) {
        const dir = `/home/web_user/${ch.id}`;
        await this.webR.FS.mkdir(dir).catch(() => {});
        const buf = await fetchRetry(encodeURI(ROOT + path));
        if (buf) await this.webR.FS.writeFile(`${dir}/${name}`, new Uint8Array(buf));
        else console.warn(`Could not load ${path}; code from that dataset will show an error.`);
      }
    }
    onStatus("");
  }

  seed(id) { let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 100000; return h; }

  async r(code) { return (await this.webR.evalRString(code)); }

  // Run arbitrary code against the chapter state *before* step k, without changing that state.
  async runAt(step, code) {
    const list = this.byCh[step.ch], k = list.indexOf(step);
    await this.replayTo(step.ch, k - 1);
    const src = JSON.stringify(code), seed = this.seed(step.id);
    return this.r(`local({ setwd("/home/web_user/${step.ch}"); .qrun(${src}, new.env(parent = .env_${step.ch}), ${seed}) })`);
  }

  async replayTo(ch, k) {
    const list = this.byCh[ch];
    if (this.pos[ch] === undefined || this.pos[ch] > k) {
      await this.webR.evalRVoid(`.env_${ch} <- new.env()`);
      this.pos[ch] = -1;
    }
    for (let i = this.pos[ch] + 1; i <= k; i++) {
      const s = list[i];
      if (s.eval) {
        const out = await this.r(`local({ setwd("/home/web_user/${ch}"); .qrun(${JSON.stringify(s.code)}, .env_${ch}, ${this.seed(s.id)}) })`);
        s._out = out;                          // cache the true output seen during replay
      }
      this.pos[ch] = i;
    }
  }

  // True output of a step (cached after the first replay).
  async output(step) {
    if (step._out === undefined) await this.replayTo(step.ch, this.byCh[step.ch].indexOf(step));
    return step._out ?? "";
  }
}
