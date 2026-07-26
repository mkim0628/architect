// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_dp1_dp5.build.js
// KV 캐시 최적 운용 (MCR 1단계) DP1–DP5 — 설계 Point 선정 1장 + DP별 상세 2장 = 11장
// 근거: docs/02_design_points_dp1_dp5.md v1.0 · QA 정의 v1.5 (신번호 QA1 Thpt/QA2 Acc/QA3 TTFT/QA4 ResEff/QA5 Mod)
// 자산: docs/mcr_assets/make_kv_dp_assets.py
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const img = f => path.join(__dirname, "mcr_assets", "kvdp", f);
const GREEN = "1B7A4B", RED = "B3402A";

const pptx = A.newDeck();

// star run 도우미: 갈리는 QA만 색 강조
const tr = cells => [cells.flatMap((c, i) => {
  const runs = [];
  if (i) runs.push({ text: " · " });
  runs.push(typeof c === "string" ? { text: c } : { text: c[0], options: { bold: true, color: c[1] } });
  return runs;
})];

// ── P9. 설계 Point 선정 ──────────────────────────────────────────────
{
  const s = A.slide(pptx, { title: "설계 Point 선정 — KV 캐시 최적 운용 DP1–DP5", active: 2, band: "green", page: 9 });
  let y = A.sectionHeader(s, { x: A.MARGIN, y: A.CONTENT_TOP, w: 3.3, text: "구성 — 2계층 5 DP", color: "navy" });
  A.bulletList(s, {
    x: A.MARGIN, y: y + 0.06, w: 3.3, h: 4.6, items: [
      { text: "기반 결정 (집·통치)", bold: true },
      { text: "DP1 실행 스택 소싱 — 어디에 짓나", level: 1 },
      { text: "DP2 관리 주체 — 누가 다스리나", level: 1 },
      { text: "내용 결정 (공백 ①②③ 1:1)", bold: true },
      { text: "공백① 재사용 → DP3 (목표 1·QA3)", level: 1 },
      { text: "공백② 압축 → DP4 (목표 2·QA4, gate QA2)", level: 1 },
      { text: "공백③ 스케줄링 → DP5 (목표 3·QA1)", level: 1 },
      { text: "주요 Driver", bold: true },
      { text: "FR-02 재사용 · FR-03 압축 · FR-05 KV 인지 스케줄링 · C-03 training-free · QA1–QA5", level: 1 },
      { text: "의존: DP1→(2·3·5) 실현 집합 제약, DP2→(3·4·5) 정책 소재", level: 1, color: A.COLORS.navy },
    ],
  });
  const X = 4.1, W = 4.35, GAP = 0.25;
  let y1 = A.CONTENT_TOP;
  y1 = A.dpCard(s, { x: X, y: y1, w: W, id: "DP-01", title: "실행 스택 소싱", items: [
    "(1안) 외부 스택 활용형 — vLLM + 변형 A/B(LMCache)",
    "(2안) 자체 구현형 — 독립 framework",
    { text: "QA: QA1·QA3·QA4 상한 ↔ QA2·QA5·비용(≤6 vs >24인월)", color: A.COLORS.navy },
  ]}) + GAP;
  y1 = A.dpCard(s, { x: X, y: y1, w: W, id: "DP-02", title: "KV 배치·압축의 관리 주체", items: [
    "(1안) Orchestration 중앙 정책 — engine은 집행 전담",
    "(2안) Memory Engine 자율 — 얇은 힌트(madvise)",
    { text: "QA: QA2·QA4 ↔ QA1·QA5 — OS paging 동형", color: A.COLORS.navy },
  ]}) + GAP;
  A.dpCard(s, { x: X, y: y1, w: W, id: "DP-03", title: "KV 재사용 범위·복원 전략", items: [
    "(1안) 본체 융합형 — in-engine exact (layer-경계 훅)",
    "(2안) 경량 선행형 — proxy speculative (엔진 밖)",
    { text: "QA: QA2·QA3 ↔ QA1·QA5 — branch prediction 동형", color: A.COLORS.navy },
  ]});
  const X2 = X + W + 0.3;
  let y2 = A.CONTENT_TOP;
  y2 = A.dpCard(s, { x: X2, y: y2, w: W, id: "DP-04", title: "정확도 유지 KV 압축", items: [
    "(1안) 입장 시 고정 예산·단일 사본 (eager·파괴)",
    "(2안) 수명주기 적응·이중 표현 (가역·피드백)",
    { text: "QA: QA1·QA4 ↔ QA2(gate)·QA5 — pruning×재사용 충돌", color: A.COLORS.navy },
  ]}) + GAP;
  y2 = A.dpCard(s, { x: X2, y: y2, w: W, id: "DP-05", title: "KV 인지 동적 스케줄링", items: [
    "(1안) locality 우선형 — affinity + 상한부 대기",
    "(2안) 부하 우선형 — + KV 이동/재계산",
    { text: "QA: QA2·QA3 ↔ QA1·QA4·QA5 — delay scheduling 동형", color: A.COLORS.navy },
  ]}) + GAP;
  A.bulletList(s, {
    x: X2, y: y2 + 0.05, w: W, h: 1.6, items: [
      { text: "상세 근거: 02_design_points_dp1_dp5.md v1.0", color: A.COLORS.gray70 },
      { text: "각 DP 상세 2장(문제 정의·후보 비교)이 뒤따름", color: A.COLORS.gray70 },
    ],
  });
}

// ── DP-01 ────────────────────────────────────────────────────────────
A.pageDpProblem(pptx, {
  title: "DP-01. 실행 스택 소싱 — 문제 정의", page: 10, band: "navy",
  problem: {
    items: [
      { text: "실행 스택(Inference Engine + KV 계층)을 외부 생태계에서 채택하는가, 자체 구현하는가 — 목표 3축 메커니즘이 들어갈 \"집\"의 결정", bold: true },
      "압력 ①(채택): vLLM 생태계 자산(배칭·커널·모델, 2주 릴리스(B)) + LMCache KV 계층(CacheBlend 상속) — 재구현·영구 추종 비용 회피",
      "압력 ②(자체): 본체 메커니즘 3개 — layer-경계 selector 훅(DP3) · 요청별 pruning 집행점(DP4) · KV 인지 스케줄러 훅(DP5) — 이 현 확장점 밖",
      "비용 모델(구 QA6 bin 보존): 초기 ≤6인월·≤0.5 FTE(채택) vs >24인월·>2 FTE(자체) — 한 자릿수 이상 차",
    ],
    image: img("dp1_problem.png"),
  },
  issues: [
    "목표 3축 메커니즘이 확장점(KV connector·attention backend·plugin) 안에서 표현 가능한가 — 표현 불가 잔여분은 무엇인가",
    "확장점 밖 지점(layer-경계 훅·scheduler KV 인지)이 연구 가치의 핵심인가 주변부인가",
    "감당 가능한 유지보수 모델 — plugin 추종 / fork rebase / 독립 코어 / KV-계층 백엔드 추종",
    { text: "(DP2·DP3·DP5 커플링) 채택안이 정책 위치·selector 훅·스케줄러 훅의 실현 가능 집합을 제약 — 변형 B(LMCache 편승)에서 제약 최강", color: A.COLORS.navy },
  ],
});
A.pageDpCompare(pptx, {
  title: "DP-01. 실행 스택 소싱 — 후보구조 비교", page: 11, band: "green",
  candidates: [
    {
      name: "후보 1 — 외부 스택 활용형 (vLLM 생태계, 변형 A/B)",
      diagram: img("dp1_c1.png"),
      features: ["Inference Engine = vLLM 무수정. Memory Engine을 확장점으로 주입(변형 A: 골격 자체) 또는 LMCache 편승(변형 B: 백엔드·정책 훅만 자체)"],
      pros: [
        "생태계 무임승차 — 검증된 코어·2주 릴리스 흡수, 초기 ≤6인월(리드타임 최단)",
        "변형 B는 CacheBlend 비접두 재사용 직상속 — 목표 1 최단 경로",
      ],
      cons: [
        "scheduler KV 비인지 — 목표 3 이득의 처리량 전환 미회수 (QA1 상한 제한)",
        "layer-경계 selector 훅이 확장점 밖 — RFC 종속, 변형 B는 훅 소유권도 없음",
      ],
      tradeoff: tr([["QA1 ★★☆", RED], ["QA2 ★★★", GREEN], ["QA3 ★★☆", RED], ["QA4 ★★☆", RED], ["QA5 ★★☆", GREEN], "비용 ≤6인월 (F)"]),
    },
    {
      name: "후보 2 — 자체 구현형 (독립 framework)",
      diagram: img("dp1_c2.png"),
      features: ["실행 스택 전 층 자체 구현 — scheduler·block table·executor가 KV 상태(위치·압축·재사용)를 1급 인지, selector 훅·pruning 집행점 무제약 배선"],
      pros: [
        "co-design 자유 — QA1·QA3·QA4 이론 상한 최고, 2단계 접속점 보존",
        "아키텍처 주도권·IP — 독립 플랫폼 포지셔닝",
      ],
      cons: [
        "재구현 >24인월 + vLLM 동등 baseline 도달 리스크 (미달 시 두 축 무효)",
        "미검증 코어의 수치 정확성 리스크(QA2) · 모델 enablement 전체가 자체 책임(QA5)",
      ],
      tradeoff: tr([["QA1 ★★★/★☆", GREEN], ["QA2 ★☆☆", RED], ["QA3 ★★★", GREEN], ["QA4 ★★★", GREEN], ["QA5 ★☆☆", RED], "비용 >24인월 (F)"]),
    },
  ],
});

// ── DP-02 ────────────────────────────────────────────────────────────
A.pageDpProblem(pptx, {
  title: "DP-02. KV 배치·압축의 관리 주체 — 문제 정의", page: 12, band: "navy",
  problem: {
    items: [
      { text: "KV의 배치·pruning 예산·영속/축출·복원 판단·pruning×재사용 중재를 누가 결정하는가 — 정책의 소재(governance). 내용 정책의 구조는 DP3–5 소관", bold: true },
      "정보 비대칭: 요청 문맥(SLO·재사용 확률·품질 예산)은 Orchestration만, 자원 상태(잔량·대역폭·압박 스파이크 — μs 변동)는 Memory Engine만 신선하게 안다",
      "중앙이면 전역 최적·요청별 bound — 그러나 request 단위 제어 루프는 μs 스파이크에 늦다 / 자율이면 μs 반응·이식성 — 그러나 문맥 부재로 재사용 KV 오강등",
      "동형성: OS paging policy — 커널 자율 vs madvise 힌트 vs 응용 전권",
    ],
    image: img("dp2_problem.png"),
  },
  issues: [
    "요청별 품질 예산 차등 집행 — 요청 문맥을 어느 레벨까지 내리나",
    "μs 메모리 압박 스파이크 대응 — 자율성을 어느 레벨까지 주나",
    "pruning×재사용 충돌(등재 쟁점)의 중재 주체 — 로컬 규칙인가 전역 중재인가",
    { text: "(DP1 커플링) 외부 스택에선 중앙 정책을 엔진 scheduler에 심을 수 없음 — 변형 B는 정책 골격을 LMCache가 소유(중앙 정책 실현성 최소)", color: A.COLORS.navy },
  ],
});
A.pageDpCompare(pptx, {
  title: "DP-02. KV 배치·압축의 관리 주체 — 후보구조 비교", page: 13, band: "green",
  candidates: [
    {
      name: "후보 1 — Orchestration 중앙 정책 (central policy)",
      diagram: img("dp2_c1.png"),
      features: ["Scheduling에 KV Placement & Compression Policy 신설 — 목표 tier·예산·영속/축출을 요청 배치와 함께 중앙 결정, Memory Engine은 집행(mechanism) 전담"],
      pros: [
        "요청별 품질 예산의 중앙 집행 — QA2 ★★★ 조건 정면 충족, 충돌 중재 일원화",
        "SLO·재사용 확률 기반 배치 — 오강등 없이 tier·pruning 이득 온전 회수(QA4)",
      ],
      cons: [
        "request 단위 루프가 μs 스파이크에 늦음 — TPOT p99 tail 리스크(QA1)",
        "tier 상태 상시 상향 보고 — 결합도↑, Memory Engine 독립성·이식성 저하(QA5)",
      ],
      tradeoff: tr([["QA1 ★★☆", RED], ["QA2 ★★★", GREEN], "QA3 ★★☆", ["QA4 ★★★", GREEN], ["QA5 ★★☆", RED], "(F)"]),
    },
    {
      name: "후보 2 — Memory Engine 자율 (autonomous, madvise 모델)",
      diagram: img("dp2_c2.png"),
      features: ["Cache Manager가 자체 정책(온도 승격/강등·watermark pruning 트리거·로컬 축출) 내장 — Orchestration은 얇은 힌트 API(pin·priority·총 품질 예산)만"],
      pros: [
        "μs 반응 — 압박 스파이크 흡수, iso-latency 처리량 방어(QA1 최강)",
        "얇은 인터페이스·타 엔진 이식 가능 — 자사 메모리 SW 생태계 전략 부합(QA5)",
      ],
      cons: [
        "문맥 부재 — 재사용 예정 KV 오강등, SLO 구분 없는 동일 취급(QA3·QA4 감점)",
        "전역 bound만 보장 — 요청별 차등 불가(QA2 ★★★ 미달), 조율 기여 지점 소실",
      ],
      tradeoff: tr([["QA1 ★★★", GREEN], ["QA2 ★★☆", RED], "QA3 ★★☆", ["QA4 ★★☆", RED], ["QA5 ★★★", GREEN], "(F)"]),
    },
  ],
});

// ── DP-03 ────────────────────────────────────────────────────────────
A.pageDpProblem(pptx, {
  title: "DP-03. KV 재사용 범위·복원 전략 — 문제 정의", page: 14, band: "navy",
  problem: {
    items: [
      { text: "전제(확정 방향): 비접두(non-contiguous) 재사용 + 세션·사용자 영속 채택 — prefix 전용은 RAG hit 0으로 QA3(TTFT ≥2×) 커버리지 미달", bold: true },
      "비접두 재사용은 경계 토큰의 선택 재계산이 필수 — CacheBlend: 10–15% 재계산으로 TTFT 2.2–3.3×·품질 저하 0.01–0.03(B). 선택 알고리즘은 query-aware라 온라인 연산 불가피",
      "선택 알고리즘(K/V deviation·attention 선정 — 팀 연구 트랙)은 교체 가능한 mechanism — DP는 그 패밀리를 수용하는 실행 구조: 선택 연산을 어디서·언제 실행하나",
      "그 위에 복원 vs 재계산 판단(tier 계단 ~10×/tier(A) — 역전 구간 존재)이 얹힘 — 비용 추정기의 telemetry 입력 필요",
    ],
    image: img("dp3_problem.png"),
  },
  issues: [
    "선택 근거의 정확도 vs 실행 위치 — 실제 모델 연산(정확, 코어 내부) vs 경량 proxy(근사, 코어 외부)",
    "재계산율의 결정 — 전역 고정 vs SLO/품질 예산 동적 (직교 축 — 양 후보 결합 가능, 정책 소재는 DP2)",
    "복원 vs 재계산 비용 추정기의 telemetry(FR-07) 공급 경로",
    { text: "(DP1 커플링) layer-경계 훅(후보 1)의 실현성은 DP1 채택안 종속 — 변형 B에서는 훅 소유권이 LMCache라 사실상 봉쇄", color: A.COLORS.navy },
  ],
});
A.pageDpCompare(pptx, {
  title: "DP-03. KV 재사용 범위·복원 전략 — 후보구조 비교", page: 15, band: "green",
  candidates: [
    {
      name: "후보 1 — 본체 융합형 (in-engine, exact)",
      diagram: img("dp3_c1.png"),
      features: ["선택 연산을 prefill 본체 1층 연산과 융합 — 실제 K/V deviation·attention 스코어로 확정, 2층부터 선택 토큰만 재계산(로딩과 중첩). 훅 = 엔진 실행 루프(layer 경계)"],
      pros: [
        "선택 근거 = 실제 모델 연산 — 근사 오차 0 (QA2 최선)",
        "문헌 실측 앵커 구조 — TTFT 2.2–3.3×(B) 직도달 (QA3)",
      ],
      cons: [
        "엔진 코어 배선 — 릴리스 추종·교체 리스크(QA5), DP1 확장점 제약 정면 노출",
        "선택 연산이 피크 GPU 임계 자원 소비 — batch 여력 잠식(QA1)",
      ],
      tradeoff: tr([["QA1 ★★☆", RED], ["QA2 ★★★", GREEN], ["QA3 ★★★", GREEN], "QA4 ★★☆", ["QA5 ★★☆", RED], "(F)"]),
    },
    {
      name: "후보 2 — 경량 선행형 (proxy, speculative)",
      diagram: img("dp3_c2.png"),
      features: ["retrieval 직후(prefill 전, query 존재) 경량 proxy(축소 모델/저차원 근사 — CPU·보조 스트림)로 선행 계산 — prefill 시작 시 재계산·로딩 계획 확정, 로딩∥재계산∥prefetch 극대"],
      pros: [
        "엔진 무수정 — proxy 교체 = 알고리즘 교체, 팀 연구 릴리스 트랙 정합(QA5)",
        "선택 연산이 GPU 임계 경로 밖(QA1) + 선행 확정의 파이프라인 이득",
      ],
      cons: [
        "근사 오차 — 정찰 오류 시 ΔF1 리스크, 방어하려면 재계산율 보수 상향 → TTFT 반납(QA2↔QA3 연쇄)",
        "proxy 재교정 관리(모델 변경 시)",
      ],
      tradeoff: tr([["QA1 ★★★", GREEN], ["QA2 ★★☆", RED], ["QA3 ★★☆", RED], "QA4 ★★☆", ["QA5 ★★★", GREEN], "(F)"]),
    },
  ],
});

// ── DP-04 ────────────────────────────────────────────────────────────
A.pageDpProblem(pptx, {
  title: "DP-04. 정확도를 유지한 KV 캐시 압축 — 문제 정의", page: 16, band: "navy",
  problem: {
    items: [
      { text: "pruning은 용량·대역폭에 동시 작용하는 주 기법(H2O 예산 20% = 산술 5× · SnapKV 3.6×(B)) — 미결은 \"언제 집행하고 무엇을 남기나\"(집행 시점 × 자산 표현)", bold: true },
      "최대 절감 압력: 일찍·공격적으로 확정할수록 저장·이동·읽기 전 경로가 가벼움 — QA1(≥2×)·QA4(≥3×) 최단 경로",
      "품질·재사용 압력: 토큰 중요도는 현재 쿼리 기준(SnapKV(B))인데 KV는 미래 쿼리용 영속(FR-02) — 불가역 pruning은 요청별 ΔF1 bound를 깨뜨림 (pruning×재사용 충돌, 등재 쟁점)",
      "C-03 training-free — 지운 것의 재학습 회복 배제. 동형성: 파괴적 compaction vs 원본 보존 계층화(파생 뷰)",
    ],
    image: img("dp4_problem.png"),
  },
  issues: [
    "집행 시점 — prefill 직후 1점(입장 시 확정)인가, KV 수명주기 전반 분산인가",
    "예산 결정 — 전역 고정인가, 요청별 품질 예산 연동(FR-07 피드백 루프)인가",
    "자산 표현 — pruned 유일 사본인가, 원본(하위 tier)·파생(pruned view) 이중 표현인가 — 가역성 ↔ 풋프린트",
    { text: "(DP2·DP3 커플링) 예산 배분·충돌 중재의 소재는 DP2 종속, 원본 보존 여부가 DP3 선택 재계산의 품질 상한을 결정", color: A.COLORS.navy },
  ],
});
A.pageDpCompare(pptx, {
  title: "DP-04. 정확도를 유지한 KV 캐시 압축 — 후보구조 비교", page: 17, band: "green",
  candidates: [
    {
      name: "후보 1 — 입장 시 고정 예산·단일 사본형 (eager, 파괴적)",
      diagram: img("dp4_c1.png"),
      features: ["prefill 종료 훅 1점에서 전역 예산(예: 20%)으로 pruning 확정 — pruned KV가 유일 사본으로 저장·영속·재사용 전 경로를 탐. 신설: Prefill-exit Pruner"],
      pros: [
        "전 경로 경량 — decode 읽기량 즉감(QA1)·산술 5× 용량(QA4)",
        "훅 1점·사본 1개 — 구조 최소, 정합성 문제 없음",
      ],
      cons: [
        "불가역 — 미래 쿼리·재사용 요청의 bound 보장 실패 리스크(QA2, 충돌 정면 노출)",
        "예산·알고리즘이 자산에 각인 — 정책·기법 교체 시 영속 KV 전량 재생성(QA5)",
      ],
      tradeoff: tr([["QA1 ★★★", GREEN], ["QA2 ★☆☆", RED], "QA3 ★★☆", ["QA4 ★★★", GREEN], ["QA5 ★★☆", RED], "(F)"]),
    },
    {
      name: "후보 2 — 수명주기 적응·이중 표현형 (adaptive, 가역)",
      diagram: img("dp4_c2.png"),
      features: ["원본은 하위 tier 보존(파괴 대신 강등), 상위 tier에 요청별 품질 예산의 파생 pruned view 상주 — KV Index 이중 표현 + 품질 피드백 루프(FR-07)로 수명주기 재조정"],
      pros: [
        "가역 — 요청별 ΔF1 bound 집행, pruning×재사용 충돌을 구조로 해소(QA2)",
        "알고리즘 교체 = 파생 재생성만 — 원본 무손실, 연구 트랙 정합(QA5)",
      ],
      cons: [
        "이중 사본의 하위 tier 용량 잠식 + 원본–파생 정합성 관리(QA4)",
        "view 생성·재평가 연산이 피크 자원 일부 소비(QA1)",
      ],
      tradeoff: tr([["QA1 ★★☆", RED], ["QA2 ★★★", GREEN], "QA3 ★★☆", ["QA4 ★★☆", RED], ["QA5 ★★★", GREEN], "(F)"]),
    },
  ],
});

// ── DP-05 ────────────────────────────────────────────────────────────
A.pageDpProblem(pptx, {
  title: "DP-05. KV 캐시 인지형 동적 스케줄링 — 문제 정의", page: 18, band: "navy",
  problem: {
    items: [
      { text: "현행 스케줄러는 KV-blind — locality 비인지 라우팅 + 포화 시 preemption뿐: 재사용·압축이 만든 이득이 시스템 처리량으로 전환되지 못함(목표 3)", bold: true },
      "locality 압력: 재사용 hit는 KV가 있는 곳에서만 난다(TTFT·QA3 직결) — 그런데 인기 컨텍스트가 있는 곳은 이미 붐빈다(인기 KV = 인기 인스턴스)",
      "균형 압력: iso-latency 처리량(QA1)은 배치 균형이 결정 — 균형을 따르면 GB급 KV 이동(전송·복원)이나 재계산을 문다",
      "동형성: data locality vs load balancing — Hadoop delay scheduling(EuroSys'10)·NUMA affinity(B). 단 KV는 GB급이라 이동 비용이 크고, 재계산이 대체재",
    ],
    image: img("dp5_problem.png"),
  },
  issues: [
    "라우팅 1차 기준 — KV 위치(affinity, 대기 지불)인가 부하(균형, 이동·재계산 지불)인가",
    "KV 공간 확보의 선택 구조 — pruning 상향/강등/축출/preempt 중 무엇을 (QA1 rubric의 문헌 공백 지점, 실현 형태는 DP4 자산 표현 종속)",
    "스케줄러의 KV 가시성 — KV Index 직조회 vs 요약 힌트 — 결합도 ↔ 결정 품질",
    { text: "(DP1·DP2 커플링) scheduler 훅 실현성은 DP1 채택안, 확보·배치 정책의 소재는 DP2 채택안에 종속", color: A.COLORS.navy },
  ],
});
A.pageDpCompare(pptx, {
  title: "DP-05. KV 캐시 인지형 동적 스케줄링 — 후보구조 비교", page: 19, band: "green",
  candidates: [
    {
      name: "후보 1 — locality 우선형 (KV-affinity 라우팅 + 지연 대기)",
      diagram: img("dp5_c1.png"),
      features: ["Router가 KV Index를 조회해 재사용 KV가 있는 인스턴스·tier로 배치(affinity) — 포화 시 상한부 지연 대기(delay scheduling), 임계 초과 시만 차선지. 신설: KV-aware Router + delay 큐"],
      pros: [
        "hit rate 극대 — 재사용 배율(CacheBlend·prefix(B))을 라우팅이 깎지 않음(QA3)",
        "축출·이동 최소 — 품질 영향원 접촉 최소(QA2)",
      ],
      cons: [
        "hotspot — 인기 인스턴스에 부하·용량 압박 집중, TPOT tail 악화(QA1)·국소 포화(QA4)",
        "Router↔KV Index 결합(control↔data plane) + head-of-line 대기(QA5)",
      ],
      tradeoff: tr([["QA1 ★★☆", RED], ["QA2 ★★★", GREEN], ["QA3 ★★★", GREEN], ["QA4 ★★☆", RED], ["QA5 ★★☆", RED], "(F)"]),
    },
    {
      name: "후보 2 — 부하 우선형 (+ KV 이동/재계산)",
      diagram: img("dp5_c2.png"),
      features: ["Router는 부하 지표·요약 힌트만으로 균형 배치 — KV 없는 곳에 배치된 요청은 KV Transport로 전송·복원하거나 비용 우위면 재계산(DP3 비용 추정기 재사용)"],
      pros: [
        "배치 균형 — TPOT p99 방어, iso-latency 처리량 최대(QA1)",
        "전 노드·전 tier 용량 균등 활용(QA4), Index 무결합 — 코어 변경 0 경로(QA5)",
      ],
      cons: [
        "GB급 KV 전송·복원(tier 계단 ~10×/tier(A))이 hit 이득을 부분 반납(QA3)",
        "부하 사유의 강등·축출이 품질 예산과 무관 발생 — 품질 blind 리스크(QA2)",
      ],
      tradeoff: tr([["QA1 ★★★", GREEN], ["QA2 ★★☆", RED], ["QA3 ★★☆", RED], ["QA4 ★★★", GREEN], ["QA5 ★★★", GREEN], "(F)"]),
    },
  ],
});

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_dp1_dp5.pptx")).then(() => console.log("written"));
