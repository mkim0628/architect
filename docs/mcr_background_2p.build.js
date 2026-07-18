// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_background_2p.build.js
// 배경 ①~⑥ 6단 논리 (docs/mcr_background_scope.md v4와 정합):
//   1p: ① AI Agent의 특징 (장기 기억 요구 → 컨텍스트 폭증) → ② 메모리 병목 심화 (KV↑, naive offload 성능 저하) → ③ 업계 현황 (메모리 제품군 + 자사 포트폴리오)
//   2p: ④ 성능은 런타임이 실현 (결정 계층 + 동일 HW 실측 격차) → ⑤ 현 런타임은 연산기 중심 → ⑥ MCR 개발 필요
// Images are generated locally by docs/mcr_assets/make_assets.py (web is blocked).
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_background_2p.pptx");
const img = (n) => path.join(__dirname, "mcr_assets", n);

// ───────────── 1. 과제 배경 (1/2) — Agent 워크로드 · 병목 심화 · 업계 현황 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (1/2)", page: 1, band: "navy",
  cols: [
    { header: "① AI Agent 워크로드의 특징", items: [
      { text: "Agent 기본 패턴: multi-turn loop × 툴 호출 × sub-agent 분업 — 한 요청이 수십~수백 스텝의 루프로 실행되며 툴 결과가 계속 유입", image: img("ag_loop.png") },
      { text: "매 스텝이 이전 대화·툴 결과·sub-agent 산출물 참조, 기억은 세션을 넘어 축적 → 장기 기억 요구 = 컨텍스트 길이 폭증", image: img("ag_context_evidence.png") },
    ]},
    { header: "② 메모리 병목 심화", items: [
      { text: "컨텍스트 증가 → KV cache 증가(∝ 컨텍스트×동시 세션) — decode는 매 토큰 KV 전체 read, 용량·대역폭 동시 압박", image: img("bg_kv_evidence.png") },
      { text: "KV가 HBM 용량 초과 — 단순 DRAM→SSD offloading은 tier마다 ~10× 낮아지는 대역폭 계단을 그대로 노출 → 성능 급락", image: img("bg_offload_evidence.png") },
    ]},
    { header: "③ 업계 현황 — 메모리 중심 제품군", items: [
      { text: "메모리 업계의 대응: 대역폭 축 HBM 고도화·근접 연산(PIM/PNM), 용량 축 CXL 확장·신규 tier(HBF) — 계층은 5+ tier로 심화", image: img("hbm3e_photo.png") },
      { text: "자사(삼성): 근접 연산(PIM·CIM)부터 계층화(Custom HBM·HBF·CXL)까지 — 근접연산·대역폭·용량 전 축의 포트폴리오 보유", image: img("samsung_portfolio_photos.png") },
    ]},
  ],
});

// ───────────── 2. 과제 배경 (2/2) — 런타임이 성능을 실현 → 현 런타임의 한계 → MCR 필요 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (2/2)", page: 2, band: "navy",
  cols: [
    { header: "④ 성능은 런타임이 실현한다", items: [
      { text: "HW는 능력만 제공 — 데이터 배치·이동·연산 위치의 '결정'이 성능을 만들며, 이종 tier·근접연산 등장으로 결정 공간 폭발 → 결정 계층(런타임)의 비중 급증", image: img("bg_decision.png") },
      { text: "같은 HW에서 런타임만으로 처리량 2–4×(vLLM SOSP'23)·100×(FlexGen ICML'23) 격차 — HW 스펙은 상한일 뿐, 도달 성능은 런타임이 결정", image: img("bg_gap_evidence.png") },
    ]},
    { header: "⑤ 그런데 현 런타임은 연산기 중심", items: [
      { text: "GPU 중심 설계: '연산=GPU, KV=HBM' 단일 메모리 가정 — 메모리는 GPU 부속물, PIM/PNM 표현 자리 없고 HBM 초과 시 성능 급락", image: img("nec_missing.png") },
      { text: "KV를 밖으로 내리는 계층(LMCache 등)도 CPU RAM·SSD 등 commodity 저장소의 수동 백엔드 — 디바이스 특성 인지 배치·근접 연산 없음", image: img("nec_kvlayer.png") },
    ]},
    { header: "⑥ 자사 제품군의 런타임 개발 필요", items: [
      { text: "자사 포트폴리오를 1급 자원으로 — 데이터 배치·이동·압축·재사용과 연산 배치를 SLO 기준 조율하는 MCR(Memory-Centric Runtime)", image: img("nec_arch.png") },
      { text: "자사 제품군의 레퍼런스 SW 스택이자, GPU HBM 단일 tier 대비 개선을 정량 입증하는 E2E 증명 수단", image: img("nec_e2e.png") },
    ]},
  ],
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
