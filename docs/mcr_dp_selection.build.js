/**
 * mcr_dp_selection.build.js — P9 「설계 Point 선정」 단일 슬라이드.
 *
 *   NODE_PATH=<pptxgenjs 위치> node docs/mcr_dp_selection.build.js [out.pptx]
 *
 * 구성: 좌측 드라이버 레일(F1~F9 · Q1~Q6 · C1) — 중앙 MCR Module View(확정안 v2
 * 패키지 구조 + 드라이버 배지 + DP 색 프레임) — 우측 DP-01~08 카드.
 * 내용 출처: docs/00_requirements_analysis.md(드라이버) ·
 * docs/01_architecture_overview.md(패키지 구조) · docs/02~05_design_points_*.md(DP·QA).
 */
const path = require("path");
const A = require(path.join(__dirname, "../.claude/skills/architect-ppt/lib/architect_deck.js"));

const OUT = process.argv[2] || path.join(__dirname, "mcr_dp_selection.pptx");

// DP-06~08 색 확장 (DP-01~05는 토큰 기본값)
A.COLORS.dp["DP-06"] = "BF9000"; // gold   — 근접연산 오프로드
A.COLORS.dp["DP-07"] = "2E75B6"; // blue   — SSD-PIM 검색 실행
A.COLORS.dp["DP-08"] = "C00000"; // red    — SSD-PIM 계약·소유

const C = A.COLORS, F = A.FONT;
const pptx = A.newDeck();
const s = A.slide(pptx, { title: "설계 Point 선정", active: 2, band: "navy", page: 9, total: 33 });
A.linkButton(s, { label: "Module View (확정안 v2) :" });

/* ---------------- 좌측 드라이버 레일 ---------------- */
const RAIL = [
  ["F1", "워크로드 서빙", C.navy], ["F2", "이종 tier KV 배치", C.navy],
  ["F3", "KV 압축", C.navy], ["F4", "KV 영속·재사용", C.navy],
  ["F5", "P/D 분리 실행", C.navy], ["F6", "요청별 SLO 정책", C.navy],
  ["F7", "근접연산 오프로드", C.navy], ["F8", "디바이스 plug-in", C.navy],
  ["F9", "모니터링·P/D 조정", C.navy],
  ["Q1", "추론 성능", C.greenDark], ["Q2", "응답 품질", C.greenDark],
  ["Q3", "메모리 효율", C.greenDark], ["Q4", "확장성·진화성", C.greenDark],
  ["Q5", "유지보수성", C.greenDark], ["Q6", "framework 적응성", C.greenDark],
  ["C1", "디바이스 불변", C.brown],
];
RAIL.forEach(([id, label, color], i) => {
  const y = 1.22 + i * 0.345;
  s.addShape("rect", { x: 0.74, y: y + 0.01, w: 1.56, h: 0.26, fill: { color: C.white }, line: { color: C.grayBorder, width: 0.75 } });
  s.addText(label, { x: 0.80, y: y + 0.01, w: 1.46, h: 0.26, align: "center", valign: "middle", fontSize: 8, color: C.ink, fontFace: F.body, margin: 0 });
  A.badge(s, { x: 0.40, y, d: 0.28, text: id, color, fontSize: 8 });
});

/* ---------------- 중앙 Module View ---------------- */
const CX = 2.48, CW = 6.62; // 중앙 영역 x·폭

/** 패키지 외곽(탭 포함) */
function pkg(x, y, w, h, name, fill) {
  s.addShape("rect", { x, y: y - 0.13, w: Math.min(2.6, w * 0.5), h: 0.15, fill: { color: fill }, line: { color: C.grayBorder, width: 0.75 } });
  s.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { color: C.grayBorder, width: 1 } });
  s.addText(name, { x: x + 0.08, y: y + 0.02, w: w - 0.16, h: 0.22, fontSize: 9, bold: true, color: C.ink, fontFace: F.head, align: "left", valign: "middle", margin: 0 });
}
/** 하위 패키지: 헤더 + 반환된 컴포넌트 배치 기준점 */
function sub(x, y, w, h, name) {
  s.addShape("rect", { x, y, w, h, fill: { color: C.white }, line: { color: C.grayBorder, width: 0.75 } });
  s.addText(name, { x: x + 0.05, y: y + 0.015, w: w - 0.1, h: 0.2, fontSize: 8, bold: true, color: C.navy, fontFace: F.head, align: "left", valign: "middle", margin: 0 });
}
/** 컴포넌트 박스 — 좌표 기록해 DP 프레임에서 재사용 */
const CO = {}; // name → {x,y,w,h}
function comp(x, y, w, name, key) {
  const h = 0.28;
  s.addShape("rect", { x, y, w, h, fill: { color: C.panelFill }, line: { color: "8496B0", width: 0.75 } });
  s.addText(name, { x, y, w, h, fontSize: 7, color: C.ink, fontFace: F.body, align: "center", valign: "middle", margin: 0, fit: "shrink" });
  CO[key || name] = { x, y, w, h };
}
/** 배지 행 — 박스 상단 모서리에 걸치게 */
function badges(x, y, ids) {
  ids.forEach(([t, c], i) => A.badge(s, { x: x + i * 0.27, y, d: 0.25, text: t, color: c, fontSize: 6.5 }));
}
/** DP 색 프레임(채움 없음) */
function frame(x, y, w, h, id, wt = 1.5) {
  s.addShape("rect", { x, y, w, h, fill: { type: "none" }, line: { color: C.dp[id], width: wt } });
}
/** DP 라벨 태그 */
function tag(x, y, id) {
  s.addShape("rect", { x, y, w: 0.56, h: 0.2, fill: { color: C.dp[id] }, line: { type: "none" } });
  s.addText(id, { x, y, w: 0.56, h: 0.2, fontSize: 7.5, bold: true, color: C.white, fontFace: F.head, align: "center", valign: "middle", margin: 0 });
}

// ── Inference Orchestration (control plane)
const OY = 1.38, OH = 1.86;
pkg(CX, OY, CW, OH, "Inference Orchestration  (control plane)", "DCE6F1");
const SW = (CW - 0.3 - 0.24) / 3, SY = OY + 0.28, SH = 1.46;
const S1 = CX + 0.15, S2 = S1 + SW + 0.12, S3 = S2 + SW + 0.12;
sub(S1, SY, SW, SH, "Request Manager");
comp(S1 + 0.08, SY + 0.26, SW - 0.16, "Request Lifecycle Manager");
comp(S1 + 0.08, SY + 0.62, SW - 0.16, "Multiturn Batcher");
comp(S1 + 0.08, SY + 0.98, SW - 0.16, "Retrieval Engine (RAG)", "RetrievalEngine");
sub(S2, SY, SW, SH, "Scheduling");
comp(S2 + 0.08, SY + 0.26, SW - 0.16, "KV-aware Router");
comp(S2 + 0.08, SY + 0.62, SW - 0.16, "SLO/QoS Monitor");
sub(S3, SY, SW, SH, "Resource Manager");
comp(S3 + 0.08, SY + 0.26, SW - 0.16, "Hardware Monitor");
comp(S3 + 0.08, SY + 0.62, SW - 0.16, "Autoscaler (P/D 2-loop)", "Autoscaler");
badges(S1 + SW - 0.85, SY - 0.12, [["F1", C.navy], ["F4", C.navy], ["F7", C.navy]]);
badges(S2 + SW - 0.85, SY - 0.12, [["F6", C.navy], ["Q1", C.greenDark], ["Q2", C.greenDark]]);
badges(S3 + SW - 0.58, SY - 0.12, [["F9", C.navy], ["F5", C.navy]]);

// ── data plane 2 패키지
const EY = 3.62, EH = 2.36, EW = (CW - 0.26) / 2;
const IEX = CX, MEX = CX + EW + 0.26;
pkg(IEX, EY, EW, EH, "Inference Engine  (data plane)", "E2EFDA");
sub(IEX + 0.12, EY + 0.28, EW - 0.24, 0.62, "Execution");
comp(IEX + 0.2, EY + 0.54, (EW - 0.48) / 2, "Model Runner");
comp(IEX + 0.2 + (EW - 0.48) / 2 + 0.08, EY + 0.54, (EW - 0.48) / 2, "Step Exec. Controller");
sub(IEX + 0.12, EY + 1.0, EW - 0.24, 0.96, "Kernel & Layer");
comp(IEX + 0.2, EY + 1.26, (EW - 0.48) / 2, "Attention Engine");
comp(IEX + 0.2 + (EW - 0.48) / 2 + 0.08, EY + 1.26, (EW - 0.48) / 2, "MoE / Custom Kernel");
comp(IEX + 0.2, EY + 1.6, EW - 0.4, "CompressionOp Kernel");
badges(IEX + EW - 0.85, EY + 0.16, [["Q4", C.greenDark], ["Q5", C.greenDark], ["Q6", C.greenDark]]);
badges(IEX + EW - 0.85, EY + 1.0 - 0.12, [["F3", C.navy], ["F7", C.navy]]);

pkg(MEX, EY, EW, EH, "Memory Engine  (data plane)", "FCE4D6");
sub(MEX + 0.12, EY + 0.28, EW - 0.24, 0.96, "Cache Manager");
comp(MEX + 0.2, EY + 0.54, (EW - 0.48) / 2, "KV Cache Manager");
comp(MEX + 0.2 + (EW - 0.48) / 2 + 0.08, EY + 0.54, (EW - 0.48) / 2, "Memory Compressor", "MemoryCompressor");
comp(MEX + 0.2, EY + 0.88, EW - 0.4, "KV Index (prefix/infix lookup)", "KVIndex");
sub(MEX + 0.12, EY + 1.34, EW - 0.24, 0.96, "Tier & Lifecycle");
comp(MEX + 0.2, EY + 1.6, (EW - 0.48) / 2, "Tier Topology Model", "TierTopology");
comp(MEX + 0.2 + (EW - 0.48) / 2 + 0.08, EY + 1.6, (EW - 0.48) / 2, "Migration (intra-node)");
comp(MEX + 0.2, EY + 1.94, EW - 0.4, "KV Transport (P/D inter-instance)", "KVTransport");
badges(MEX + EW - 1.12, EY + 0.28 - 0.12, [["F2", C.navy], ["F3", C.navy], ["F4", C.navy], ["Q3", C.greenDark]]);
badges(MEX + EW - 1.12, EY + 1.34 - 0.12, [["F2", C.navy], ["F5", C.navy], ["F8", C.navy], ["C1", C.brown]]);

// ── 의존 관계
const arrow = (x, y, x2, y2, dash) => s.addShape("line", { x, y, w: x2 - x, h: y2 - y, line: { color: "595959", width: 1.25, endArrowType: "triangle", dashType: dash || "solid" } });
arrow(IEX + EW / 2, OY + OH, IEX + EW / 2, EY - 0.13);         // Orch → IE «use»
arrow(MEX + EW / 2, OY + OH, MEX + EW / 2, EY - 0.13);         // Orch → ME «use»
arrow(IEX + EW, EY + 0.7, MEX, EY + 0.7);                       // IE → ME alloc/fetch
arrow(IEX + EW, EY + 1.75, MEX - 0.02, EY + 1.1, "dash");       // Kernel ⇢ CompressionOp (DI)
s.addText("«interface»  KV Locator (조회 전용) · CompressionOp (의존 역전)", {
  x: CX, y: EY + EH + 0.20, w: CW, h: 0.2, fontSize: 7.5, italic: true, color: C.muted, align: "center", margin: 0, fontFace: F.body,
});

// ── DP 색 프레임 + 태그
const inf = (b, d) => [b.x - d, b.y - d, b.w + 2 * d, b.h + 2 * d];
// DP-01 실행 스택 소싱 — data plane 전체
frame(IEX - 0.1, EY - 0.24, CW + 0.2, EH + 0.36, "DP-01", 2);
tag(IEX + CW - 0.48, EY - 0.34, "DP-01");
// DP-02 KV 배치·압축의 관리 주체 — Scheduling ↔ Cache Manager
frame(S2 - 0.06, SY - 0.06, SW + 0.12, SH + 0.12, "DP-02");
frame(MEX + 0.06, EY + 0.22, EW - 0.12, 1.08, "DP-02");
tag(S2 + 0.03, SY + SH - 0.28, "DP-02");
// DP-03 KV 재사용 — KV Index
frame(...inf(CO.KVIndex, 0.035), "DP-03");
tag(MEX + 0.35, CO.KVIndex.y + 0.26, "DP-03");
// DP-04 Tier 추상화 — Tier Topology Model
frame(...inf(CO.TierTopology, 0.035), "DP-04");
tag(MEX - 0.36, CO.TierTopology.y + 0.04, "DP-04");
// DP-05 P/D 운용·KV 이동 — KV Transport + Autoscaler
frame(...inf(CO.KVTransport, 0.035), "DP-05");
frame(...inf(CO.Autoscaler, 0.035), "DP-05");
tag(CO.KVTransport.x + CO.KVTransport.w - 0.52, CO.KVTransport.y - 0.11, "DP-05");
tag(CO.Autoscaler.x + CO.Autoscaler.w - 0.5, CO.Autoscaler.y + 0.3, "DP-05");
// DP-06 근접연산 오프로드 — Kernel & Layer + Memory Compressor
frame(IEX + 0.06, EY + 0.94, EW - 0.12, 1.08, "DP-06");
frame(...inf(CO.MemoryCompressor, 0.055), "DP-06");
tag(IEX + 0.06, EY + 2.04, "DP-06");
// DP-07 SSD-PIM 검색 실행 구조 — Retrieval Engine
frame(...inf(CO.RetrievalEngine, 0.03), "DP-07");
tag(S1 + 0.15, SY + 1.31, "DP-07");
// DP-08 SSD-PIM 계약·소유 — Retrieval Engine ↔ Tier & Lifecycle
frame(...inf(CO.RetrievalEngine, 0.07), "DP-08");
frame(MEX + 0.04, EY + 1.28, EW - 0.08, 1.08, "DP-08");
tag(S1 + 0.82, SY + 1.31, "DP-08");

// ── Legends
const LY = 6.62;
s.addText("Legends:", { x: CX + 0.9, y: LY, w: 0.85, h: 0.24, fontSize: 8.5, bold: true, color: C.ink, margin: 0, fontFace: F.head, valign: "middle" });
s.addShape("rect", { x: CX + 1.8, y: LY + 0.02, w: 0.9, h: 0.2, fill: { color: "DCE6F1" }, line: { color: C.grayBorder, width: 0.75 } });
s.addText("Package", { x: CX + 1.8, y: LY + 0.02, w: 0.9, h: 0.2, fontSize: 7.5, align: "center", valign: "middle", margin: 0, fontFace: F.body });
s.addShape("rect", { x: CX + 2.85, y: LY + 0.02, w: 0.9, h: 0.2, fill: { color: C.panelFill }, line: { color: "8496B0", width: 0.75 } });
s.addText("Module", { x: CX + 2.85, y: LY + 0.02, w: 0.9, h: 0.2, fontSize: 7.5, align: "center", valign: "middle", margin: 0, fontFace: F.body });
s.addShape("rect", { x: CX + 3.9, y: LY + 0.02, w: 0.9, h: 0.2, fill: { type: "none" }, line: { color: C.dp["DP-01"], width: 1.5 } });
s.addText("DP 영역", { x: CX + 3.9, y: LY + 0.02, w: 0.9, h: 0.2, fontSize: 7.5, align: "center", valign: "middle", margin: 0, fontFace: F.body });

/* ---------------- 우측 DP 카드 8장 ---------------- */
const CARDS = [
  ["DP-01", "실행 스택 소싱", "① 외부 스택 활용형(vLLM)  ② 자체 구현형", "QA: Q1·Q2 ↔ Q3·Q4·Q5"],
  ["DP-02", "KV 배치·압축의 관리 주체", "① Orchestration 중앙 정책  ② Memory Engine 자율", "QA: Q2·Q3 ↔ Q1·Q4·Q5"],
  ["DP-03", "KV 재사용 범위·복원 전략", "① Exact-prefix 재사용  ② 비연속 chunk+재계산", "QA: Q3·Q4·Q5 ↔ Q1·Q2"],
  ["DP-04", "Tier Topology 추상화 수준", "① 공통 파라미터형  ② Capability 프로파일형", "QA: Q4·Q5 ↔ Q1"],
  ["DP-05", "P/D 분리 운용·KV 이동 구조", "① Point-to-point 직접 전송  ② 공유 tier 스테이징", "QA: Q4·Q5 ↔ Q1·Q2"],
  ["DP-06", "근접연산(PIM/PNM) 오프로드", "① 데이터 관리 연산  ② 모델 연산(AttAcc형)", "QA: Q2~Q5 ↔ Q1"],
  ["DP-07", "SSD-PIM 검색 실행 구조", "① 전수 스캔형(exact)  ② 인덱스 유도형", "QA: Q3·Q4·Q5 ↔ Q1"],
  ["DP-08", "SSD-PIM의 계약·소유", "① 가속 벡터DB 서비스  ② 검색 가능 메모리 tier", "QA: Q3·Q4·Q5 ↔ Q1·Q2"],
];
let cy = 1.22;
CARDS.forEach(([id, title, cand, qa]) => {
  cy = A.dpCard(s, {
    x: 9.28, y: cy, w: 3.7, id, title,
    items: [{ text: cand }, { text: qa, color: C.navy }],
    bodyH: 0.37, fontSize: 7.5,
  }) + 0.05;
});

(async () => {
  await A.writeDeck(pptx, OUT);
  console.log("written:", OUT);
})();
