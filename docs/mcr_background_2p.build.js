// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_background_2p.build.js
// 배경·필요성을 나누지 않고 하나의 6단 논리(①~⑥)를 배경 2페이지로 전개한 버전.
//   1p: ① 병목 심화 → ② 업계의 해법 → ③ 승부처가 HW에서 런타임으로 이동 (세상 이야기)
//   2p: ④ 자사는 해법의 재료 보유 → ⑤ 실현 계층(SW 스택) 공백 → ⑥ MCR 설계 (우리 이야기)
// Images are generated locally by docs/mcr_assets/make_assets.py (web is blocked).
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_background_2p.pptx");
const img = (n) => path.join(__dirname, "mcr_assets", n);

// ───────────── 1. 과제 배경 (1/2) — 병목 · 해법 · 승부처의 이동 ─────────────
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
    { header: "③ 승부처의 이동: HW → 런타임", items: [
      { text: "해법이 만든 결정 문제: 연산 배치 × 데이터 배치가 결합 — tier·디바이스 늘수록 조합 폭증, 오결정 시 baseline보다 악화", image: img("bg_decision.png") },
      { text: "스펙과 응용 E2E 성능의 gap은 런타임이 결정 — 기존 스택(vLLM)은 'KV=HBM' 가정, 이 계층 부재", image: img("bg_gap.png") },
    ]},
  ],
});

// ───────────── 2. 과제 배경 (2/2) — 자산 · 공백 · 과제 정의 ─────────────
A.pageColumns(pptx, {
  title: "과제 배경 (2/2)", page: 2, band: "navy",
  cols: [
    { header: "④ 자사: 해법의 재료 보유", items: [
      { text: "근접 연산(PIM·CIM)부터 계층화(CXL·tiered memory)까지 — ②의 두 방향 모두 제품 포트폴리오로 확보", image: img("bg_devices.png") },
      { text: "근접연산·대역폭·용량의 상이한 축 — 조합 시 GPU HBM 단일 체계로 불가능한 설계 공간", image: img("bg_axes.png") },
    ]},
    { header: "⑤ 그러나: 실현 계층의 공백", items: [
      { text: "디바이스 가치는 단품 스펙이 아니라 응용(LLM 추론) E2E 성능으로만 실현·입증됨 (←③)", image: img("nec_missing.png") },
      { text: "단품 데모는 있어도, 포트폴리오를 응용과 연결해 시스템 관점 E2E 성능을 증명할 레퍼런스 SW 스택 부재", image: img("nec_demos.png") },
    ]},
    { header: "⑥ 과제: 메모리 중심 런타임 설계", items: [
      { text: "자사 포트폴리오를 1급 자원으로 — 배치·이동·압축·재사용을 조율하는 MCR(Memory-Centric Runtime) 설계", image: img("nec_arch.png") },
      { text: "자사 제품군의 레퍼런스 SW 스택이자, GPU HBM 단일 tier 대비 개선을 정량 입증하는 E2E 증명 수단", image: img("nec_e2e.png") },
    ]},
  ],
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
