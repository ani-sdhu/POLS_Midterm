"""Split the official QSS companion Rmd files (Ch. 1-4) into top-level R statements.

Output: bookcode.json, loaded by the quiz. Rerun after editing the Rmd list.
Paths in the JSON are relative to the server root (the 7012_POLS folder).
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]          # .../7012_POLS
CHAPTERS = [
    ("ch1", "Week 1/INTRO/intro.Rmd", "Week 1/INTRO"),
    ("ch2", "Data Sets/CAUSALITY/causality.Rmd", "Data Sets/CAUSALITY"),
    ("ch3", "Data Sets/MEASUREMENT/measurement.Rmd", "Data Sets/MEASUREMENT"),
    ("ch4", "Data Sets/PREDICTION/prediction.Rmd", "Data Sets/PREDICTION"),
]
SECTION_RE = re.compile(r"^#+\s*(?:Section\s+)?(\d+\.\d+(?:\.\d+)?):?\s*(.*)$")
CONT_RE = re.compile(r"(<-|[-+*/|&,=~]|%[^%]*%)\s*$")   # line ends mid-expression
DATA_RE = re.compile(r'(?:read\.csv|load)\("([^"]+)"\)')


def depth_delta(line):
    """Bracket depth change for one line, ignoring strings and comments."""
    d, q = 0, None
    for i, ch in enumerate(line):
        if q:
            if ch == q and line[i - 1] != "\\":
                q = None
        elif ch in "\"'`":
            q = ch
        elif ch == "#":
            break
        elif ch in "([{":
            d += 1
        elif ch in ")]}":
            d -= 1
    return d


def strip_comment(line):
    q = None
    for i, ch in enumerate(line):
        if q:
            if ch == q and line[i - 1] != "\\":
                q = None
        elif ch in "\"'`":
            q = ch
        elif ch == "#":
            return line[:i].rstrip()
    return line.rstrip()


def find_file(name, chapter_dir):
    local = ROOT / chapter_dir / name
    if local.exists():
        return str(local.relative_to(ROOT)).replace("\\", "/")
    for p in sorted(ROOT.rglob(name)):
        if ".git" not in p.parts:
            return str(p.relative_to(ROOT)).replace("\\", "/")
    raise FileNotFoundError(name)


def parse(ch, rmd, chapter_dir):
    lines = (ROOT / rmd).read_text(encoding="utf-8").splitlines()
    steps, files = [], {}
    section, title = None, ""
    in_chunk, evaluate, group = False, True, 0
    pending_comments, buf, depth = [], [], 0

    def flush():
        nonlocal buf, pending_comments
        if not buf:
            return
        code = "\n".join(buf)
        steps.append({
            "id": f"{ch}-{len(steps) + 1:03d}",
            "ch": ch, "section": section, "title": title, "group": group,
            "comment": "\n".join(pending_comments), "code": code, "eval": evaluate,
        })
        for f in DATA_RE.findall(code):
            files[f] = find_file(f, chapter_dir)
        buf, pending_comments = [], []

    for line in lines:
        if not in_chunk:
            m = SECTION_RE.match(line)
            if m:
                section, title = m.group(1), m.group(2).strip()
            if line.startswith("```{r"):
                in_chunk, evaluate = True, "eval = FALSE" not in line.replace("eval=FALSE", "eval = FALSE")
                group += 1
            continue
        if line.startswith("```"):
            flush()
            in_chunk, pending_comments = False, []
            continue
        stripped = line.strip()
        if not buf:
            m = SECTION_RE.match(stripped) if stripped.startswith("###") else None
            if m:                                   # e.g. "### Section 3.3.3: Box Plot" inside a chunk
                section, title = m.group(1), m.group(2).strip()
                continue
            if not stripped:
                group += 1                          # blank line separates code groups
                pending_comments = []
                continue
            if stripped.startswith("#"):
                pending_comments.append(stripped.lstrip("#").strip())
                continue
        buf.append(line.rstrip())
        depth += depth_delta(line)
        if depth <= 0 and not CONT_RE.search(strip_comment(line)):
            depth = 0
            flush()
    return steps, files


def main():
    out = {"chapters": [], "steps": []}
    for ch, rmd, chapter_dir in CHAPTERS:
        steps, files = parse(ch, rmd, chapter_dir)
        out["chapters"].append({"id": ch, "rmd": rmd, "files": files})
        out["steps"].extend(steps)
    dest = Path(__file__).with_name("bookcode.json")
    dest.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
    counts = {c["id"]: sum(s["ch"] == c["id"] for s in out["steps"]) for c in out["chapters"]}
    print(f"wrote {dest.name}: {len(out['steps'])} statements", counts)


if __name__ == "__main__":
    main()
