# Flashcards tab: design

Date: 2026-10-04 · Status: approved by the user in conversation

## Goal

A Quizlet-style Flashcards tab in the QSS midterm quiz app that drills every item on the user's study guide (`POLS_7012 MIDTERM STUDY GUIDES.docx`: Commands, Concepts, Equations, Graphs dictionaries), built from the full QSS PDF.

## Decisions (from the user)

| Topic | Decision |
|---|---|
| Card style | Mixed types by dictionary: concept, command, equation, graph, plus output cards for the inference set |
| Study mode | Quizlet sorting: flip, Know / Still learning, rounds of the still-learning cards, shuffle, star, filter by set |
| Scope | Chapters 1–4 only (the exam's scope), with one requested exception: a "Regression output & inference" set from Ch 7.2–7.3 (t values, p values, interpreting `summary(lm)` for simple and multiple regression, exogeneity and unbiasedness) |
| Outputs and plots | Pre-made by running every snippet once in real R on the book's data; stored with the cards |
| Examples | The book's own examples, data sets, and page numbers |
| Definitions | Book wording word-for-word (with page) + one plain-language sentence + a book example |
| Progress | Saved in the browser per card, with reset per set; shown on the Progress tab |
| Sets | The four study-guide dictionaries, plus topic sets that cut across them, plus All and Starred |
| Direction | Front first by default; a "Show back first" toggle for concept and equation cards |
| Keyboard | Full keyboard control (see below) |

The book has no glossary. Its General Index and R Index are used to locate where each term is defined; the boxed definitions are authoritative.

## Architecture

```
quiz/flash/
  cards_commands.js     command cards (+ inference output cards)
  cards_concepts.js     concept cards
  cards_equations.js    equation cards
  cards_graphs.js       graph cards
  topics.js             set definitions (dictionaries + topic sets)
  guide.js              study-guide items -> card ids (coverage map)
  outputs.json          GENERATED: printed R output per card
  img/<id>.png          GENERATED: plots for graph cards
quiz/build_flash.mjs    build script (node + local R)
quiz/app.js             Flashcards tab (render, sorting, keyboard, progress)
quiz/index.html         tab button, section, styles
```

### Card schema

```js
{
  id: "conf-confounder",            // unique, no dots
  dict: "concept",                  // concept | command | equation | graph
  topics: ["causal"],               // one or more topic-set ids from topics.js
  sec: "2.5.2", page: 58,           // book section and printed page
  front: "Confounder",              // HTML (KaTeX allowed)
  setup: "minwage <- read.csv(...)",// optional hidden R run before `code`
  code: "prop.table(table(...))",   // optional R shown on the front; its output is shown under it
  book: "A pretreatment variable…", // optional verbatim book definition (shown first on the back)
  back: "…",                        // HTML: plain gloss, example, how to read, good/bad for, etc.
  reversible: true,                 // concept/equation only: allowed in "Show back first" mode
}
```

### Build script (`quiz/build_flash.mjs`)

1. Imports every card file; validates fields (unique ids, valid dict, known topics, page number, `code` only on command/graph cards).
2. Downloads the book's data sets once (pinned commit of github.com/kosukeimai/qss, the same source the quiz uses) into a temp folder.
3. Writes one R script that, for each card with `code`, runs `setup` then `code` in a fresh environment in that folder, captures printed output, and for graph cards writes `quiz/flash/img/<id>.png` (PNG device, white background).
4. Any R error or warning stops the build with the card id. Writes `quiz/flash/outputs.json`.
5. Coverage check: every study-guide item in `guide.js` must map to at least one existing card id.

### Tab (in `app.js`)

- Set picker (grouped: Dictionaries, Topics, Starred), progress bar (known / learning / round), controls (Shuffle, Starred only, Show back first, Reset set).
- Card: header (type · QSS section · page · ☆), front (term / code + output / equation / plot), back (book quote, then back HTML). Click or Space flips with a short animation. KaTeX typesets both sides.
- Sorting: Know / Still learning record a mark and advance. End of round shows counts with "Keep going" (next round = still-learning cards only) and "Restart set". All known → done screen with restart.
- Storage: `qss.flash` = `{ marks: {id: "know"|"learn"}, stars: {id: true}, set, backFirst, round state per set }`. Reset clears marks for the current set only.
- Progress tab: a Flashcards panel with known / total per set.
- Flashcards never depend on webR, so they work while R loads.

### Keyboard

| Key | Action |
|---|---|
| Space or Enter | Flip |
| → or K | Know (next card) |
| ← or J | Still learning (next card) |
| S | Star / unstar |
| Z | Undo last mark |
| H | Shuffle |
| B | Toggle "Show back first" |

Keys are ignored while typing in an input (e.g. the search box) and only act when the Flashcards tab is visible. A one-line key hint sits under the card.

## Content

About 215 cards (counts approximate):

- Commands (~43) and inference output cards (~12): the book's code on the book's data, real output on the front.
- Concepts (~118): Causality & designs (22), Descriptive stats (9), Sampling & measurement (19), Correlation & clustering (8), Prediction (6), Linear regression (28, including a logical-flow card), Regression & causation (11), Regression output & inference concepts (~15).
- Equations (~31): the study guide's Equation Dictionary plus t-statistic, 95% CI, residual standard error.
- Graphs (9): bar, histogram, scatter, box, line, Q-Q, residual plot, Lorenz curve, DiD figure (the last two drawn in R in the book's style).

Concept cards cover meaning; equation cards cover formula and symbols; their backs do not duplicate each other.

## Error handling

- Missing plot image: the card shows its code and a note instead.
- Missing output entry (stale build): the card shows its code and "output not built".
- Unknown ids in saved progress are ignored.

## Testing

1. Build script: all snippets run cleanly in R; schema and coverage checks pass.
2. Accuracy pass: boxed-definition text compared with the PDF text; page numbers checked against the PDF.
3. Browser: flip, sort, finish a round (next round = learning cards only), star, shuffle, back-first, undo, reset, reload persistence, every keyboard shortcut, phone width, dark mode.

## Out of scope

Type-the-answer mode, spaced-repetition scheduling, Ch 5–7 material beyond the inference set, AI-generated cards.
