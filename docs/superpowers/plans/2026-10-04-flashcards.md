# Flashcards Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Quizlet-style Flashcards tab that drills every study-guide item with cards built from the QSS book, its data, and real R output.

**Architecture:** Card content lives in plain ES-module data files under `quiz/flash/`. A node build script runs every card's R code once in local R on the book's data and writes `outputs.json` plus plot PNGs; it also validates the schema and the study-guide coverage map. The tab in `app.js` only renders cards and tracks sorting/progress in localStorage.

**Tech Stack:** Vanilla JS ES modules (existing app), KaTeX (already loaded), Node 24 for the build, local R 4.4.2 (`C:/Program Files/R/R-4.4.2/bin/Rscript.exe`).

## Global Constraints

- Scope: QSS Chapters 1–4, plus the "Regression output & inference" set from Ch 7.2–7.3 only.
- Examples: the book's own code and data sets; data from `https://raw.githubusercontent.com/kosukeimai/qss/3d6144d4c6fa29ff1fb0a7edb681490b22340bbb/<FOLDER>/<file>`.
- Boxed definitions are quoted word-for-word with the printed page number.
- Card ids contain no dots; every card has `dict`, `topics`, `sec`, `page`, `front`, `back`.
- Flashcards must not depend on webR.
- Keyboard: Space/Enter flip; →/K know; ←/J still learning; S star; Z undo; H shuffle; B back-first.
- localStorage key: `qss.flash`.
- Commits: only when the user asks (repo convention in this session).

---

## File map

| File | Responsibility |
|---|---|
| `quiz/flash/topics.js` | `DICTS` and `TOPICS` (id → label), used by build and tab |
| `quiz/flash/cards_commands.js` | command cards + inference output cards |
| `quiz/flash/cards_concepts.js` | concept cards |
| `quiz/flash/cards_equations.js` | equation cards |
| `quiz/flash/cards_graphs.js` | graph cards |
| `quiz/flash/guide.js` | study-guide items → card ids |
| `quiz/flash/outputs.json` | generated output per card |
| `quiz/flash/img/<id>.png` | generated plots |
| `quiz/build_flash.mjs` | validate, run R, write outputs, check coverage |
| `quiz/app.js` | Flashcards tab + Progress panel |
| `quiz/index.html` | nav button, section, CSS |

### Task 1: Build pipeline with seed cards

**Files:** Create `quiz/flash/topics.js`, the four `cards_*.js` files (2 seed cards each), `quiz/flash/guide.js` (seed), `quiz/build_flash.mjs`.

**Interfaces — Produces:** `export const DICTS = {concept, command, equation, graph}` and `export const TOPICS = {...}` from `topics.js`; each `cards_*.js` exports `default` an array of cards; `outputs.json` maps `id → { text: string, img: boolean }`.

- [ ] Step 1: Write `topics.js` and seed cards (one command card using `resume.csv`, one graph card drawing a histogram).
- [ ] Step 2: Write `build_flash.mjs`: import cards; validate schema (throw listing every problem); download needed CSVs into `os.tmpdir()/qss-flash-data/<FOLDER>/`; generate one R script that for each card with `code` runs `setup` then `code` (autoprinting visible values) with `png(<img>, 1100, 800, res = 150)` around graph cards; treat any error or warning as fatal; write `outputs.json`; run coverage check.
- [ ] Step 3: Run `node quiz/build_flash.mjs`. Expected: "N cards, M outputs, K images, coverage ok".
- [ ] Step 4: Break a seed card's code on purpose; run again. Expected: build fails naming the card id. Restore.

### Task 2: Flashcards tab

**Files:** Modify `quiz/index.html` (nav button `data-tab="flash"`, `<section id="flash" hidden>`, CSS), `quiz/app.js` (imports + section before "chrome").

**Interfaces — Consumes:** card arrays, `DICTS`, `TOPICS`, `outputs.json` (fetched).

- [ ] Step 1: Render set picker, progress bar, controls, card (header, front, back), key hint.
- [ ] Step 2: Sorting: `know`/`learn` marks, round queue, end-of-round screen, all-known screen, undo stack.
- [ ] Step 3: Star, shuffle, starred-only filter, back-first (concept/equation only), reset set.
- [ ] Step 4: Keyboard handler scoped to the visible tab and non-input targets.
- [ ] Step 5: Persist `qss.flash`; Progress tab panel (known/total per set).
- [ ] Step 6: Browser check with seed cards: every control and key, reload persistence.

### Task 3: Command and inference output cards (~55)

**Files:** `quiz/flash/cards_commands.js`, `quiz/flash/guide.js`.

- [ ] Step 1: Write the ~43 command cards listed in the spec, each with the book's code, `setup` loading its data, page, and a back explaining how to read the output.
- [ ] Step 2: Write the inference output cards (`summary()` of `water ~ reserved`, `diff.share ~ d.comp`, the minimum-wage multiple regression; `confint()`; one card per output part).
- [ ] Step 3: Build; read every output in `outputs.json` against the back text; fix mismatches.

### Task 4: Concept cards (~118)

**Files:** `quiz/flash/cards_concepts.js`, `quiz/flash/guide.js`.

- [ ] Step 1: Write cards topic by topic (Causality & designs, Descriptive stats, Sampling & measurement, Correlation & clustering, Prediction, Linear regression, Regression & causation, Inference concepts), using `book` for verbatim boxes.
- [ ] Step 2: Build (schema + coverage).

### Task 5: Equation and graph cards (~40)

**Files:** `quiz/flash/cards_equations.js`, `quiz/flash/cards_graphs.js`, `quiz/flash/guide.js`.

- [ ] Step 1: Equation cards with KaTeX fronts and symbol-by-symbol backs.
- [ ] Step 2: Graph cards with the book's plotting code (Lorenz curve and DiD figure drawn in R).
- [ ] Step 3: Build; open each PNG to check it.

### Task 6: Accuracy and coverage pass

- [ ] Step 1: Script compares every `book` quote (normalized whitespace/punctuation) against the PDF text; list misses and fix them.
- [ ] Step 2: Spot-check page numbers against the PDF text page markers.
- [ ] Step 3: Coverage map complete for every study-guide line.

### Task 7: Final browser verification

- [ ] Step 1: Flip/sort/round/undo/star/shuffle/back-first/reset, all keys, reload persistence, phone width, dark mode, console errors.
