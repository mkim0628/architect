// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_dp1_kv_reuse.build.js
// DP-01 (KV 캐시 재사용성 제고) 상세 2페이지 — P10 문제 정의·설계 쟁점 / P11 후보구조 비교
// 방향(전제): 비접두(non-contiguous) 재사용 채택 — prefix 전용으로는 RAG 커버리지 미달(확정 방향).
// baseline: CacheBlend(비접두 재사용 + 고정 비율 선택 재계산). 후보 = baseline 잔여 문제를
// 개선하는 자체 설계안 2개 — C1 사전 가공형(store-time eager) vs C2 요청 적응형(read-time lazy).
// 근거 체계: 요구사항 분석 v1.5 · QA 정의 v1.5. 자산: docs/mcr_assets/make_dp1s1_assets.py
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const img = f => path.join(__dirname, "mcr_assets", f);
const GREEN = "1B7A4B", RED = "B3402A";

const pptx = A.newDeck();

// ── P10. 문제 정의 · 설계 쟁점 ────────────────────────────────────────
A.pageDpProblem(pptx, {
  title: "DP-01. KV 캐시 재사용성 제고 — 문제 정의", page: 10, band: "navy",
  problem: {
    items: [
      { text: "방향(전제): 비접두(non-contiguous) 재사용 채택 — prefix 전용은 RAG에서 hit 0이라 QA3(TTFT ≥2×) 커버리지 미달. baseline = CacheBlend(비접두 + 고정 비율 선택 재계산, TTFT 2.2–3.3×(B))", bold: true },
      { text: "문제: baseline을 채택해도 잔여 상한(floor)이 남는다 — 본 DP는 이 잔여를 깎는 자체 개선 구조의 결정", bold: true },
      "잔여 ①: 선택 재계산(HKVD 10–15%(B))과 chunk KV 로딩 I/O가 여전히 온라인 임계 경로에 있음 — 하위 tier일수록 I/O 노출 확대, TTFT 하한 형성",
      "잔여 ②: 재계산 비율이 정적·전역 고정 — 요청별 품질 예산(QA2 요청별 bound)과 무관하게 일률 적용",
      "잔여 ③: 적용 범위가 요청 파이프라인에 한정 — 세션·사용자 영속(multiturn·agent)은 수동적 저장뿐, 무엇을 상위 tier에 두는가의 결정 부재",
    ],
    image: img("dp1s1_problem.png"),
  },
  issues: [
    "잔여 작업(blend·배치)을 언제 수행하나 — 쓰기/유휴 시점(사전 가공)인가, 읽기 시점(요청 적응)인가 — eager vs lazy의 고전 축",
    "재계산 비율의 결정 주체 — 사전 확정(가공 시점 고정)인가, 요청별 품질 예산 연동(SLO/bound 기반 동적)인가",
    "상위 tier 상주 대상의 선정 — 인기도/조합 예측(사전 승격)인가, 접근 시점 승격(LRU류)인가 — 예측 실패 시 낭비의 귀속",
    { text: "(DP2·DP4 커플링) 가공본(fused KV)의 pruning 허용·사본 관리는 DP2(자산 표현)가, 예측·예산 정책이 사는 곳은 DP4(조율 주체)가 제약", color: A.COLORS.navy },
  ],
});

// ── P11. 후보구조 비교 ───────────────────────────────────────────────
A.pageDpCompare(pptx, {
  title: "DP-01. KV 캐시 재사용성 제고 — 후보구조 비교", page: 11, band: "green",
  candidates: [
    {
      name: "후보 1 — 사전 가공형 (store-time pre-blend, eager)",
      diagram: img("dp1s1_c1.png"),
      features: [
        "유휴/저부하 시간에 인기 chunk 조합을 미리 blending(Background KV Refiner) 후 상위 tier에 상주(warm) — 온라인 hit 경로는 순수 load. 신규: 백그라운드 가공기 + 인기도/조합 예측기 + 승격 경로",
      ],
      pros: [
        "온라인 경로에서 재계산·복원 제거 — baseline 잔여 ①을 구조적으로 소거(QA3 상한 돌파)",
        "가공·승격이 유휴 시간대 자원 사용 — 피크 prefill 자원 보존(QA1)",
      ],
      cons: [
        "조합 예측 실패 = 사전 연산·저장 낭비, fused 사본의 신선도·일관성 관리(QA4 감점)",
        "재계산율이 가공 시점에 확정 — 요청별 품질 예산 대응 불가, 전역 bound만(QA2 ★★☆ 조건)",
      ],
      tradeoff: [[
        { text: "QA1 ★★★", options: { bold: true, color: GREEN } },
        { text: " · " },
        { text: "QA2 ★★☆", options: { bold: true, color: RED } },
        { text: " · " },
        { text: "QA3 ★★★", options: { bold: true, color: GREEN } },
        { text: " · " },
        { text: "QA4 ★★☆", options: { bold: true, color: RED } },
        { text: " · QA5 ★★☆  — 지연·피크 자원 축 우위 (F)" },
      ]],
    },
    {
      name: "후보 2 — 요청 적응형 (read-time adaptive recompute, lazy)",
      diagram: img("dp1s1_c2.png"),
      features: [
        "저장은 원본 chunk 그대로 — hit 시점에 요청별 품질 예산(SLO/bound)으로 재계산율을 동적 결정(Quality-budget Controller)하고 로딩∥재계산을 중첩(pipelining). 신규: 예산 컨트롤러 + 중첩 스케줄",
      ],
      pros: [
        "낭비 0 — 쓰이는 요청만 계산·원본만 저장, 신선도 문제 없음(QA4)",
        "요청별 bound 집행과 직결 — 예산 여유 요청은 재계산↑로 품질 방어(QA2 ★★★ 조건 충족)",
      ],
      cons: [
        "재계산·I/O가 온라인 임계 경로에 잔존 — TTFT 개선이 중첩 효율의 한계에 막힘(QA3)",
        "피크 시간에 재계산 수행 — prefill 자원 소비가 batch 여력 잠식(QA1)",
      ],
      tradeoff: [[
        { text: "QA1 ★★☆", options: { bold: true, color: RED } },
        { text: " · " },
        { text: "QA2 ★★★", options: { bold: true, color: GREEN } },
        { text: " · " },
        { text: "QA3 ★★☆", options: { bold: true, color: RED } },
        { text: " · " },
        { text: "QA4 ★★★", options: { bold: true, color: GREEN } },
        { text: " · QA5 ★★☆  — 품질 집행·용량 축 우위 (F)" },
      ]],
    },
  ],
});

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_dp1_kv_reuse.pptx")).then(() => console.log("written"));
