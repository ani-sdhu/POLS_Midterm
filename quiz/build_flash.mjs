// Builds the flashcard outputs: validates every card, runs each card's R code once on the book's data in local R,
// and writes flash/outputs.json (printed output) and flash/img/<id>.png (plots). Also checks study-guide coverage.
// Usage: node build_flash.mjs        (needs R; set RSCRIPT if Rscript is not at the default Windows path)
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FLASH = join(HERE, "flash");
const RSCRIPT = process.env.RSCRIPT ?? "C:/Program Files/R/R-4.4.2/bin/Rscript.exe";
const QSS = "https://raw.githubusercontent.com/kosukeimai/qss/3d6144d4c6fa29ff1fb0a7edb681490b22340bbb/";
const imp = f => import(pathToFileURL(join(FLASH, f)).href);

const { DICTS, TOPICS } = await imp("topics.js");
const cards = [];
for (const f of ["cards_commands.js", "cards_concepts.js", "cards_equations.js", "cards_graphs.js"]) cards.push(...(await imp(f)).default);
const guide = (await imp("guide.js")).default;

// ---------- schema ----------
const problems = [], ids = new Set();
for (const c of cards) {
  const where = c.id ?? JSON.stringify(c.front).slice(0, 40);
  if (!/^[a-z0-9-]+$/.test(c.id ?? "")) problems.push(`${where}: id must be lowercase letters, digits, hyphens`);
  if (ids.has(c.id)) problems.push(`${where}: duplicate id`);
  ids.add(c.id);
  if (!DICTS[c.dict]) problems.push(`${where}: unknown dict ${c.dict}`);
  if (!c.topics?.length || c.topics.some(t => !TOPICS[t])) problems.push(`${where}: bad topics ${c.topics}`);
  if (typeof c.sec !== "string" || !Number.isInteger(c.page)) problems.push(`${where}: needs sec (string) and page (integer)`);
  if (!c.front || !c.back) problems.push(`${where}: needs front and back`);
  if (c.code && !["command", "graph"].includes(c.dict)) problems.push(`${where}: only command/graph cards carry code`);
  if (c.dict === "graph" && !c.code) problems.push(`${where}: graph card without code`);
  if (c.reversible && !["concept", "equation"].includes(c.dict)) problems.push(`${where}: only concept/equation cards are reversible`);
}
for (const g of guide) {
  if (!g.cards?.length) problems.push(`guide "${g.item}": no cards`);
  for (const id of g.cards ?? []) if (!ids.has(id)) problems.push(`guide "${g.item}": unknown card ${id}`);
}
if (problems.length) { console.error("Card problems:\n  " + problems.join("\n  ")); process.exit(1); }

// ---------- data ----------
const DATA = join(tmpdir(), "qss-flash-data");
const needed = new Set();
for (const c of cards) for (const m of `${c.setup ?? ""}\n${c.code ?? ""}`.matchAll(/read\.csv\("([A-Z]+\/[^"]+)"/g)) needed.add(m[1]);
for (const path of needed) {
  const dest = join(DATA, path);
  if (existsSync(dest)) continue;
  const res = await fetch(QSS + path);
  if (!res.ok) { console.error(`Could not download ${path}: HTTP ${res.status}`); process.exit(1); }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// ---------- run R ----------
const OUT = join(tmpdir(), "qss-flash-out");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(join(FLASH, "img"), { recursive: true });
const rs = s => JSON.stringify(s).replace(/\\u([0-9a-f]{4})/gi, "\\u$1");
const fwd = p => p.replace(/\\/g, "/");
let r = `setwd(${rs(fwd(DATA))})
.failed <- character()
.card <- function(id, setup, code, img) {
  env <- new.env()
  res <- tryCatch(withCallingHandlers({
    set.seed(1)
    eval(parse(text = setup), envir = env)
    if (nzchar(img)) png(img, width = 1100, height = 800, res = 150)
    out <- capture.output(for (e in parse(text = code)) { v <- withVisible(eval(e, env)); if (v$visible) print(v$value) })
    if (nzchar(img)) dev.off()
    out
  }, warning = function(w) stop("warning: ", conditionMessage(w))),
  error = function(e) { while (dev.cur() > 1) dev.off(); structure(conditionMessage(e), class = "flasherr") })
  if (inherits(res, "flasherr")) { .failed <<- c(.failed, id); cat("FAILED", id, ":", res, "\\n") }
  else writeLines(res, file.path(${rs(fwd(OUT))}, paste0(id, ".txt")), useBytes = TRUE)
}
`;
const withCode = cards.filter(c => c.code);
for (const c of withCode) {
  const img = c.dict === "graph" || c.plot ? fwd(join(FLASH, "img", c.id + ".png")) : "";
  r += `.card(${rs(c.id)}, ${rs(c.setup ?? "")}, ${rs(c.code)}, ${rs(img)})\n`;
}
r += `if (length(.failed)) quit(status = 1)\n`;
const script = join(OUT, "build.R");
writeFileSync(script, r);
try { execFileSync(RSCRIPT, [script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
catch (e) { console.error((e.stdout ?? "") + (e.stderr ?? "")); console.error("R failed; nothing written."); process.exit(1); }

const outputs = {};
for (const c of withCode) {
  const text = readFileSync(join(OUT, c.id + ".txt"), "utf8").replace(/\r\n/g, "\n").replace(/\s+$/, "");
  outputs[c.id] = { text, img: Boolean(c.dict === "graph" || c.plot) };
}
writeFileSync(join(FLASH, "outputs.json"), JSON.stringify(outputs, null, 1));
const byDict = Object.keys(DICTS).map(d => `${cards.filter(c => c.dict === d).length} ${d}`).join(", ");
console.log(`${cards.length} cards (${byDict}); ${withCode.length} outputs; ${Object.values(outputs).filter(o => o.img).length} images; coverage ok for ${guide.length} study-guide items`);
