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
Full token list (colors, fonts, sizes, geometry) is in
[reference/design-tokens.md](reference/design-tokens.md).

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

const pptx = A.newDeck();                       // 4:3, Malgun Gothic

// A content slide with the navy band + nav on step 0 (과제 개요) + page 2
const s = A.slide(pptx, { title: "과제 배경", active: 0, band: "navy", page: 2 });

// Three columns, each with a green section-header bar + bullets
const cols = A.columns(3);
cols.forEach((c, i) => {
  const below = A.sectionHeader(s, { x: c.x, y: A.CONTENT_TOP, w: c.w, text: `헤더 ${i+1}`, color: "green" });
  A.bulletList(s, { x: c.x + 0.05, y: below + 0.15, w: c.w - 0.1, h: 1.7,
    items: ["핵심 메시지 1", { text: "강조 문장", bold: true, color: A.COLORS.navy }] });
  A.placeholder(s, { x: c.x, y: below + 1.95, w: c.w, h: 2.85, label: "[ 그림 / 차트 ]" });
});

await pptx.writeFile({ fileName: "deck.pptx" });
```

### Helper reference (`lib/architect_deck.js`)

| Helper | Purpose |
|--------|---------|
| `newDeck()` | New 4:3 presentation with default fonts |
| `slide(pptx, {title, active, band, page, total})` | Add slide + paint chrome |
| `sectionHeader(s, {x,y,w,text,color})` | Green/navy header bar; returns y below it |
| `infoTable(s, {x,y,w,h,labelW,rows})` | Navy-label + white-content table |
| `bulletList(s, {x,y,w,h,items})` | Navy diamond (◆) bullets; `level:1` → dash |
| `columns(n, {gap})` | Even column boxes `[{x,w}]` |
| `panel` / `placeholder(s, {x,y,w,h})` | Content box / diagram placeholder |
| `statCallout(s, {x,y,w,value,label})` | Big-number stat |
| `COLORS`, `FONT`, `SECTIONS`, `MARGIN`, `CONTENT_TOP`, `CONTENT_BOTTOM` | Tokens (mutable) |

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
