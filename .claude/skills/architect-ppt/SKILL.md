---
name: architect-ppt
description: "Generate PowerPoint slides in the in-house \"Architect 과제\" (Architect assignment) house style — the Korean corporate format with a full-width navy/green title band, a 5-step nav stepper (과제 개요 → 요구사항 → 설계 → 검증 → 결론) highlighted in yellow, green/navy section-header bars, navy label tables, navy diamond bullets, and an N/33 page footer. Use this whenever the user wants a deck, slides, or 발표자료 that matches this Architect-course template, mentions 아키텍트 과제 PPT / 개인과제 발표자료, or attaches screenshots of this template and asks to reproduce its format or master slide. Self-contained: generates and packages valid .pptx files with pptxgenjs + python3."
---

# Architect 과제 PPT Skill

Generates presentations that match the **Architect 양성과정 개인과제** house style.
It encodes that template's design system (see [reference/design-tokens.md](reference/design-tokens.md))
as a small pptxgenjs library plus ready-to-copy layout patterns.

**Self-contained.** It needs only Node + `pptxgenjs` (generation) and `python3`
(canonical `.pptx` packaging + validation) — no other skills required.

## What this format looks like

Every content slide carries the same chrome ("the master"):

| Element | Spec |
|---------|------|
| **Title band** | Full-width bar at top. **Navy** `#1F3864` for content slides, **green** `#4E7C3A` for lead / section-opener slides. Title text white bold, left-aligned. |
| **Nav stepper** | Top-right: `과제 개요 → 요구사항 → 설계 → 검증 → 결론`, joined by gray chevrons. The current section box is filled **yellow** `#FFC000`. |
| **Footer** | `N / 33` page number, bottom-right, muted gray. |

Content uses green/navy **section-header bars**, **navy-label info tables**,
**navy diamond bullets** (◆), and light **placeholder boxes** for diagrams/charts.
Canvas is **16:9** (13.333″ × 7.5″).
Full token list (colors, fonts, sizes, geometry) is in
[reference/design-tokens.md](reference/design-tokens.md).

## Per-page rules

Standard page order and structure. Each type has a dedicated builder:

| # | Page | Columns | Structure | Builder |
|---|------|---------|-----------|---------|
| 1 | **과제 배경** | 3 | Each column holds **2 content items**; each item = short text + a **matching image**. | `pageColumns` |
| 2 | **과제 필요성** | 2 | Same item format as 과제 배경 (2 items/column, each with its image). | `pageColumns` |
| 3 | **과제 범위** | 3 | Text-only lists (목적 / In Scope / Out of Scope) — `images: false`. | `pageColumns` |
| 4 | **과제 개요** | 2 | **Left** = info table (과제명 · 과제목표 · 참여인력 · 일정 …). **Right** = overall architecture — **BLANK unless the user explicitly supplies it.** | `pageOverview` |

### Image sourcing rule (배경 / 필요성)

For every content item that needs a visual (chart, 그림, 구조도, 설계도 등):

1. Search the web for a fitting image (WebSearch / image search) and download it
   locally (`curl -L -o /tmp/item.png <url>`); pass the local path as `image`.
2. **If the web is blocked or no suitable image exists, generate a matching
   diagram/chart locally** (matplotlib — see `docs/mcr_assets/make_assets.py` for
   a worked example) and use that. Prefer a generated, on-topic diagram over a
   blank box. Use English technical labels in figures to avoid CJK-font issues;
   keep the Korean prose in the bullet text.
3. Only leave the box **blank** as a last resort (no web, nothing sensible to
   generate). Never invent a caption or fake measured numbers — mark any
   illustrative chart as such.

The **overall architecture** box on 과제 개요 stays blank until the user names
exactly what to put there.

## Files

```
architect-ppt/
├── SKILL.md
├── lib/architect_deck.js          # the generator library
├── examples/build_deck.js         # 3 reusable layout patterns → template
├── assets/architect_template.pptx # prebuilt starter template (open in PowerPoint)
└── reference/design-tokens.md     # exact design spec
```

## Quick start

The library needs `pptxgenjs` importable. Install once:

```bash
npm install -g pptxgenjs        # or: npm install pptxgenjs in a working dir
export NODE_PATH="$(npm root -g)"
```

Generate the starter template (3 layout patterns):

```bash
node examples/build_deck.js            # → assets/architect_template.pptx
node examples/build_deck.js out.pptx   # custom output path
```

## Building a deck in code

```js
const A = require("<skill>/lib/architect_deck");
const pptx = A.newDeck();                        // 16:9, Malgun Gothic

// 과제 개요 · 2단 (좌: 표 / 우: overall architecture — 지시 없으면 공란)
A.pageOverview(pptx, {
  title: "과제 개요", page: 1, band: "green",
  table: [
    { label: "과제 명",  lines: [{ text: "…", bullet: false, bold: true }] },
    { label: "과제 목표", lines: ["…"] },
    { label: "참여 인력", lines: [{ text: "국내: N명", color: A.COLORS.navy, bold: true }] },
    { label: "일정",      lines: ["YY.M ~ YY.M"] },
  ],
  // architecture: "/tmp/overall_arch.png",      // 사용자가 명시할 때만
});

// 과제 배경 · 3단, 각 단 2개 콘텐츠 + 매칭 이미지 (웹에서 찾아 로컬 경로로)
A.pageColumns(pptx, {
  title: "과제 배경", page: 2, band: "navy",
  cols: [
    { header: "배경 1", items: [
      { text: "핵심 메시지 A", image: "/tmp/bg1a.png" },   // 웹 이미지 다운로드 경로
      { text: "핵심 메시지 B" },                            // image 생략 → 공란
    ]},
    { header: "배경 2", items: [{ text: "…" }, { text: "…" }] },
    { header: "배경 3", items: [{ text: "…" }, { text: "…" }] },
  ],
});

// 과제 필요성 → 위와 동일하되 cols 2개. 과제 범위 → cols 3개.

await A.writeDeck(pptx, "deck.pptx");   // NOT pptx.writeFile — see below
```

> **Always save with `A.writeDeck(pptx, file)`, never `pptx.writeFile()`.**
> pptxgenjs's zip writer emits bare directory entries and misorders
> `[Content_Types].xml`; real `.pptx` files have neither, and some PowerPoint/OS
> setups then reject the file and open it as a plain `.zip`. `writeDeck`
> repackages into a canonical OPC archive (no directory entries,
> `[Content_Types].xml` first) using `python3`'s `zipfile`.

### Helper reference (`lib/architect_deck.js`)

| Helper | Purpose |
|--------|---------|
| `newDeck()` | New 16:9 presentation with default fonts |
| `writeDeck(pptx, file)` | Save + repackage to a valid `.pptx` (use instead of `writeFile`) |
| `pageOverview(pptx, {title, page, band, table, architecture})` | **과제 개요**: 2단, 좌 표 + 우 아키텍처(공란 가능) |
| `pageColumns(pptx, {title, page, band, cols})` | **배경/필요성/범위**: N단, 각 단 items(텍스트+이미지) |
| `slide(pptx, {title, active, band, page, total})` | Add slide + paint chrome (low-level) |
| `itemColumn(s, {x, w, header, items})` | One column: header bar + stacked text/image items |
| `sectionHeader(s, {x,y,w,text,color})` | Green/navy header bar; returns y below it |
| `infoTable(s, {x,y,w,h,labelW,rows})` | Navy-label + white-content table |
| `bulletList(s, {x,y,w,h,items})` | Navy diamond (◆) bullets; `level:1` → dash |
| `columns(n, {gap})` | Even column boxes `[{x,w}]` |
| `panel` / `placeholder(s, {x,y,w,h})` | Content box / diagram placeholder |
| `statCallout(s, {x,y,w,value,label})` | Big-number stat |
| `COLORS`, `FONT`, `SECTIONS`, `MARGIN`, `CONTENT_TOP`, `CONTENT_BOTTOM` | Tokens (mutable) |

- **`cols[i].items`** = `[{ text, image? }]`. Omit `image` → blank box. `text`
  can be a string or a `bulletList` run array.
- **`cols[i].images: false`** → text-only column (no image boxes), for list-style
  slides like 과제 범위 (목적 / In Scope / Out of Scope).

- **Change the nav labels** for a different chapter set: `A.SECTIONS = [...]` before building.
- **`active`** is the 0-based index of the highlighted nav step; **`band`** is `"navy"` (content) or `"green"` (lead).
- Place real images with pptxgenjs directly: `s.addImage({ path, x, y, w, h })`.

## Reproducing the format from screenshots

When the user attaches screenshots of a template and asks to match it:

1. Read the tokens already captured in [reference/design-tokens.md](reference/design-tokens.md).
2. If the attached style differs (different colors, nav labels, aspect ratio),
   update the tokens at the top of `lib/architect_deck.js` (`COLORS`, `SECTIONS`, `PAGE`)
   and/or the geometry constants — everything else reflows.
3. Regenerate and QA (below).

## QA (required)

**1. Validate the file is a real PowerPoint package** (catches the "opens as a
zip" failure). `python-pptx` parses the OPC package strictly — if it loads, the
file will open in PowerPoint:

```bash
pip install python-pptx   # once
python - <<'PY'
from pptx import Presentation
p = Presentation("deck.pptx")
print("slides:", len(p.slides))          # must succeed and match your slide count
for i, s in enumerate(p.slides, 1):
    t = next((sh.text_frame.text.split("\n")[0] for sh in s.shapes
              if sh.has_text_frame and sh.text_frame.text.strip()), "(no text)")
    print(f"  {i}: {t}")
PY
```

Also confirm the archive is canonical (no directory entries, `[Content_Types].xml`
first — `writeDeck` guarantees this):

```bash
python - <<'PY'
import zipfile
z = zipfile.ZipFile("deck.pptx"); n = z.namelist()
assert not any(e.endswith("/") for e in n), "has directory entries!"
assert n[0] == "[Content_Types].xml", "Content_Types not first!"
print("package OK")
PY
```

**2. Visual QA** — render slides to images and inspect critically (assume there
are problems). Requires LibreOffice + PyMuPDF, both optional:

```bash
soffice --headless --convert-to pdf deck.pptx   # → deck.pdf
python - <<'PY'
import fitz
for i, p in enumerate(fitz.open("deck.pdf"), 1):
    p.get_pixmap(dpi=150).save(f"slide-{i:02d}.png")
PY
```

Check every slide for: leftover `[ ... ]` placeholders, text overflow past box
edges, low-contrast text, nav step highlighted on the wrong section, and the
correct `page` number. Complete at least one fix-and-verify cycle before finishing.

## Notes

- Do **not** add decorative accent lines under titles — this template uses solid
  bands and whitespace, not underlines.
- Keep the nav stepper's active step consistent with the slide's chapter.
- Body text is left-aligned; only band titles and section-bar text are centered.
