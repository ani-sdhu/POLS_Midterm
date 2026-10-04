import { Runtime } from "./rt.js";
import { BookCode, Boxes, Vocab, Stats, Calculus, Concepts, Scenarios, SynthR, esc, PAGE, SECTION_TITLES, sectionKey, exprPreview } from "./gen.js";
import { AI } from "./ai.js";
import { BookBoxes, findPdf, savePdf, forgetPdf } from "./pdfbox.js";
import ch1 from "./assess/ch1.js";
import ch2 from "./assess/ch2.js";
import ch3 from "./assess/ch3.js";
import ch4 from "./assess/ch4.js";
import calcAssess from "./assess/calc.js";
import { DICTS, TOPICS } from "./flash/topics.js";
import fCommands from "./flash/cards_commands.js";
import fConcepts from "./flash/cards_concepts.js";
import fEquations from "./flash/cards_equations.js";
import fGraphs from "./flash/cards_graphs.js";

const KNOWLEDGE = ["steps_ch1", "steps_ch2", "steps_ch3", "steps_ch4", "cases", "boxes", "vocab", "concepts", "scenarios", "box_geom", "calculus"];
const $ = s => document.querySelector(s);
const getJSON = async p => (await fetch(p)).json();

// ---------- persistence (per-browser; nothing leaves this machine) ----------
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let mastery = store.get("qss.mastery", {});        // itemId -> {n, c, s: EWMA score 0..1, t}
let settings = store.get("qss.settings", { focus: "all" });

// Spaced repetition: a correct answer retires the item for a growing interval; a miss keeps it in play.
const INTERVALS = [10, 60, 360, 1440, 4320].map(min => min * 60000);   // 10 min, 1 h, 6 h, 1 day, 3 days
function record(id, score) {
  const m = mastery[id] ?? { n: 0, c: 0, s: 0 }, now = Date.now();
  m.n++; m.c += score; m.s = m.n === 1 ? score : 0.6 * m.s + 0.4 * score; m.t = now;
  m.streak = score >= 1 ? (m.streak ?? 0) + 1 : 0;
  m.due = score >= 1 ? now + INTERVALS[Math.min(m.streak, INTERVALS.length) - 1] : now;
  mastery[id] = m; store.set("qss.mastery", mastery);
}
const isDue = id => (mastery[id]?.due ?? 0) <= Date.now();
const recent = [];                                   // last questions shown this session (never repeat immediately)
const RECENT_N = 8;
let reviewEarly = false;                             // "review anyway" for the current focus
const fmtWait = ms => ms < 3600000 ? `${Math.max(1, Math.round(ms / 60000))} min` : ms < 86400000 ? `${Math.round(ms / 3600000)} h` : `${Math.round(ms / 86400000)} day${ms >= 1.5 * 86400000 ? "s" : ""}`;
// Unseen items get the most weight, then weak ones; definition boxes get a boost.
const weight = id => { const m = mastery[id]; const w = m ? 0.1 + 0.9 * (1 - m.s) ** 2 : 3; return id.startsWith("box:") ? w * 1.5 : w; };
function weightedPick(ids) {
  const ws = ids.map(weight), total = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ids.length; i++) if ((r -= ws[i]) <= 0) return ids[i];
  return ids.at(-1);
}

// ---------- boot ----------
const [book, ...kn] = await Promise.all([getJSON("bookcode.json"), ...KNOWLEDGE.map(k => getJSON(`knowledge/${k}.json`))]);
const [s1, s2, s3, s4, cases, boxes, vocab, concepts, scenarios, boxGeom, calcSheet] = kn;
const notes = { ...s1, ...s2, ...s3, ...s4 };
const flashOut = await getJSON("flash/outputs.json").catch(() => ({}));   // built by build_flash.mjs
const ai = new AI();
const factPool = [
  ...boxes.boxes.map(b => ({ section: b.section, get text() { return `${b.term}: ${bookBoxes.texts?.[b.id] ?? ""}`; } })),
  ...concepts.items.map(c => ({ section: c.section, text: `${c.q} ${c.a}` })),
  ...vocab.terms.map(t => ({ section: t.section, text: `${t.term}: ${t.def}` })),
];
const aiError = e => { console.warn(e); $("#rstatus").textContent = "AI add-on: " + e.message; };
const bookBoxes = new BookBoxes();
const openBook = data => bookBoxes.init(boxes.boxes, boxGeom, data).then(() => true)
  .catch(e => { $("#rstatus").textContent = "Could not read the textbook PDF (box questions disabled): " + e.message; return false; });
// No PDF found (the website never hosts it): box questions wait until the student opens their own copy.
let bookReadyP = findPdf().then(data => data ? openBook(data) : false);
bookReadyP.then(ok => { $("#openbook").hidden = ok; });
$("#openbook").onclick = () => $("#bookfile").click();
$("#bookfile").onchange = async e => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  $("#openbook").textContent = "📖 Reading…";
  const data = await file.arrayBuffer();
  const ok = await (bookReadyP = openBook(data));
  $("#openbook").textContent = "📖 Open textbook PDF";
  $("#openbook").hidden = ok;
  if (!ok) return;
  await savePdf(data);
  for (const k in passageCache) delete passageCache[k];
  if (!$("#study").hidden) renderStudy();
  if (!$("#quiz").hidden && !answered) go();
};
const rt = new Runtime(book);
let rReady = false;
const rReadyP = rt.init(m => { $("#rstatus").textContent = m; }).then(() => { rReady = true; $("#rstatus").textContent = ""; return true; })
  .catch(e => { $("#rstatus").textContent = "R failed to load (code questions disabled): " + e.message; return false; });

const sources = {
  code: new BookCode(book, notes, cases.cases, rt),
  box: new Boxes(boxes.boxes, bookBoxes),
  vocab: new Vocab(vocab.terms),
  stats: new Stats(),
  calc: new Calculus(),
  concept: new Concepts(concepts.items),
  scen: new Scenarios(scenarios),
  synth: new SynthR(rt),
  ai: { items: () => ai.on ? ["ai:gen"] : [], make: () => ai.question(factPool).catch(e => (aiError(e), null)) },
};
const AREAS = [["code", "Book code"], ["box", "★ Definition boxes"], ["concept", "Concepts"], ["scen", "Research design"], ["synth", "R practice"], ["vocab", "Vocabulary"], ["stats", "Computation"], ["calc", "Calculus"]];
const sectionOf = id => { const [k, a] = id.split(":"); return ({ code: sources.code, box: sources.box, vocab: sources.vocab, concept: sources.concept, scen: sources.scen })[k]?.byId[a]?.section ?? null; };
const inSection = (sec, s) => !!s && (s === sec || s.startsWith(sec + "."));
const chapterOf = id => { const s = sectionOf(id); return s ? "ch" + s[0] : null; };
const FOCUS = {
  all: { code: 3.5, synth: 1.5, box: 2.5, concept: 2, scen: 1.5, stats: 1.5, calc: 1, vocab: 1 },
  boxes: { box: 1 }, code: { code: 1 }, rpractice: { synth: 1 }, compute: { stats: 1 }, calculus: { calc: 1 }, vocab: { vocab: 1 }, concepts: { concept: 1 }, design: { scen: 1 },
  ch1: { code: 3, concept: 1 }, ch2: { code: 4, box: 2, concept: 2, scen: 1.5, vocab: 1 }, ch3: { code: 4, box: 2, concept: 2, scen: 1, vocab: 1 }, ch4: { code: 4, box: 2, concept: 2, scen: 1, vocab: 1 },
};
const mixFor = f => f === "sec:calc" ? { calc: 2, stats: 1 } : f.startsWith("sec:") ? { code: 4, box: 2.5, concept: 2, scen: 1.5, vocab: 1 } : FOCUS[f] ?? FOCUS.all;
function candidates(src) {
  let ids = sources[src].items();
  if (settings.focus.startsWith("ch")) ids = ids.filter(id => chapterOf(id) === settings.focus);
  if (settings.focus.startsWith("sec:") && settings.focus !== "sec:calc") ids = ids.filter(id => inSection(settings.focus.slice(4), sectionOf(id)));
  return ids;
}

async function nextQuestion() {
  const mix = { ...mixFor(settings.focus) };
  if (ai.on && (settings.focus === "all" || settings.focus === "design" || settings.focus === "concepts")) mix.ai = 1.5;
  if (!rReady) { delete mix.code; delete mix.synth; }
  const all = Object.fromEntries(Object.keys(mix).map(s => [s, candidates(s)]));
  if (!Object.values(all).some(ids => ids.length)) return { format: "wait" };
  const fresh = id => id.startsWith("ai:") || !recent.includes(id);
  let pools = Object.fromEntries(Object.entries(all).map(([s, ids]) => [s, ids.filter(id => fresh(id) && (reviewEarly || id.startsWith("ai:") || isDue(id)))]));
  if (!Object.values(pools).some(p => p.length)) {
    if (!reviewEarly) {
      const next = Math.min(...Object.values(all).flat().map(id => mastery[id]?.due ?? 0));
      return { format: "caughtup", wait: next - Date.now() };
    }
    pools = all;                                     // tiny focus: allow repeats rather than nothing
  }
  const srcs = Object.keys(pools).filter(s => pools[s].length);
  for (let tries = 0; tries < 8; tries++) {
    let r = Math.random() * srcs.reduce((a, s) => a + mix[s], 0), src = srcs.at(-1);
    for (const s of srcs) if ((r -= mix[s]) <= 0) { src = s; break; }
    const id = weightedPick(pools[src]);
    let q = await sources[src].make(id);
    if (q && settings.shortAnswer && q.format === "mc" && /FALSE/.test(q.prompt)) q = null;
    if (q) { recent.push(id); if (recent.length > RECENT_N) recent.shift(); return q; }
  }
  return null;
}

// ---------- shared rendering helpers ----------
// Typeset LaTeX written as \( inline \) or $$ display $$ (KaTeX auto-render; code and pre are skipped).
const MATH_OPTS = { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }], throwOnError: false };
const typeset = el => { if (!el) return; if (window.renderMathInElement) window.renderMathInElement(el, MATH_OPTS); else window.addEventListener("load", () => window.renderMathInElement?.(el, MATH_OPTS), { once: true }); };
const codeBlock = (code, cls = "") => `<pre class="code ${cls}">${esc(code)}</pre>`;
const commentBlock = c => c ? codeBlock(c.split("\n").map(l => "## " + l).join("\n"), "dim") : "";
const caseHtml = (c, open = false) => `<details class=case ${open ? "open" : ""}><summary>Case context: ${esc(c.title)}</summary><p>${esc(c.about)}</p><table>${Object.entries(c.vars).map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${esc(v)}</td></tr>`).join("")}</table></details>`;
const block = (label, inner) => `<div class=block><div class=label>${label}</div>${inner}</div>`;

// ---------- quiz ----------
let current = null, answered = false;

// Short-answer mode: a multiple-choice question becomes "write it, reveal, self-grade" (typed formats stay auto-graded).
function toShortAnswer(q) {
  if (!settings.shortAnswer || q?.format !== "mc") return q;
  const right = q.options[q.answer];
  const answerHtml = q.optionsAreCode ? codeBlock(right) : `<p class=model><b>${esc(right)}</b></p>`;
  return { ...q, format: "self", options: undefined, prompt: q.prompt + `<div class=hint>Short-answer mode: write your answer, then reveal.</div>`,
    explain: `<div class=label>Answer</div>${answerHtml}${q.explain ? `<div class=label>Why</div><div>${q.explain}</div>` : ""}` };
}

// Everything above the answer area: topic, case, code, output, prompt.
function questionHtml(q) {
  let h = `<div class=q-meta><span class="chip ${q.star ? "star" : ""}">${esc(q.topic)}</span><span class=ref>${esc(q.ref)}</span></div>`;
  if (q.caseCard) h += caseHtml(q.caseCard);
  if (q.originalCode) h += block("Original code", codeBlock(q.originalCode)) + (q.output ? block("Original output", codeBlock(q.output, "out")) : "");
  if (q.code) h += block(q.originalCode ? "Changed code" : "Code", (q.originalCode ? "" : commentBlock(q.comment) + (q.codeBefore ? codeBlock(q.codeBefore, "dim") : "")) + codeBlock(q.code, "hl"));
  if (q.output && !q.originalCode) h += block("Output", codeBlock(q.output, "out"));
  return h + `<div class=prompt>${q.prompt}</div>`;
}

function render(q) {
  q = toShortAnswer(q);
  current = q; answered = false;
  const card = $("#card");
  if (q?.format === "caughtup") {
    card.innerHTML = `<h2 class=page>✓ All caught up</h2>
      <p>You've answered everything in <b>${esc($("#focus").selectedOptions[0]?.dataset.label ?? "this focus")}</b> correctly, and nothing is due for review yet.
      The next item comes back in about <b>${fmtWait(q.wait)}</b>.</p>
      <div class=actions><button id=early>Review early anyway</button><button id=everything class=primary>Quiz everything</button></div>`;
    $("#early").onclick = () => { reviewEarly = true; go(); };
    $("#everything").onclick = () => { settings.focus = "all"; store.set("qss.settings", settings); $("#focus").value = "all"; updateBar(); go(); };
    return;
  }
  if (!q || q.format === "wait") {
    card.innerHTML = `<p class=muted>${rReady ? "No questions match this focus." : "R is still starting (about 10 seconds). Code questions will appear here automatically."}</p>`;
    if (!rReady && q) rReadyP.then(() => { if (current === q) go(); });
    return;
  }
  let h = questionHtml(q);
  if (q.format === "mc") {
    h += `<div class=opts>${q.options.map((o, i) => `<label class=opt><input type=radio name=opt value=${i}><span class=key>${i + 1}</span>${q.optionsAreCode ? codeBlock(o) : `<span>${esc(o)}</span>`}</label>`).join("")}</div>`;
  } else if (q.format === "self") {
    h += `<textarea id=ans rows=5 placeholder="Write your answer, then reveal the book's version."></textarea>`;
  } else {
    h += `<input id=ans autocomplete=off spellcheck=false placeholder="${q.format === "expr" ? "derivative, e.g. 6*x^2 - 2/x^3" : "your answer"}">`;
    if (q.format === "expr") h += `<div class=preview id=preview></div>`;
  }
  h += `<div class=actions><button id=submit class=primary>${q.format === "self" ? "Reveal answer" : "Check"}</button><button id=skip>Skip</button><span class=keys>${q.format === "mc" ? "1–4 to pick · " : ""}${q.format === "self" ? "Enter to reveal" : q.format === "mc" ? "Space or Enter to check" : "Enter to check"}, then Space for next</span></div><div id=feedback></div>`;
  card.innerHTML = h;
  $("#submit").onclick = submit;
  $("#skip").onclick = go;
  card.querySelector("input:not([type=radio]),textarea")?.focus();
  if (q.format === "expr") $("#ans").addEventListener("input", e => { const p = $("#preview"); p.innerHTML = exprPreview(e.target.value); typeset(p); });
  typeset(card);
}

function feedback(kind, head, body) {
  $("#feedback").innerHTML = `<div class=fb><div class="fb-head ${kind}">${head}</div><div class=fb-body>${body}</div></div>`;
  typeset($("#feedback"));
  return $("#feedback .fb-body");
}

function submit() {
  if (answered) { if (current.format !== "self") go(); return; }
  const q = current;
  if (q.format === "self") {
    answered = true;
    const mine = $("#ans").value.trim();
    const body = feedback("neutral", "Compare with the book", `<div class=explain>${q.explain}</div>
      <div class=self>How did you do? <button data-s=1>1 · Got it</button><button data-s=0.5>2 · Partly</button><button data-s=0>3 · Missed it</button>${ai.on && mine ? " <button id=aigrade>Grade with AI</button>" : ""}</div><div id=aifb></div>`);
    body.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { record(q.id, +b.dataset.s); go(); });
    $("#aigrade")?.addEventListener("click", async e => {
      e.target.disabled = true; $("#aifb").innerHTML = "<p class=muted>Grading…</p>";
      const plain = h => Object.assign(document.createElement("div"), { innerHTML: h }).textContent;
      try {
        const g = await ai.grade(plain(q.prompt), plain(q.explain), mine);
        $("#aifb").innerHTML = `<div class=explain><b>AI score: ${esc(g.score)}/2.</b> ${esc(g.feedback ?? "")}${g.missing ? `<br><i>Missing:</i> ${esc(g.missing)}` : ""}</div><div class=self><button id=aiaccept>Record ${esc(g.score)}/2 and continue</button></div>`;
        $("#aiaccept").onclick = () => { record(q.id, Math.max(0, Math.min(2, +g.score || 0)) / 2); go(); };
      } catch (err) { $("#aifb").innerHTML = `<p class=muted>AI grading failed: ${esc(err.message)}. Self-grade instead.</p>`; }
    });
    $("#submit").style.display = "none";
    return;
  }
  let ok;
  if (q.format === "mc") {
    const sel = document.querySelector("input[name=opt]:checked");
    if (!sel) return;
    ok = +sel.value === q.answer;
    document.querySelectorAll(".opt").forEach((el, i) => { if (i === q.answer) el.classList.add("right"); else if (+sel.value === i) el.classList.add("wrong"); });
  } else {
    const v = $("#ans").value.trim();
    if (!v) return;
    ok = q.check(v);
  }
  answered = true;
  document.activeElement?.blur();
  record(q.id, ok ? 1 : 0);
  const back = ok ? ` <span class=muted>· back for review in ${fmtWait(mastery[q.id].due - Date.now())}</span>` : "";
  const body = feedback(ok ? "right" : "wrong", ok ? `✓ Correct${back}` : `✗ Not quite${q.format !== "mc" ? ` · answer: ${q.answerHtml ?? `<code>${esc(q.answer)}</code>`}` : ""}`, `<div class=explain>${q.explain}</div>`);
  $("#submit").textContent = "Next question →";
  updateBar();
  addPassage(q, body);
}

// Verbatim book prose that follows the code block, where the book explains it.
const passageCache = {};
function passageFor(s) {
  return passageCache[s.id] ??= (async () => {
    if (!(await bookReadyP)) return null;
    const group = book.steps.filter(t => t.ch === s.ch && t.group === s.group && t !== s).map(t => t.code);
    const page = PAGE[s.section] ?? PAGE[s.section.split(".").slice(0, 2).join(".")];
    return page ? bookBoxes.passageAfter([s.code, ...group], page).catch(() => null) : null;
  })();
}
const passageHtml = p => p ? `<div class=bookpass><div class=label>📖 What the book says after this code · QSS p. ${p.page}</div><blockquote>${esc(p.text)}</blockquote></div>` : "";
async function addPassage(q, el) {
  if (!q.id?.startsWith("code:")) return;
  const p = await passageFor(sources.code.byId[q.id.slice(5)]);
  if (p && current === q) el.insertAdjacentHTML("beforeend", passageHtml(p));
}

// Show-all mode: every question in the current focus on one page, answers folded away (browse only, nothing is recorded).
const answerHtml = q => q.format === "self" ? q.explain
  : `<div class=label>Answer</div>${q.format !== "mc" ? `<p class=model><b>${q.answerHtml ?? `<code>${esc(q.answer)}</code>`}</b></p>`
    : q.optionsAreCode ? codeBlock(q.options[q.answer]) : `<p class=model><b>${esc(q.options[q.answer])}</b></p>`}${q.explain ? `<div class=label>Why</div><div>${q.explain}</div>` : ""}`;
async function renderAll(mine) {
  const card = $("#card");
  card.innerHTML = `<p class=muted>Waiting for R and the textbook…</p>`;
  await Promise.all([rReadyP, bookReadyP]);
  if (mine !== generation) return;
  const mix = { ...mixFor(settings.focus) };
  if (!rReady) { delete mix.code; delete mix.synth; }
  const todo = Object.keys(mix).flatMap(s => candidates(s).map(id => [s, id]));
  card.innerHTML = `<h2 class=page>${esc($("#focus").selectedOptions[0]?.dataset.label ?? "All questions")} · ${todo.length} questions</h2><p class=muted id=allstat></p><div id=alllist></div>`;
  for (const [i, [src, id]] of todo.entries()) {
    $("#allstat").textContent = `Generating ${i + 1} of ${todo.length}…`;
    const q = toShortAnswer(await Promise.resolve(sources[src].make(id)).catch(e => (console.error(e), null)));
    if (mine !== generation) return;
    if (!q) continue;
    const opts = q.format === "mc" ? `<ol>${q.options.map(o => `<li>${q.optionsAreCode ? codeBlock(o) : esc(o)}</li>`).join("")}</ol>` : "";
    const el = Object.assign(document.createElement("div"), { className: "allq",
      innerHTML: `${questionHtml(q)}${opts}<details><summary>Show answer</summary><div class=explain>${answerHtml(q)}</div></details>` });
    $("#alllist").append(el);
    typeset(el);
  }
  $("#allstat").textContent = "";
}

let generation = 0;                                  // ignore stale results when focus changes mid-generation
async function go() {
  const mine = ++generation;
  if (settings.showAll) { current = null; return renderAll(mine); }
  $("#card").innerHTML = `<p class=muted>Generating…</p>`;
  const q = await nextQuestion().catch(e => (console.error(e), null));
  if (mine !== generation) return;
  render(q);
  updateBar();
  window.scrollTo(0, 0);
}

// ---------- progress ----------
// Quiz items a focus covers (what "seen it all" means for that menu entry).
const TYPE_SRC = { boxes: "box", code: "code", rpractice: "synth", concepts: "concept", design: "scen", compute: "stats", calculus: "calc", vocab: "vocab" };
function focusItems(f) {
  if (f === "all") return AREAS.flatMap(([k]) => sources[k].items());
  if (TYPE_SRC[f]) return sources[TYPE_SRC[f]].items();
  if (f === "sec:calc") return [...sources.calc.items(), ...sources.stats.items()];
  const keep = f.startsWith("sec:") ? id => inSection(f.slice(4), sectionOf(id)) : id => chapterOf(id) === f;
  return ["code", "box", "vocab", "concept", "scen"].flatMap(k => sources[k].items()).filter(keep);
}
function updateBar() {
  const vals = Object.values(mastery), n = vals.reduce((a, m) => a + m.n, 0), c = vals.reduce((a, m) => a + m.c, 0);
  $("#bar").textContent = n ? `${n} answered · ${Math.round(100 * c / n)}% correct` : "No answers yet";
  // live coverage of the current focus
  const s = summary(focusItems(settings.focus)), done = s.total && s.seen === s.total;
  $("#cover").innerHTML = s.total ? `<div class=track title="${s.seen} of ${s.total} quiz items seen"><span class=seen style="width:${100 * s.seen / s.total}%"></span><span class=mast style="width:${100 * s.mastered}%"></span></div>
    <span class="covtext ${done ? "done" : ""}">${done ? "✓ all " : ""}${s.seen}/${s.total} seen · ${Math.round(100 * s.mastered)}% mastered</span>` : "";
  // per-entry counts in the menu (sections and chapters), ✓ when everything has been seen
  for (const o of $("#focus").options) {
    if (!/^(sec:|ch\d)/.test(o.value)) continue;
    const t = summary(focusItems(o.value));
    o.textContent = `${t.total && t.seen === t.total ? "✓ " : ""}${o.dataset.label} · ${t.seen}/${t.total}`;
  }
}
function label(id) {
  const [kind, a, b] = id.split(":");
  if (kind === "code") { const s = sources.code.byId[a]; return s ? `${s.section} code: ${s.code.split("\n")[0].slice(0, 60)}` : id; }
  if (kind === "box") { const bx = sources.box.byId[a]; return `★ ${bx.term} (sentence ${+b + 1})`; }
  if (kind === "vocab") return `Term: ${sources.vocab.byId[a].term}`;
  if (kind === "concept") return `Concept: ${sources.concept.byId[a].q}`;
  if (kind === "scen") return `Design scenario: ${a} (${b})`;
  if (kind === "synth") return `R practice: ${a}`;
  if (kind === "ai") return `AI scenario: QSS ${a}`;
  return `${kind === "stats" ? "Compute" : "Calculus"}: ${a}`;
}
// Mastery counts unseen items as 0, so a bar fills only as you actually master material.
function summary(ids) {
  const seen = ids.filter(i => mastery[i]);
  return { total: ids.length, seen: seen.length, mastered: ids.length ? seen.reduce((a, i) => a + mastery[i].s, 0) / ids.length : 0 };
}
const meter = (name, sub, s) => `<div class=meter><div class=name>${name}<small>${sub ?? `${s.seen} of ${s.total} seen`}</small></div>
  <div class=track title="${s.seen}/${s.total} seen"><span class=seen style="width:${s.total ? 100 * s.seen / s.total : 0}%"></span><span class=mast style="width:${100 * s.mastered}%"></span></div>
  <div class=pct>${Math.round(100 * s.mastered)}%</div></div>`;
const legend = `<div class=legend><span><i style="background:var(--accent)"></i>mastered</span><span><i style="background:color-mix(in srgb, var(--accent) 38%, transparent)"></i>seen but not mastered</span></div>`;

function renderProgress() {
  const vals = Object.values(mastery), n = vals.reduce((a, m) => a + m.n, 0), c = vals.reduce((a, m) => a + m.c, 0);
  const all = summary(AREAS.flatMap(([k]) => sources[k].items()));
  let h = `<div class=panel><h2 class=page>Progress</h2><p class=muted>Bars fill as you master items; unseen items count as not yet mastered.</p>
    <div class=kpis><div class=kpi><b>${n}</b><span class=muted>answers</span></div><div class=kpi><b>${n ? Math.round(100 * c / n) : 0}%</b><span class=muted>correct</span></div>
    <div class=kpi><b>${all.seen}</b><span class=muted>of ${all.total} items seen</span></div><div class=kpi><b>${Math.round(100 * all.mastered)}%</b><span class=muted>overall mastery</span></div></div></div>`;
  h += `<div class=panel><h3 class=sub>By area</h3>${legend}${AREAS.map(([k, name]) => meter(name, null, summary(sources[k].items()))).join("")}</div>`;
  h += `<div class=panel><h3 class=sub>By chapter</h3>${legend}${["ch1", "ch2", "ch3", "ch4"].map(ch =>
    meter(`Chapter ${ch[2]}`, null, summary(["code", "box", "vocab", "concept", "scen"].flatMap(s => sources[s].items()).filter(i => chapterOf(i) === ch)))).join("")}</div>`;
  h += `<div class=panel><h3 class=sub>★ Definition boxes</h3>${legend}${boxes.boxes.map(b => meter(esc(b.term), `QSS ${b.section} · p. ${b.page}`, summary(sources.box.items().filter(i => i.startsWith(`box:${b.id}:`))))).join("")}</div>`;
  h += `<div class=panel><h3 class=sub>Flashcards</h3><div class=legend><span><i style="background:var(--accent)"></i>known</span><span><i style="background:color-mix(in srgb, var(--accent) 38%, transparent)"></i>marked still learning</span></div>${FSETS.filter(([v]) => v !== "starred").map(([v, t]) => {
    const cs = fSetCards(v, true), k = cs.filter(c => flash.marks[c.id] === "know").length;
    return meter(esc(t), `${k} of ${cs.length} known`, { seen: cs.filter(c => flash.marks[c.id]).length, total: cs.length, mastered: cs.length ? k / cs.length : 0 });
  }).join("")}</div>`;
  const weak = Object.entries(mastery).filter(([, m]) => m.n).sort((x, y) => x[1].s - y[1].s).slice(0, 12);
  h += `<div class=panel><h3 class=sub>Weakest items</h3>${weak.length ? `<ol class=weak>${weak.map(([id, m]) => `<li>${esc(label(id))} <span class=muted>· ${Math.round(100 * m.s)}%</span></li>`).join("")}</ol>` : "<p class=muted>Answer some questions first.</p>"}</div>`;
  h += `<div class=panel><h3 class=sub>Backup</h3><div class=actions><button id=exp>Export progress</button><label class=btn>Import<input type=file id=imp accept=.json hidden></label><button id=reset>Reset</button></div></div>`;
  $("#progress").innerHTML = h;
  $("#exp").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(mastery)], { type: "application/json" })); a.download = "qss-progress.json"; a.click(); };
  $("#imp").onchange = async e => { mastery = JSON.parse(await e.target.files[0].text()); store.set("qss.mastery", mastery); renderProgress(); };
  $("#reset").onclick = () => { if (confirm("Erase all progress?")) { mastery = {}; store.set("qss.mastery", mastery); renderProgress(); updateBar(); } };
}

// ---------- settings (AI add-on) ----------
function renderSettings() {
  const u = ai.usage();
  $("#settings").innerHTML = `<div class=panel><h2 class=page>Textbook PDF</h2>
  <p class=muted>${bookBoxes.ready ? "Loaded." : "Not loaded: open your copy with the 📖 button at the top."} The definition boxes and book passages are read from your own copy of the course's <i>QSS Ch1-4.pdf</i>. It stays in this browser and is never uploaded.</p>
  <div class=actions><button id=bookforget>Forget saved copy</button></div></div>
  <div class=panel><h2 class=page>AI add-on <span class=muted>(optional)</span></h2>
  <p class=muted>Everything works without this. When enabled, a free Groq model writes new scenario questions from the textbook's own definitions and grades your written answers. Your key is stored only in this browser (localStorage), never in a file.</p>
  <label class=row><input type=checkbox id=aion ${ai.s.enabled ? "checked" : ""}> Enable AI questions and grading</label>
  <label class=field>Groq API key <input id=aikey type=password autocomplete=off value="${esc(ai.s.key)}" placeholder="gsk_..."></label>
  <label class=field>Model <input id=aimodel value="${esc(ai.s.model)}"></label>
  <div class=actions><button id=aisave class=primary>Save</button><button id=aitest>Test connection</button><button id=aiclear>Forget key</button></div>
  <p id=aistatus class=muted></p>
  <p class=muted>Today: ${u.n} requests, ${u.tokens.toLocaleString()} tokens (the app stops at 900 requests / 190,000 tokens per day, under Groq's free limits).</p></div>`;
  const read = () => ({ enabled: $("#aion").checked, key: $("#aikey").value.trim(), model: $("#aimodel").value.trim() || "openai/gpt-oss-120b" });
  $("#aisave").onclick = () => { ai.set(read()); $("#aistatus").textContent = ai.on ? "Saved. AI questions will mix into Everything / Concepts / Research design." : "Saved (AI off)."; };
  $("#bookforget").onclick = async () => { await forgetPdf(); $("#bookforget").textContent = "Forgotten (takes effect on reload)"; };
  $("#aiclear").onclick = () => { ai.set({ key: "", enabled: false }); renderSettings(); };
  $("#aitest").onclick = async () => {
    ai.set(read()); $("#aistatus").textContent = "Testing…";
    try { const r = await ai.chat([{ role: "user", content: 'Reply with the JSON {"ok": true}.' }]); $("#aistatus").textContent = r.ok ? "Connected ✓" : "Connected, but the reply was unexpected."; }
    catch (e) { $("#aistatus").textContent = "Failed: " + e.message; }
  };
}

// ---------- study (learning, not testing) ----------
const studySections = [...new Set([
  ...book.steps.filter(s => s.eval && notes[s.id]).map(s => s.section), ...boxes.boxes.map(b => b.section),
  ...vocab.terms.map(t => t.section), ...concepts.items.map(c => c.section), ...scenarios.templates.map(t => t.section),
])].filter(Boolean).sort((a, b) => sectionKey(a) < sectionKey(b) ? -1 : 1).concat("calc");
const secLabel = s => s === "calc" ? "Calculus Fundamentals" : `${s} ${SECTION_TITLES[s] ?? ""}`;
function ensureFocusOption(f) {
  if (!f.startsWith("sec:") || [...$("#focus").options].some(o => o.value === f)) return;
  const o = new Option(`Section: ${secLabel(f.slice(4))}`, f);
  o.dataset.label = o.text;
  $("#focus").add(o);
}
const PLOT = /^(plot|hist|barplot|boxplot|lines|points|abline|text|qqplot|par|pdf|dev\.off)\(/;
const GENERIC = { units: "units", unit: "unit", treatment: "the treatment", outcome: "the outcome", confounder: "a confounder", running: "the running variable", cutoff: "the cutoff" };
const panel = (title, inner, extra = "") => `<div class=panel${extra}><h3 class=sub>${title}</h3>${inner}</div>`;
let studyGen = 0;

async function renderStudy(sec = settings.studySec ?? studySections[0], anchor = null) {
  const mine = ++studyGen;
  settings.studySec = sec; store.set("qss.settings", settings);
  const studied = store.get("qss.studied", {}), idx = studySections.indexOf(sec);
  const chName = s => s === "calc" ? "Calculus" : `Chapter ${s[0]}`;
  const select = `<select id=secsel aria-label="Section">${[...new Set(studySections.map(chName))].map(g => `<optgroup label="${g}">${studySections.filter(s => chName(s) === g)
    .map(s => `<option value="${s}" ${s === sec ? "selected" : ""}>${studied[s] ? "✓ " : ""}${esc(secLabel(s))}</option>`).join("")}</optgroup>`).join("")}</select>`;
  const s = summary(["code", "box", "vocab", "concept", "scen"].flatMap(k => sources[k].items()).filter(id => inSection(sec, sectionOf(id))));
  let h = `<div class=studyhead>${select}<button class=btn id=prev ${idx <= 0 ? "disabled" : ""} aria-label="Previous section">←</button><button class=btn id=next ${idx >= studySections.length - 1 ? "disabled" : ""} aria-label="Next section">→</button></div>`;
  h += `<div class="panel sechead"><h2>${esc(secLabel(sec))}</h2><p class=muted>${PAGE[sec] ? `QSS p. ${PAGE[sec]}` : ""}${sec === "calc" ? "Course material (not in QSS)" : ""}</p>
    ${sec === "calc" ? "" : meter("This section", null, s)}
    <div class=actions><button id=studied>${studied[sec] ? "✓ Studied" : "Mark as studied"}</button><button id=quizsec class=primary>Quiz me on this section</button></div></div>`;

  if (sec === "calc") {
    h += panel("Rules and worked examples", calcSheet.rules.map(r => `<div class=scard><b>${esc(r.name)}</b><div class=rule>${esc(r.rule)}</div><div class=muted>Example: ${esc(r.example)}</div></div>`).join(""));
  } else {
    const cs = cases.cases.filter(c => c.sections.some(x => inSection(sec, x)));
    if (cs.length) h += panel("Case context", cs.map(c => caseHtml(c, true)).join(""));
    const bx = boxes.boxes.filter(b => inSection(sec, b.section));
    if (bx.length) h += panel("★ Definition boxes (from the book)", bx.map(b => `<div class=boximg id="a-box-${b.id}" data-box="${b.id}"><p class=muted>Loading box from the PDF…</p></div>`).join(""));
    const vs = vocab.terms.filter(t => inSection(sec, t.section));
    if (vs.length) h += panel("Key terms", `<dl>${vs.map(t => `<dt id="a-vocab-${t.id}">${esc(t.term)}</dt><dd>${esc(t.def)}</dd>`).join("")}</dl>`);
    const ts = scenarios.templates.filter(t => inSection(sec, t.section)), fill = x => sources.scen.fill(x, GENERIC, "n");
    if (ts.length) h += panel("Research designs", ts.map(t => `<div class=scard id="a-scen-${t.id}"><b>${esc(t.design)}</b><ul><li><i>Assumption:</i> ${esc(fill(t.assumption))}</li><li><i>Estimates:</i> ${esc(fill(t.estimand))}</li><li><i>Adjusts for:</i> ${esc(fill(t.adjusts))}</li><li><i>Main threat:</i> ${esc(fill(t.threat))}</li></ul></div>`).join(""));
    const cq = concepts.items.filter(c => inSection(sec, c.section));
    if (cq.length) h += panel("Concepts <span class=muted>· answer in your head, then open</span>", cq.map(c => `<details class=concept id="a-concept-${c.id}"><summary>${esc(c.q)}</summary><p>${esc(c.a)}</p></details>`).join(""));
    const steps = book.steps.filter(x => x.eval && notes[x.id] && inSection(sec, x.section));
    if (steps.length) {
      const byGroup = [];
      for (const x of steps) { const g = byGroup.at(-1); g && g[0].group === x.group && g[0].ch === x.ch ? g.push(x) : byGroup.push([x]); }
      h += panel("Code walkthrough <span class=muted>· the book's code, run on the real data</span>", byGroup.map(g => `<div class=walk>` + g.map(x =>
        `<div id="a-code-${x.id}">${commentBlock(x.comment)}${codeBlock(x.code)}` +
        (PLOT.test(x.code.trim()) ? `<div class=muted>(draws on a plot)</div>` : `<pre class="code out" data-out="${x.id}">running…</pre>`) +
        `<div class=note>${esc(notes[x.id].does)}${notes[x.id].out ? `<br><span class=muted>Output: ${esc(notes[x.id].out)}</span>` : ""}</div></div>`).join("") +
        `<div data-pass="${g[0].id}"></div></div>`).join(""));
    }
  }
  $("#study").innerHTML = h;
  typeset($("#study"));
  $("#secsel").onchange = e => renderStudy(e.target.value);
  $("#prev").onclick = () => renderStudy(studySections[idx - 1]);
  $("#next").onclick = () => renderStudy(studySections[idx + 1]);
  $("#studied").onclick = () => { const st = store.get("qss.studied", {}); st[sec] ? delete st[sec] : (st[sec] = Date.now()); store.set("qss.studied", st); renderStudy(sec); };
  $("#quizsec").onclick = () => {
    settings.focus = "sec:" + sec; store.set("qss.settings", settings); ensureFocusOption(settings.focus); $("#focus").value = settings.focus;
    showTab("quiz"); go();
  };
  const target = anchor && document.getElementById(anchor);
  if (target) { if (target.tagName === "DETAILS") target.open = true; target.scrollIntoView({ block: "center" }); target.classList.add("flash"); }
  else window.scrollTo(0, 0);

  // Slow parts fill in afterwards: box images, then book passages, then R outputs.
  const hasBook = await bookReadyP;
  if (mine !== studyGen) return;
  for (const el of document.querySelectorAll("[data-box]")) {
    if (!hasBook) { el.innerHTML = `<p class=muted>Open your copy of the textbook PDF (📖 button at the top) to see this box.</p>`; continue; }
    const b = boxes.boxes.find(x => x.id === el.dataset.box);
    const img = await bookBoxes.image(b.id);
    if (mine !== studyGen) return;
    el.innerHTML = `<img src="${img}" alt="${esc(b.term)} definition box, QSS p. ${b.page}">`;
  }
  let lastPassage = null;                            // consecutive groups often share one book block
  for (const el of document.querySelectorAll("[data-pass]")) {
    const p = await passageFor(sources.code.byId[el.dataset.pass]);
    if (mine !== studyGen) return;
    if (p && p.text !== lastPassage) el.innerHTML = passageHtml(p);
    lastPassage = p?.text ?? lastPassage;
  }
  if (!document.querySelector("[data-out]") || !(await rReadyP)) return;
  for (const el of document.querySelectorAll("[data-out]")) {
    const out = await rt.output(sources.code.byId[el.dataset.out]);
    if (mine !== studyGen) return;
    if (out) el.textContent = out;
    else el.replaceWith(Object.assign(document.createElement("div"), { className: "muted", textContent: "(no printed output: it creates or changes an object)" }));
  }
}

// ---------- search ----------
let searchIndex = null;
function buildIndex() {
  const e = [];
  for (const b of boxes.boxes) e.push({ sec: b.section, kind: "★ Box", title: b.term, get text() { return bookBoxes.texts?.[b.id] ?? ""; }, anchor: `a-box-${b.id}` });
  for (const t of vocab.terms) e.push({ sec: t.section, kind: "Term", title: t.term, text: t.def, anchor: `a-vocab-${t.id}` });
  for (const c of concepts.items) e.push({ sec: c.section, kind: "Concept", title: c.q, text: c.a, anchor: `a-concept-${c.id}` });
  for (const t of scenarios.templates) e.push({ sec: t.section, kind: "Design", title: t.design, text: sources.scen.fill(`${t.assumption} ${t.threat}`, GENERIC, "n"), anchor: `a-scen-${t.id}` });
  for (const s of book.steps) if (s.eval && notes[s.id]) e.push({ sec: s.section, kind: "Code", title: s.code.split("\n")[0], text: notes[s.id].does, anchor: `a-code-${s.id}`, code: true });
  for (const c of cases.cases) e.push({ sec: c.sections[0], kind: "Case", title: c.title, text: `${c.about} ${Object.keys(c.vars).join(" ")}` });
  for (const s of studySections) e.push({ sec: s, kind: "Section", title: secLabel(s), text: "" });
  for (const r of calcSheet.rules) e.push({ sec: "calc", kind: "Calculus", title: r.name, text: r.rule });
  return e;
}
const highlight = (text, words) => { let h = esc(text); for (const w of words) h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>"); return h; };
function renderSearch(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  searchIndex ??= buildIndex();
  const hits = searchIndex.filter(e => { const hay = `${e.title} ${e.text} ${e.sec}`.toLowerCase(); return words.every(w => hay.includes(w)); })
    .sort((a, b) => (b.title.toLowerCase().includes(words[0]) - a.title.toLowerCase().includes(words[0])) || (sectionKey(a.sec) < sectionKey(b.sec) ? -1 : 1));
  const shown = hits.slice(0, 80);
  $("#study").innerHTML = `<div class=panel><h2 class=page>Search: “${esc(query)}”</h2><p class=muted>${hits.length} result${hits.length === 1 ? "" : "s"}${hits.length > 80 ? " (showing 80)" : ""} · click one to open it in Study · Esc clears</p></div>` +
    (shown.length ? shown.map((e, i) => `<button class=result data-i=${i}><div><span class=chip>${esc(e.kind)}</span> <span class=muted>${esc(secLabel(e.sec))}</span></div>
      <div class=rtitle>${e.code ? `<code>${highlight(e.title, words)}</code>` : highlight(e.title, words)}</div>${e.text ? `<div class=rtext>${highlight(e.text.slice(0, 220), words)}</div>` : ""}</button>`).join("")
      : `<div class=panel><p class=muted>Nothing matched. Try fewer or different words.</p></div>`);
  typeset($("#study"));
  document.querySelectorAll(".result").forEach(b => b.onclick = () => { const e = shown[+b.dataset.i]; $("#search").value = ""; renderStudy(e.sec, e.anchor); });
}

// ---------- assessment: new problems, written answers, graded against a rubric ----------
const ASSESS = [ch1, ch2, ch3, ch4, calcAssess];
const KIND = { write: "Written answer", predict: "Predict the output", interpret: "Interpret the code and output" };
const PH = { write: "Answer in full sentences, as you would on the exam.", predict: "Write the exact output you expect, then reveal.", interpret: "Explain what the code does and interpret its output in full sentences." };
let assessState = store.get("qss.assess", {});        // partId -> { draft, score (0..1), checks: [bool] }
let draftTimer;
const saveAssess = () => store.set("qss.assess", assessState);
const partIds = it => it.parts.map((_, k) => `${it.id}.${k}`);
const findPart = pid => { const i = pid.lastIndexOf("."), it = ASSESS.flatMap(c => c.items).find(x => x.id === pid.slice(0, i)); return [it, it.parts[+pid.slice(i + 1)]]; };
function chapterScore(ch) {
  const ids = ch.items.flatMap(partIds), graded = ids.filter(id => assessState[id]?.score !== undefined);
  return { total: ids.length, graded: graded.length, pct: ids.length ? graded.reduce((a, id) => a + assessState[id].score, 0) / ids.length : 0 };
}
const itemScore = it => { const s = partIds(it).map(id => assessState[id]?.score); return s.every(x => x !== undefined) ? s.reduce((a, b) => a + b, 0) / s.length : null; };
const tabLabel = c => { const s = chapterScore(c), ready = s.pct >= 0.9; return `<b>${esc(c.short)}</b><small class="${ready ? "ready" : ""}">${ready ? "✓ exam-ready · " : ""}${Math.round(100 * s.pct)}% · ${s.graded}/${s.total} graded</small>`; };

function renderAssess(chId = settings.assessCh ?? ASSESS[0].id) {
  const ch = ASSESS.find(c => c.id === chId) ?? ASSESS[0];
  settings.assessCh = ch.id; store.set("qss.settings", settings);
  let h = `<div class=panel><h2 class=page>Assessment</h2>
    <p class=muted>New problems built on the book's methods and R functions, not its examples. As on the exam, you never write code: you predict what code prints or interpret code and its output. Write your answer before you reveal anything. Then tick only the rubric points your answer actually made. A chapter's mastery counts ungraded parts as 0; 90% means exam-ready.</p>
    <div class=chtabs>${ASSESS.map(c => `<button data-ch="${c.id}" class="${c.id === ch.id ? "on" : ""}">${tabLabel(c)}</button>`).join("")}</div></div>
    <div class=panel><h2 class=page>${esc(ch.title)}</h2><p class=muted>${ch.intro}</p></div>`;
  for (const it of ch.items) {
    const s = itemScore(it);
    h += `<details class="panel aitem" data-item="${it.id}"><summary><span class=chip>${esc(it.sec)}</span>${esc(it.title)}<span class="ascore ${s === null ? "" : "done"}">${s === null ? `${it.parts.length} parts` : `${Math.round(100 * s)}%`}</span></summary>
      <div class=abody><div class=actx>${it.context}</div>${it.parts.map((p, k) => {
        const pid = `${it.id}.${k}`, st = assessState[pid] ?? {};
        return `<div class=apart data-pid="${pid}"><div class=label>Part (${String.fromCharCode(97 + k)}) · ${KIND[p.kind]}<span class="ptag done">${st.score === undefined ? "" : `scored ${Math.round(100 * st.score)}%`}</span></div>
          <div class=prompt>${p.q}</div>${p.show ? codeBlock(p.show) : ""}${p.kind === "interpret" ? "<div class=label>Output</div><div class=showout></div>" : ""}
          <textarea class="${p.kind === "predict" ? "rcode" : ""}" rows=${p.kind === "predict" ? 6 : 5} spellcheck=${p.kind !== "predict"} placeholder="${PH[p.kind]}">${esc(st.draft ?? "")}</textarea>
          <div class=actions><button data-act=reveal class=primary>Reveal model answer</button></div>
          <div class=areveal></div></div>`;
      }).join("")}</div></details>`;
  }
  $("#assess").innerHTML = h;
  typeset($("#assess"));
  // Interpret parts show their code's output; run it when the problem is first opened.
  for (const d of document.querySelectorAll("#assess details.aitem")) d.addEventListener("toggle", () => {
    if (!d.open) return;
    for (const box of d.querySelectorAll(".apart")) {
      const el = box.querySelector(".showout"), [it, p] = findPart(box.dataset.pid);
      if (el && !el.innerHTML) runR(it.setup, p.show, el);
    }
  });
}

// One R run at a time: every run shares the scratch environment .aenv.
let rQueue = Promise.resolve();
async function runR(setup, code, el) {
  el.innerHTML = `<p class=muted>${rReady ? "Running…" : "Waiting for R to start (about 10 seconds)…"}</p>`;
  if (!(await rReadyP)) { el.innerHTML = "<p class=muted>R failed to load, so code can't run here.</p>"; return; }
  const { text, images } = await (rQueue = rQueue.then(() => rt.capture(setup, code)));
  el.innerHTML = (text.trim() ? `<pre class="code out">${esc(text)}</pre>` : images.length ? "" : "<p class=muted>(no printed output)</p>") + (images.length ? "<div class=plots></div>" : "");
  for (const img of images) {
    const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height });
    c.getContext("2d").drawImage(img, 0, 0);
    el.querySelector(".plots").append(c);
  }
}

function revealPart(box, it, p) {
  const st = assessState[box.dataset.pid] ?? {}, el = box.querySelector(".areveal");
  el.innerHTML = (p.kind === "predict" ? "<div><div class=label>Actual output</div><div class=solout></div></div>" : "")
    + `<div><div class=label>Model answer</div><div class=explain>${p.a}</div></div>
    <div class=rubric><div class=label>Grade yourself: tick each point your answer actually made</div>${p.rubric.map((r, i) => `<label><input type=checkbox data-r=${i} ${st.checks?.[i] ? "checked" : ""}><span>${r}</span></label>`).join("")}</div>
    <div class=actions><button data-act=grade class=primary>Save score</button>${ai.on ? "<button data-act=ai>Ask AI to check my answer</button>" : ""}</div><div class=aifb></div>`;
  typeset(el);
  if (p.kind === "predict") runR(it.setup, p.show, el.querySelector(".solout"));
}

function refreshScores(box, it) {
  const st = assessState[box.dataset.pid];
  box.querySelector(".ptag").textContent = `scored ${Math.round(100 * st.score)}%`;
  const s = itemScore(it), tag = box.closest(".aitem").querySelector(".ascore");
  if (s !== null) { tag.textContent = `${Math.round(100 * s)}%`; tag.classList.add("done"); }
  for (const b of document.querySelectorAll(".chtabs [data-ch]")) b.innerHTML = tabLabel(ASSESS.find(c => c.id === b.dataset.ch));
}

$("#assess").addEventListener("click", async e => {
  const tab = e.target.closest("[data-ch]");
  if (tab) { renderAssess(tab.dataset.ch); return; }
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const box = btn.closest(".apart"), [it, p] = findPart(box.dataset.pid), mine = box.querySelector("textarea").value;
  if (btn.dataset.act === "reveal") revealPart(box, it, p);
  if (btn.dataset.act === "grade") {
    const checks = [...box.querySelectorAll(".rubric input")].map(x => x.checked);
    assessState[box.dataset.pid] = { draft: mine, checks, score: checks.filter(Boolean).length / checks.length };
    saveAssess(); refreshScores(box, it);
  }
  if (btn.dataset.act === "ai") {
    const plain = h => Object.assign(document.createElement("div"), { innerHTML: h }).textContent, fb = box.querySelector(".aifb");
    btn.disabled = true; fb.innerHTML = "<p class=muted>Checking…</p>";
    try {
      const g = await ai.grade(plain(it.context + " " + p.q + (p.show ?? "")), plain(p.a) + " Rubric: " + p.rubric.map(plain).join("; "), mine);
      fb.innerHTML = `<div class=explain><b>AI: ${esc(g.score)}/2.</b> ${esc(g.feedback ?? "")}${g.missing ? `<br><i>Missing:</i> ${esc(g.missing)}` : ""}</div>`;
    } catch (err) { fb.innerHTML = `<p class=muted>AI check failed: ${esc(err.message)}</p>`; }
    btn.disabled = false;
  }
});
$("#assess").addEventListener("input", e => {
  if (e.target.tagName !== "TEXTAREA") return;
  const pid = e.target.closest(".apart").dataset.pid;
  (assessState[pid] ??= {}).draft = e.target.value;
  clearTimeout(draftTimer); draftTimer = setTimeout(saveAssess, 400);
});

// ---------- flashcards: Quizlet-style sorting over the study-guide deck ----------
const FCARDS = [...fCommands, ...fConcepts, ...fEquations, ...fGraphs];
const FBYID = Object.fromEntries(FCARDS.map(c => [c.id, c]));
const FLABEL = { command: "Command", concept: "Concept", equation: "Equation", graph: "Graph" };
const FSETS = [["all", "All cards"], ...Object.entries(DICTS).map(([k, v]) => [`dict:${k}`, v]),
  ...Object.entries(TOPICS).map(([k, v]) => [`topic:${k}`, v]), ["starred", "Starred"]];
let flash = { marks: {}, stars: {}, set: "all", backFirst: false, starredOnly: false, rounds: {}, ...store.get("qss.flash", {}) };
let fFlipped = false, fUndo = [];
const saveFlash = () => store.set("qss.flash", flash);
function fSetCards(set, ignoreStarFilter = false) {
  const cs = set === "all" ? FCARDS : set === "starred" ? FCARDS.filter(c => flash.stars[c.id])
    : set.startsWith("dict:") ? FCARDS.filter(c => c.dict === set.slice(5)) : FCARDS.filter(c => c.topics.includes(set.slice(6)));
  return flash.starredOnly && !ignoreStarFilter ? cs.filter(c => flash.stars[c.id]) : cs;
}
const fKey = () => flash.set + (flash.starredOnly ? "*" : "");
// A round works through the set's cards not yet marked "know"; its queue and position are saved per set.
const fNewRound = n => ({ n, pos: 0, know: 0, learn: 0, queue: fSetCards(flash.set).filter(c => flash.marks[c.id] !== "know").map(c => c.id) });
function fRound() {
  const valid = new Set(fSetCards(flash.set).map(c => c.id)), r = flash.rounds[fKey()];
  return r && r.queue.every(id => valid.has(id)) ? r : (flash.rounds[fKey()] = fNewRound(1));
}

function fCodeOut(c) {
  const o = flashOut[c.id];
  if (!o) return codeBlock(c.code) + "<p class=muted>Output not built yet (run quiz/build_flash.mjs).</p>";
  return codeBlock(c.code) + (o.text ? `<pre class="code out">${esc(o.text)}</pre>` : "")
    + (o.img ? `<img class=fplot src="flash/img/${c.id}.png" alt="Plot drawn by this code">` : "");
}
// Prompt side and answer side. "Show back first" swaps them for reversible (concept/equation) cards.
function fFace(c, answer) {
  const term = c.code ? `<p class=fq>${c.front}</p>${fCodeOut(c)}` : `<div class=fterm>${c.front}</div>`;
  const explain = (c.book ? `<div><div class=label>Book definition · p. ${c.page}</div><blockquote>${c.book}</blockquote></div>` : "") + `<div class=explain>${c.back}</div>`;
  if (flash.backFirst && c.reversible) return answer ? term : explain;
  if (!answer) return term;
  return (c.code ? term : `<div class=fq>${c.front}</div>`) + explain;
}

function renderFlash() {
  const cards = fSetCards(flash.set), r = fRound();
  const known = cards.filter(c => flash.marks[c.id] === "know").length, learning = cards.filter(c => flash.marks[c.id] === "learn").length;
  const opts = list => list.map(([v, t]) => `<option value="${v}" ${v === flash.set ? "selected" : ""}>${esc(t)} (${fSetCards(v, true).length})</option>`).join("");
  let h = `<div class="panel fhead"><div class=row1>
      <select id=fset aria-label="Card set"><option value="all" ${flash.set === "all" ? "selected" : ""}>All cards (${FCARDS.length})</option>
        <optgroup label="Study guide dictionaries">${opts(FSETS.filter(([v]) => v.startsWith("dict:")))}</optgroup>
        <optgroup label="Topics">${opts(FSETS.filter(([v]) => v.startsWith("topic:")))}</optgroup>
        <optgroup label="Yours">${opts([["starred", "Starred"]])}</optgroup></select>
      <div class=fctl><button id=fshuffle title="Shuffle the rest of this round (H)">⇄ Shuffle</button><button id=fstaronly class="${flash.starredOnly ? "on" : ""}">☆ Starred only</button>
        <button id=fback class="${flash.backFirst ? "on" : ""}" title="Concept and equation cards show the definition first (B)">Show back first</button><button id=freset>Reset set</button></div></div>
    <div class=fprog><div class=track title="${known} known, ${learning} still learning"><span class=learn style="width:${cards.length ? 100 * (known + learning) / cards.length : 0}%"></span><span class=mast style="width:${cards.length ? 100 * known / cards.length : 0}%"></span></div>
      <span class=fstat>${known} known · ${learning} still learning · ${cards.length - known - learning} new · Round ${r.n}</span></div></div>`;
  const live = cards.length && r.pos < r.queue.length;
  if (!cards.length) h += `<div class="fcard fdone"><div class=big>No cards here yet</div><p class=muted>Star cards with ☆ or the S key to collect them here.</p></div>`;
  else if (!live) {
    const left = cards.length - known;
    h += left ? `<div class="fcard fdone"><div class=big>Round ${r.n} done</div><p>Know <b>${r.know}</b> · Still learning <b>${r.learn}</b></p><p class=muted>${left} card${left === 1 ? "" : "s"} left to learn in this set.</p>
        <div class=actions><button id=fnext class=primary>Keep going: round ${r.n + 1}</button><button id=frestart>Restart set</button></div></div>`
      : `<div class="fcard fdone"><div class=big>✓ You know ${cards.length === 1 ? "the 1 card" : `all ${cards.length} cards`} in this set</div><div class=actions><button id=frestart class=primary>Restart set</button></div></div>`;
  } else {
    const c = FBYID[r.queue[r.pos]], on = flash.stars[c.id];
    h += `<div class=fcard id=fcard tabindex=0><div class=ftop><span class=chip>${FLABEL[c.dict]}</span><span class=ref>QSS ${esc(c.sec)} · p. ${c.page}</span><span class=side>${fFlipped ? "Answer" : "Prompt"}</span>
        <button class="star ${on ? "on" : ""}" id=fstar title="Star (S)" aria-label="${on ? "Unstar" : "Star"} this card">${on ? "★" : "☆"}</button></div>
      <div class=fbody>${fFace(c, fFlipped)}</div>${fFlipped ? "" : "<div class=fhint>Click or press Space to flip</div>"}</div>
      <div class=fnav><button id=flearn>← Still learning</button><span class=fpos>${r.pos + 1} / ${r.queue.length}</span><button id=fknow>Know →</button></div>`;
  }
  h += `<p class=fkeys><kbd>Space</kbd> flip · <kbd>→</kbd> know · <kbd>←</kbd> still learning · <kbd>S</kbd> star · <kbd>Z</kbd> undo · <kbd>H</kbd> shuffle · <kbd>B</kbd> back first</p>`;
  $("#flash").innerHTML = h;
  typeset($("#flash"));
  for (const img of document.querySelectorAll("#flash img.fplot")) img.onerror = () => img.replaceWith(Object.assign(document.createElement("p"), { className: "muted", textContent: "(Plot image missing; rebuild with quiz/build_flash.mjs.)" }));
  $("#fset").onchange = e => { flash.set = e.target.value; fFlipped = false; fUndo = []; saveFlash(); renderFlash(); };
  $("#fshuffle").onclick = fShuffle;
  $("#fstaronly").onclick = () => { flash.starredOnly = !flash.starredOnly; fFlipped = false; fUndo = []; saveFlash(); renderFlash(); };
  $("#fback").onclick = fToggleBack;
  $("#freset").onclick = () => { if (confirm("Clear Know / Still learning marks for every card in this set?")) fRestart(); };
  $("#fnext")?.addEventListener("click", () => { flash.rounds[fKey()] = fNewRound(r.n + 1); fUndo = []; saveFlash(); renderFlash(); });
  $("#frestart")?.addEventListener("click", fRestart);
  $("#fknow")?.addEventListener("click", () => fMark("know"));
  $("#flearn")?.addEventListener("click", () => fMark("learn"));
  $("#fstar")?.addEventListener("click", e => { e.stopPropagation(); fStar(); });
  $("#fcard")?.addEventListener("click", e => { if (!e.target.closest("button, summary, details, a")) fFlip(); });
}

function fFlip() {
  const r = fRound();
  if (r.pos >= r.queue.length) return;
  fFlipped = !fFlipped; renderFlash();
  $("#fcard")?.classList.add("anim");
}
function fMark(m) {
  const r = fRound();
  if (r.pos >= r.queue.length) return;
  const id = r.queue[r.pos];
  fUndo.push({ key: fKey(), id, prev: flash.marks[id], pos: r.pos, m });
  flash.marks[id] = m; r[m]++; r.pos++; fFlipped = false;
  saveFlash(); renderFlash();
}
function fUndoLast() {
  const u = fUndo.pop();
  if (!u || u.key !== fKey()) return;
  const r = fRound();
  if (u.prev === undefined) delete flash.marks[u.id]; else flash.marks[u.id] = u.prev;
  r[u.m]--; r.pos = u.pos; fFlipped = false;
  saveFlash(); renderFlash();
}
function fStar() {
  const r = fRound(), id = r.queue[r.pos];
  if (!id) return;
  flash.stars[id] ? delete flash.stars[id] : (flash.stars[id] = true);
  saveFlash(); renderFlash();
}
function fShuffle() {
  const r = fRound(), rest = r.queue.slice(r.pos);
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
  r.queue = r.queue.slice(0, r.pos).concat(rest); fFlipped = false;
  saveFlash(); renderFlash();
}
function fToggleBack() { flash.backFirst = !flash.backFirst; fFlipped = false; saveFlash(); renderFlash(); }
function fRestart() {
  for (const c of fSetCards(flash.set)) delete flash.marks[c.id];
  flash.rounds[fKey()] = fNewRound(1); fFlipped = false; fUndo = [];
  saveFlash(); renderFlash();
}
document.addEventListener("keydown", e => {
  if ($("#flash").hidden || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase();
  if (e.target.tagName === "BUTTON" && (k === " " || k === "enter")) return;    // let a focused button act normally
  const act = { " ": fFlip, enter: fFlip, arrowright: () => fMark("know"), k: () => fMark("know"), arrowleft: () => fMark("learn"), j: () => fMark("learn"),
    s: fStar, z: fUndoLast, h: fShuffle, b: fToggleBack }[k];
  if (act) { e.preventDefault(); act(); }
});

// ---------- chrome: tabs, theme, search ----------
function showTab(tab) {
  document.querySelectorAll("nav button").forEach(x => x.classList.toggle("on", x.dataset.tab === tab));
  document.querySelectorAll("main > section").forEach(s => s.hidden = s.id !== tab);
  $("#quizbar").hidden = tab !== "quiz";
}
document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  showTab(b.dataset.tab);
  if (b.dataset.tab === "progress") renderProgress();
  if (b.dataset.tab === "settings") renderSettings();
  if (b.dataset.tab === "study") renderStudy();
  if (b.dataset.tab === "assess" && !$("#assess").innerHTML) renderAssess();
  if (b.dataset.tab === "flash") renderFlash();
});
const THEMES = ["auto", "light", "dark"], THEME_LABEL = { auto: "◐ Auto", light: "☀ Light", dark: "☾ Dark" };
function applyTheme(t) {
  t === "auto" ? delete document.documentElement.dataset.theme : (document.documentElement.dataset.theme = t);
  $("#theme").textContent = THEME_LABEL[t];
  try { localStorage.setItem("qss.theme", t); } catch {}
}
let theme = (() => { try { return localStorage.getItem("qss.theme") ?? "auto"; } catch { return "auto"; } })();
applyTheme(theme);
$("#theme").onclick = () => applyTheme(theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]);
let searchTimer;
$("#search").addEventListener("input", e => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  searchTimer = setTimeout(() => { if (q.length >= 2) { showTab("study"); renderSearch(q); } else if (!q) renderStudy(); }, 150);
});
$("#search").addEventListener("keydown", e => { if (e.key === "Escape") { e.target.value = ""; renderStudy(); } });

// Quiz focus menu: mixes, whole chapters, then every section grouped by chapter.
const CHAPTER_NAMES = { 1: "Introduction", 2: "Causality", 3: "Measurement", 4: "Prediction" };
function buildFocusMenu() {
  const groups = [
    ["Mix", [["all", "Everything"], ["boxes", "★ Definition boxes"], ["code", "Book code"], ["rpractice", "R practice (random code)"], ["concepts", "Concepts"],
      ["design", "Research design scenarios"], ["compute", "Computation"], ["calculus", "Calculus"], ["vocab", "Vocabulary"]]],
    ["Whole chapters", [1, 2, 3, 4].map(n => [`ch${n}`, `Chapter ${n}: ${CHAPTER_NAMES[n]}`])],
    ...[1, 2, 3, 4].map(n => [`Chapter ${n} sections`, studySections.filter(s => s[0] === String(n)).map(s => [`sec:${s}`, secLabel(s)])]),
  ];
  $("#focus").innerHTML = groups.map(([label, opts]) => `<optgroup label="${esc(label)}">${opts.map(([v, t]) => `<option value="${v}" data-label="${esc(t)}">${esc(t)}</option>`).join("")}</optgroup>`).join("");
}
buildFocusMenu();
if (![...$("#focus").options].some(o => o.value === settings.focus)) settings.focus = "all";
$("#focus").value = settings.focus;
$("#shortans").checked = !!settings.shortAnswer;
$("#shortans").onchange = e => { settings.shortAnswer = e.target.checked; store.set("qss.settings", settings); go(); };
$("#showall").checked = !!settings.showAll;
$("#showall").onchange = e => { settings.showAll = e.target.checked; store.set("qss.settings", settings); go(); };
$("#focus").onchange = e => { settings.focus = e.target.value; reviewEarly = false; store.set("qss.settings", settings); updateBar(); go(); };
bookReadyP.then(() => updateBar());                 // box items exist once the PDF has been read
// Keyboard: Space or Enter = check / next; 1-4 pick an option; after a self-graded reveal, 1-3 = Got it / Partly / Missed.
const typing = el => el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el.tagName === "INPUT" && el.type !== "radio");
document.addEventListener("keydown", e => {
  if ($("#quiz").hidden || !current || e.target.id === "search") return;
  if (current.format === "self" && answered && /^[1-3]$/.test(e.key)) { document.querySelectorAll("[data-s]")[+e.key - 1]?.click(); return; }
  if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") { e.preventDefault(); submit(); return; }
  if (e.key === " " && !typing(e.target) && e.target.tagName !== "BUTTON" && !(e.target.type === "radio" && !e.target.checked)) { e.preventDefault(); submit(); return; }
  if (current.format === "mc" && !answered && /^[1-4]$/.test(e.key) && !typing(e.target)) {
    const r = document.querySelectorAll("input[name=opt]")[+e.key - 1]; if (r) r.checked = true;
  }
});
if (location.search.includes("debug")) window.__app = { candidates, sources, mixFor, nextQuestion, rt, get settings() { return settings; }, get current() { return current; } };
if (new URLSearchParams(location.search).has("selftest")) selftest(); else go();

// ?selftest: generate many questions per source and check their invariants.
async function selftest() {
  $("#card").innerHTML = "<p>Self-test running…</p>";
  while (!rReady) await new Promise(r => setTimeout(r, 300));
  await bookReadyP;
  const report = {}, t0 = performance.now();
  const N = { code: 400, box: 300, vocab: 100, stats: 300, calc: 200, concept: 200, scen: 300, synth: 300 };
  for (const [src, n] of Object.entries(N)) {
    const r = report[src] = { made: 0, nulls: 0, fails: [], kinds: {} };
    const ids = sources[src].items();
    for (let i = 0; i < n; i++) {
      const id = src === "code" ? ids[i % ids.length] : ids[Math.floor(Math.random() * ids.length)];
      let q; try { q = await sources[src].make(id); } catch (e) { r.fails.push([id, "threw " + e.message]); continue; }
      if (!q) { r.nulls++; continue; }
      r.made++;
      if (src === "code") { const k = q.prompt.replace(/<[^>]+>/g, "").slice(0, 38); r.kinds[k] = (r.kinds[k] ?? 0) + 1; }
      const bad = q.format === "mc" ? (new Set(q.options).size !== q.options.length ? "dup options" : !(q.answer >= 0 && q.answer < q.options.length) ? "answer not in options" : null)
        : q.format === "self" ? null : !q.check(String(q.answer)) ? `own answer rejected: ${q.answer}` : null;
      if (bad) r.fails.push([id, bad]);
    }
  }
  window.__selftest = { secs: ((performance.now() - t0) / 1000).toFixed(1), report };
  $("#card").innerHTML = `<pre>${esc(JSON.stringify(window.__selftest, null, 1))}</pre>`;
}
