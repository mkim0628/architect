// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_necessity_kv.build.js
// 과제 필요성 1장 — 좌: KV 캐시 문제 정의(우선순위 3건) / 우: 과제 목표 3축
const A = require(require("path").join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const C = A.COLORS, F = A.FONT;

const pptx = A.newDeck();
const s = A.slide(pptx, { title: "과제 필요성", active: 0, band: "navy", page: 2 });

// ── 기하 ──────────────────────────────────────────────────────────────
const TOP = A.CONTENT_TOP;            // 1.18
const BOT = A.CONTENT_BOTTOM;         // 7.05
const LX = A.MARGIN, LW = 6.08;       // 좌측 문제 열
const RX = 6.98, RW = 13.333 - A.MARGIN - RX; // 우측 목표 열 (≈5.99)
const ARROW_X = LX + LW + 0.06, ARROW_W = RX - ARROW_X - 0.06;

// 헤더 바
const hy = A.sectionHeader(s, { x: LX, y: TOP, w: LW, text: "문제 정의 — 현재 런타임의 KV 캐시 운용 3대 공백 (우선순위 순)", color: "navy", fontSize: 12 });
A.sectionHeader(s, { x: RX, y: TOP, w: RW, text: "과제 목표 — KV 캐시 최적 운용 AI 런타임 (MCR 1단계)", color: "green", fontSize: 12 });

// 행 배치: 헤더 아래 ~ 하단 종합 바 위
const SYNTH_H = 0.66;
const rowsTop = hy + 0.10;
const rowsBottom = BOT - SYNTH_H - 0.12;
const GAP = 0.13;
const ROW_H = (rowsBottom - rowsTop - 2 * GAP) / 3;

const bullet = { characterCode: "25C6", indent: 10 };
const dash   = { characterCode: "2013", indent: 10 };

function probPanel(y, num, title, lines, result) {
  A.panel(s, { x: LX, y, w: LW, h: ROW_H });
  // 우선순위 칩
  s.addShape("ellipse", { x: LX + 0.10, y: y + 0.09, w: 0.30, h: 0.30, fill: { color: C.navy }, line: { type: "none" } });
  s.addText(String(num), { x: LX + 0.10, y: y + 0.09, w: 0.30, h: 0.30, align: "center", valign: "middle", fontFace: F.head, fontSize: 12, bold: true, color: C.white });
  s.addText(title, { x: LX + 0.48, y: y + 0.06, w: LW - 0.58, h: 0.34, fontFace: F.head, fontSize: 11.5, bold: true, color: C.navy, valign: "middle" });
  const runs = [];
  lines.forEach(t => runs.push({ text: t, options: { bullet, fontFace: F.body, fontSize: 9.3, color: C.ink, breakLine: true, paraSpaceAfter: 3 } }));
  runs.push({ text: "⇒ " + result, options: { fontFace: F.body, fontSize: 9.6, bold: true, color: "B3402A", breakLine: true } });
  s.addText(runs, { x: LX + 0.16, y: y + 0.40, w: LW - 0.30, h: ROW_H - 0.48, valign: "top" });
}

function goalPanel(y, num, title, lines, verdict) {
  A.panel(s, { x: RX, y, w: RW, h: ROW_H, fill: "F3F7F0" });
  s.addShape("roundRect", { x: RX + 0.10, y: y + 0.09, w: 0.72, h: 0.30, rectRadius: 0.06, fill: { color: C.green }, line: { type: "none" } });
  s.addText("목표 " + num, { x: RX + 0.10, y: y + 0.09, w: 0.72, h: 0.30, align: "center", valign: "middle", fontFace: F.head, fontSize: 10, bold: true, color: C.white });
  s.addText(title, { x: RX + 0.92, y: y + 0.06, w: RW - 1.02, h: 0.34, fontFace: F.head, fontSize: 11.5, bold: true, color: C.greenDark, valign: "middle" });
  const runs = [];
  lines.forEach(t => runs.push({ text: t, options: { bullet, fontFace: F.body, fontSize: 9.3, color: C.ink, breakLine: true, paraSpaceAfter: 3 } }));
  runs.push({ text: "판정: ", options: { fontFace: F.body, fontSize: 9.6, bold: true, color: C.navy } },
            { text: verdict, options: { fontFace: F.body, fontSize: 9.6, color: C.navy, breakLine: true } });
  s.addText(runs, { x: RX + 0.16, y: y + 0.40, w: RW - 0.30, h: ROW_H - 0.48, valign: "top" });
}

function arrow(y) {
  s.addShape("rightArrow", { x: ARROW_X, y: y + ROW_H / 2 - 0.14, w: ARROW_W, h: 0.28, fill: { color: C.yellow }, line: { type: "none" } });
}

// ── 행 1: 재사용 공백 → 목표 1 ────────────────────────────────────────
const y1 = rowsTop;
probPanel(y1, 1, "KV 재사용 공백 — prefix 일치·일회성 버퍼에 갇힘",
  [
    "prefix 정확 일치 시에만 재사용(vLLM·SGLang) — RAG chunk 순서·프롬프트 변경에 hit 0, 비접두 재사용 부재",
    "요청 종료 시 폐기 — 세션·사용자 영속 자산 아님, 하위 tier 복원 vs 재계산의 비용 판단도 없음",
  ],
  "수십 k 토큰을 매 요청 전체 re-prefill — TTFT 지배 (R-03·04·05)");
arrow(y1);
goalPanel(y1, 1, "KV 재사용성 제고 → 지연시간(TTFT) 개선",
  [
    "prefix + 비접두(chunk) 재사용, 세션·사용자 단위 영속화, 복원 vs 재계산 비용 판단 (FR-02)",
  ],
  "TTFT ≥ 2× (QA1) — CacheBlend 2.2–3.3×(B) 앵커");

// ── 행 2: 압축 공백 → 목표 2 ─────────────────────────────────────────
const y2 = y1 + ROW_H + GAP;
probPanel(y2, 2, "KV 압축 공백 — 정적·일률 적용, 품질과 피드백 없음",
  [
    "KV ∝ 컨텍스트×동시 세션(32k 1세션 ≈ 10.5 GB) — HBM 용량 초과 + decode 대역폭 압박(대기 70–85%(A))",
    "압축(2-bit 양자화·token eviction)은 입증됐으나 전역 고정 설정 — 요청별 품질 예산·차등 집행 부재",
  ],
  "용량·대역폭 이중 병목 지속, 품질 리스크 통제 불가 (R-01·02·06)");
arrow(y2);
goalPanel(y2, 2, "정확도 유지 KV 압축 → 메모리 병목 해소 → 지연·처리량 개선",
  [
    "품질 bound(ΔF1 ≤ 1%p, QA3 gate) 안에서 요청별 차등 압축 — training-free(C-03) (FR-03·04)",
  ],
  "유효 KV 용량 ≥ 3× (QA4) · throughput ≥ 2× (QA2)");

// ── 행 3: 스케줄링 공백 → 목표 3 ─────────────────────────────────────
const y3 = y2 + ROW_H + GAP;
probPanel(y3, 3, "스케줄링 공백 — 스케줄러가 KV를 모른다 (KV-blind)",
  [
    "admission·라우팅이 cache locality 비인지 — 재사용 KV가 있는 노드를 두고 다른 노드로 배정 시 ①의 이득 소실",
    "KV 풀 포화 시 preemption·전체 재계산뿐 — 압축/강등/축출 중의 선택이라는 결정 자체가 없음",
  ],
  "재사용·압축의 이득이 시스템 처리량으로 전환되지 않음 (R-16)");
arrow(y3);
goalPanel(y3, 3, "KV 캐시 인지형 동적 스케줄링 → 처리량 개선",
  [
    "cache-hit/locality 인지 admission·라우팅 + KV 공간 확보(압축/강등/축출 최적 선택) — 요청별 SLO 차등 (FR-05)",
  ],
  "throughput ≥ 2× (QA2) — 축별 ablation으로 순기여 분리");

// ── 하단 종합 바 ─────────────────────────────────────────────────────
const sy = BOT - SYNTH_H;
s.addShape("rect", { x: LX, y: sy, w: 13.333 - 2 * A.MARGIN, h: SYNTH_H, fill: { color: C.cream }, line: { color: C.brown, width: 1 } });
s.addText([
  { text: "관통 문제: ", options: { bold: true, color: C.brown, fontFace: F.head, fontSize: 10.5 } },
  { text: "세 공백은 결합되어 있다(재사용은 남는 것을, 압축은 비용을, 스케줄링은 활용을 결정) — 그러나 셋을 조율하는 계층이 어느 런타임에도 없다.  ", options: { color: C.ink, fontFace: F.body, fontSize: 10.5 } },
  { text: "∴ 본 과제 = 조율 계층을 갖춘 KV 캐시 최적 운용 런타임", options: { bold: true, color: C.navy, fontFace: F.head, fontSize: 10.5 } },
  { text: "  (2단계 진화: 자사 memory-centric 디바이스 확장 — MCR 완성)", options: { color: C.muted, fontFace: F.body, fontSize: 9.5 } },
], { x: LX + 0.15, y: sy, w: 13.333 - 2 * A.MARGIN - 0.3, h: SYNTH_H, valign: "middle" });

A.writeDeck(pptx, process.argv[2] || require("path").join(__dirname, "mcr_necessity_kv.pptx")).then(() => console.log("written"));
