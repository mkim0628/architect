// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_deck.build.js
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_deck.pptx");
const navy = A.COLORS.navy;

// ───────────────── 과제 개요 (green, 2단) ─────────────────
A.pageOverview(pptx, {
  title: "과제 개요", page: 1, band: "green",
  table: [
    { label: "과제 명", lines: [
      { text: "MCR (Memory-Centric Runtime)", bullet: false, bold: true },
      { text: "계층화된 이종 메모리 기반 LLM 추론 런타임", bullet: false, fontSize: 10, color: "595959" } ] },
    { label: "과제 목표", lines: [
      "이종 메모리 시스템 위 LLM 추론 goodput@SLO 극대화 런타임(MCR) 아키텍처 설계",
      "자사 memory-centric 디바이스의 레퍼런스 SW 스택으로 성립" ] },
    { label: "참여 인력", lines: [ { text: "(미정)", bullet: false, color: "808080" } ] },
    { label: "일정", lines: [ { text: "(미정)", bullet: false, color: "808080" } ] },
  ],
  // architecture: 지시 없음 → 공란 (Overall Architecture)
});

// ───────────────── 과제 배경 (navy, 3단 × 2, 이미지 공란) ─────────────────
A.pageColumns(pptx, {
  title: "과제 배경", page: 2, band: "navy",
  cols: [
    { header: "LLM 추론 메모리 병목 심화", items: [
      { text: [{ text: "Decode 단계가 추론 시간을 지배 — memory-bandwidth-bound 연산, 자체 P/D 벤치 실측 대기시간 70–85%", options: { bullet: { characterCode: "25C6", indent: 14 }, color: navy, fontFace: A.FONT.body, fontSize: 11, breakLine: true } }] },
      { text: [{ text: "KV cache가 컨텍스트·세션 수에 비례 증가 → HBM 용량 압박, agent는 세션 넘는 장기 기억 요구", options: { bullet: { characterCode: "25C6", indent: 14 }, color: navy, fontFace: A.FONT.body, fontSize: 11, breakLine: true } }] },
    ]},
    { header: "Memory-Centric 디바이스 포트폴리오", items: [
      { text: "PIM · PNM · Custom HBM · HBF · CXL 메모리 확장 등 자사 memory-centric 제품군 확보" },
      { text: "근접연산 · 대역폭 · 용량의 서로 다른 축 → 조합 시 GPU HBM 단일 체계로 불가능한 설계 공간" },
    ]},
    { header: "문제 공간의 재정의", items: [
      { text: "연산기 중심 → 메모리 중심: '연산을 데이터가 있는 곳으로' (PIM/PNM), 배치·이동·스케줄 가정 재검토" },
      { text: "메모리 계층 심화: HBM–HBF–DRAM–CXL–SSD 5단↑ → 정적 tiering 한계, 기존 vLLM 가정 수용 불가" },
    ]},
  ],
});

// ───────────────── 과제 필요성 (navy, 2단 × 2, 이미지 공란) ─────────────────
A.pageColumns(pptx, {
  title: "과제 필요성", page: 3, band: "navy",
  cols: [
    { header: "이종 메모리 1급 런타임 아키텍처 (기술 요구)", items: [
      { text: "계층화 이종 메모리·근접연산을 1급 개념으로 수용 (←배경 1.3): topology model, 정책/메커니즘 분리, 결합방식 DP화" },
      { text: "배치×압축×재사용 joint orchestration (←배경 1.1): SLO·품질 예산 기준 공동 조율, 장기 기억까지 시간축 확장" },
    ]},
    { header: "레퍼런스 스택 & E2E 증명 (사업 가치)", items: [
      { text: "자사 메모리 제품군의 레퍼런스 SW 스택 (←배경 1.2): 응용(LLM 서빙)과 디바이스를 잇는 스택" },
      { text: "GPU HBM 단일 tier 대비 성능 개선을 정량 입증하는 E2E 증명 vehicle → 설계 산출물이자 SW 사업 자산" },
    ]},
  ],
});

// ───────────────── 과제 범위 (navy, 3단, 텍스트 전용) ─────────────────
A.pageColumns(pptx, {
  title: "과제 범위 · 목적", page: 4, band: "navy",
  cols: [
    { header: "목적", headerColor: "green", images: false, items: [
      { text: [
        { text: "계층화 이종 메모리 위 LLM 추론 goodput@SLO 극대화 런타임 MCR 아키텍처 설계", options: { bullet: { characterCode: "25C6", indent: 14 }, color: navy, bold: true, fontFace: A.FONT.body, fontSize: 12, breakLine: true, paraSpaceAfter: 8 } },
        { text: "자사 memory-centric 디바이스의 레퍼런스 스택으로 성립", options: { bullet: { characterCode: "25C6", indent: 14 }, fontFace: A.FONT.body, fontSize: 11, breakLine: true, paraSpaceAfter: 8 } },
        { text: "산출물 = 설계 과제 결과물 + 메모리 사업 SW 자산", options: { bullet: { characterCode: "25C6", indent: 14 }, fontFace: A.FONT.body, fontSize: 11, breakLine: true } },
      ] },
    ]},
    { header: "범위 (In Scope)", headerColor: "navy", images: false, items: [
      { text: [
        { text: "MCR 레퍼런스 아키텍처 설계", options: { bold: true, color: navy, fontFace: A.FONT.body, fontSize: 11, breakLine: true } },
        { text: "3-패키지(Orchestration/Inference/Memory Engine) · 공개 IF(KV Locator, CompressionOp) · Tier Topology Model plug-in", options: { bullet: { characterCode: "2013", indent: 12 }, indentLevel: 1, fontFace: A.FONT.body, fontSize: 10, breakLine: true, paraSpaceAfter: 6 } },
        { text: "핵심 설계결정(DP) 도출·평가", options: { bold: true, color: navy, fontFace: A.FONT.body, fontSize: 11, breakLine: true } },
        { text: "DP1 실행구조(vLLM 확장 vs 독립) · DP2 KV 관리주체(중앙 vs 자율) — 후보·QA평가·ADR", options: { bullet: { characterCode: "2013", indent: 12 }, indentLevel: 1, fontFace: A.FONT.body, fontSize: 10, breakLine: true, paraSpaceAfter: 6 } },
        { text: "E2E 실행경로 확보·정량 성능 증명", options: { bold: true, color: navy, fontFace: A.FONT.body, fontSize: 11, breakLine: true } },
        { text: "RAG/multiturn/agent memory 워크로드, GPU HBM baseline 대비 goodput@SLO·유효 KV capacity·품질 bound", options: { bullet: { characterCode: "2013", indent: 12 }, indentLevel: 1, fontFace: A.FONT.body, fontSize: 10, breakLine: true } },
      ] },
    ]},
    { header: "범위 외 (Out of Scope)", headerColor: "navy", images: false, items: [
      { text: [
        { text: "메모리 디바이스 HW 설계 자체 — Topology Model 파라미터(대역폭·용량·지연)로만 취급", options: { bullet: { characterCode: "25C6", indent: 14 }, fontFace: A.FONT.body, fontSize: 11, breakLine: true, paraSpaceAfter: 8 } },
        { text: "모델 학습·압축 알고리즘 자체 개발 — 기존 기법 채용, 조율 구조·정책 위치를 다룸", options: { bullet: { characterCode: "25C6", indent: 14 }, fontFace: A.FONT.body, fontSize: 11, breakLine: true, paraSpaceAfter: 8 } },
        { text: "클러스터 인프라 provisioning — desired state 산출까지가 런타임 책임, 집행은 인프라 계층 위임", options: { bullet: { characterCode: "25C6", indent: 14 }, fontFace: A.FONT.body, fontSize: 11, breakLine: true } },
      ] },
    ]},
  ],
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
