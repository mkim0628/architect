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

Standard page order and structure. Each type has a dedicated builder.
**Full per-page specs — exact geometry, colors, and the canonical content
tables (FR/QA/C/DP/Stakeholder/UC lists transcribed from the source deck) —
live in [reference/page-specs.md](reference/page-specs.md). Read it before
building any page.**

| # | Page | Chapter (`active`) | Structure | Builder(s) |
|---|------|-----|-----------|---------|
| 1 | **과제 배경** | 과제 개요 (0) | 3단; each column 2 items = short text + **matching image**. | `pageColumns` |
| 2 | **과제 필요성** | 과제 개요 (0) | 2단; same item format as 배경. | `pageColumns` |
| 3 | **과제 범위** | 과제 개요 (0) | 3단 text-only (목적 / In Scope / Out of Scope) — `images: false`. | `pageColumns` |
| 4 | **과제 개요** | 과제 개요 (0) | 2단; left info table (과제명·과제목표·참여인력·일정), right overall architecture — **BLANK unless user supplies it**. | `pageOverview` |
| 5 | **Architecture Design Process** | 요구사항 (1) | 4단 process pipeline; `chevronHeader` per column (green/navy alternating): Stakeholder/VOC table → refinement flow + mini QA table → DP thumbnails + ATAM flow → SEI 3-View minis. | `chevronHeader` `specTable` `panel` |
| 6 | **요구사항 정제** | 요구사항 (1) | Headline (수집 N건 → 정제 M건) + left 기능 요구사항/제약사항 `specTable`s (navy `sectionHeader`) + right use-case diagram panel; `linkButton` in band. | `sectionHeader` `specTable` `linkButton` |
| 7 | **Utility Tree 활용한 ASR 선정** | 요구사항 (1) | One full-width ASR table (번호/QA/Refinement/Scenario/중요도/난이도/우선순위/선정); Scenario cell = 문장 + `[측정: …]` line; selected rows cream-highlighted + "O". | `specTable` (+`highlightRows`) |
| 8 | **Architecture Driver 도출** | 요구사항 (1) | FR(navy) / QA(green) / C(brown) `tagBar` groups converging into yellow "Architectural Drivers" ellipse → big down-arrow → 산출물 인용구. | `tagBar` + shapes |
| 9 | **설계 Point 선정** | 설계 (2) | Left driver rail (`badge` F/Q/C + labels), center module diagram with badges & DP-color highlights, right **5 `dpCard`s** (DP-01~05, colors from `COLORS.dp`). | `badge` `dpCard` `linkButton` |
| 10 | **DP 상세 ① — 문제 정의·설계 쟁점** | 설계 (2) | **DP마다 2페이지 세트의 첫 장.** 좌(56%) "문제 정의" 헤더 + 불릿 + **내용에 맞는 그림(필수)**, 우 "설계 쟁점" 번호 리스트. | `pageDpProblem` |
| 11 | **DP 상세 ② — 후보구조 비교** | 설계 (2) | **세트의 둘째 장.** 3열 비교표 — 열 = 두 후보구조, 행 = **설계도(이미지)·특징·장점·단점·Trade-off**. | `pageDpCompare` |

P10–P11은 **DP마다 반복**된다 (DP-01 ①②, DP-02 ①②, …). 제목 관례:
`DP-0N. {DP 이름} — 문제 정의` / `DP-0N. {DP 이름} — 후보구조 비교`.
내용 출처는 architect-dp 스킬의 DP 문서(`docs/NN_design_points_*.md`):
문제 정의·설계 쟁점·구조(→특징)·장점·단점을 요약 발췌하고, Trade-off는 검토
노트의 실질 결정 변수(무엇을 얻고 무엇을 포기하는가)를 후보별 1–2줄로 압축한다.

Band color alternates navy/green page to page (no two adjacent pages the same).
`active` follows the **chapter**, not the page; footer keeps the global `N / 33`
numbering.

### Image sourcing rule (배경 / 필요성 / DP 상세)

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

**DP 상세 페이지의 그림 소싱**:

- **P10 문제 정의 그림**: 문제의 긴장(양방향 압력)이 보이는 그림을 내용에 맞게
  **생성**한다 (matplotlib 또는 SVG→PNG). 예: 두 압력이 마주보는 force 다이어그램,
  병목 지점을 강조한 미니 구조도. 웹 이미지보다 생성 다이어그램 우선 — DP 문제
  정의는 과제 고유 내용이라 웹에 맞는 그림이 없다.
- **P11 후보별 설계도**: `diagrams/dpN_candidates.svg`가 이미 있으면 **후보별
  패널을 크롭**해 쓴다 — python으로 사본의 `viewBox`를 해당 패널 영역(예: 좌
  `0 60 700 900`, 우 `700 60 700 900`)으로 좁힌 뒤 PNG로 변환:
  `soffice --headless --convert-to png cand1.svg` (또는 cairosvg). 설계도가
  없으면 후보 구조의 미니 다이어그램을 생성한다. pptxgenjs에는 **PNG로 변환해서**
  넣는다 (SVG 직접 삽입은 렌더러 호환성 문제).

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

// DP 상세 ① — 문제 정의 + 설계 쟁점 (DP마다 2페이지 세트의 첫 장)
A.pageDpProblem(pptx, {
  title: "DP-01. 실행 스택 소싱 — 문제 정의", page: 10, band: "navy",
  problem: {
    items: [
      { text: "핵심 긴장 한 줄 요약", bold: true },
      "압력 ① — 외부 스택의 구조적 한계 …",
      "압력 ② — 생태계 재구현·추종 비용 …",
    ],
    image: "/tmp/dp1_problem.png",   // 내용에 맞는 그림 — 생성 규칙 참조 (필수)
  },
  issues: [
    "차별 가치가 확장점 안에서 표현 가능한가 — 잔여분은 무엇인가",
    "확장점 밖 수정 지점이 핵심인가 주변부인가",
    "감당 가능한 유지보수 모델은 무엇인가",
    { text: "(DP2 커플링) 채택안이 DP2의 실현 가능 집합을 제약", color: A.COLORS.navy },
  ],
});

// DP 상세 ② — 후보구조 비교표 (세트의 둘째 장)
A.pageDpCompare(pptx, {
  title: "DP-01. 실행 스택 소싱 — 후보구조 비교", page: 11, band: "green",
  candidates: [
    {
      name: "후보 1 — 외부 스택 활용형",
      diagram: "/tmp/dp1_cand1.png",              // dpN_candidates.svg 패널 크롭 PNG
      features: ["Inference Engine = vLLM, KV 골격은 변형 A/B로 소싱"],
      pros: ["생태계 무임승차 · 검증된 코어", "초기 ≤6인월 — 리드타임 최단"],
      cons: ["scheduler tier 비인지 — co-scheduling 미회수", "upstream API 변경 리스크"],
      tradeoff: [{ text: "비용·리드타임을 얻고 성능 상한·주도권을 포기", bold: true }],
    },
    {
      name: "후보 2 — 자체 구현형",
      diagram: "/tmp/dp1_cand2.png",
      features: ["전 층 자체 구현 — tier topology 1급 인지 클린 설계"],
      pros: ["co-design 자유 — 이론 상한 최고", "자사 HW 로드맵 무제약 수용"],
      cons: ["재구현 수십 인월+ · baseline 도달 리스크", "신규 모델 영구 추종 부담"],
      tradeoff: [{ text: "성능 상한·주도권을 얻고 비용·도달 확률을 포기", bold: true }],
    },
  ],
});

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
| `chevronHeader(s, {x,y,w,text,color})` | Arrow/pentagon process banner (P5 컬럼 헤더) |
| `tagBar(s, {x,y,w,id,tag,text,color})` | Rounded FR/QA/C tag bar — navy/green/brown (P8) |
| `badge(s, {x,y,text,color})` | Small circle badge F1/Q3/C2 for diagrams (P9) |
| `dpCard(s, {x,y,w,id,title,items})` | Design-Point card: colored ID + dark title + bullets (P9) |
| `specTable(s, {x,y,w,colW,header,rows,highlightRows})` | Dark-green-header spec table; cream row highlight (P5–P7) |
| `pageDpProblem(pptx, {title,page,band,problem,issues})` | **DP 상세 ①**: 좌 문제 정의(불릿+그림) / 우 설계 쟁점 번호 리스트 (P10) |
| `pageDpCompare(pptx, {title,page,band,candidates,rowH})` | **DP 상세 ②**: 구분\|후보1\|후보2 비교표 — 설계도·특징·장점·단점·Trade-off (P11) |
| `linkButton(s, {label,…})` | "…: ▶" jump label, in-band (white) or below-band (ink) |
| `COLORS` (incl. `cream`,`brown`,`gray70`,`dp{}`), `FONT`, `SECTIONS`, `MARGIN`, `CONTENT_TOP`, `CONTENT_BOTTOM` | Tokens (mutable) |

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
