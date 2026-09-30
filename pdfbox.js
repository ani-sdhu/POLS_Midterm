// Reads the definition boxes verbatim from the user's own copy of the textbook PDF:
// exact text for questions, and a rendered image of the box for answers.
import * as pdfjs from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const PDF_URL = "../QSS%20Ch1-4.pdf";
const SPLITS = { "box-causal": [0, "The fundamental problem"], "box-fpci": ["The fundamental problem", null] };  // two definitions share one box

export class BookBoxes {
  async init(boxes, geoms) {
    this.doc = await pdfjs.getDocument(PDF_URL).promise;
    this.geom = {};
    const byPage = {};
    for (const g of geoms) (byPage[g.page] ??= []).push(g);
    const seen = {};
    for (const b of boxes) {                      // match boxes to outlines in reading order on each page
      const gs = byPage[b.page] ?? [], i = seen[b.page] = (seen[b.page] ?? -1) + 1;
      this.geom[b.id] = gs[Math.min(i, gs.length - 1)];
    }
    this.texts = {}; this.images = {};
    await Promise.all(boxes.map(b => this.load(b.id)));
    this.ready = true;
  }

  async load(id) {
    const g = this.geom[id];
    if (!g) return;
    const page = await this.doc.getPage(g.pdfPage);
    const [x0, y0, x1, y1] = g.bbox;
    const content = await page.getTextContent();
    const items = content.items.filter(it => it.str && it.transform[4] >= x0 && it.transform[4] <= x1 && it.transform[5] >= y0 && it.transform[5] <= y1);
    const lines = [];
    for (const it of items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4])) {
      const line = lines.find(l => Math.abs(l.y - it.transform[5]) < 2.5);
      line ? line.items.push(it) : lines.push({ y: it.transform[5], items: [it] });
    }
    let text = lines.sort((a, b) => b.y - a.y).map(l => {
      let s = "", end = null;
      for (const it of l.items.sort((a, b) => a.transform[4] - b.transform[4])) {
        if (end !== null && it.transform[4] - end > 1.2 && !s.endsWith(" ") && !it.str.startsWith(" ")) s += " ";
        s += it.str; end = it.transform[4] + it.width;
      }
      return s;
    }).join(" ").replace(/-\s+(?=[a-z])/g, "-").replace(/\s+/g, " ").trim();
    const split = SPLITS[id];
    if (split) {
      const a = split[0] === 0 ? 0 : text.indexOf(split[0]), bIdx = split[1] ? text.indexOf(split[1]) : text.length;
      text = text.slice(Math.max(0, a), bIdx > 0 ? bIdx : text.length).trim();
    }
    this.texts[id] = text;
  }

  // Sentences of prose (formula-heavy fragments are skipped for text questions; the image shows them).
  sentences(id) {
    return (this.texts[id] ?? "").split(/(?<=\.)\s+(?=[A-Z])|(?<=:)\s+|(?<=\.)\s+(?=[a-z]\s)|\s(?=The assumption|Few data points|The square of)/).map(s => s.trim())
      .filter(s => s.length > 30 && (s.match(/[a-z]/gi) ?? []).length / s.length > 0.7);
  }

  // ---------- book prose that follows a code block ----------
  // Lines are classified as code when nearly all their characters are monospace (Courier).
  async pageLines(pdfPage) {
    (this.lineCache ??= {});
    if (this.lineCache[pdfPage]) return this.lineCache[pdfPage];
    const page = await this.doc.getPage(pdfPage), c = await page.getTextContent(), rows = [];
    for (const it of c.items) {
      if (!it.str.trim() && !rows.length) continue;
      const y = it.transform[5], mono = c.styles[it.fontName]?.fontFamily === "monospace";
      let row = rows.find(r => Math.abs(r.y - y) < 2.5);
      if (!row) rows.push(row = { y, parts: [] });
      row.parts.push({ x: it.transform[4], w: it.width, s: it.str, mono });
    }
    const lines = rows.filter(r => r.y > 80 && r.y < 745).sort((a, b) => b.y - a.y).map(r => {   // drop running heads / folios
      let s = "", end = null, monoChars = 0, all = 0;
      for (const p of r.parts.sort((a, b) => a.x - b.x)) {
        if (end !== null && p.x - end > 1.2 && !s.endsWith(" ") && !p.s.startsWith(" ")) s += " ";
        s += p.s; end = p.x + p.w;
        const n = p.s.replace(/\s/g, "").length; all += n; if (p.mono) monoChars += n;
      }
      return { y: r.y, text: s.trim(), code: all > 0 && monoChars / all > 0.9 };
    }).filter(l => l.text && !/^(\d+\s+Chapter \d+:|\d+(\.\d+)+\s.{3,80}\s\d+$)/.test(l.text));   // running heads
    return (this.lineCache[pdfPage] = lines);
  }

  // Verbatim book prose right after the code block containing `code`, or null if the book says nothing there.
  // candidates: code strings (the statement first, then its neighbors) used to locate the block.
  async passageAfter(candidates, printedPage) {
    const norm = s => s.replace(/#.*$/gm, "").replace(/\s+/g, "");
    const targets = candidates.map(norm).filter(t => t.length >= 6);
    if (!targets.length) return null;
    for (let p = printedPage - 1; p <= printedPage + 14; p++) {
      const pdfPage = p + 23;
      if (pdfPage < 1 || pdfPage > this.doc.numPages) continue;
      const lines = await this.pageLines(pdfPage);
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].code) continue;
        let j = i, blockText = "";                      // the code block starting at line i
        while (j < lines.length && lines[j].code) blockText += norm(lines[j++].text);
        if (!targets.some(t => blockText.includes(t))) { i = j; continue; }
        let prose = [], next = lines.slice(j), q = pdfPage;
        while (true) {
          for (const l of next) { if (l.code) { next = null; break; } prose.push(l.text); }
          if (next === null || prose.join(" ").length > 900 || q >= this.doc.numPages) break;
          next = await this.pageLines(++q);            // passage continues on the next page
        }
        let text = prose.join(" ").replace(/-\s+(?=[a-z])/g, "").replace(/\s+/g, " ").trim();
        if (text.length > 900) { const cut = text.slice(0, 900).lastIndexOf(". "); text = text.slice(0, cut > 200 ? cut + 1 : 900) + " …"; }
        return text.length > 40 ? { text, page: p } : null;
      }
    }
    return null;
  }

  async image(id) {
    if (this.images[id]) return this.images[id];
    const g = this.geom[id], page = await this.doc.getPage(g.pdfPage), scale = 2.5;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, intent: "print" }).promise;   // "print" avoids requestAnimationFrame, which stalls in background tabs
    const [ax, ay, bx, by] = vp.convertToViewportRectangle(g.bbox);
    const [left, top, w, h] = [Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay)];
    const crop = document.createElement("canvas");
    crop.width = w; crop.height = h;
    crop.getContext("2d").drawImage(canvas, left, top, w, h, 0, 0, w, h);
    return (this.images[id] = crop.toDataURL("image/png"));
  }
}
