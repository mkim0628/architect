# Architect 과제 Deck — Design Tokens

Design system extracted from screenshots of the source deck
(*Architect 양성과정 개인과제*). These are the exact values used by
`lib/architect_deck.js`. Tune them here if the source style shifts.

## Canvas

| Property | Value |
|----------|-------|
| Aspect ratio | **16:9** |
| Size | 13.333″ × 7.5″ |
| Background | white `#FFFFFF` |

> For a 4:3 variant, set `PAGE = { w: 10, h: 7.5 }` in the library.
> All helpers are inch-based and reflow off `PAGE.w`.

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| `navy` | `#1F3864` | Content title band, table label cells, navy section bars, emphasis text, bullets |
| `navyLight` | `#2E4C7E` | Secondary navy accents |
| `green` | `#4E7C3A` | Lead-slide title band, green section-header bars |
| `greenDark` | `#3C5F2C` | Green accents / edges |
| `yellow` | `#FFC000` | Active nav-stepper step |
| `grayBox` | `#E9E9E9` | Inactive nav-stepper steps |
| `grayBorder` | `#A6A6A6` | Box / table borders |
| `grayArrow` | `#9AA0A6` | Nav chevrons between steps |
| `panelFill` | `#F5F6F8` | Diagram / image placeholder fill |
| `ink` | `#262626` | Body text |
| `muted` | `#7F7F7F` | Footer page number |

**Dominance:** navy is the primary (title bands + tables), green the supporting
accent (section headers + lead slides), yellow the single sharp accent (active step).

## Typography

Font family: **Malgun Gothic (맑은 고딕)** for both headings and body
(the standard Korean corporate face; falls back to system sans if unavailable).

| Element | Size | Weight |
|---------|------|--------|
| Slide title (in band) | 30pt | bold, white |
| Nav-stepper label | 9pt | bold if active |
| Section-header bar | 13pt | bold, white |
| Table label cell | 11pt | bold, white |
| Body / list | 11–12pt | regular |
| Footer page number | 10pt | regular, muted |

## Layout geometry (inches)

| Element | Value |
|---------|-------|
| Title band height | 1.0 |
| Content margin (l/r) | 0.35 |
| Content top | 1.18 (band + 0.18) |
| Content bottom | 7.05 (page − 0.45) |
| Nav box | 0.86 w × 0.30 h |
| Nav chevron | 0.17 w |
| Section-header bar height | 0.34 |
| Column gap | 0.22 |

## Recurring chrome

Every content slide carries three fixed elements ("the master"):

1. **Title band** — full-width rectangle at the top; title text left-aligned,
   white bold. Navy by default; **green** for lead / section-opener slides.
2. **Nav stepper** — top-right, 5 boxes `과제 개요 → 요구사항 → 설계 → 검증 → 결론`
   joined by gray chevrons; the current section is filled yellow.
3. **Footer** — `N / M` page number, bottom-right, muted gray.

## Bullets

- Level 0: navy diamond `◆` (`characterCode 25C6`)
- Level 1: en-dash `–` (`characterCode 2013`)
- Never use Unicode bullet glyphs typed into the text itself; use the bullet property.

## Per-page rules (see `examples/build_deck.js`)

These are the standard slide types and their fixed structure. Each is a
builder in `lib/architect_deck.js`.

| Page | Columns | Per column | Right/other | Builder |
|------|---------|-----------|-------------|---------|
| **과제 개요** | 2 | left = info table (과제명 · 과제목표 · 참여인력 · 일정 …) | right = **overall architecture** image; BLANK unless the user explicitly provides it | `pageOverview` |
| **과제 배경** | 3 | 2 content items, each with a matching image (chart/그림/구조도/설계도) | — | `pageColumns` |
| **과제 필요성** | 2 | 2 content items, each with a matching image (same format as 배경) | — | `pageColumns` |
| **과제 범위** | 3 | 2 content items each | — | `pageColumns` |

**Image sourcing rule:** for each content item that needs a visual, find a
matching image from the web and embed it (`item.image = localPath`). If the web
is unavailable or no fitting image is found, leave that image area **BLANK**
(empty bordered box) — do not fabricate a caption. The overall-architecture box
on 과제 개요 stays blank until the user explicitly supplies it.
