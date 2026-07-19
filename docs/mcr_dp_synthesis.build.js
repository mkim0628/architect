// Regenerate: NODE_PATH="$(npm root -g)" node docs/mcr_dp_synthesis.build.js
// 설계 챕터 종합 슬라이드 — QA1 성능 목표의 축별 분해:
//   QA1 ★★★(두 축 각 2×)은 단일 DP로 불가 — TTFT축 승자 × throughput축 승자 조합.
//   내용 출처: docs/02~05_design_points_*.md QA1 재평가(00 v0.9 2지표 bin).
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_dp_synthesis.pptx");
const navy = A.COLORS.navy, green = A.COLORS.green, gray = "595959";
const STAR = "1B7A4B"; // 2× 승자 강조색

const s = A.slide(pptx, { title: "QA1 성능 목표의 축별 분해", active: 2, band: "navy", page: 10 });

// 헤드라인
s.addText([
  { text: "○ QA1 ★★★ = 두 축 각 2× 동시 달성 — ", options: { fontSize: 15, color: A.COLORS.ink } },
  { text: "단일 DP로는 불가, TTFT축 승자 × throughput축 승자 조합이 필요", options: { fontSize: 15, bold: true, color: navy } },
], { x: A.MARGIN, y: A.CONTENT_TOP - 0.02, w: A.PAGE.w - 2 * A.MARGIN, h: 0.38, margin: 0, valign: "middle", fontFace: A.FONT.head });
s.addText("- 각 DP는 대개 한 축에 작용 · 별점은 담당 축의 배율(설계 단계 예측 F) · 상보 축은 sibling DP가 완성", {
  x: A.MARGIN + 0.35, y: A.CONTENT_TOP + 0.36, w: A.PAGE.w - 2 * A.MARGIN - 0.35, h: 0.26, margin: 0,
  fontFace: A.FONT.body, fontSize: 11, color: gray, valign: "middle", align: "left",
});

// 우측 QA1 타깃 (두 lane이 수렴)
const tX = 10.2, tW = A.PAGE.w - A.MARGIN - tX, tY = 2.35, tH = 3.15;
s.addShape("roundRect", { x: tX, y: tY, w: tW, h: tH, rectRadius: 0.08, fill: { color: A.COLORS.yellow }, line: { color: navy, width: 1.5 } });
s.addText([
  { text: "QA1\n", options: { fontSize: 15, bold: true, color: navy } },
  { text: "★★★\n\n", options: { fontSize: 26, bold: true, color: navy } },
  { text: "TTFT ≥ 2×\nAND\nthroughput ≥ 2×\n\n", options: { fontSize: 13, bold: true, color: navy } },
  { text: "두 축 동시 —\n단일 DP 불가", options: { fontSize: 10.5, color: "5B4A00" } },
], { x: tX, y: tY + 0.12, w: tW, h: tH - 0.24, margin: 0, align: "center", valign: "middle", fontFace: A.FONT.head, lineSpacingMultiple: 0.95 });

// 축 lane 빌더: 좌 라벨 박스 + 우 DP 표
const laneX = A.MARGIN, labelW = 2.35, tblX = laneX + labelW + 0.15, tblW = 9.9 - tblX;
function lane(y, h, accent, axisLines, rows) {
  // 좌 라벨 박스 (accent 좌측 바 + 축 이름)
  s.addShape("rect", { x: laneX, y, w: labelW, h, fill: { color: A.COLORS.panelFill }, line: { color: A.COLORS.grayBorder, width: 1 } });
  s.addShape("rect", { x: laneX, y, w: 0.08, h, fill: { color: accent }, line: { type: "none" } });
  s.addText(axisLines, { x: laneX + 0.16, y, w: labelW - 0.22, h, margin: 0, align: "left", valign: "middle", fontFace: A.FONT.head });
  // 우 DP 표
  A.specTable(s, {
    x: tblX, y, w: tblW, colW: [0.62, 3.05, tblW - 0.62 - 3.05], fontSize: 9.5, headerFontSize: 9.5,
    header: ["DP", "축별 2× 승자 후보 (★★★ 상한)", "근거 (F · A/B/C)"],
    rows,
  });
  // lane → 타깃 수렴 화살표
  s.addShape("rightArrow", { x: 9.55, y: y + h / 2 - 0.16, w: tX - 9.55 + 0.02, h: 0.32, fill: { color: accent }, line: { type: "none" } });
}

const dp = (id, cand, evid) => [
  { text: id, align: "center", bold: true, color: navy, fontSize: 9.5 },
  { text: cand, fontSize: 9.5 },
  { text: [...evid.map((p) => Array.isArray(p) ? { text: p[0], options: { bold: true, color: STAR, fontSize: 9 } } : { text: p, options: { fontSize: 9 } })] },
];

// Lane A — TTFT 축 (prefill: 재사용·retrieval)
lane(1.95, 1.72, green, [
  { text: "TTFT 축", options: { fontSize: 14, bold: true, color: green } },
  { text: "  (prefill)\n", options: { fontSize: 11, color: gray } },
  { text: "재사용 · retrieval\n", options: { fontSize: 10.5, bold: true, color: A.COLORS.ink } },
  { text: "첫 토큰까지 단축", options: { fontSize: 9.5, color: gray } },
], [
  dp("DP3", "후보2 — 비연속 chunk 재사용", [["TTFT 2.2–3.3×"], " (CacheBlend, B)"]),
  dp("DP7", "후보2 — 인덱스 유도 검색", ["검색 ", ["QPS ≤10.7×"], " (SmartANNS, B)"]),
  dp("DP8", "후보2 — 검색 가능 KV tier", ["hit ≡ KV hit → ", ["prefill 재계산 소멸"]]),
]);

// Lane B — throughput 축 (decode: tier·압축·flip)
lane(3.82, 2.08, navy, [
  { text: "throughput 축", options: { fontSize: 14, bold: true, color: navy } },
  { text: "  (decode)\n", options: { fontSize: 11, color: gray } },
  { text: "tier · 압축 · flip\n", options: { fontSize: 10.5, bold: true, color: A.COLORS.ink } },
  { text: "생성 처리량 확대", options: { fontSize: 9.5, color: gray } },
], [
  dp("DP2", "후보2 — Memory Engine 자율", ["μs tail 방어 + ", ["KIVI 2.35–3.47×"], " (B)"]),
  dp("DP4", "후보2 — capability-aware", ["압축 PIM 오프로드 → ", ["decode 사이클 보존"]]),
  dp("DP5", "후보2 — 공유 tier 스테이징", [["drain-free flip"], " — 부하 추종 재배치"]),
  dp("DP6", "후보2 — attention 오프로드", ["decode 직격 ", ["2.81×"], " (AttAcc, B)"]),
]);

// 하단 DP1 substrate 스트립
const bY = 6.05, bH = 0.82;
s.addShape("rect", { x: A.MARGIN, y: bY, w: A.PAGE.w - 2 * A.MARGIN, h: bH, fill: { color: "F2ECD9" }, line: { color: A.COLORS.brown, width: 1 } });
s.addText([
  { text: "DP1 (실행 스택 소싱) = 두 축 공통 substrate   ", options: { fontSize: 11, bold: true, color: A.COLORS.brown } },
  { text: "후보2 자체 구현형", options: { fontSize: 10.5, bold: true, color: navy } },
  { text: ": co-design으로 두 축 동시 2× 개방 (★★★ 상한 / 도달 리스크 ★☆ — vLLM 배칭 재현) · ", options: { fontSize: 10.5, color: A.COLORS.ink } },
  { text: "후보1 외부 스택 활용형", options: { fontSize: 10.5, bold: true, color: navy } },
  { text: ": 확장점 제약으로 두 축 모두 1.5–2× 상한 (★★☆) — throughput은 co-scheduling 미회수, TTFT는 비연속 재사용 제약", options: { fontSize: 10.5, color: A.COLORS.ink } },
], { x: A.MARGIN + 0.15, y: bY, w: A.PAGE.w - 2 * A.MARGIN - 0.3, h: bH, margin: 0, valign: "middle", align: "left", fontFace: A.FONT.body });

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
