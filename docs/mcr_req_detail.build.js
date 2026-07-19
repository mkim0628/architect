// Regenerate: NODE_PATH="$(npm root -g)" node docs/mcr_req_detail.build.js
// 요구사항 분석 상세 2장 (참조 덱 GW9 p30·p32 방식을 MCR에 적용):
//   A. 요구사항 수집 경위 → 목표(QA) 정의 — 누구와·언제·어떤 문헌으로 무엇을 목표했나
//   B. 시나리오 기반 핵심 요소 → QA 도출 — 정량 효과(재사용·압축·검색 등)로 필요 기능·목표 도출
// 내용 출처: docs/00_requirements_analysis.md · 00_qa_derivation.md · 00_qa_definitions.md
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_req_detail.pptx");
const navy = A.COLORS.navy, green = A.COLORS.green, gray = "595959", ink = A.COLORS.ink;
const blue = "2E5496"; // 참조 덱의 파란 헤더 바 톤

// 참조 덱식 파란 라운드 헤더 바
function blueHeader(s, { x, y, w, text, h = 0.36, fontSize = 12.5 }) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: blue }, line: { type: "none" } });
  s.addText(text, { x, y, w, h, margin: 0, align: "center", valign: "middle", color: "FFFFFF", bold: true, fontFace: A.FONT.head, fontSize });
  return y + h;
}
// 라운드 외곽 패널
function roundPanel(s, { x, y, w, h, fill = "FBFCFE" }) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.05, fill: { color: fill }, line: { color: A.COLORS.grayBorder, width: 1 } });
}
// 하단 파란 굵은 한 줄 요약
function bottomSummary(s, runs) {
  s.addText(runs, { x: A.MARGIN, y: 6.72, w: A.PAGE.w - 2 * A.MARGIN, h: 0.4, margin: 0, align: "center", valign: "middle", fontFace: A.FONT.head });
}
function headline(s, runs) {
  s.addText(runs, { x: A.MARGIN, y: A.CONTENT_TOP - 0.04, w: A.PAGE.w - 2 * A.MARGIN, h: 0.36, margin: 0, valign: "middle", align: "left", fontFace: A.FONT.head });
}

// ════════════ A. 요구사항 수집 경위 → 목표(QA) 정의 (navy) ════════════
{
  const s = A.slide(pptx, { title: "요구사항 수집 · 목표 정의 — 상세", active: 1, band: "navy", page: 7, titleSize: 26 });
  headline(s, [
    { text: "○ VOC·QAW·자체 실측·문헌 조사로 요구사항을 수집 → ", options: { fontSize: 14, color: ink } },
    { text: "정량 목표(QA KPI = Exit Criteria) 정의", options: { fontSize: 14, bold: true, color: navy } },
  ]);
  const top = 1.68, bot = 6.5;
  const Lx = A.MARGIN, Lw = 6.15, Rx = 6.78, Rw = A.PAGE.w - A.MARGIN - Rx;
  roundPanel(s, { x: Lx, y: top, w: Lw, h: bot - top });
  roundPanel(s, { x: Rx, y: top, w: Rw, h: bot - top });

  // 좌: 수집 경위 (순서 있는 방식·대상·산출)
  let y = blueHeader(s, { x: Lx + 0.12, y: top + 0.12, w: Lw - 0.24, text: "요구사항 수집 — 방식 · 대상 · 산출" });
  const coll = (n, m, d) => [
    { text: `${n} `, options: { bullet: false, bold: true, color: blue, fontSize: 10.5 } },
    { text: `${m}\n`, options: { bold: true, color: navy, fontSize: 10.5 } },
    { text: d, options: { fontSize: 9.5, color: ink } },
  ];
  A.bulletList(s, {
    x: Lx + 0.2, y: y + 0.12, w: Lw - 0.36, h: bot - y - 0.2, fontSize: 10.5,
    items: [
      coll("①", "Stakeholder 인터뷰 · VOC 접수", "메모리 사업부 · MCAS 팀 · User · 개발 임원 · MCR 개발팀 · 고객사(잠재) → 원시 요구 R-01~R-23 (유효 22건)"),
      coll("②", "QAW (Quality Attribute Workshop)", "이해관계자 합동 — 품질 발화를 6-part 시나리오(자극→환경→응답→측정)로 구체화"),
      coll("③", "자체 벤치마크 실측", "P/D 분리 벤치 → decode 대기 70–85% (근거 A) — QA1 baseline·개선 대상 정의"),
      coll("④", "문헌 · 업계 벤치마크 조사", "DistServe·MLPerf·KIVI·CacheBlend·SmartANNS·vLLM·FlexGen → 정량 목표의 앵커 (근거 B)"),
      coll("⑤", "upstream 로드맵 · 릴리스 분석", "vLLM 2주 릴리스 케이던스 → 진화성·유지보수 목표 근거"),
      coll("⑥", "유사 시스템 분석", "LMCache 등 KV offloading 계층 → 설계 후보(DP) 발굴"),
    ],
  });

  // 우: 목표(QA) 정의 4단계 + Exit Criteria + stakeholder 표
  y = blueHeader(s, { x: Rx + 0.12, y: top + 0.12, w: Rw - 0.24, text: "달성 목표(QA / Exit Criteria) 정의" });
  A.bulletList(s, {
    x: Rx + 0.2, y: y + 0.1, w: Rw - 0.36, h: 1.15, fontSize: 9.5,
    items: [
      [{ text: "① 분류 ", options: { bold: true, color: blue, fontSize: 9.5 } }, { text: "→ 기능 FR 9 · 제약 C 2 · 품질(QA 후보) 10", options: { fontSize: 9.5 } }],
      [{ text: "② Utility Tree ", options: { bold: true, color: blue, fontSize: 9.5 } }, { text: "(중요도·난이도) → 상위 6건 ASR 선정", options: { fontSize: 9.5 } }],
      [{ text: "③ 정량화 ", options: { bold: true, color: blue, fontSize: 9.5 } }, { text: "→ 각 QA에 문헌 앵커 기반 KPI(정량 bin) = Exit Criteria 부여", options: { fontSize: 9.5 } }],
    ],
  });
  // Exit Criteria 표
  const ey = y + 1.28;
  A.specTable(s, {
    x: Rx + 0.16, y: ey, w: Rw - 0.32, colW: [1.9, Rw - 0.32 - 1.9], fontSize: 8.3, headerFontSize: 8.6, headerColor: blue,
    header: ["선정 QA", "★★★ Exit Criteria (KPI)"],
    rows: [
      [{ text: "QA1 성능", bold: true }, { text: [{ text: "TTFT ≥ 2× ", options: { bold: true, color: navy, fontSize: 8.3 } }, { text: "AND ", options: { fontSize: 8.3 } }, { text: "throughput ≥ 2×", options: { bold: true, color: navy, fontSize: 8.3 } }, { text: " (vs GPU HBM 단일 tier)", options: { fontSize: 8.3, color: gray } }] }],
      [{ text: "QA2 품질(gate)", bold: true }, "ΔF1 ≤ 1%p · 요청별 bound 집행"],
      [{ text: "QA3 메모리 효율", bold: true }, "유효 KV 용량 ≥ 3× (원본 환산)"],
      [{ text: "QA4 확장성", bold: true }, "어댑터 ≤ 1 · 코어 LOC 0 · ≤ upstream + 2주"],
      [{ text: "QA6 적응성", bold: true }, "framework 결합 격리 ≤ 10% · 전환 ≤ 3인월"],
      [{ text: "QA5 유지보수", bold: true }, "초기 ≤ 6인월 · 유지 ≤ 0.5 FTE"],
    ],
  });
}

// ════════════ B. 시나리오 기반 핵심 요소 → QA 도출 (green) ════════════
{
  const s = A.slide(pptx, { title: "시나리오 기반 핵심 요소 → QA 도출 — 상세", active: 1, band: "green", page: 8, titleSize: 24 });
  headline(s, [
    { text: "○ 대표 워크로드 시나리오의 정량 관찰(효과 %·배율) → ", options: { fontSize: 14, color: ink } },
    { text: "필요 기능(FR) · 목표(QA) 도출", options: { fontSize: 14, bold: true, color: navy } },
  ]);
  const top = 1.62;
  const Lx = A.MARGIN, Lw = 5.75, aX = Lx + Lw + 0.12, aW = 0.62, Rx = aX + aW + 0.12, Rw = A.PAGE.w - A.MARGIN - Rx;
  blueHeader(s, { x: Lx, y: top, w: Lw, text: "대표 워크로드 시나리오 — 정량 핵심 요소", fontSize: 11.5 });
  blueHeader(s, { x: Rx, y: top, w: Rw, text: "도출된 필요 기능(FR) → 귀결 목표(QA)", fontSize: 11.5 });

  const rowsTop = top + 0.46, rowsBot = 6.55, n = 5, gap = 0.14;
  const rh = (rowsBot - rowsTop - gap * (n - 1)) / n;
  const rows = [
    { sc: "long-context RAG — 수십k 토큰 프롬프트를 매 요청 re-prefill (반복 비용 지배)",
      scEv: "KV 재사용 시 TTFT 2.2–3.3×↓ · 히트율 85%+ (CacheBlend, B)",
      fr: "KV 영속·재사용 (FR-04)", qa: "→ TTFT ≥ 2× (QA1 prefill 축)" },
    { sc: "RAG retrieval이 TTFT 임계 경로 — SSD 기반 ANN은 I/O가 실행의 ~67% (B)",
      scEv: "near-storage 검색 가속 QPS 10.7× (SmartANNS, B) — SSD-PIM",
      fr: "근접연산 오프로드 (FR-07)", qa: "→ retrieval 가속 (QA1 · 차별 축)" },
    { sc: "KV 용량 병목 — 32k 컨텍스트 1세션 ≈ 10.5 GB, HBM 용량 초과 (C)",
      scEv: "2-bit 압축 시 peak memory 2.6×↓ · batch 4× (KIVI, B)",
      fr: "KV 압축 (FR-03)", qa: "→ 유효 KV 용량 ≥ 3× (QA3)" },
    { sc: "decode 단계가 지배 — 자체 실측 대기 70–85%, memory-BW-bound (A)",
      scEv: "이종 tier 확장으로 batch↑ → 처리량 2–4× (vLLM paging, B)",
      fr: "이종 tier KV 배치 (FR-02)", qa: "→ throughput ≥ 2× (QA1 decode 축)" },
    { sc: "압축·재사용 시 답변 품질 저하 우려 — 저하 크면 사용 불가 (User VOC)",
      scEv: "near-lossless 운용 실재 — LongBench 저하 ≤ 2%p (KIVI, B)",
      fr: "요청별 SLO·품질 정책 (FR-06)", qa: "→ 품질 저하 bound (QA2 gate)" },
  ];
  rows.forEach((r, i) => {
    const y = rowsTop + i * (rh + gap);
    // 좌 시나리오 카드
    A.panel(s, { x: Lx, y, w: Lw, h: rh, fill: "EAF1FB" });
    s.addText([
      { text: r.sc, options: { fontSize: 9, bold: true, color: ink, breakLine: true } },
      { text: r.scEv, options: { fontSize: 8.3, color: blue, bold: true } },
    ], { x: Lx + 0.1, y: y + 0.04, w: Lw - 0.2, h: rh - 0.08, margin: 0, valign: "middle", align: "left", fontFace: A.FONT.body, lineSpacingMultiple: 0.98 });
    // → 화살표
    s.addShape("rightArrow", { x: aX, y: y + rh / 2 - 0.15, w: aW, h: 0.3, fill: { color: green }, line: { type: "none" } });
    // 우 필요 기능·QA 카드
    A.panel(s, { x: Rx, y, w: Rw, h: rh, fill: "EAF3E6" });
    s.addText([
      { text: r.fr, options: { fontSize: 9.5, bold: true, color: navy, breakLine: true } },
      { text: r.qa, options: { fontSize: 9.5, bold: true, color: A.COLORS.greenDark } },
    ], { x: Rx + 0.12, y: y + 0.04, w: Rw - 0.22, h: rh - 0.08, margin: 0, valign: "middle", align: "left", fontFace: A.FONT.body, lineSpacingMultiple: 0.98 });
  });

  bottomSummary(s, [
    { text: "시나리오의 정량 효과가 곧 기능·목표의 근거 — ", options: { fontSize: 13, color: navy, bold: true } },
    { text: "모든 QA는 측정 가능한 시나리오에서 도출(A 실측 · B 문헌 · C 논증)", options: { fontSize: 13, color: navy, bold: true } },
  ]);
}

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
