// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_dp1_kv_reuse.build.js
// DP-01 (KV 캐시 재사용성 제고) 상세 2페이지 — P10 문제 정의·설계 쟁점 / P11 후보구조 비교
// 근거 체계: 요구사항 분석 v1.5 · QA 정의 v1.5 (QA1 thpt · QA2 acc · QA3 TTFT · QA4 용량 · QA5 진화성)
// 자산: docs/mcr_assets/make_dp1s1_assets.py 로 생성
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
      { text: "공백 ①(과제 필요성 Ⅱ): 재사용이 prefix 정확 일치·요청 수명에 갇혀 있고, 하위 tier 복원의 손익 판단이 없다 ⇒ 수십 k 토큰을 매 요청 전체 re-prefill — TTFT 지배 (R-03·04·05)", bold: true },
      "압력 → (커버리지 확장): RAG는 chunk 순서·프롬프트 변경만으로 prefix hit 0 — 비접두 재사용 없이는 워크로드 3종 전반 TTFT ≥ 2×(QA3) 미달 위험. CacheBlend: 비접두+선택 재계산으로 TTFT 2.2–3.3×(B)",
      "압력 ← (무손실·단순성): 비접두 재사용은 cross-attention 무시의 품질 비용 F1/Rouge-L 0.01–0.03(B) — QA2 gate(ΔF1 ≤ 1%p 요청별)와 긴장. 부분 재계산 경로는 prefill 파이프라인 코어에 배선(QA5 감점 요인)",
      "복원 역전: tier 대역폭 계단(~10×/tier)에서 SSD 복원이 재계산보다 느린 구간이 실재(C) — 판단 구조 없는 영속화는 이득을 스스로 상쇄",
    ],
    image: img("dp1s1_problem.png"),
  },
  issues: [
    "hit 판정의 주소화 방식 — prefix(radix) 트리인가, 내용 주소화(chunk) + 부분 재계산 경로 신설인가 (KV Index 구조와 prefill 실행 흐름이 갈림)",
    "영속 단위·공유 범위 — 세션 내 vs 사용자 단위, 동일 chunk의 세션 간 공유(dedup)를 인정하는가 (용량·격리에 영향)",
    "하위 tier hit의 활용 판단 — 무조건 복원(고정 규칙)인가, 복원 vs 재계산 비용 추정기(+telemetry 결합)를 두는가",
    { text: "(DP2·DP4 커플링) 재사용 대상 KV의 pruning 허용 여부는 DP2(자산 표현)가, 판단 정책이 사는 곳은 DP4(조율 주체)가 제약 — 본 DP는 두 결정의 상류 입력", color: A.COLORS.navy },
  ],
});

// ── P11. 후보구조 비교 ───────────────────────────────────────────────
A.pageDpCompare(pptx, {
  title: "DP-01. KV 캐시 재사용성 제고 — 후보구조 비교", page: 11, band: "green",
  candidates: [
    {
      name: "후보 1 — prefix 보수형 (정확 일치 · 즉시 복원)",
      diagram: img("dp1s1_c1.png"),
      features: [
        "KV Index = prefix(radix) 트리 — 접두 일치 시만 hit. 세션·사용자 영속 + hit 시 즉시 복원(고정 규칙). 신규 컴포넌트 0 — 모듈 국소 변경",
      ],
      pros: [
        "재사용에 의한 품질 저하 = 0 (구조적 보장 — QA2 ★★★의 직접 근거)",
        "인덱스·파이프라인 무변경 — KV 구조 변화(MLA 등) 수용 시 재작업 최소(QA5)",
      ],
      cons: [
        "RAG chunk 재배열에 hit 0 — 3종 워크로드 전반 TTFT 2× 미달 위험(QA3)",
        "chunk 공유 불가(세션별 중복 저장) + 복원 역전 구간 무방비(QA4·QA3)",
      ],
      tradeoff: [[
        { text: "QA1 ★★☆", options: {} },
        { text: " · " },
        { text: "QA2 ★★★", options: { bold: true, color: GREEN } },
        { text: " · " },
        { text: "QA3 ★★☆", options: { bold: true, color: RED } },
        { text: " · QA4 ★★☆ · " },
        { text: "QA5 ★★★", options: { bold: true, color: GREEN } },
        { text: "  — 무손실·단순성 축 우위 (F)" },
      ]],
    },
    {
      name: "후보 2 — 비접두 확장형 (내용 주소화 · 선택 재계산 · 비용 판단)",
      diagram: img("dp1s1_c2.png"),
      features: [
        "KV Index = 내용 주소화 chunk 인덱스(비접두 hit·chunk dedup) + prefill에 선택 재계산(HKVD) 경로 신설 + 복원 vs 재계산 비용 추정기(telemetry 결합)",
      ],
      pros: [
        "RAG 포함 전 워크로드 커버 — TTFT 2.2–3.3×(B, CacheBlend)로 QA3 bin 직접 달성",
        "chunk 공유(dedup)로 유효 용량 기여(QA4) + 비용 판단으로 복원 역전 회피",
      ],
      cons: [
        "품질 비용 0.01–0.03(B) — 요청별 bound(QA2) 집행 설계 부담·검증 비용",
        "재계산 경로가 코어 배선 — KV 구조 변화 시 인덱스·재계산 로직 재작업(QA5)",
      ],
      tradeoff: [[
        { text: "QA1 ★★☆", options: {} },
        { text: " · " },
        { text: "QA2 ★★☆", options: { bold: true, color: RED } },
        { text: " · " },
        { text: "QA3 ★★★", options: { bold: true, color: GREEN } },
        { text: " · " },
        { text: "QA4 ★★★", options: { bold: true, color: GREEN } },
        { text: " · " },
        { text: "QA5 ★★☆", options: { bold: true, color: RED } },
        { text: "  — 커버리지·용량 축 우위 (F)" },
      ]],
    },
  ],
});

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_dp1_kv_reuse.pptx")).then(() => console.log("written"));
