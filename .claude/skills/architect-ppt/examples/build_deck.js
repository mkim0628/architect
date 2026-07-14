/**
 * Example: build a starter "Architect 과제" deck / master template (16:9).
 * Run:  node examples/build_deck.js  (writes assets/architect_template.pptx)
 *
 * Demonstrates the four standard page types and their per-page rules.
 * Images are left BLANK here; at real generation time the agent finds a
 * matching image from the web per item and passes its local path as `image`.
 */
const path = require("path");
const A = require("./../lib/architect_deck");

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "..", "assets", "architect_template.pptx");

// ── 과제 개요 · 2단 (좌: 표 / 우: overall architecture) ──────────────────────
A.pageOverview(pptx, {
  title: "과제 개요", page: 1, band: "green",
  table: [
    { label: "과제 명",  lines: [{ text: "과제 제목 (한글)", bullet: false, bold: true }, { text: "(English subtitle)", bullet: false, fontSize: 9, color: "595959" }] },
    { label: "과제 목표", lines: ["목표 문장 1", "목표 문장 2"] },
    { label: "참여 인력", lines: [{ text: "국내: N명", color: A.COLORS.navy, bold: true }, { text: "해외: N명", color: A.COLORS.navy, bold: true }] },
    { label: "일정",      lines: ["YY년 M월 ~ YY년 M월 (총 N개월)"] },
  ],
  // architecture: "/tmp/overall_arch.png"   // ← 지시가 있을 때만 채움. 없으면 공란.
});

// ── 과제 배경 · 3단, 각 단 2개 콘텐츠 + 매칭 이미지 ──────────────────────────
A.pageColumns(pptx, {
  title: "과제 배경", page: 2, band: "navy",
  cols: [
    { header: "배경 헤더 1", items: [
      { text: "첫 번째 핵심 메시지" /*, image: "/tmp/bg1a.png" */ },
      { text: "두 번째 핵심 메시지" /*, image: "/tmp/bg1b.png" */ },
    ]},
    { header: "배경 헤더 2", items: [
      { text: "첫 번째 핵심 메시지" }, { text: "두 번째 핵심 메시지" },
    ]},
    { header: "배경 헤더 3", items: [
      { text: "첫 번째 핵심 메시지" }, { text: "두 번째 핵심 메시지" },
    ]},
  ],
});

// ── 과제 필요성 · 2단, 나머지는 배경과 동일 ─────────────────────────────────
A.pageColumns(pptx, {
  title: "과제 필요성", page: 3, band: "navy",
  cols: [
    { header: "필요성 헤더 1", items: [{ text: "핵심 메시지 1" }, { text: "핵심 메시지 2" }] },
    { header: "필요성 헤더 2", items: [{ text: "핵심 메시지 1" }, { text: "핵심 메시지 2" }] },
  ],
});

// ── 과제 범위 · 3단 ─────────────────────────────────────────────────────────
A.pageColumns(pptx, {
  title: "과제 범위", page: 4, band: "navy",
  cols: [
    { header: "Target System #1", headerColor: "green", items: [{ text: "범위 항목 1" }, { text: "범위 항목 2" }] },
    { header: "Target System #2", headerColor: "navy",  items: [{ text: "범위 항목 1" }, { text: "범위 항목 2" }] },
    { header: "Target HW",        headerColor: "green", items: [{ text: "범위 항목 1" }, { text: "범위 항목 2" }] },
  ],
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
