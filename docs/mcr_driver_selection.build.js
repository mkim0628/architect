/**
 * mcr_driver_selection.build.js — P8 「Architecture Driver 도출」 단일 슬라이드.
 *
 *   NODE_PATH=<pptxgenjs 위치> node docs/mcr_driver_selection.build.js [out.pptx]
 *
 * 구성: FR-01~09(navy) · 선정 QA 6건(green) · C-01(brown) 태그바 3그룹이
 * 중앙 노란 타원 "Architectural Drivers"로 수렴 → 산출물 인용구.
 * 내용 출처: docs/00_requirements_analysis.md §2·§4.3·§5 (FR 9 · QA 6 · C 1 = 16종).
 */
const path = require("path");
const A = require(path.join(__dirname, "../.claude/skills/architect-ppt/lib/architect_deck.js"));

const OUT = process.argv[2] || path.join(__dirname, "mcr_driver_selection.pptx");
const C = A.COLORS, F = A.FONT;

const pptx = A.newDeck();
const s = A.slide(pptx, { title: "Architecture Driver 도출", active: 1, band: "green", page: 8, total: 33 });

/** 그룹 라벨: | Group Name */
function groupLabel(x, y, text) {
  s.addShape("rect", { x, y: y + 0.03, w: 0.045, h: 0.24, fill: { color: C.ink }, line: { type: "none" } });
  s.addText(text, { x: x + 0.12, y, w: 4.4, h: 0.3, fontSize: 12.5, bold: true, color: C.ink, fontFace: F.head, align: "left", valign: "middle", margin: 0 });
}

/* ── 좌측: Functional Requirements (FR-01~09, navy) ── */
const FRX = 0.45, FRW = 4.62;
groupLabel(FRX, 1.24, "Functional Requirements");
const FRS = [
  ["FR-01", "워크로드 서빙", "RAG·multiturn·agent E2E 서빙"],
  ["FR-02", "이종 tier KV 배치", "특성 인지 배치·승격/강등"],
  ["FR-03", "KV 압축", "양자화·토큰 eviction 적용·해제"],
  ["FR-04", "KV 영속·재사용", "세션·사용자 단위 영속·재사용"],
  ["FR-05", "P/D 분리 실행", "인스턴스 간 KV 전송 포함 실행"],
  ["FR-06", "요청별 SLO 정책", "배치×압축×재사용 차등 조율"],
  ["FR-07", "근접연산 오프로드", "PIM/PNM 오프로드 (압축·검색)"],
  ["FR-08", "디바이스 plug-in", "Tier Topology 파라미터 등록"],
  ["FR-09", "모니터링·P/D 조정", "고정 N 내 P/D 비율 자동 조정"],
];
FRS.forEach(([id, tag, text], i) => {
  A.tagBar(s, { x: FRX, y: 1.62 + i * 0.475, w: FRW, id, tag, text, color: "navy", fontSize: 9.5 });
});

/* ── 우상단: Quality Attributes (선정 QA 6건, green — 우선순위 순) ── */
const QAX = 5.5, QAW = 4.45;
groupLabel(QAX, 1.24, "Quality Attributes");
const QAS = [
  ["QA1", "Performance", "추론 성능 (goodput@SLO)"],
  ["QA2", "Accuracy", "응답 품질 (품질 저하 bound)"],
  ["QA3", "Resource Efficiency", "메모리 효율 (유효 KV 용량)"],
  ["QA4", "Modifiability", "확장성·진화성"],
  ["QA6", "Adaptability", "framework 적응성"],
  ["QA5", "Maintainability", "유지보수성 (개발·운영 비용)"],
];
QAS.forEach(([id, tag, text], i) => {
  A.tagBar(s, { x: QAX, y: 1.62 + i * 0.475, w: QAW, id, tag, text, color: "green", fontSize: 9.5 });
});

/* ── 우하단: Constraints (C-01, brown) ── */
const CX = 10.05, CW2 = 2.9;
groupLabel(CX, 4.42, "Constraints");
A.tagBar(s, { x: CX, y: 4.80, w: CW2, id: "C-01", tag: "디바이스 불변", text: "HW 스펙 변경 불가", color: "brown", fontSize: 9 });

/* ── 중앙 수렴부: 화살표 3개 + 노란 타원 ── */
const EX = 6.5, EYE = 4.95, EW2 = 2.45, EH2 = 1.0; // ellipse
s.addShape("downArrow", { x: 7.5, y: 4.40, w: 0.45, h: 0.5, fill: { color: C.green }, line: { type: "none" } });                     // QA ↓
s.addShape("rightArrow", { x: 5.2, y: 5.22, w: 1.2, h: 0.46, fill: { color: C.navy }, line: { type: "none" } });                    // FR →
s.addShape("leftArrow", { x: 9.05, y: 5.22, w: 0.92, h: 0.46, fill: { color: C.brown }, line: { type: "none" } });                  // C ←
s.addShape("ellipse", { x: EX, y: EYE, w: EW2, h: EH2, fill: { color: C.yellow }, line: { color: "BF9000", width: 1 } });
s.addText([
  { text: "Architectural Drivers", options: { bold: true, fontSize: 13, color: C.navy, breakLine: true } },
  { text: "FR 9 · QA 6 · C 1 = 16종", options: { fontSize: 8, color: C.navy } },
], { x: EX, y: EYE, w: EW2, h: EH2, align: "center", valign: "middle", margin: 0, fontFace: F.head });

/* ── 하단: 산출물 인용구 ── */
s.addShape("downArrow", { x: 7.32, y: 6.08, w: 0.8, h: 0.55, fill: { color: "A9C08C" }, line: { type: "none" } });
s.addText("“MCR (Memory-Centric Runtime)”", {
  x: 3.7, y: 6.66, w: 8.0, h: 0.38, fontSize: 17, bold: true, color: C.ink, fontFace: F.head, align: "center", valign: "middle", margin: 0,
});

(async () => {
  await A.writeDeck(pptx, OUT);
  console.log("written:", OUT);
})();
