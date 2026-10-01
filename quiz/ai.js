// Optional LLM add-on (Groq, OpenAI-compatible API). Off unless enabled in Settings.
// The key lives only in this browser's localStorage, never in a file.
import { esc, shuffle, ref } from "./gen.js";

const URL_ = "https://api.groq.com/openai/v1/chat/completions";
const LIMITS = { perMin: 25, perDay: 900, tokensPerDay: 190000 };   // just under Groq's free tier
const load = () => { try { return JSON.parse(localStorage.getItem("qss.ai")) ?? {}; } catch { return {}; } };
const save = s => { try { localStorage.setItem("qss.ai", JSON.stringify(s)); } catch {} };

export class AI {
  constructor() { this.s = { enabled: false, key: "", model: "openai/gpt-oss-120b", ...load() }; this.recent = []; this.queue = []; }
  get on() { return this.s.enabled && !!this.s.key; }
  set(patch) { Object.assign(this.s, patch); save(this.s); }
  usage() { const today = new Date().toDateString(); if (this.s.day !== today) this.set({ day: today, n: 0, tokens: 0 }); return { n: this.s.n, tokens: this.s.tokens }; }
  canCall() {
    const u = this.usage(), now = Date.now();
    this.recent = this.recent.filter(t => now - t < 60000);
    return this.on && this.recent.length < LIMITS.perMin && u.n < LIMITS.perDay && u.tokens < LIMITS.tokensPerDay;
  }

  async chat(messages) {
    if (!this.canCall()) throw new Error("AI add-on is off or the rate limit was reached");
    this.recent.push(Date.now());
    const res = await fetch(URL_, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.s.key}` },
      body: JSON.stringify({ model: this.s.model, messages, temperature: 0.7, response_format: { type: "json_object" } }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
    const u = this.usage(); this.set({ n: u.n + 1, tokens: u.tokens + (data.usage?.total_tokens ?? 0) });
    const text = data.choices?.[0]?.message?.content ?? "";
    return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  }

  // Five new scenario questions per call, grounded in textbook entries passed in as facts.
  async refill(facts) {
    const out = await this.chat([
      { role: "system", content: "You write exam questions for a graduate political methodology course using the textbook Quantitative Social Science (Imai). Use ONLY the facts provided as ground truth. Invent new, realistic political-science study scenarios (never the textbook's own cases) that test applying these concepts. Each question has exactly 4 options, one unambiguously correct. Respond as JSON: {\"questions\":[{\"stem\":str,\"options\":[str,str,str,str],\"answer\":0-3,\"explanation\":str,\"section\":str}]}" },
      { role: "user", content: `Facts from the textbook:\n${facts.map(f => `- [QSS ${f.section}] ${f.text}`).join("\n")}\n\nWrite 5 questions.` }]);
    for (const q of out.questions ?? []) {
      if (Array.isArray(q.options) && q.options.length === 4 && q.answer >= 0 && q.answer < 4 && new Set(q.options).size === 4) this.queue.push(q);
    }
  }

  async question(factPool) {
    if (!this.queue.length) await this.refill(shuffle(factPool).slice(0, 4));
    const q = this.queue.shift();
    if (!q) return null;
    const order = shuffle([0, 1, 2, 3]);
    return { id: `ai:${q.section}`, topic: "AI scenario (Groq)", ref: ref(q.section), format: "mc", prompt: esc(q.stem),
      options: order.map(i => q.options[i]), answer: order.indexOf(q.answer), explain: esc(q.explanation) + "<div class=hint>AI-generated question; check it against the book if it looks off.</div>" };
  }

  async grade(question, reference, answer) {
    return this.chat([
      { role: "system", content: "You grade a graduate student's short answer against the textbook's reference answer. Be strict about substance, lenient about wording. Respond as JSON: {\"score\":0|1|2, \"missing\":str, \"feedback\":str} where 2 = complete and correct, 1 = partly correct, 0 = incorrect or missing the key idea." },
      { role: "user", content: `Question: ${question}\nReference answer (from the textbook): ${reference}\nStudent answer: ${answer}` }]);
  }
}
