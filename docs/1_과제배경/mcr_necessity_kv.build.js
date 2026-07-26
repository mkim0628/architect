// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/1_과제배경/mcr_necessity_kv.build.js
// 과제 필요성 1장 (검수 반영 v3: 1층 단독 구성)
//   좌측: 문제 정의 — 물리 병목 (용량 · 대역폭 + 결합 구조)
//   우측: 상위 과제 목표 — 자원 관점 총괄 + 3축 (브리지 공식 ①②③이 생성기)
//   ※ 운용 공백(세 지렛대의 부재)과 그 해소는 설계 챕터(DP1–DP5)에서 다룬다 — 본 페이지는 1층만.
const path = require("path");
const A = require(path.join(__dirname, "..", "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const C = A.COLORS, F = A.FONT;

const pptx = A.newDeck();
const s = A.slide(pptx, { title: "과제 필요성", active: 0, band: "navy", page: 2 });

// ── 기하 ──────────────────────────────────────────────────────────────
const LX = A.MARGIN, LW = 6.08;
const RX = 6.98, RW = 13.333 - A.MARGIN - RX;
const ARROW_X = LX + LW + 0.06, ARROW_W = RX - ARROW_X - 0.06;

const H_Y = A.CONTENT_TOP;                       // 헤더
const TOP = H_Y + 0.34 + 0.12;                   // 본문 시작
const BOTTOM = A.CONTENT_BOTTOM;                 // 본문 끝
const bullet = { characterCode: "25C6", indent: 8 };

// ── 헤더 ─────────────────────────────────────────────────────────────
A.sectionHeader(s, { x: LX, y: H_Y, w: LW, text: "문제 정의 — 물리 병목: KV cache가 용량·대역폭을 동시에 압박", color: "navy", fontSize: 11.5 });
A.sectionHeader(s, { x: RX, y: H_Y, w: RW, text: "과제 목표 — 자원 효율로 AI 추론 성능 향상 (MCR 1단계)", color: "green", fontSize: 11.5 });

// ── 좌측: 물리 병목 2박스 + 결합 구조 ────────────────────────────────
const STRIP_H = 0.62;
const PHYS_H = BOTTOM - TOP - STRIP_H - 0.12;
const BW = (LW - 0.14) / 2;
function physBox(x, title, lines, image) {
  A.panel(s, { x, y: TOP, w: BW, h: PHYS_H });
  s.addText(title, { x: x + 0.08, y: TOP + 0.06, w: BW - 0.16, h: 0.30, fontFace: F.head, fontSize: 11.5, bold: true, color: C.navy, valign: "middle" });
  const IMG_H = 1.42, IMG_W = BW - 0.24;
  const runs = lines.map(t => (typeof t === "string"
    ? { text: t, options: { bullet, fontFace: F.body, fontSize: 9.2, color: C.ink, breakLine: true, paraSpaceAfter: 5 } }
    : { text: t.text, options: { bullet, fontFace: F.body, fontSize: 9.2, color: t.color || C.ink, bold: !!t.bold, breakLine: true, paraSpaceAfter: 5 } }));
  s.addText(runs, { x: x + 0.10, y: TOP + 0.42, w: BW - 0.20, h: PHYS_H - 0.56 - IMG_H, valign: "top" });
  if (image) s.addImage({ path: image, x: x + 0.12, y: TOP + PHYS_H - IMG_H - 0.10, w: IMG_W, h: IMG_H, sizing: { type: "contain", w: IMG_W, h: IMG_H } });
}
physBox(LX, "용량 — KV가 HBM을 넘는다",
  [
    "KV ∝ 컨텍스트 길이 × 동시 세션 수 — 32k 토큰 1세션 ≈ 10.5 GB (토큰당 320 KB, Llama-2-70B)",
    "모델이 아니라 KV가 메모리를 지배 — 컨텍스트·세션이 늘수록 선형 증가",
    { text: "용량 = batch(동시성)의 상한 = 처리량의 상한", bold: true, color: C.navy },
    "초과 시 대기 또는 preemption·전체 재계산뿐 → 지연·처리량 악화 직결",
  ], path.join(__dirname, "..", "mcr_assets", "bg_kv_evidence.png"));
physBox(LX + BW + 0.14, "대역폭 — 매 토큰 KV 전체를 읽는다",
  [
    "decode = memory-bandwidth-bound — decode 대기가 E2E의 70–85%(A), 컨텍스트↑ = 토큰당 지연(TPOT)↑",
    { text: "대역폭 포화 시 용량이 남아도 연산기는 유휴 — 처리량 정체", bold: true, color: C.navy },
    "메모리 계층 대역폭 계단 ~10×씩 (HBM→DRAM→SSD) — 하위 tier 복원이 재계산보다 느린 역전 구간 존재",
  ], path.join(__dirname, "..", "mcr_assets", "nec_tier_ladder.png"));
// 결합 구조 스트립
const SY = TOP + PHYS_H + 0.12;
s.addShape("rect", { x: LX, y: SY, w: LW, h: STRIP_H, fill: { color: "EDEFF4" }, line: { color: C.navy, width: 0.75 } });
s.addText([
  { text: "결합 구조: ", options: { bold: true, color: C.navy, fontFace: F.head, fontSize: 9.6 } },
  { text: "offload로 용량을 풀면 대역폭 계단에 부딪힌다(용량 ↔ 대역폭 트레이드오프) — 두 병목은 따로 풀 수 없고, HW 증설이 아닌 ", options: { color: C.ink, fontFace: F.body, fontSize: 9.6 } },
  { text: "자원 사용 방식의 개선", options: { bold: true, color: C.navy, fontFace: F.body, fontSize: 9.6 } },
  { text: "이 요구된다", options: { color: C.ink, fontFace: F.body, fontSize: 9.6 } },
], { x: LX + 0.10, y: SY, w: LW - 0.20, h: STRIP_H, valign: "middle" });

// ── 가운데 화살표 ────────────────────────────────────────────────────
s.addShape("rightArrow", { x: ARROW_X, y: TOP + (BOTTOM - TOP) / 2 - 0.16, w: ARROW_W, h: 0.32, fill: { color: C.grayArrow }, line: { type: "none" } });

// ── 우측: 상위 과제 목표 (총괄 + 자원 3축) ───────────────────────────
// 총괄 callout
const OV_H = 0.72;
s.addShape("rect", { x: RX, y: TOP, w: RW, h: OV_H, fill: { color: "F3F7F0" }, line: { color: C.green, width: 1.2 } });
s.addText([
  { text: "총괄: ", options: { bold: true, fontFace: F.head, fontSize: 10.6, color: C.greenDark } },
  { text: "연산기의 불필요한 연산은 줄이고 메모리의 사용성은 높여, 동일 HW에서 AI 추론 성능(지연·처리량)을 향상시킨다", options: { bold: true, fontFace: F.body, fontSize: 10.6, color: C.greenDark } },
], { x: RX + 0.12, y: TOP, w: RW - 0.24, h: OV_H, valign: "middle" });

// 브리지 공식
const BR_Y = TOP + OV_H + 0.10, BR_H = 0.46;
s.addShape("rect", { x: RX, y: BR_Y, w: RW, h: BR_H, fill: { color: C.cream }, line: { color: C.brown, width: 0.75 } });
s.addText([
  { text: "KV 총량·이동량 = ① 만드는 횟수 × ② 토큰당 바이트 × ③ 두는 위치·처리 순서", options: { bold: true, fontFace: F.body, fontSize: 9.4, color: C.navy } },
  { text: "  — 공식의 세 인자가 곧 목표 3축", options: { fontFace: F.body, fontSize: 9.2, color: C.brown } },
], { x: RX + 0.12, y: BR_Y, w: RW - 0.24, h: BR_H, valign: "middle" });

// 목표 3축 rows
const ROWS_TOP = BR_Y + BR_H + 0.12;
const GAP = 0.12;
const ROW_H = (BOTTOM - ROWS_TOP - 2 * GAP) / 3;
function goalRow(y, num, axis, lever, title, body, verdict) {
  A.panel(s, { x: RX, y, w: RW, h: ROW_H, fill: "F3F7F0" });
  s.addShape("roundRect", { x: RX + 0.10, y: y + 0.09, w: 0.66, h: 0.28, rectRadius: 0.05, fill: { color: C.green }, line: { type: "none" } });
  s.addText("목표 " + num, { x: RX + 0.10, y: y + 0.09, w: 0.66, h: 0.28, align: "center", valign: "middle", fontFace: F.head, fontSize: 9.5, bold: true, color: C.white });
  s.addText([
    { text: "[" + axis + "]  " + title + "  ", options: { bold: true, fontFace: F.head, fontSize: 10.4, color: C.greenDark } },
    { text: "(브리지 " + lever + ")", options: { fontFace: F.body, fontSize: 8.8, color: C.brown, breakLine: true, paraSpaceAfter: 3 } },
    { text: body, options: { fontFace: F.body, fontSize: 9.2, color: C.ink, breakLine: true, paraSpaceAfter: 3 } },
    { text: "판정: ", options: { bold: true, fontFace: F.body, fontSize: 9.2, color: C.navy } },
    { text: verdict, options: { fontFace: F.body, fontSize: 9.2, color: C.navy, breakLine: true } },
  ], { x: RX + 0.88, y: y + 0.06, w: RW - 1.02, h: ROW_H - 0.12, valign: "top" });
}
let gy = ROWS_TOP;
goalRow(gy, 1, "연산 효율", "① 축소", "이미 계산한 결과를 재활용해 불필요한 재연산을 제거한다",
  "같은 컨텍스트를 매 요청 다시 만드는 연산을 없애 응답 시작 지연을 줄인다",
  "TTFT 단축 배율 ≥ 2× (QA3)");
gy += ROW_H + GAP;
goalRow(gy, 2, "메모리 효율", "② 축소", "정확도를 유지한 채 메모리의 실효 용량·토큰당 읽기량을 개선한다",
  "같은 HBM으로 더 많은 컨텍스트를 수용하고(동시성) 매 토큰 읽기량을 줄인다(대역폭) — 품질 bound가 전제(QA2 gate)",
  "유효 KV 용량 ≥ 3× (QA4) · throughput ≥ 2× (QA1)");
gy += ROW_H + GAP;
goalRow(gy, 3, "자원 인지 운용", "③ 최적화", "캐시·메모리·부하 상태를 인지해 요청과 데이터를 동적으로 배치·선별한다",
  "유휴 자원 없이, 개별 효율 개선(목표 1·2)을 시스템 전체 처리량으로 전환한다",
  "throughput ≥ 2× (QA1) — 축별 ablation으로 순기여 분리");

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_necessity_kv.pptx")).then(() => console.log("written"));
