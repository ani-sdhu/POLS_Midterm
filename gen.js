// Question generators. None of these call an LLM: answers come from the textbook's
// code run in webR, from knowledge/*.json, or from exact computation.
import { derivative, parse, simplify, rationalize } from "https://cdn.jsdelivr.net/npm/mathjs@14.9.1/+esm";

// ---------- helpers ----------
export const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = a => [...new Set(a)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const fmt = (x, d = 3) => (Math.round(x * 10 ** d) / 10 ** d).toString();
const mean = v => v.reduce((a, b) => a + b, 0) / v.length;
const sumsq = (v, m) => v.reduce((a, b) => a + (b - m) ** 2, 0);
const sdN1 = v => Math.sqrt(sumsq(v, mean(v)) / (v.length - 1));
const quantile7 = (v, p) => { const s = [...v].sort((a, b) => a - b), h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
const median = v => quantile7(v, 0.5);
const near = (a, b, tol) => Math.abs(a - b) <= Math.max(tol, Math.abs(b) * 1e-3);
const numCheck = (ans, tol = 0.006) => v => { const x = parseFloat(String(v).replace(/[, ]/g, "")); return Number.isFinite(x) && near(x, ans, tol); };

// Build a multiple-choice question from a correct option and distractors (deduplicated).
function mc(q, correct, distractors, n = 4, minOpts = 2) {
  const opts = uniq([correct, ...distractors.filter(d => d && d !== correct)]).slice(0, n);
  if (opts.length < minOpts) return null;
  const options = shuffle(opts);
  return { ...q, format: "mc", options, answer: options.indexOf(correct) };
}

// Printed start page of each QSS section, for "go read it" references.
export const PAGE = { "1.3.1": 11, "1.3.2": 12, "1.3.3": 14, "1.3.4": 16, "1.3.5": 20, "2.1": 32, "2.2": 37, "2.2.1": 37, "2.2.2": 39, "2.2.3": 40, "2.2.4": 43, "2.2.5": 44, "2.3": 46, "2.4": 48, "2.4.1": 49, "2.4.2": 51, "2.5": 54, "2.5.1": 54, "2.5.2": 57, "2.5.3": 60, "2.6": 63, "2.6.1": 63, "2.6.2": 66, "2.8": 69, "3.1": 75, "3.2": 78, "3.3.1": 80, "3.3.2": 81, "3.3.3": 85, "3.4": 88, "3.4.1": 89, "3.4.2": 93, "3.5": 96, "3.6.1": 98, "3.6.2": 101, "3.6.3": 105, "3.7": 108, "3.7.2": 110, "3.7.3": 111, "4.1.1": 124, "4.1.2": 127, "4.1.3": 130, "4.2.1": 139, "4.2.2": 141, "4.2.3": 143, "4.2.4": 148, "4.2.5": 149, "4.2.6": 156, "4.3.1": 162, "4.3.2": 165, "4.3.3": 170, "4.3.4": 176 };
export const SECTION_TITLES = {
  "1.3.1": "Arithmetic Operations", "1.3.2": "Objects", "1.3.3": "Vectors", "1.3.4": "Functions", "1.3.5": "Data Files", "1.3.6": "Saving Objects", "1.3.7": "Packages", "1.3.8": "Programming and Learning Tips",
  "2.1": "Racial Discrimination in the Labor Market", "2.2": "Subsetting the Data in R", "2.2.1": "Logical Values and Operators", "2.2.2": "Relational Operators", "2.2.3": "Subsetting", "2.2.4": "Simple Conditional Statements", "2.2.5": "Factor Variables",
  "2.3": "Causal Effects and the Counterfactual", "2.4": "Randomized Controlled Trials", "2.4.1": "The Role of Randomization", "2.4.2": "Social Pressure and Voter Turnout",
  "2.5": "Observational Studies", "2.5.1": "Minimum Wage and Unemployment", "2.5.2": "Confounding Bias", "2.5.3": "Before-and-After and Difference-in-Differences Designs",
  "2.6": "Descriptive Statistics for a Single Variable", "2.6.1": "Quantiles", "2.6.2": "Standard Deviation", "2.8": "Natural Experiments (Exercises)",
  "3.1": "Measuring Civilian Victimization during Wartime", "3.2": "Handling Missing Data in R", "3.3.1": "Bar Plot", "3.3.2": "Histogram", "3.3.3": "Box Plot", "3.3.4": "Printing and Saving Graphs",
  "3.4": "Survey Sampling", "3.4.1": "The Role of Randomization", "3.4.2": "Nonresponse and Other Sources of Bias", "3.5": "Measuring Political Polarization",
  "3.6.1": "Scatter Plot", "3.6.2": "Correlation", "3.6.3": "Quantile-Quantile Plot", "3.7": "Clustering: Matrix in R", "3.7.2": "List in R", "3.7.3": "The k-Means Algorithm",
  "4.1.1": "Loops in R", "4.1.2": "General Conditional Statements in R", "4.1.3": "Poll Predictions", "4.2.1": "Facial Appearance and Election Outcomes", "4.2.2": "Correlation and Scatter Plots",
  "4.2.3": "Least Squares", "4.2.4": "Regression towards the Mean", "4.2.5": "Merging Data Sets in R", "4.2.6": "Model Fit",
  "4.3.1": "Randomized Experiments", "4.3.2": "Regression with Multiple Predictors", "4.3.3": "Heterogenous Treatment Effects", "4.3.4": "Regression Discontinuity Design",
  "calc": "Calculus Fundamentals",
};
export const sectionKey = s => s.split(".").map(n => n.padStart(3, "0")).join(".");
export const ref = (section, page) => `QSS ${section}${(page ?? PAGE[section]) ? ` · p. ${page ?? PAGE[section]}` : ""}`;

// ---------- book code (webR) ----------
const LEVEL_SWAPS = [["black", "white"], ["female", "male"], ["Control", "Neighbors"], ["Hawthorne", "Civic Duty"], ["ISAF", "control"],
  ["Republican", "Democrat"], ["labour", "tory"], ["burgerking", "kfc"], ["PA", "southNJ"], ["add", "multiply"]];
const MUTATIONS = [
  ["== ↔ !=", c => c.includes("==") ? c.replace("==", "!=") : c.includes("!=") ? c.replace("!=", "==") : null],
  ["& ↔ |", c => /[^&]&[^&]/.test(c) ? c.replace(/([^&])&([^&])/, "$1|$2") : /[^|]\|[^|]/.test(c) ? c.replace(/([^|])\|([^|])/, "$1&$2") : null],
  ["mean ↔ median", c => /\bmean\(/.test(c) ? c.replace(/\bmean\(/, "median(") : /\bmedian\(/.test(c) ? c.replace(/\bmedian\(/, "mean(") : null],
  ["sum → mean", c => /\bsum\(/.test(c) ? c.replace(/\bsum\(/, "mean(") : null],
  ["sd ↔ var", c => /\bsd\(/.test(c) ? c.replace(/\bsd\(/, "var(") : /\bvar\(/.test(c) ? c.replace(/\bvar\(/, "sd(") : null],
  ["swap [i, j]", c => /\[(\d+), (\d+)\]/.test(c) ? c.replace(/\[(\d+), (\d+)\]/, (m, a, b) => a === b ? m : `[${b}, ${a}]`) : null],
  ["row ↔ column", c => /\[(\d+), \]/.test(c) ? c.replace(/\[(\d+), \]/, "[, $1]") : /\[, (\d+)\]/.test(c) ? c.replace(/\[, (\d+)\]/, "[$1, ]") : null],
  ["< ↔ >", c => / < /.test(c) ? c.replace(" < ", " > ") : / > /.test(c) ? c.replace(" > ", " < ") : null],
  ["<= ↔ >=", c => c.includes("<=") ? c.replace("<=", ">=") : c.includes(">=") ? c.replace(">=", "<=") : null],
  ["drop na.rm", c => c.includes(", na.rm = TRUE") ? c.replace(", na.rm = TRUE", "") : null],
  ["drop -1", c => c.includes("~ -1 + ") ? c.replace("~ -1 + ", "~ ") : null],
  ["change a number", c => { const lines = c.split("\n"), last = lines.pop(), nums = [...last.matchAll(/\b\d+\b/g)];
    if (!nums.length) return null; const m = pick(nums), v = +m[0] + pick([1, -1]);
    return v < 0 ? null : [...lines, last.slice(0, m.index) + v + last.slice(m.index + m[0].length)].join("\n"); }],
  ["swap level", c => { for (const [a, b] of shuffle(LEVEL_SWAPS)) { if (c.includes(`"${a}"`)) return c.replace(`"${a}"`, `"${b}"`); if (c.includes(`"${b}"`)) return c.replace(`"${b}"`, `"${a}"`); } return null; }],
];
const mutants = code => MUTATIONS.map(([name, f]) => { const m = f(code); return m && m !== code ? { name, code: m } : null; }).filter(Boolean);
const outLines = s => (s || "").split("\n").length;
const isNum1 = s => /^\[1\] -?[\d.]+(e[-+]?\d+)?$/.test((s || "").trim());
const perturbNum = s => { const x = parseFloat(s.trim().slice(4)); const d = [x * 2, x / 2, -x, x + (Math.abs(x) < 1 ? 0.1 : Math.round(Math.abs(x) * 0.25) || 1), 1 - x];
  return uniq(d.filter(v => Number.isFinite(v) && v !== x).map(v => `[1] ${Number(v.toPrecision(7))}`)); };

export class BookCode {
  constructor(book, notes, cases, rt) {
    this.rt = rt; this.notes = notes; this.cases = cases;
    this.steps = book.steps.filter(s => s.eval);
    this.byId = Object.fromEntries(this.steps.map(s => [s.id, s]));
  }
  items() { return this.steps.filter(s => this.notes[s.id]).map(s => `code:${s.id}`); }
  caseFor(s) { return this.cases.find(c => c.ch === s.ch && c.sections.includes(s.section)); }
  context(s) {                                   // up to 3 earlier statements from the same code group
    const i = this.steps.indexOf(s), prev = [];
    for (let j = i - 1; j >= 0 && prev.length < 3 && this.steps[j].group === s.group && this.steps[j].ch === s.ch; j--) prev.unshift(this.steps[j].code);
    return prev.join("\n");
  }
  base(s) {
    return { id: `code:${s.id}`, topic: `Book code · ${s.section} ${s.title}`, ref: ref(s.section), code: s.code,
      codeBefore: this.context(s), comment: s.comment, caseCard: this.caseFor(s) };
  }
  siblings(s, key) {                             // nearby statements make plausible distractors
    const i = this.steps.indexOf(s);
    const near = this.steps.filter(t => t !== s && t.ch === s.ch && this.notes[t.id]?.[key])
      .sort((a, b) => Math.abs(this.steps.indexOf(a) - i) - Math.abs(this.steps.indexOf(b) - i)).slice(0, 10);
    return shuffle(uniq(near.map(t => this.notes[t.id][key]))).filter(x => x !== this.notes[s.id][key]);
  }

  // No question asks you to recall a value from the book's data. Every format tests what the code
  // does, what it computes, what the data are, or what a shown output means.
  async make(itemId) {
    const s = this.byId[itemId.slice(5)], note = this.notes[s.id];
    const out = await this.rt.output(s);
    const kinds = ["does", "variable", "unit"];
    if (note.out) kinds.push("computes", "computes");
    if (note.out && out && !out.startsWith("Error") && outLines(out) <= 14) kinds.push("interpret", "interpret");
    for (const k of shuffle(kinds)) {
      const q = this[k](s, note, out);
      if (q) return q;
    }
    return null;
  }

  does(s, note) {
    return mc({ ...this.base(s), prompt: "What does the <b>highlighted</b> code do?", explain: note.does + (note.out ? `<br><i>Output:</i> ${note.out}` : "") },
      note.does, this.siblings(s, "does"));
  }

  computes(s, note) {
    return mc({ ...this.base(s), prompt: "Without running it: what quantity does the <b>highlighted</b> code produce?",
      explain: `${note.does}<br><i>It produces:</i> ${note.out}` }, note.out, this.siblings(s, "out"));
  }

  interpret(s, note, out) {
    return mc({ ...this.base(s), output: out, prompt: "The <b>highlighted</b> code produced the output shown. What does this output represent?",
      explain: `${note.does}` }, note.out, this.siblings(s, "out"));
  }

  // Data frames and variables referenced in the code, resolved against the case cards.
  frameOf(name) {
    let best = null;
    for (const c of this.cases) for (const [f, unit] of Object.entries(c.frames ?? {}))
      if ((name === f || name.startsWith(f)) && (!best || f.length > best.f.length)) best = { c, f, unit };
    return best;
  }
  varsOf(c) {
    const m = {};
    for (const [k, v] of Object.entries(c.vars)) for (const name of k.split(" / ")) m[name.replace(/\s*\(.*\)$/, "").trim()] = v;
    return m;
  }

  variable(s) {
    const refs = [...s.code.matchAll(/\b([A-Za-z][\w.]*)\$([A-Za-z][\w.]*)/g)].map(m => ({ df: m[1], v: m[2], fr: this.frameOf(m[1]) }))
      .filter(r => r.fr && this.varsOf(r.fr.c)[r.v]);
    if (!refs.length) return null;
    const r = pick(refs), vars = this.varsOf(r.fr.c), meaning = vars[r.v];
    const others = shuffle(uniq([...Object.values(vars), ...this.cases.flatMap(c => Object.values(c.vars))])).filter(x => x !== meaning);
    return mc({ ...this.base(s), prompt: `In this code, what does <code>${esc(r.df)}$${esc(r.v)}</code> measure?`,
      explain: `<code>${esc(r.v)}</code>: ${esc(meaning)}. ${esc(this.notes[s.id].does)}` }, meaning, others);
  }

  unit(s) {
    const names = [...s.code.matchAll(/\b([A-Za-z][\w.]*)\s*(?:\$|\[)/g)].map(m => m[1]);
    const hit = names.map(n => ({ n, fr: this.frameOf(n) })).find(x => x.fr);
    if (!hit) return null;
    const others = uniq(this.cases.flatMap(c => Object.values(c.frames ?? {}))).filter(u => u !== hit.fr.unit);
    return mc({ ...this.base(s), prompt: `In this code, what does one row (observation) of <code>${esc(hit.n)}</code> represent?`,
      explain: `Each row of <code>${esc(hit.n)}</code> is ${esc(hit.fr.unit)}. ${esc(hit.fr.c.about)}` }, hit.fr.unit, shuffle(others));
  }
}

// ---------- synthetic R snippets (random data, answers from webR) ----------
const ints = (n, a = 1, b = 20) => Array.from({ length: n }, () => ri(a, b));
const rv = v => `c(${v.join(", ")})`;
const SYNTH = {
  index: () => { const x = ints(6), i = ri(1, 6), j = ri(1, 6), k = ri(1, 6);
    return { sec: "1.3.3", code: `x <- ${rv(x)}\n${pick([`x[c(${i}, ${j})]`, `x[-${k}]`, `x[${i}:${Math.min(6, i + 2)}]`, `x[length(x)]`])}` }; },
  seq: () => { const a = ri(1, 5) * 5, s = pick([2, 3, 5]), b = a + s * ri(3, 5);
    return { sec: "1.3.4", code: pick([`seq(from = ${a}, to = ${b}, by = ${s})`, `seq(from = ${b}, to = ${a}, by = -${s})`, `${a}:${a + ri(2, 5)}`]) }; },
  vecmath: () => { const x = ints(4); return { sec: "1.3.3", code: `x <- ${rv(x)}\n${pick(["x / x[1]", "x[-1] - x[-4]", "x * 2 - 1", "sum(x) / length(x)"])}` }; },
  logical: () => { const x = ints(6, -5, 10), t = ri(0, 5), u = t + ri(2, 5);
    return { sec: "2.2.2", code: `x <- ${rv(x)}\n${pick([`x > ${t}`, `mean(x > ${t})`, `sum(x >= ${t} & x < ${u})`, `(x < ${t}) | (x > ${u})`, `x[x > ${t}]`])}` }; },
  ifelse: () => { const x = ints(5, 1, 12), t = ri(4, 9);
    return { sec: "2.2.4", code: `x <- ${rv(x)}\nifelse(x > ${t}, ${pick(['"high", "low"', "1, 0", "x, 0"])})` }; },
  tapply: () => { const g = Array.from({ length: 6 }, () => pick(["a", "b", "c"])); g[0] = "a"; g[1] = "b"; const y = ints(6, 0, 10);
    return { sec: "2.2.5", code: `g <- ${rv(g.map(s => `"${s}"`))}\ny <- ${rv(y)}\ntapply(y, g, ${pick(["mean", "sum", "max"])})` }; },
  table: () => { const g = Array.from({ length: 7 }, () => pick(["yes", "no", "maybe"]));
    return { sec: "2.5.2", code: `g <- ${rv(g.map(s => `"${s}"`))}\n${pick(["table(g)", "prop.table(table(g))"])}` }; },
  na: () => { const x = ints(4); x.splice(ri(0, 4), 0, "NA");
    return { sec: "3.2", code: `x <- ${rv(x)}\n${pick(["mean(x)", "mean(x, na.rm = TRUE)", "sum(is.na(x))", "is.na(x)", "length(na.omit(x))"])}` }; },
  quant: () => { const x = ints(ri(5, 8), 1, 30);
    return { sec: "2.6.1", code: `x <- ${rv(x)}\n${pick(["median(x)", "IQR(x)", "quantile(x, 0.25)", "summary(x)", "range(x)"])}` }; },
  spread: () => { const x = ints(4, 1, 10); return { sec: "2.6.2", code: `x <- ${rv(x)}\n${pick(["sd(x)", "var(x)", "sqrt(mean(x^2))", "sqrt(mean((x - mean(x))^2))"])}` }; },
  matrix: () => { const byrow = pick(["TRUE", "FALSE"]), m = ri(1, 2);
    return { sec: "3.7.1", code: `m <- matrix(1:6, nrow = 2, byrow = ${byrow})\n${pick(["m", `apply(m, ${m}, sum)`, "colSums(m)", "rowMeans(m)", "m[2, 3]", "dim(m)"])}` }; },
  list: () => { const a = ints(3); return { sec: "3.7.2", code: `l <- list(a = ${rv(a)}, b = c("x", "y"))\n${pick(["l$a[2]", "l[[2]]", "length(l)", "names(l)", 'l[["a"]] * 2'])}` }; },
  factor: () => { const f = Array.from({ length: 5 }, () => pick(["low", "mid", "high"])); f[0] = "mid";
    return { sec: "2.2.5", code: `f <- factor(${rv(f.map(s => `"${s}"`))})\n${pick(["levels(f)", "table(f)", "as.integer(f)"])}` }; },
  loop: () => { const n = ri(3, 5), op = pick(["i^2", "i * 2 + 1", "sum(1:i)"]);
    return { sec: "4.1.1", code: `res <- rep(NA, ${n})\nfor (i in 1:${n}) {\n    res[i] <- ${op}\n}\nres` }; },
  ifelseCtl: () => { const v = ri(1, 12);
    return { sec: "4.1.2", code: `x <- ${v}\nif (x %% 3 == 0) {\n    "divisible by 3"\n} else if (x %% 2 == 0) {\n    "even"\n} else {\n    "other"\n}` }; },
  lm: () => { const x = [1, 2, 3, 4, 5], b = ri(1, 4), a = ri(-3, 3), y = x.map(v => a + b * v + pick([-1, 0, 0, 1]));
    return { sec: "4.2.3", code: `x <- ${rv(x)}\ny <- ${rv(y)}\n${pick(["coef(lm(y ~ x))", "round(fitted(lm(y ~ x)), 2)", "round(resid(lm(y ~ x)), 2)", "round(cor(x, y), 3)"])}` }; },
  dummyLm: () => { const g = ["A", "A", "B", "B", "C", "C"], y = ints(6, 0, 10);
    return { sec: "4.3.2", code: `g <- factor(${rv(g.map(s => `"${s}"`))})\ny <- ${rv(y)}\n${pick(["coef(lm(y ~ g))", "coef(lm(y ~ -1 + g))", "tapply(y, g, mean)"])}` }; },
};

export class SynthR {
  constructor(rt) { this.rt = rt; }
  items() { return Object.keys(SYNTH).map(k => `synth:${k}`); }
  run(code) { return this.rt.r(`.qrun(${JSON.stringify(code)}, new.env(), 1)`); }
  async make(itemId) {
    const g = SYNTH[itemId.slice(6)](), out = await this.run(g.code);
    if (!out || out.startsWith("Error") || outLines(out) > 10) return null;
    const base = { id: itemId, topic: "R practice · predict the output", ref: ref(g.sec), code: g.code,
      explain: `R's actual output:<pre class=code>${esc(out)}</pre>` };
    if (isNum1(out) && Math.random() < 0.5) {
      const val = parseFloat(out.trim().slice(4));
      return { ...base, format: "numeric", prompt: "What number does this code print?", answer: String(val), check: numCheck(val, 0.0006) };
    }
    const alts = [], c = g.code, at = (m, v) => c.slice(0, m.index) + v + c.slice(m.index + m[0].length);
    const numberMutants = [...c.matchAll(/\b\d+\b/g)].flatMap(m => [1, -1].map(d => +m[0] + d).filter(v => v >= 0).map(v => at(m, v)));
    const strs = [...c.matchAll(/"(\w+)"/g)], vals = uniq(strs.map(m => m[1]));
    const stringMutants = strs.flatMap(m => vals.filter(v => v !== m[1]).map(v => at(m, `"${v}"`)));
    for (const code of shuffle([...mutants(c).map(m => m.code), ...numberMutants, ...stringMutants]).slice(0, 10)) {
      const o = await this.run(code); if (o && o !== out && !o.startsWith("Error") && outLines(o) <= 10) alts.push(o);
    }
    if (isNum1(out)) alts.push(...perturbNum(out));
    return mc({ ...base, prompt: "What does this code print?", optionsAreCode: true }, out, alts, 4, 3);
  }
}

// ---------- definition boxes ----------
const normalize = s => s.toLowerCase().normalize("NFKD").replace(/[−–]/g, "-").replace(/[^a-z0-9α-ωŷȳ̄ε̂=+\-*/()^_,.]/g, "");
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }

const STOP = new Set("the and that this with which from their there these those when where while about into than then them they each only also such other same more most less least whether because between within without under over does done have been being were".split(" "));

// Definition boxes, verbatim from the user's PDF (via BookBoxes). Items exist once the PDF is read.
export class Boxes {
  constructor(boxes, book) { this.boxes = boxes; this.book = book; this.byId = Object.fromEntries(boxes.map(b => [b.id, b])); }
  items() {
    if (!this.book.ready) return [];
    return this.boxes.flatMap(b => { const n = this.book.sentences(b.id).length; return Array.from({ length: Math.max(1, n) }, (_, i) => `box:${b.id}:${i}`); });
  }
  blankFor(b, sentence) {
    const low = sentence.toLowerCase();
    const cands = uniq(b.components.flatMap(c => c.blanks ?? [])).filter(k => k.length > 2 && low.includes(k.toLowerCase()));
    if (cands.length) { const k = pick(cands), i = low.indexOf(k.toLowerCase()); return sentence.slice(i, i + k.length); }
    const words = sentence.match(/[A-Za-z][A-Za-z-]{6,}/g)?.filter(w => !STOP.has(w.toLowerCase())) ?? [];
    return words.length ? pick(words) : null;
  }
  async make(itemId) {
    const [, bid, si] = itemId.split(":"), b = this.byId[bid], sents = this.book.sentences(bid), sentence = sents[+si];
    const img = await this.book.image(bid);
    const base = { id: itemId, topic: `★ Definition box · ${b.term}`, ref: ref(b.section, b.page), star: true,
      explain: `<div class=boximg><img src="${img}" alt="${esc(b.term)} definition box, QSS p. ${b.page}"></div>` };
    for (const k of shuffle(["cloze", "cloze", "cloze", "wrong", "term", "recall"])) {
      if (k === "cloze" && sentence) {
        const blank = this.blankFor(b, sentence);
        if (!blank) continue;
        const i = sentence.indexOf(blank), shown = esc(sentence.slice(0, i)) + "<span class=blank>________</span>" + esc(sentence.slice(i + blank.length));
        return { ...base, format: "text", prompt: `Fill in the blank, word for word (<b>${esc(b.term)}</b>):<blockquote>${shown}</blockquote>`,
          answer: blank, check: v => { const a = normalize(v), t = normalize(blank); return a === t || (t.length > 6 && lev(a, t) <= 1); } };
      }
      if (k === "wrong" && sents.length >= 2) {
        const falses = b.components.flatMap(c => c.wrong ?? []);
        if (!falses.length) continue;
        const q = mc({ ...base, prompt: `Which statement about <b>${esc(b.term)}</b> is <b>FALSE</b>? (The true ones are quoted from the book.)` },
          pick(falses), shuffle(sents).slice(0, 3));
        if (q) return q;
      }
      if (k === "term" && sentence) {
        const words = b.term.replace(/\(.*?\)/g, "").split(/[\s,-]+/).filter(w => w.length > 3);
        let masked = sentence; for (const w of words) masked = masked.replace(new RegExp(w, "ig"), "____");
        masked = masked.replace(/\((SATE|SATT|RCT|DiD|RD|SRS|IQR|RMSE)\)/g, "(____)");
        const others = shuffle(this.boxes.filter(o => o.id !== b.id).map(o => o.term)).slice(0, 3);
        return mc({ ...base, prompt: `Which definition box is this sentence from?<blockquote>${esc(masked)}</blockquote>` }, b.term, others);
      }
      if (k === "recall") {
        return { ...base, format: "self", prompt: `From memory, write out the definition box for <b>${esc(b.term)}</b> (QSS p. ${b.page}) as close to word for word as you can.` };
      }
    }
    return null;
  }
}

// ---------- vocabulary ----------
export class Vocab {
  constructor(terms) { this.terms = terms; this.byId = Object.fromEntries(terms.map(t => [t.id, t])); }
  items() { return this.terms.map(t => `vocab:${t.id}`); }
  make(itemId) {
    const t = this.byId[itemId.slice(6)], others = shuffle(this.terms.filter(o => o !== t));
    const base = { id: itemId, topic: "Core vocabulary", ref: ref(t.section), explain: `<b>${esc(t.term)}</b>: ${esc(t.def)}` };
    return Math.random() < 0.5
      ? mc({ ...base, prompt: `Which term matches this definition?<blockquote>${esc(t.def)}</blockquote>` }, t.term, others.slice(0, 3).map(o => o.term))
      : mc({ ...base, prompt: `Which is the correct definition of <b>${esc(t.term)}</b>?` }, t.def, others.slice(0, 3).map(o => o.def));
  }
}

// ---------- concept questions ----------
export class Concepts {
  constructor(items) { this.list = items; this.byId = Object.fromEntries(items.map(c => [c.id, c])); }
  items() { return this.list.map(c => `concept:${c.id}`); }
  make(itemId) {
    const c = this.byId[itemId.slice(8)], base = { id: itemId, topic: "Concept", ref: ref(c.section), explain: `<b>Answer:</b> ${esc(c.a)}` };
    return Math.random() < 0.8 ? mc({ ...base, prompt: esc(c.q) }, c.a, shuffle(c.wrong))
      : { ...base, format: "self", prompt: `${esc(c.q)}<div class=hint>Answer in your own words, then reveal.</div>` };
  }
}

// ---------- design scenarios (fictional studies from templates) ----------
export class Scenarios {
  constructor(sc) {
    this.sc = sc; this.byId = Object.fromEntries(sc.templates.map(t => [t.id, t]));
    this.slot = { unit: "{units}", treatment: "{treatment}", outcome: "{outcome}" };
  }
  fieldsOf(t) { return Object.keys(this.sc.fields).filter(f => this.slot[f] ? t.text.toLowerCase().includes(this.slot[f].toLowerCase()) : t[f]); }
  items() { return this.sc.templates.flatMap(t => this.fieldsOf(t).map(f => `scen:${t.id}:${f}`)); }
  fill(s, topic, n) {
    return s.replace(/\{(\w+)\}/g, (m, k) => { const key = k.toLowerCase(), v = key === "n" ? n : topic[key]; if (v === undefined) return m;
      return k[0] === k[0].toUpperCase() && key !== "n" ? v[0].toUpperCase() + v.slice(1) : v; });
  }
  make(itemId) {
    const [, tid, field] = itemId.split(":"), t = this.byId[tid], topic = pick(this.sc.topics), n = pick([40, 60, 100, 200, 500, 1000]);
    const f = s => this.fill(s, topic, n);
    let correct, others;
    if (this.slot[field]) {
      correct = topic[field];
      others = ["unit", "treatment", "outcome", "confounder"].filter(k => k !== field).map(k => topic[k]);
    } else {
      correct = f(t[field]);
      others = shuffle(this.sc.templates.filter(o => o !== t && o[field] && o[field] !== t[field])).map(o => f(o[field]));
    }
    const summary = `<b>${esc(t.design)}</b> (${ref(t.section)})<ul><li><i>Assumption:</i> ${esc(f(t.assumption))}</li><li><i>Estimates:</i> ${esc(f(t.estimand))}</li><li><i>Adjusts for:</i> ${esc(f(t.adjusts))}</li><li><i>Main threat:</i> ${esc(f(t.threat))}</li></ul>`;
    return mc({ id: itemId, topic: "Research design · scenario", ref: ref(t.section), prompt: `<blockquote>${esc(f(t.text))}</blockquote>${esc(this.sc.fields[field])}`,
      explain: (this.slot[field] ? `The ${field} here is <b>${esc(correct)}</b>.<br><br>` : "") + summary }, correct, others);
  }
}

// ---------- LaTeX helpers (rendered by KaTeX in the page) ----------
const T = String.raw;
export const M = s => `\\(${s}\\)`;                 // inline math
export const D = s => `$$${s}$$`;                   // display math
const sgn = x => x < 0 ? `- ${Math.abs(x)}` : `+ ${x}`;
const coef = (c, v, first = false) => {             // signed coefficient times a variable, e.g. "- 3x"
  if (c === 0) return "";
  const mag = Math.abs(c) === 1 ? "" : Math.abs(c);
  return first ? `${c < 0 ? "-" : ""}${mag}${v}` : ` ${c < 0 ? "-" : "+"} ${mag}${v}`;
};
const setT = v => M(`\\{${v.join(",\\ ")}\\}`);
// math.js expression -> clean LaTeX (no "+ -", no \cdot between a number and a variable)
const cleanTex = t => t.replace(/\{\s+/g, "{").replace(/\+\s*-/g, "-").replace(/(\d)\s*\\cdot\s*(?=[a-zA-Z{\\(])/g, "$1").replace(/\\cdot/g, "\\,").replace(/\\mathrm\{(\w)\}/g, "$1");
export const texOf = expr => cleanTex(parse(expr).toTex({ parenthesis: "auto", implicit: "hide" }));
export const exprPreview = s => { try { return s.trim() ? M(texOf(s.replace(/\*\*/g, "^"))) : ""; } catch { return ""; } };

// ---------- stats computations (exact answers) ----------
const STATS = {
  median: () => { const n = ri(5, 8), v = Array.from({ length: n }, () => ri(1, 30)), m = median(v);
    return { sec: "2.6.1", prompt: T`Compute the <b>median</b> of ${setT(v)}.`, ans: m,
      explain: T`Sorted: ${setT([...v].sort((a, b) => a - b))}. \(n = ${n}\) is ${n % 2 ? T`odd, so take the middle value \(x_{((n+1)/2)}\)` : T`even, so average the two middle values: \(\tfrac{1}{2}\left(x_{(n/2)} + x_{(n/2+1)}\right)\)`}. Median \(= ${fmt(m)}\).` }; },
  meanVsMedian: () => { const v = Array.from({ length: 5 }, () => ri(1, 10)); v.push(ri(60, 120)); const m = mean(v), md = median(v);
    return { sec: "2.6.1", prompt: T`For ${setT(v)}, compute \(\bar{x} - \text{median}\).`, ans: m - md,
      explain: T`\(\bar{x} = ${fmt(m)}\), median \(= ${fmt(md)}\). The outlier pulls the mean up but barely moves the median: the median is more robust.` }; },
  iqr: () => { const v = Array.from({ length: ri(7, 9) }, () => ri(1, 40)), q1 = quantile7(v, 0.25), q3 = quantile7(v, 0.75);
    return { sec: "2.6.1", prompt: T`Using R's default quantile rule (<code>quantile()</code>, type 7), compute the <b>IQR</b> of ${setT(v)}.`, ans: q3 - q1, tol: 0.01,
      explain: T`\(Q_1 = ${fmt(q1)}\), \(Q_3 = ${fmt(q3)}\), so ${D(T`\text{IQR} = Q_3 - Q_1 = ${fmt(q3 - q1)}`)} (Type 7: the \(p\)-quantile sits at position \((n-1)p + 1\) of the sorted data, interpolating.)` }; },
  rms: () => { const v = Array.from({ length: 5 }, () => ri(-6, 6)), ms = mean(v.map(x => x * x)), r = Math.sqrt(ms);
    return { sec: "2.6.2", prompt: T`Compute the <b>RMS</b> (root mean square) of ${setT(v)}.`, ans: r,
      explain: D(T`\text{RMS} = \sqrt{\frac{1}{n}\sum_{i=1}^{n} x_i^2} = \sqrt{${fmt(ms)}} = ${fmt(r)}`) + T`The mean is \(${fmt(mean(v))}\): RMS ignores sign.` }; },
  sd: () => { const v = Array.from({ length: 5 }, () => ri(1, 12)), useN = Math.random() < 0.5, m = mean(v), ss = sumsq(v, m), d = useN ? v.length : v.length - 1, s = Math.sqrt(ss / d);
    return { sec: "2.6.2", prompt: T`Compute the <b>standard deviation</b> of ${setT(v)} using \(${useN ? "n" : "n-1"}\) in the denominator.`, ans: s,
      explain: T`\(\bar{x} = ${fmt(m)}\) and \(\sum (x_i - \bar{x})^2 = ${fmt(ss)}\), so` + D(T`s = \sqrt{\frac{1}{${useN ? "n" : "n-1"}}\sum_{i=1}^{n}(x_i - \bar{x})^2} = \sqrt{\frac{${fmt(ss)}}{${d}}} = ${fmt(s)}`) + T`R's <code>sd()</code> uses \(n-1\).` }; },
  variance: () => { const v = Array.from({ length: 4 }, () => ri(1, 10)), m = mean(v), ss = sumsq(v, m), s2 = ss / (v.length - 1);
    return { sec: "2.6.2", prompt: T`Compute <code>var(c(${v.join(", ")}))</code> (R divides by \(n-1\)).`, ans: s2,
      explain: D(T`s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2 = \frac{${fmt(ss)}}{${v.length - 1}} = ${fmt(s2)}`) + T`with \(\bar{x} = ${fmt(m)}\). Variance \(= \text{SD}^2\).` }; },
  zscore: () => { const m = ri(40, 70), s = ri(4, 12), x = m + ri(-25, 25);
    return { sec: "3.6.2", prompt: T`A variable has mean \(\bar{x} = ${m}\) and standard deviation \(S_x = ${s}\). What is the <b>z-score</b> of an observation \(x_i = ${x}\)?`, ans: (x - m) / s,
      explain: D(T`z_i = \frac{x_i - \bar{x}}{S_x} = \frac{${x} - ${m}}{${s}} = ${fmt((x - m) / s)}`) + `That many standard deviations ${x >= m ? "above" : "below"} the mean.` }; },
  cor: () => { const x = [1, 2, 3, 4, 5].map(() => ri(1, 9)), y = x.map(v => v + ri(-3, 3)); const mx = mean(x), my = mean(y), sx = sdN1(x), sy = sdN1(y);
    if (!sx || !sy) return STATS.cor(); const r = x.reduce((a, xi, i) => a + (xi - mx) / sx * (y[i] - my) / sy, 0) / (x.length - 1);
    return { sec: "3.6.2", prompt: T`Compute the <b>correlation</b> between \(x = ${setT(x).slice(2, -2)}\) and \(y = ${setT(y).slice(2, -2)}\).`, ans: r, tol: 0.01,
      explain: D(T`r = \frac{1}{n-1}\sum_{i=1}^{n}\frac{x_i - \bar{x}}{S_x}\cdot\frac{y_i - \bar{y}}{S_y} = ${fmt(r)}`) + T`with \(\bar{x} = ${fmt(mx)}\), \(\bar{y} = ${fmt(my)}\), \(S_x = ${fmt(sx)}\), \(S_y = ${fmt(sy)}\).` }; },
  did: () => { const tb = ri(20, 40), cb = ri(20, 40), ta = tb + ri(-5, 10), ca = cb + ri(-5, 5);
    return { sec: "2.5.3", page: 62, prompt: T`Mean outcomes: treated before \(= ${tb}\), treated after \(= ${ta}\); control before \(= ${cb}\), control after \(= ${ca}\). Compute the <b>difference-in-differences</b> estimate.`, ans: (ta - tb) - (ca - cb),
      explain: D(T`\text{DiD} = \left(\bar{Y}^{\text{after}}_{\text{treated}} - \bar{Y}^{\text{before}}_{\text{treated}}\right) - \left(\bar{Y}^{\text{after}}_{\text{control}} - \bar{Y}^{\text{before}}_{\text{control}}\right) = (${ta} - ${tb}) - (${ca} - ${cb}) = ${(ta - tb) - (ca - cb)}`) + "It estimates the SATT under the parallel trends assumption." }; },
  beforeAfter: () => { const tb = ri(20, 40), ta = tb + ri(-6, 10), cb = ri(20, 40), ca = cb + ri(-5, 5);
    return { sec: "2.5.3", page: 61, prompt: T`Treated before \(= ${tb}\), treated after \(= ${ta}\); control before \(= ${cb}\), control after \(= ${ca}\). What is the <b>before-and-after</b> estimate for the treated group?`, ans: ta - tb,
      explain: D(T`\bar{Y}^{\text{after}}_{\text{treated}} - \bar{Y}^{\text{before}}_{\text{treated}} = ${ta} - ${tb} = ${ta - tb}`) + T`It ignores the control group, so it cannot remove time trends (DiD would give \(${(ta - tb) - (ca - cb)}\)).` }; },
  sate: () => { const y1 = Array.from({ length: 4 }, () => ri(0, 10)), y0 = y1.map(v => v - ri(-2, 5)), d = y1.map((v, i) => v - y0[i]);
    return { sec: "2.4.1", page: 49, prompt: T`Hypothetically we know both potential outcomes for 4 units: \(Y_i(1) = ${setT(y1).slice(2, -2)}\), \(Y_i(0) = ${setT(y0).slice(2, -2)}\). Compute the <b>SATE</b>.`, ans: mean(d),
      explain: D(T`\text{SATE} = \frac{1}{n}\sum_{i=1}^{n}\{Y_i(1) - Y_i(0)\} = \frac{1}{4}(${d.join(" + ").replace(/\+ -/g, "- ")}) = ${fmt(mean(d))}`) + "In real data only one potential outcome per unit is observed." }; },
  diffMeans: () => { const t = Array.from({ length: 4 }, () => ri(0, 1)), c = Array.from({ length: 5 }, () => ri(0, 1)); t[0] = 1;
    return { sec: "2.4.1", prompt: T`Binary outcomes in the treatment group: ${setT(t)}; in the control group: ${setT(c)}. Compute the <b>difference-in-means</b> estimate.`, ans: mean(t) - mean(c),
      explain: D(T`\bar{Y}_{\text{treated}} - \bar{Y}_{\text{control}} = ${fmt(mean(t))} - ${fmt(mean(c))} = ${fmt(mean(t) - mean(c))}`) + "Each mean of a 0/1 variable is a proportion of 1s." }; },
  biasRmse: () => { const actual = Array.from({ length: 4 }, () => ri(-10, 10)), pred = actual.map(a => a + ri(-6, 6)), err = actual.map((a, i) => a - pred[i]), wantRmse = Math.random() < 0.5;
    const b = mean(err), r = Math.sqrt(mean(err.map(e => e * e)));
    return { sec: "4.1.3", page: 133, prompt: T`Actual margins: ${setT(actual)}. Predicted margins: ${setT(pred)}. Compute the <b>${wantRmse ? "RMSE" : "bias"}</b> of the predictions.`, ans: wantRmse ? r : b,
      explain: T`Errors \(e_i = \text{actual} - \text{predicted}\): ${setT(err)}.` + D(T`\text{bias} = \frac{1}{n}\sum_{i=1}^{n} e_i = ${fmt(b)}, \qquad \text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n} e_i^2} = ${fmt(r)}`) }; },
  r2: () => { const tss = ri(200, 900), ssr = ri(20, tss - 20);
    return { sec: "4.2.6", page: 156, prompt: T`A regression has \(\text{TSS} = ${tss}\) and \(\text{SSR} = ${ssr}\). Compute \(R^2\).`, ans: 1 - ssr / tss,
      explain: D(T`R^2 = 1 - \frac{\text{SSR}}{\text{TSS}} = 1 - \frac{${ssr}}{${tss}} = ${fmt(1 - ssr / tss)}`) }; },
  adjR2: () => { const n = ri(20, 60), p = ri(1, 4), tss = ri(300, 900), ssr = ri(50, tss - 50), a = 1 - (ssr / (n - p - 1)) / (tss / (n - 1));
    return { sec: "4.3.2", prompt: T`\(n = ${n}\), \(p = ${p}\) predictors, \(\text{TSS} = ${tss}\), \(\text{SSR} = ${ssr}\). Compute the <b>adjusted</b> \(R^2\).`, ans: a,
      explain: D(T`\text{adjusted } R^2 = 1 - \frac{\text{SSR}/(n-p-1)}{\text{TSS}/(n-1)} = 1 - \frac{${ssr}/${n - p - 1}}{${tss}/${n - 1}} = ${fmt(a)}`) }; },
  slopeFromCor: () => { const r = ri(-9, 9) / 10 || 0.5, sx = ri(2, 10), sy = ri(2, 20);
    return { sec: "4.2.3", page: 148, prompt: T`The correlation between \(X\) and \(Y\) is \(${r}\), \(\text{SD}(X) = ${sx}\), \(\text{SD}(Y) = ${sy}\). What is the least-squares slope \(\hat{\beta}\)?`, ans: r * sy / sx,
      explain: D(T`\hat{\beta} = \text{cor}(X, Y)\cdot\frac{\text{SD}(Y)}{\text{SD}(X)} = ${r}\cdot\frac{${sy}}{${sx}} = ${fmt(r * sy / sx)}`) }; },
  intercept: () => { const b = ri(-30, 30) / 10 || 1, mx = ri(1, 20), my = ri(-10, 40);
    return { sec: "4.2.3", prompt: T`Least squares gave slope \(\hat{\beta} = ${b}\). The sample means are \(\bar{X} = ${mx}\), \(\bar{Y} = ${my}\). What is the intercept \(\hat{\alpha}\)?`, ans: my - b * mx,
      explain: T`The line passes through \((\bar{X}, \bar{Y})\), so` + D(T`\hat{\alpha} = \bar{Y} - \hat{\beta}\bar{X} = ${my} - (${b})(${mx}) = ${fmt(my - b * mx)}`) }; },
  predicted: () => { const a = ri(-20, 20) / 10, b = ri(-30, 30) / 10 || 1, x = ri(0, 10);
    return { sec: "4.2.3", page: 144, prompt: T`Fitted model: \(\hat{Y} = ${a}${coef(b, "X")}\). What is the <b>fitted value</b> at \(X = ${x}\)?`, ans: a + b * x,
      explain: D(T`\hat{Y} = \hat{\alpha} + \hat{\beta}x = ${a} + (${b})(${x}) = ${fmt(a + b * x)}`) }; },
  residual: () => { const a = ri(-10, 10), b = ri(1, 5), x = ri(0, 10), y = a + b * x + ri(-6, 6);
    return { sec: "4.2.3", page: 144, prompt: T`Fitted model: \(\hat{Y} = ${a}${coef(b, "X")}\). An observation has \(X = ${x}\), \(Y = ${y}\). What is its <b>residual</b>?`, ans: y - (a + b * x),
      explain: D(T`\hat{\varepsilon} = Y - \hat{Y} = ${y} - (${a} + ${b}\cdot ${x}) = ${y - (a + b * x)}`) }; },
  dummy: () => { const a = ri(20, 40) / 100, b1 = ri(-5, 5) / 100, b2 = ri(1, 9) / 100;
    return { sec: "4.3.2", prompt: T`<code>lm(turnout ~ group)</code> with base level "A" gives (Intercept) \(= ${a}\), groupB \(= ${b1}\), groupC \(= ${b2}\). What is the <b>predicted turnout in group C</b>?`, ans: a + b2,
      explain: T`Coefficients are differences from the base level:` + D(T`\hat{Y}_C = \hat{\alpha} + \hat{\beta}_C = ${a} + ${b2} = ${fmt(a + b2)}`) + T`The effect of C relative to B is \(\hat{\beta}_C - \hat{\beta}_B = ${fmt(b2 - b1)}\).` }; },
  interaction: () => { const b1 = ri(-20, 40) / 1000, b3 = ri(1, 12) / 10000 * (Math.random() < 0.3 ? -1 : 1), x2 = ri(20, 80);
    return { sec: "4.3.3", page: 172, prompt: T`Model: \(Y = \alpha + \beta_1 T + \beta_2\,\text{Age} + \beta_3 (T \times \text{Age}) + \varepsilon\), with \(\beta_1 = ${b1}\), \(\beta_3 = ${b3}\). What is the estimated effect of \(T\) (treatment vs. control) for a ${x2}-year-old?`, ans: b1 + b3 * x2, tol: 0.0006,
      explain: T`Compare \(T = 1\) with \(T = 0\) at the same age:` + D(T`\beta_1 + \beta_3\,\text{Age} = ${b1} + (${b3})(${x2}) = ${fmt(b1 + b3 * x2, 4)}`) }; },
  listExp: () => { const c = ri(150, 220) / 100, t = c + ri(2, 30) / 100;
    return { sec: "3.4.2", prompt: T`In a list experiment, the control group's mean item count is \(${c.toFixed(2)}\) and the treatment group's (list plus the sensitive item) is \(${t.toFixed(2)}\). Estimate the proportion supporting the sensitive item.`, ans: t - c,
      explain: D(T`\bar{Y}_{\text{treatment}} - \bar{Y}_{\text{control}} = ${t.toFixed(2)} - ${c.toFixed(2)} = ${fmt(t - c)}`) }; },
  density: () => { const n = ri(100, 500), k = ri(10, 80), w = pick([1, 2, 5, 10]);
    return { sec: "3.3.2", page: 83, prompt: T`A histogram bin of width \(${w}\) contains \(${k}\) of \(${n}\) observations. What is the bin's <b>density</b> (its height)?`, ans: k / n / w, tol: 0.0006,
      explain: D(T`\text{density} = \frac{\text{proportion in bin}}{\text{bin width}} = \frac{${k}/${n}}{${w}} = ${fmt(k / n / w, 4)}`) + T`The bin's area, \(${fmt(k / n, 4)}\), is the proportion.` }; },
  participation: () => { const contacted = ri(2000, 4000), refused = ri(100, 600);
    return { sec: "3.1", prompt: T`A survey contacted \(${contacted}\) people and \(${refused}\) refused. What is the <b>participation rate</b>?`, ans: (contacted - refused) / contacted,
      explain: D(T`\frac{\text{contacted} - \text{refused}}{\text{contacted}} = \frac{${contacted - refused}}{${contacted}} = ${fmt((contacted - refused) / contacted)}`) }; },
};

export class Stats {
  items() { return Object.keys(STATS).map(k => `stats:${k}`); }
  make(itemId) {
    const g = STATS[itemId.slice(6)](), tol = g.tol ?? 0.006;
    return { id: itemId, topic: "Compute", ref: ref(g.sec, g.page), format: "numeric", prompt: g.prompt + "<div class=hint>Round to 3 decimals.</div>",
      answer: fmt(g.ans, 4), check: numCheck(g.ans, tol), explain: g.explain };
  }
}

// ---------- calculus (math.js computes and checks; KaTeX displays) ----------
// Polynomial text from [coefficient, monomial] pairs, written the way you'd write it by hand:
// zero terms dropped, no "1x", no "+ -".
const polyStr = terms => terms.filter(([c]) => c !== 0).map(([c, m], i) => {
  const mag = Math.abs(c), body = m ? (mag === 1 ? m : `${mag}*${m}`) : String(mag);
  return (i === 0 ? (c < 0 ? "-" : "") : (c < 0 ? " - " : " + ")) + body;
}).join("") || "0";
const nz = (a, b) => ri(a, b) || 1;
const CALC = {
  power: () => { const a = pick([1, 2, 3, 4, 5, -2]), n = pick([2, 3, 4, 5, -1, -2, 0.5]); return { f: polyStr([[a, `x^${n}`]]), rule: T`Power rule: \(\frac{d}{dx}x^n = n\,x^{n-1}\); constant multiples carry through.` }; },
  poly: () => ({ f: polyStr([[ri(1, 5), "x^3"], [ri(-6, 6), "x^2"], [nz(-9, 9), "x"], [ri(-5, 5), ""]]), rule: T`Differentiate term by term with the power rule \(\frac{d}{dx}x^n = n\,x^{n-1}\); constants vanish.` }),
  product: () => ({ f: `(${polyStr([[ri(1, 4), `x^${ri(2, 3)}`], [nz(-5, 5), ""]])}) * (${polyStr([[ri(1, 4), "x"], [-1, ""]])})`, rule: T`Product rule: \((fg)' = f'g + fg'\).` }),
  quotient: () => ({ f: `(${polyStr([[ri(1, 5), "x"], [nz(-4, 4), ""]])}) / (${polyStr([[ri(1, 3), "x"], [ri(1, 5), ""]])})`, rule: T`Quotient rule: \(\left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}\).` }),
  chain: () => { const a = ri(1, 4), b = nz(-5, 5), n = pick([2, 3, 4]);
    return { f: pick([`(${polyStr([[a, "x^2"], [b, ""]])})^${n}`, `sqrt(${polyStr([[a, "x"], [Math.abs(b) + 1, ""]])})`, `(${polyStr([[Math.abs(b) + 1, ""], [-a, "x"]])})^2`]), rule: T`Chain rule: \(\frac{d}{dx}f(g(x)) = f'(g(x))\,g'(x)\).` }; },
  partialX: () => ({ f: polyStr([[ri(1, 5), "x^2*y"], [ri(-4, 4), "x*y"], [ri(1, 3), "y^2"]]), v: "x", rule: T`Partial derivative \(\frac{\partial f}{\partial x}\): differentiate in \(x\), treating \(y\) as a constant.` }),
  partialY: () => ({ f: polyStr([[ri(1, 5), "x^2*y"], [ri(-4, 4), "x*y"], [ri(1, 3), "y^2"]]), v: "y", rule: T`Partial derivative \(\frac{\partial f}{\partial y}\): differentiate in \(y\), treating \(x\) as a constant.` }),
};
// Standard form for display: expanded, descending powers when possible; otherwise simplified.
const tidy = node => { try { return rationalize(node); } catch { return simplify(node); } };
const equivalent = (userExpr, truth, vars) => {
  let u; try { u = parse(userExpr.replace(/\*\*/g, "^")).compile(); } catch { return false; }
  const t = truth.compile();
  for (let k = 0; k < 6; k++) {
    const scope = Object.fromEntries(vars.map(v => [v, 0.5 + Math.random() * 3]));
    let a, b; try { a = u.evaluate(scope); b = t.evaluate(scope); } catch { return false; }
    if (!Number.isFinite(a) || Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return false;
  }
  return true;
};

const OPT = {
  quadOpt: () => { const a = pick([-3, -2, -1, 1, 2, 3]), h = ri(-5, 5), b = -2 * a * h, c = ri(-9, 9);
    return { sec: "Calculus · Optimization", prompt: D(T`f(x) = ${coef(a, "x^2", true)}${coef(b, "x")} ${sgn(c)}`) + T`At what \(x\) is \(f\)'s critical point (set \(f'(x) = 0\))?`, ans: h,
      explain: D(T`f'(x) = ${coef(2 * a, "x", true)}${b ? ` ${sgn(b)}` : ""} = 0 \;\Rightarrow\; x = ${h}`) + T`\(f''(x) = ${2 * a} ${a > 0 ? "> 0" : "< 0"}\), so it is a ${a > 0 ? "minimum" : "maximum"}.` }; },
  turning: () => { const b1 = ri(5, 20) / 1000, b2 = -ri(5, 20) / 100000;
    return { sec: "Calculus · Derivatives of a linear model", prompt: T`Turnout model: ${D(T`\hat{Y} = \alpha + ${b1}\,\text{Age} - ${Math.abs(b2)}\,\text{Age}^2`)}At what age is predicted turnout highest? (Set \(d\hat{Y}/d\,\text{Age} = 0\).)`, ans: -b1 / (2 * b2), tol: 0.06,
      explain: D(T`\frac{d\hat{Y}}{d\,\text{Age}} = ${b1} - 2(${Math.abs(b2)})\,\text{Age} = 0 \;\Rightarrow\; \text{Age}^* = -\frac{\beta_1}{2\beta_2} = ${fmt(-b1 / (2 * b2), 2)}`) + T`Since \(\beta_2 < 0\), this is a peak.` }; },
  marginal: () => { const b1 = ri(-30, 30) / 10 || 1, b3 = ri(-20, 20) / 10 || 0.5, x2 = ri(0, 10);
    return { sec: "Calculus · Derivatives of a linear model", prompt: D(T`Y = \alpha ${sgn(b1)}\,X_1 + \beta_2 X_2 ${sgn(b3)}\,X_1 X_2`) + T`What is \(\frac{\partial Y}{\partial X_1}\) when \(X_2 = ${x2}\)?`, ans: b1 + b3 * x2,
      explain: D(T`\frac{\partial Y}{\partial X_1} = \beta_1 + \beta_3 X_2 = ${b1} + (${b3})(${x2}) = ${fmt(b1 + b3 * x2)}`) + T`The marginal effect of \(X_1\) depends on \(X_2\).` }; },
  meanMin: () => { const v = Array.from({ length: 4 }, () => ri(1, 12));
    return { sec: "Calculus · Optimization", prompt: T`Find \(c\) minimizing \(S(c) = \sum_{i}(x_i - c)^2\) for \(x = ${setT(v).slice(2, -2)}\).`, ans: mean(v),
      explain: D(T`\frac{dS}{dc} = -2\sum_{i=1}^{n}(x_i - c) = 0 \;\Rightarrow\; c = \frac{1}{n}\sum_{i=1}^{n} x_i = \bar{x} = ${fmt(mean(v))}`) + "The mean minimizes the sum of squared deviations." }; },
  twoVar: () => { const h = ri(-4, 4), k = ri(-4, 4), a = ri(1, 3), b = ri(1, 3), wantX = Math.random() < 0.5;
    const sq = (v, c) => c === 0 ? `${v}^2` : `(${v} ${c > 0 ? "-" : "+"} ${Math.abs(c)})^2`;
    return { sec: "Calculus · Optimization", prompt: D(T`f(x, y) = ${a === 1 ? "" : a}${sq("x", h)} + ${b === 1 ? "" : b}${sq("y", k)} + 7`) + T`Set both partial derivatives to 0. What is \(${wantX ? "x" : "y"}\) at the minimum?`, ans: wantX ? h : k,
      explain: D(T`\frac{\partial f}{\partial x} = ${2 * a}(x - ${h}) = 0 \Rightarrow x = ${h}, \qquad \frac{\partial f}{\partial y} = ${2 * b}(y - ${k}) = 0 \Rightarrow y = ${k}`).replace(/- -/g, "+ ") }; },
};

export class Calculus {
  items() { return [...Object.keys(CALC).map(k => `calc:${k}`), ...Object.keys(OPT).map(k => `opt:${k}`)]; }
  make(itemId) {
    const [kind, key] = itemId.split(":");
    if (kind === "opt") { const g = OPT[key]();
      return { id: itemId, topic: "Calculus", ref: g.sec, format: "numeric", prompt: g.prompt + "<div class=hint>Round to 3 decimals.</div>", answer: fmt(g.ans, 4), check: numCheck(g.ans, g.tol ?? 0.006), explain: g.explain }; }
    const g = CALC[key](), v = g.v ?? "x", truth = derivative(g.f, v), vars = g.v ? ["x", "y"] : ["x"];
    const lhs = g.v ? T`\frac{\partial f}{\partial ${v}}` : T`f'(x)`, fx = g.v ? "f(x, y)" : "f(x)";
    const shown = tidy(truth), shownTex = cleanTex(shown.toTex({ parenthesis: "auto", implicit: "hide" }));   // display only; checking uses truth
    return { id: itemId, topic: "Calculus · Differentiation", ref: "Calculus Fundamentals", format: "expr",
      prompt: T`Differentiate with respect to \(${v}\):` + D(`${fx} = ${texOf(g.f)}`) + T`<div class=hint>Type your answer as an expression, e.g. <code>6*x^2 - 2/x^3</code> (use <code>*</code>, <code>^</code>, <code>sqrt()</code>). A typeset preview appears as you type; any equivalent form counts.</div>`,
      answer: shown.toString(), answerHtml: M(`${lhs} = ${shownTex}`),
      check: s => equivalent(s, truth, vars), explain: g.rule + D(`${lhs} = ${shownTex}`) };
  }
}
