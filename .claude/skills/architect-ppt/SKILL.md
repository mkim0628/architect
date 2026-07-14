---
name: architect-ppt
description: "Generate PowerPoint slides in the in-house \"Architect 과제\" (Architect assignment) house style — the Korean corporate format with a full-width navy/green title band, a 5-step nav stepper (과제 개요 → 요구사항 → 설계 → 검증 → 결론) highlighted in yellow, green/navy section-header bars, navy label tables, navy diamond bullets, and an N/33 page footer. Use this whenever the user wants a deck, slides, or 발표자료 that matches this Architect-course template, mentions 아키텍트 과제 PPT / 개인과제 발표자료, or attaches screenshots of this template and asks to reproduce its format or master slide. Builds on the base `pptx` skill for reading/QA/packing."
---

# Architect 과제 PPT Skill

Generates presentations that match the **Architect 양성과정 개인과제** house style.
It encodes that template's design system (see [reference/design-tokens.md](reference/design-tokens.md))
as a small pptxgenjs library plus ready-to-copy layout patterns.

For anything about reading, editing, converting, or QA'ing a `.pptx`, this skill
sits on top of the base **`pptx`** skill — use its scripts (`markitdown`,
`thumbnail.py`, `office/unpack.py`, `office/pack.py`, image conversion) as documented there.

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

Each standard slide type has a fixed structure and a dedicated builder:

| Page | Columns | Structure | Builder |
|------|---------|-----------|---------|
| **과제 개요** | 2 | **Left** = info table (과제명 · 과제목표 · 참여인력 · 일정 …). **Right** = overall architecture — **BLANK unless the user explicitly supplies it.** | `pageOverview` |
| **과제 배경** | 3 | Each column holds **2 content items**; each item = short text + a **matching image** found from the web. | `pageColumns` |
| **과제 필요성** | 2 | Same item format as 과제 배경 (2 items/column, each with its image). | `pageColumns` |
| **과제 범위** | 3 | 2 content items per column. | `pageColumns` |

### Image sourcing rule (배경 / 필요성 / 범위)

For every content item that needs a visual (chart, 그림, 구조도, 설계도 등):

1. Search the web for a fitting image (WebSearch / image search).
2. Download it locally (e.g. `curl -L -o /tmp/item.png <url>`).
3. Pass the local path as the item's `image`.
4. **If the web is unavailable or no suitable image is found, leave it BLANK** —
   `pageColumns`/`pageOverview` draw an empty bordered box. Do **not** invent a
   caption or a fake chart. (User rule: "web 연결이 안되면 과감하게 빈칸으로 채워".)

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

The library needs `pptxgenjs` importable. Install once (or reuse the base
`pptx` skill's install):

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
> repackages into a canonical OPC archive (requires `python3`, always present
> via the base `pptx` skill).

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

Use the base **`pptx`** skill's QA loop. Render slides to images and inspect
critically (assume there are problems):

```bash
python <pptx-skill>/scripts/office/soffice.py --headless --convert-to pdf deck.pptx
pdftoppm -jpeg -r 150 deck.pdf slide      # → slide-01.jpg ...
```

If LibreOffice or Poppler is unavailable, render the PDF with PyMuPDF instead:

```bash
python - <<'PY'
import fitz
for i,p in enumerate(fitz.open("deck.pdf"), 1):
    p.get_pixmap(dpi=150).save(f"slide-{i:02d}.png")
PY
```

Content QA:

```bash
python -m markitdown deck.pptx | grep -iE "xxxx|lorem|ipsum|placeholder|\[ .* \]"
```

Check every slide for: leftover `[ ... ]` placeholders, text overflow past box
edges, low-contrast text, nav step highlighted on the wrong section, and the
correct `page` number. Complete at least one fix-and-verify cycle before finishing.

## Notes

- Do **not** add decorative accent lines under titles — this template uses solid
  bands and whitespace, not underlines.
- Keep the nav stepper's active step consistent with the slide's chapter.
- Body text is left-aligned; only band titles and section-bar text are centered.
