// Regenerate: NODE_PATH="$(npm root -g)" node docs/mcr_qa_derivation.build.js
// 요구사항 정의 → QA 도출 (논문 분석 기반):
//   ① 논문 분석 관찰(정량 인과) → ② 문제 정의 → ③ 요구사항(FR) → ④ 품질 목표(QA)
//   1장차: QA1 성능(TTFT) — KV cache 재사용률↑(tiered memory offload/prefetch) ⇒ TTFT↓
// 내용 출처: docs/00_qa_derivation.md §2.1 · 00_requirements_analysis.md · 00_qa_definitions.md
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_qa_derivation.pptx");
const navy = A.COLORS.navy, green = A.COLORS.green, greenDark = A.COLORS.greenDark,
      ink = A.COLORS.ink, gray = "595959", blue = "2E5496";

// ── 로컬 헬퍼 (mcr_req_detail.build.js와 동일 톤) ──
function blueHeader(s, { x, y, w, text, h = 0.34, fontSize = 12 }) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: blue }, line: { type: "none" } });
  s.addText(text, { x, y, w, h, margin: 0, align: "center", valign: "middle", color: "FFFFFF", bold: true, fontFace: A.FONT.head, fontSize });
  return y + h;
}
function headline(s, runs) {
  s.addText(runs, { x: A.MARGIN, y: A.CONTENT_TOP - 0.04, w: A.PAGE.w - 2 * A.MARGIN, h: 0.36, margin: 0, valign: "middle", align: "left", fontFace: A.FONT.head });
}
function bottomSummary(s, runs) {
  s.addText(runs, { x: A.MARGIN, y: 6.74, w: A.PAGE.w - 2 * A.MARGIN, h: 0.4, margin: 0, align: "center", valign: "middle", fontFace: A.FONT.head });
}

// ════════════ 요구사항 정의 → QA 도출 ① (QA1 성능 · TTFT) ════════════
{
  const s = A.slide(pptx, { title: "요구사항 정의 → QA 도출 ① — QA1 성능(TTFT)", active: 1, band: "navy", page: 7, titleSize: 23 });
  headline(s, [
    { text: "○ 논문 분석 관찰(정량 인과) → 문제 정의 → 요구사항(FR) → ", options: { fontSize: 14, color: ink } },
    { text: "품질 목표(QA) 도출", options: { fontSize: 14, bold: true, color: navy } },
  ]);

  const full = A.PAGE.w - 2 * A.MARGIN;
  // ── ① 논문 분석 — 관찰된 정량 인과 (full-width, 인과 체인) ──
  const topY = 1.66, topH = 2.28;
  A.panel(s, { x: A.MARGIN, y: topY, w: full, h: topH, fill: "FBFCFE" });
  blueHeader(s, { x: A.MARGIN + 0.12, y: topY + 0.12, w: full - 0.24, text: "① 논문 분석 — 관찰된 정량 인과 (KV cache 재사용 ⇒ TTFT)" });

  // 인과 체인 4박스 → 화살표
  const chainY = topY + 0.62, chainH = 0.86, cGap = 0.5;
  const boxW = (full - 0.4 - cGap * 3) / 4, cX0 = A.MARGIN + 0.2;
  const chain = [
    { t: "컨텍스트 길이 ↑", d: "long-context RAG·multiturn·agent", c: blue },
    { t: "KV cache 크기\n지속 증가", d: "HBM 용량 초과 (병목)", c: "B3402A" },
    { t: "KV cache 재사용", d: "매 요청 re-prefill(재계산) 회피", c: green },
    { t: "재사용률 ↑\n⇒ TTFT ↓", d: "첫 토큰 지연 단축", c: greenDark },
  ];
  chain.forEach((b, i) => {
    const x = cX0 + i * (boxW + cGap);
    s.addShape("roundRect", { x, y: chainY, w: boxW, h: chainH, rectRadius: 0.06, fill: { color: "FFFFFF" }, line: { color: b.c, width: 1.5 } });
    s.addText([
      { text: b.t, options: { fontSize: 11, bold: true, color: b.c, breakLine: true } },
      { text: b.d, options: { fontSize: 8.3, color: gray } },
    ], { x: x + 0.06, y: chainY + 0.05, w: boxW - 0.12, h: chainH - 0.1, margin: 0, align: "center", valign: "middle", fontFace: A.FONT.body, lineSpacingMultiple: 0.95 });
    if (i < 3) s.addShape("rightArrow", { x: x + boxW + 0.08, y: chainY + chainH / 2 - 0.12, w: cGap - 0.16, h: 0.24, fill: { color: navy }, line: { type: "none" } });
  });

  // 연구 방법 (밑줄 캡션 바)
  const capY = chainY + chainH + 0.16;
  s.addShape("roundRect", { x: cX0, y: capY, w: full - 0.4, h: 0.46, rectRadius: 0.05, fill: { color: "EAF3E6" }, line: { color: greenDark, width: 1 } });
  s.addText([
    { text: "본 과제 연구 방법 — ", options: { fontSize: 11.5, bold: true, color: greenDark } },
    { text: "tiered memory로 KV cache를 적절히 ", options: { fontSize: 11.5, color: ink } },
    { text: "offloading", options: { fontSize: 11.5, bold: true, color: navy } },
    { text: "(HBM→하위 tier로 내려 용량 확보) · ", options: { fontSize: 11.5, color: ink } },
    { text: "prefetching", options: { fontSize: 11.5, bold: true, color: navy } },
    { text: "(재사용 직전 상위 tier로 앞당김) ", options: { fontSize: 11.5, color: ink } },
    { text: "하여 재사용률을 높인다", options: { fontSize: 11.5, bold: true, color: greenDark } },
  ], { x: cX0 + 0.12, y: capY, w: full - 0.64, h: 0.46, margin: 0, align: "center", valign: "middle", fontFace: A.FONT.body });

  // ── ②③④ 3단 도출 흐름 ──
  const rowY = topY + topH + 0.2, rowBot = 6.55;
  const rowH = rowBot - rowY;
  const aW = 0.5, pW = (full - aW * 2) / 3;
  const px = [A.MARGIN, A.MARGIN + pW + aW, A.MARGIN + 2 * (pW + aW)];

  // ② 문제 정의
  A.panel(s, { x: px[0], y: rowY, w: pW, h: rowH, fill: "FBF3EE" });
  let hy = blueHeader(s, { x: px[0] + 0.1, y: rowY + 0.1, w: pW - 0.2, text: "② 문제 정의", fontSize: 11.5 });
  A.bulletList(s, {
    x: px[0] + 0.18, y: hy + 0.12, w: pW - 0.34, h: rowH - (hy - rowY) - 0.2, fontSize: 10,
    items: [
      "KV cache가 HBM 용량을 넘어 지속 증가 — 재사용에 필요한 저장·조회 공간이 부족하다",
      "재사용 실패 시 매 요청 전체 re-prefill → TTFT 폭증(장문일수록 심화)",
      [{ text: "핵심 긴장: ", options: { bold: true, color: "B3402A", fontSize: 10 } }, { text: "용량 한계 ↔ 재사용을 위한 상주 필요", options: { fontSize: 10, color: ink } }],
    ],
  });

  // ③ 도출 요구사항 (FR)
  A.panel(s, { x: px[1], y: rowY, w: pW, h: rowH, fill: "EAF1FB" });
  hy = blueHeader(s, { x: px[1] + 0.1, y: rowY + 0.1, w: pW - 0.2, text: "③ 도출 요구사항 (FR)", fontSize: 11.5 });
  A.bulletList(s, {
    x: px[1] + 0.18, y: hy + 0.12, w: pW - 0.34, h: rowH - (hy - rowY) - 0.2, fontSize: 10,
    items: [
      [{ text: "FR-04 KV 영속·재사용", options: { bold: true, color: navy, fontSize: 10 } }, { text: "\n세션·사용자 단위로 KV를 영속화하고 재사용", options: { fontSize: 9.3, color: ink } }],
      [{ text: "FR-02 이종 tier KV 배치", options: { bold: true, color: navy, fontSize: 10 } }, { text: "\noffloading·prefetching으로 재사용률을 높이는 메커니즘", options: { fontSize: 9.3, color: ink } }],
      [{ text: "→ 재사용률↑ = 재계산 회피 = TTFT↓의 실현 수단", options: { bold: true, color: greenDark, fontSize: 9.5 } }],
    ],
  });

  // ④ 품질 목표 (QA1)
  A.panel(s, { x: px[2], y: rowY, w: pW, h: rowH, fill: "EAF3E6" });
  hy = blueHeader(s, { x: px[2] + 0.1, y: rowY + 0.1, w: pW - 0.2, text: "④ 품질 목표 (QA)", fontSize: 11.5 });
  s.addText([
    { text: "QA1 Performance", options: { fontSize: 12, bold: true, color: greenDark, breakLine: true } },
    { text: "TTFT 단축 (prefill 축) — 지표: TTFT 단축 배율", options: { fontSize: 10, bold: true, color: navy } },
  ], { x: px[2] + 0.18, y: hy + 0.08, w: pW - 0.34, h: 0.52, margin: 0, align: "left", valign: "top", fontFace: A.FONT.body, lineSpacingMultiple: 1.0 });
  A.specTable(s, {
    x: px[2] + 0.16, y: hy + 0.66, w: pW - 0.32, colW: [1.05, pW - 0.32 - 1.05], fontSize: 8.5, headerFontSize: 8.8, headerColor: greenDark,
    header: ["구분", "정량 목표 (Exit Criteria)"],
    rows: [
      [{ text: "목표 ★★★", bold: true }, { text: [{ text: "TTFT ≥ 2×", options: { bold: true, color: navy, fontSize: 8.5 } }, { text: " (평균·p99 병행)", options: { fontSize: 8.5, color: gray } }] }],
      [{ text: "baseline", bold: true }, "GPU HBM 단일 tier (순증분 분리)"],
      [{ text: "근거", bold: true }, "CacheBlend TTFT 2.2–3.3×↓ (B)"],
    ],
  });

  // 단 사이 화살표 (②→③→④)
  [0, 1].forEach((i) => {
    s.addShape("rightArrow", { x: px[i] + pW + 0.06, y: rowY + rowH / 2 - 0.16, w: aW - 0.12, h: 0.32, fill: { color: green }, line: { type: "none" } });
  });

  bottomSummary(s, [
    { text: "재사용률 ↑ = 재계산(re-prefill) 회피 = TTFT ↓ — ", options: { fontSize: 13, color: navy, bold: true } },
    { text: "tiered memory offloading·prefetching이 그 메커니즘 → QA1 도출", options: { fontSize: 13, color: navy, bold: true } },
  ]);
}

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
