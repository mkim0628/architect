/**
 * Example: build a starter "Architect 과제" deck / master template.
 * Run:  node examples/build_deck.js  (writes assets/architect_template.pptx)
 *
 * Each slide below is a reusable LAYOUT PATTERN. Copy a block, swap the
 * placeholder content, and adjust `active` (nav step) + `page` per slide.
 */
const path = require("path");
const A = require("./../lib/architect_deck");

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "..", "assets", "architect_template.pptx");

// ── Layout 1 · Info table + diagram (e.g. 과제 개요) ─────────────────────────
{
  const s = A.slide(pptx, { title: "과제 개요", active: 0, band: "green", page: 1 });
  A.infoTable(s, {
    x: A.MARGIN, y: A.CONTENT_TOP, w: 4.55, h: A.CONTENT_BOTTOM - A.CONTENT_TOP, labelW: 1.4,
    rows: [
      { label: "과제 명",  lines: [{ text: "과제 제목 (한글)", bullet: false, bold: true }, { text: "(English subtitle)", bullet: false, fontSize: 9, color: "595959" }] },
      { label: "과제 개요", lines: ["개요 문장 1", "개요 문장 2"] },
      { label: "참여 인력", lines: [{ text: "국내: N명", color: A.COLORS.navy, bold: true }, { text: "해외: N명", color: A.COLORS.navy, bold: true }] },
      { label: "개발 기간", lines: ["YY년 M월 ~ YY년 M월 (총 N개월)"] },
      { label: "개발 환경", lines: ["항목 1", "항목 2", "항목 3"] },
      { label: "타겟 시스템 / 장치", lines: [{ text: "#1. ...", color: A.COLORS.navy, bold: true }, { text: "#2. ...", color: A.COLORS.navy, bold: true }] },
      { label: "주요 성과", lines: ["성과 1", "성과 2"] },
    ],
  });
  const dx = 5.15, dw = A.PAGE.w - A.MARGIN - dx;
  A.placeholder(s, { x: dx, y: A.CONTENT_TOP, w: dw, h: A.CONTENT_BOTTOM - A.CONTENT_TOP, label: "[ 시스템 아키텍처 다이어그램 ]" });
}

// ── Layout 2 · Three columns with section headers (e.g. 과제 배경) ───────────
{
  const s = A.slide(pptx, { title: "과제 배경", active: 0, band: "navy", page: 2 });
  const cols = A.columns(3);
  const headers = ["섹션 헤더 1", "섹션 헤더 2", "섹션 헤더 3"];
  cols.forEach((c, i) => {
    const below = A.sectionHeader(s, { x: c.x, y: A.CONTENT_TOP, w: c.w, text: headers[i], color: "green" });
    A.bulletList(s, { x: c.x + 0.05, y: below + 0.15, w: c.w - 0.1, h: 1.7, fontSize: 11,
      items: [{ text: "핵심 메시지 문장을 여기에 작성", bold: false }, { text: "두 번째 핵심 메시지", bold: false }] });
    A.placeholder(s, { x: c.x, y: below + 1.95, w: c.w, h: 2.85, label: "[ 그림 / 차트 ]" });
  });
}

// ── Layout 3 · Comparison panels + stat callouts (e.g. 과제 범위) ────────────
{
  const s = A.slide(pptx, { title: "과제 범위", active: 0, band: "navy", page: 3 });
  const g = A.columns(3);
  A.sectionHeader(s, { x: g[0].x, y: A.CONTENT_TOP, w: g[0].w, text: "Target System #1", color: "green" });
  A.placeholder(s, { x: g[0].x, y: A.CONTENT_TOP + 0.45, w: g[0].w, h: 4.35 });
  A.sectionHeader(s, { x: g[1].x, y: A.CONTENT_TOP, w: g[1].w, text: "Target System #2", color: "navy" });
  A.placeholder(s, { x: g[1].x, y: A.CONTENT_TOP + 0.45, w: g[1].w, h: 4.35 });
  A.sectionHeader(s, { x: g[2].x, y: A.CONTENT_TOP, w: g[2].w, text: "Target HW", color: "green" });
  A.statCallout(s, { x: g[2].x, y: A.CONTENT_TOP + 0.9, w: g[2].w, value: "3", label: "타겟 하드웨어" });
  A.statCallout(s, { x: g[2].x, y: A.CONTENT_TOP + 2.6, w: g[2].w, value: "10", label: "개월 개발 기간", color: A.COLORS.green });
}

pptx.writeFile({ fileName: OUT }).then((f) => console.log("wrote", f));
