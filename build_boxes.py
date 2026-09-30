"""Locate the definition boxes in QSS Ch1-4.pdf and write their page + bounding box.

Output: knowledge/box_geom.json (coordinates only). The quiz renders and reads the exact
box text from the user's own PDF at runtime, so no book text is copied into this project.
"""
import json
from pathlib import Path
from pypdf import PdfReader

PDF = Path(__file__).resolve().parent.parent / "QSS Ch1-4.pdf"
PAGE_OFFSET = 23          # PDF page index minus printed book page
PAINT = {b"S", b"s", b"f", b"F", b"f*", b"B", b"B*", b"b", b"b*", b"n"}


def box_paths(page):
    pts, found = [], []

    def mul(cm, x, y):
        return (cm[0] * x + cm[2] * y + cm[4], cm[1] * x + cm[3] * y + cm[5])

    def before(op, args, cm, tm):
        nonlocal pts
        if op in (b"m", b"l"):
            pts.append(mul(cm, float(args[0]), float(args[1])))
        elif op == b"c":
            pts.append(mul(cm, float(args[4]), float(args[5])))
        elif op in (b"v", b"y"):
            pts.append(mul(cm, float(args[2]), float(args[3])))
        elif op in PAINT:
            if pts:
                xs, ys = [p[0] for p in pts], [p[1] for p in pts]
                # the outer outline of a definition box: ~362pt wide, filled
                if op.startswith(b"f") and 355 <= max(xs) - min(xs) <= 370:
                    found.append((min(xs), min(ys), max(xs), max(ys)))
            pts = []

    page.extract_text(visitor_operand_before=before)
    # keep outer outlines only (drop the inner fill nested inside another)
    outer = [b for b in found if not any(o != b and o[0] <= b[0] and o[1] <= b[1] and o[2] >= b[2] and o[3] >= b[3] for o in found)]
    return sorted(outer, key=lambda b: -b[3])      # top of page first


def main():
    r = PdfReader(PDF)
    boxes = []
    for i, page in enumerate(r.pages):
        for x0, y0, x1, y1 in box_paths(page):
            boxes.append({"pdfPage": i + 1, "page": i + 1 - PAGE_OFFSET,
                          "bbox": [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)]})
    out = Path(__file__).with_name("knowledge") / "box_geom.json"
    out.write_text(json.dumps(boxes, indent=1), encoding="utf-8")
    print(len(boxes), "boxes:", [b["page"] for b in boxes])


if __name__ == "__main__":
    main()
