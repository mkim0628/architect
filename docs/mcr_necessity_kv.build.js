// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_necessity_kv.build.js
// 과제 필요성 1장 (2층 구성)
//   좌측 상단: 문제 정의 Ⅰ — 물리 병목 (용량 · 대역폭 + 트레이드오프)
//   좌측 하단: 문제 정의 Ⅱ — 운용 공백 3건 (우선순위 순)
//   우측 상단: 해법 공간 브리지 (병목 → 3 지렛대)
//   우측 하단: 과제 목표 3축 (공백과 행 1:1 대응)
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const C = A.COLORS, F = A.FONT;

const pptx = A.newDeck();
const s = A.slide(pptx, { title: "과제 필요성", active: 0, band: "navy", page: 2 });

// ── 기하 ──────────────────────────────────────────────────────────────
const LX = A.MARGIN, LW = 6.08;
const RX = 6.98, RW = 13.333 - A.MARGIN - RX;
const ARROW_X = LX + LW + 0.06, ARROW_W = RX - ARROW_X - 0.06;

const H1_Y = A.CONTENT_TOP;            // 1.18
const PHYS_Y = 1.60, PHYS_H = 1.42;    // 물리 병목 2박스
const STRIP_Y = PHYS_Y + PHYS_H + 0.05, STRIP_H = 0.30;  // 트레이드오프 스트립
const H2_Y = STRIP_Y + STRIP_H + 0.09; // 2층 헤더
const ROWS_TOP = H2_Y + 0.34 + 0.10;
const SYNTH_H = 0.58;
const ROWS_BOTTOM = A.CONTENT_BOTTOM - SYNTH_H - 0.10;
const GAP = 0.10;
const ROW_H = (ROWS_BOTTOM - ROWS_TOP - 2 * GAP) / 3;

const bullet = { characterCode: "25C6", indent: 8 };

// ── 헤더 (1층) ────────────────────────────────────────────────────────
A.sectionHeader(s, { x: LX, y: H1_Y, w: LW, text: "문제 정의 Ⅰ — 물리 병목: KV cache가 용량·대역폭을 동시에 압박", color: "navy", fontSize: 11.5 });
A.sectionHeader(s, { x: RX, y: H1_Y, w: RW, text: "과제 목표 — KV 캐시 최적 운용 AI 런타임 (MCR 1단계)", color: "green", fontSize: 11.5 });

// ── 좌측 1층: 물리 병목 2박스 ─────────────────────────────────────────
const BW = (LW - 0.14) / 2;
function physBox(x, title, lines) {
  A.panel(s, { x, y: PHYS_Y, w: BW, h: PHYS_H });
  s.addText(title, { x: x + 0.08, y: PHYS_Y + 0.04, w: BW - 0.16, h: 0.26, fontFace: F.head, fontSize: 10.3, bold: true, color: C.navy, valign: "middle" });
  const runs = lines.map(t => ({ text: t, options: { bullet, fontFace: F.body, fontSize: 8.2, color: C.ink, breakLine: true, paraSpaceAfter: 2 } }));
  s.addText(runs, { x: x + 0.10, y: PHYS_Y + 0.30, w: BW - 0.18, h: PHYS_H - 0.36, valign: "top" });
}
physBox(LX, "용량 — KV가 HBM을 넘는다",
  [
    "KV ∝ 컨텍스트 × 동시 세션 — 32k 1세션 ≈ 10.5 GB (토큰당 320 KB, Llama-2-70B)",
    "용량 = batch(동시성)의 상한 = 처리량의 상한",
    "초과 시 대기 또는 preemption·전체 재계산뿐 → 지연·처리량 악화 직결",
  ]);
physBox(LX + BW + 0.14, "대역폭 — 매 토큰 KV 전체를 읽는다",
  [
    "decode = memory-bandwidth-bound — 대기가 E2E의 70–85%(A), 컨텍스트↑ = TPOT↑",
    "대역폭 포화 시 용량 남아도 연산기 유휴 — 처리량 정체",
    "tier 계단 ~10×씩(HBM→DRAM→SSD) — 복원이 재계산보다 느릴 수도",
  ]);
// 트레이드오프 스트립
s.addShape("rect", { x: LX, y: STRIP_Y, w: LW, h: STRIP_H, fill: { color: "EDEFF4" }, line: { color: C.navy, width: 0.75 } });
s.addText([
  { text: "결합 구조: ", options: { bold: true, color: C.navy, fontFace: F.head, fontSize: 8.8 } },
  { text: "offload로 용량을 풀면 대역폭 계단에 부딪힌다(용량 ↔ 대역폭 트레이드오프) — 어디에 두고·얼마나 줄이고·언제 다시 만들지의 ", options: { color: C.ink, fontFace: F.body, fontSize: 8.8 } },
  { text: "운용 결정이 성능을 결정", options: { bold: true, color: C.navy, fontFace: F.body, fontSize: 8.8 } },
], { x: LX + 0.08, y: STRIP_Y, w: LW - 0.16, h: STRIP_H, valign: "middle" });

// ── 우측 1층: 해법 공간 브리지 ────────────────────────────────────────
const BR_H = STRIP_Y + STRIP_H - PHYS_Y;   // 물리 병목+스트립과 동일 높이
A.panel(s, { x: RX, y: PHYS_Y, w: RW, h: BR_H, fill: "F3F7F0" });
s.addText("해법 공간 — 병목을 푸는 지렛대는 셋뿐이다", { x: RX + 0.10, y: PHYS_Y + 0.05, w: RW - 0.2, h: 0.27, fontFace: F.head, fontSize: 10.5, bold: true, color: C.greenDark, valign: "middle" });
s.addText([
  { text: "KV 총량·이동량 = ", options: { fontFace: F.body, fontSize: 9.2, color: C.ink } },
  { text: "① 만드는 횟수 × ② 토큰당 바이트 × ③ 두는 위치·처리 순서", options: { bold: true, fontFace: F.body, fontSize: 9.2, color: C.navy, breakLine: true, paraSpaceAfter: 4 } },
  { text: "① 다시 만들지 않기 = 재사용   ② 줄이기 = 압축   ③ 잘 두고 잘 고르기 = KV 인지 스케줄링", options: { bullet, bold: true, fontFace: F.body, fontSize: 9.2, color: C.greenDark, breakLine: true, paraSpaceAfter: 4 } },
  { text: "그런데 현 런타임에는 세 지렛대가 모두 공백이다(좌측 Ⅱ) → 이를 채우는 것이 과제 목표 3축", options: { bullet, fontFace: F.body, fontSize: 9.2, color: C.ink, breakLine: true } },
], { x: RX + 0.12, y: PHYS_Y + 0.34, w: RW - 0.24, h: BR_H - 0.42, valign: "top" });
// 물리 병목 → 해법 공간 화살표
s.addShape("rightArrow", { x: ARROW_X, y: PHYS_Y + BR_H / 2 - 0.14, w: ARROW_W, h: 0.28, fill: { color: C.grayArrow }, line: { type: "none" } });

// ── 헤더 (2층) ────────────────────────────────────────────────────────
A.sectionHeader(s, { x: LX, y: H2_Y, w: LW, text: "문제 정의 Ⅱ — 운용 공백: 세 지렛대가 현 런타임에 없다 (우선순위 순)", color: "navy", fontSize: 11.5 });
A.sectionHeader(s, { x: RX, y: H2_Y, w: RW, text: "과제 목표 3축 — 좌측 공백 ①②③과 1:1 대응", color: "green", fontSize: 11.5 });

// ── 2층 행: 공백 ↔ 목표 ──────────────────────────────────────────────
function gapRow(y, num, lead, body, result) {
  A.panel(s, { x: LX, y, w: LW, h: ROW_H });
  s.addShape("ellipse", { x: LX + 0.08, y: y + 0.07, w: 0.26, h: 0.26, fill: { color: C.navy }, line: { type: "none" } });
  s.addText(String(num), { x: LX + 0.08, y: y + 0.07, w: 0.26, h: 0.26, align: "center", valign: "middle", fontFace: F.head, fontSize: 10.5, bold: true, color: C.white });
  s.addText([
    { text: lead, options: { bold: true, fontFace: F.head, fontSize: 9.8, color: C.navy, breakLine: true, paraSpaceAfter: 2 } },
    { text: body, options: { fontFace: F.body, fontSize: 8.6, color: C.ink, breakLine: true, paraSpaceAfter: 2 } },
    { text: "⇒ " + result, options: { bold: true, fontFace: F.body, fontSize: 8.8, color: "B3402A", breakLine: true } },
  ], { x: LX + 0.42, y: y + 0.04, w: LW - 0.54, h: ROW_H - 0.08, valign: "top" });
}
function goalRow(y, num, title, body, verdict) {
  A.panel(s, { x: RX, y, w: RW, h: ROW_H, fill: "F3F7F0" });
  s.addShape("roundRect", { x: RX + 0.08, y: y + 0.07, w: 0.64, h: 0.26, rectRadius: 0.05, fill: { color: C.green }, line: { type: "none" } });
  s.addText("목표 " + num, { x: RX + 0.08, y: y + 0.07, w: 0.64, h: 0.26, align: "center", valign: "middle", fontFace: F.head, fontSize: 9, bold: true, color: C.white });
  s.addText([
    { text: title, options: { bold: true, fontFace: F.head, fontSize: 9.8, color: C.greenDark, breakLine: true, paraSpaceAfter: 2 } },
    { text: body, options: { fontFace: F.body, fontSize: 8.6, color: C.ink, breakLine: true, paraSpaceAfter: 2 } },
    { text: "판정: ", options: { bold: true, fontFace: F.body, fontSize: 8.8, color: C.navy } },
    { text: verdict, options: { fontFace: F.body, fontSize: 8.8, color: C.navy, breakLine: true } },
  ], { x: RX + 0.82, y: y + 0.04, w: RW - 0.94, h: ROW_H - 0.08, valign: "top" });
}
function rowArrow(y) {
  s.addShape("rightArrow", { x: ARROW_X, y: y + ROW_H / 2 - 0.13, w: ARROW_W, h: 0.26, fill: { color: C.yellow }, line: { type: "none" } });
}

const y1 = ROWS_TOP;
gapRow(y1, 1, "재사용 공백 — prefix 일치·일회성 버퍼에 갇힘 (다시 만들지 않기의 부재)",
  "prefix 정확 일치 시만 hit(vLLM·SGLang), 요청 종료 시 폐기 — 비접두 재사용·세션/사용자 영속화·복원 vs 재계산 판단 없음",
  "수십 k 토큰을 매 요청 전체 re-prefill — TTFT 지배 (R-03·04·05)");
rowArrow(y1);
goalRow(y1, 1, "KV 재사용성 제고 → 지연시간(TTFT) 개선",
  "prefix + 비접두(chunk) 재사용 · 세션/사용자 영속화 · 복원 vs 재계산 비용 판단 (FR-02)",
  "TTFT ≥ 2× (QA1) — CacheBlend 2.2–3.3×(B) 앵커");

const y2 = y1 + ROW_H + GAP;
gapRow(y2, 2, "압축 공백 — 중요도 판정이 정적·전역 일률 (줄이기의 부재)",
  "중요도 기반 토큰 pruning(H2O·SnapKV)은 입증됐으나 고정 예산·고정 휴리스틱 — 요청별 품질 예산·차등 집행, 재사용과의 조율(쿼리 의존 중요도) 부재",
  "용량·대역폭 이중 병목 지속, 품질 리스크 통제 불가 (R-01·02·06)");
rowArrow(y2);
goalRow(y2, 2, "정확도 유지 KV 압축(pruning) → 메모리 병목 해소 → 지연·처리량 개선",
  "품질 bound(ΔF1 ≤ 1%p, QA3 gate) 안에서 중요도 기반 토큰 pruning을 요청별 차등 적용(양자화는 조합) — training-free(C-03) (FR-03·04)",
  "유효 KV 용량 ≥ 3× (QA4) · throughput ≥ 2× (QA2)");

const y3 = y2 + ROW_H + GAP;
gapRow(y3, 3, "스케줄링 공백 — 스케줄러가 KV를 모른다, KV-blind (잘 두고 고르기의 부재)",
  "admission·라우팅이 cache locality 비인지(재사용 이득 소실), KV 풀 포화 시 preemption·전체 재계산뿐 — 압축/강등/축출 선택 없음",
  "재사용·압축의 이득이 시스템 처리량으로 전환되지 않음 (R-16)");
rowArrow(y3);
goalRow(y3, 3, "KV 캐시 인지형 동적 스케줄링 → 처리량 개선",
  "cache-hit/locality 인지 admission·라우팅 + KV 공간 확보(압축/강등/축출 최적 선택) — 요청별 SLO 차등 (FR-05)",
  "throughput ≥ 2× (QA2) — 축별 ablation으로 순기여 분리");

// ── 하단 종합 바 ─────────────────────────────────────────────────────
const sy = A.CONTENT_BOTTOM - SYNTH_H;
s.addShape("rect", { x: LX, y: sy, w: 13.333 - 2 * A.MARGIN, h: SYNTH_H, fill: { color: C.cream }, line: { color: C.brown, width: 1 } });
s.addText([
  { text: "관통 문제: ", options: { bold: true, color: C.brown, fontFace: F.head, fontSize: 10 } },
  { text: "세 지렛대는 결합되어 있다(재사용은 남는 것을, 압축은 비용을, 스케줄링은 활용을 결정) — 그러나 셋을 조율하는 계층이 어느 런타임에도 없다.  ", options: { color: C.ink, fontFace: F.body, fontSize: 10 } },
  { text: "∴ 본 과제 = 조율 계층을 갖춘 KV 캐시 최적 운용 런타임", options: { bold: true, color: C.navy, fontFace: F.head, fontSize: 10 } },
  { text: "  (2단계 진화: 자사 memory-centric 디바이스 확장 — MCR 완성)", options: { color: C.muted, fontFace: F.body, fontSize: 9 } },
], { x: LX + 0.14, y: sy, w: 13.333 - 2 * A.MARGIN - 0.28, h: SYNTH_H, valign: "middle" });

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_necessity_kv.pptx")).then(() => console.log("written"));
