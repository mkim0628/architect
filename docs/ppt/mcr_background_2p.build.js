// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/ppt/mcr_background_2p.build.js
// 배경 ①~⑥ 6단 논리 (docs/md/mcr_background_scope.md v4와 정합):
//   1p: ① AI Agent의 특징 (장기 기억 요구 → 컨텍스트 폭증) → ② 메모리 병목 심화 (KV↑, naive offload 성능 저하) → ③ 업계 현황 (메모리 제품군 + 자사 포트폴리오)
//   2p: ④ 성능은 런타임이 실현 (결정 계층 + 동일 HW 실측 격차) → ⑤ 현 런타임은 연산기 중심 → ⑥ MCR 개발 필요
// Images are generated locally by docs/ppt/mcr_assets/make_assets.py (web is blocked).
const path = require("path");
const A = require(path.join(__dirname, "..", "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_background_2p.pptx");
const img = (n) => path.join(__dirname, "mcr_assets", n);

// ───────────── 1. 과제 배경 (1/2) — Agent 워크로드 · 병목 심화 · 업계 현황 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (1/2)", page: 1, band: "navy",
  cols: [
    { header: "① AI Agent 워크로드의 특징", items: [
      { text: "Agent 기본 패턴: multi-turn loop × 툴 호출 × sub-agent 분업 — 한 요청이 수십~수백 스텝의 루프로 실행되며 툴 결과가 계속 유입", image: img("ag_loop.png") },
      { text: "매 스텝이 이전 대화·툴 결과·sub-agent 산출물 참조, 기억은 세션을 넘어 축적 → 장기 기억 요구 = 컨텍스트 길이 폭증", image: img("ag_context.png") },
    ]},
    { header: "② 메모리 병목 심화", items: [
      { text: "컨텍스트 증가 → KV cache 증가(∝ 컨텍스트×동시 세션) — decode는 매 토큰 KV 전체 read, 용량·대역폭 동시 압박", image: img("bg_kv_evidence.png") },
      { text: "KV가 HBM 용량 초과 — 단순 DRAM→SSD offloading은 tier마다 ~10× 낮아지는 대역폭 계단을 그대로 노출 → 성능 급락", image: img("bg_offload.png") },
    ]},
    { header: "③ 업계 현황 — 메모리 중심 제품군", items: [
      { text: "메모리 업계의 대응: 대역폭 축 HBM 고도화·근접 연산(PIM/PNM), 용량 축 CXL 확장·신규 tier(HBF) — 계층은 5+ tier로 심화", image: img("industry_products_photos.png") },
      { text: "자사(삼성): 근접 연산(PIM·CIM)부터 계층화(Custom HBM·HBF·CXL)까지 — 근접연산·대역폭·용량 전 축의 포트폴리오 보유", image: img("samsung_portfolio_photos.png") },
    ]},
  ],
});

// ───────────── 2. 과제 배경 (2/2) — 런타임이 성능을 실현 → 현 런타임의 한계 → MCR 필요 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (2/2)", page: 2, band: "navy",
  cols: [
    { header: "④ 런타임 스택의 중요도", items: [
      { subtitle: "AI 씬의 승부처 = 실행 계층(런타임)",
        text: "배치·이동·스케줄링을 결정하는 실행 계층 — 업계 전체가 자체 런타임(TensorRT-LLM·ONNX Runtime·vLLM·SGLang)에 투자, CUDA 해자도 실리콘 아닌 SW 스택", image: img("bg_stack_runtime.png") },
      { subtitle: "같은 HW, 관리 정책만으로 갈린 성능",
        text: "커널을 빠르게 한 게 아니라 메모리 관리(vLLM, paging)·배치 정책(FlexGen, offloading)만 바꿔 2–4×·100× 격차 — 컴파일 축과 독립인 동적 자원 관리 축의 지렛대", image: img("bg_gap_evidence.png") },
    ]},
    { header: "⑤ 그런데 현 런타임은 연산기 중심", items: [
      { subtitle: "GPU 중심 설계 — 메모리는 부속물",
        text: "'연산=GPU, KV=HBM' 가정 — KV가 HBM을 넘는 순간 선점·재계산·스왑으로 성능 급락, DRAM·CXL·HBF tier와 PIM/PNM은 런타임에 보이지도 않음", image: img("nec_gpu_limit.png") },
      { subtitle: "KV를 내리는 계층도 '넣고 꺼내기'뿐",
        text: "LMCache 등이 KV를 CPU RAM·SSD로 내려 보관하지만 하는 일은 넣고 꺼내기가 전부 — 어떤 KV를 어느 tier에 둘지, 연산을 데이터 쪽으로 보낼지는 판단하지 못함", image: img("nec_kvlayer.png") },
    ]},
    { header: "⑥ 자사 제품군의 런타임 개발 필요", items: [
      { subtitle: "기존 런타임과 다른 점 — 결정을 내린다",
        text: "요청 SLO 기준으로 hot KV는 HBM·warm은 CXL·cold는 압축해 flash에 배치하고, attention 연산은 PIM으로 보내 이동 자체를 절감 — '밀려나면 내리는' 기존 방식과의 차이", image: img("nec_mcr_diff.png") },
      { subtitle: "레퍼런스 스택 · E2E 정량 증명",
        text: "자사 제품군의 레퍼런스 SW 스택이자, GPU HBM 단일 tier 대비 개선을 정량 입증하는 E2E 증명 수단", image: img("nec_e2e.png") },
    ]},
  ],
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
