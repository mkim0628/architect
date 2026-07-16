// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_background_2p.build.js
// 배경 ①~⑤ 5단 논리 (docs/mcr_background_scope.md v2와 정합):
//   1p: ① 병목 심화 → ② 업계의 메모리 중심 해법 → ③ 자사도 두 방향 제품군 보유
//   2p: ④ 현재 런타임의 한계 (vLLM 단일 메모리 가정 + LMCache 등 KV 계층의 한계) → ⑤ MCR 개발 필요
// Images are generated locally by docs/mcr_assets/make_assets.py (web is blocked).
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_background_2p.pptx");
const img = (n) => path.join(__dirname, "mcr_assets", n);

// ───────────── 1. 과제 배경 (1/2) — 병목 · 해법 · 자사의 재료 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (1/2)", page: 1, band: "navy",
  cols: [
    { header: "① AI 메모리 병목 심화", items: [
      { text: "대역폭 병목: decode가 추론 시간 지배 — 매 토큰 KV cache 전체 read, 컨텍스트 폭증으로 심화", image: img("bg_decode.png") },
      { text: "용량 병목: KV cache ∝ 컨텍스트×동시 세션 → HBM 압박, agent 장기 기억이 구조적으로 심화", image: img("bg_kv.png") },
    ]},
    { header: "② 업계의 대응 — 메모리 중심 해법", items: [
      { text: "대역폭 병목 → 근접 연산(PIM/PNM): 연산을 데이터가 있는 곳으로 보내 이동량 자체를 절감", image: img("bg_shift.png") },
      { text: "용량 병목 → 계층화(tiered offloading): 하위 tier로 내리고 필요 시 회수, HBM 밖 용량 확장", image: img("bg_hierarchy.png") },
    ]},
    { header: "③ 자사: 두 방향 모두 제품군 보유", items: [
      { text: "근접 연산(PIM·CIM)부터 계층화(Custom HBM·HBF·CXL)까지 — ②의 두 방향 모두 제품 포트폴리오로 확보", image: img("bg_devices.png") },
      { text: "근접연산·대역폭·용량의 상이한 축 — 조합 시 새 설계 공간, 병목을 풀 하드웨어 재료는 갖춰짐", image: img("bg_axes.png") },
    ]},
  ],
});

// ───────────── 2. 과제 배경 (2/2) — 현재 런타임의 한계 → MCR 필요 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (2/2)", page: 2, band: "navy",
  cols: [
    { header: "④ 현재 런타임은 이 재료를 활용하지 못한다", items: [
      { text: "GPU 중심 설계: 'KV=HBM' 단일 메모리 가정 — 메모리 관리·offloading 정책만으로 성능 2–4×~100× 격차 실증(vLLM SOSP'23 · FlexGen ICML'23)", image: img("bg_gap.png") },
      { text: "KV를 밖으로 내리는 계층(LMCache 등)도 CPU RAM·SSD 등 commodity 저장소의 수동 백엔드 — 디바이스 특성 인지 배치·근접 연산 없음", image: img("nec_kvlayer.png") },
    ]},
    { header: "⑤ 자사 제품군을 활용하는 런타임 개발 필요", items: [
      { text: "자사 포트폴리오를 1급 자원으로 — 데이터 배치·이동·압축·재사용과 연산 배치를 SLO 기준 조율하는 MCR(Memory-Centric Runtime)", image: img("nec_arch.png") },
      { text: "자사 제품군의 레퍼런스 SW 스택이자, GPU HBM 단일 tier 대비 개선을 정량 입증하는 E2E 증명 수단", image: img("nec_e2e.png") },
    ]},
  ],
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
