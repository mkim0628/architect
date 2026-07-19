/**
 * mcr_dp12_deck.build.js — MCR DP1·DP2 상세 덱 (DP당 2페이지 = 4장).
 * architect-ppt 스킬의 pageDpProblem / pageDpCompare 빌더 사용.
 *
 *   NODE_PATH=<pptxgenjs 위치> node docs/mcr_dp12_deck.build.js [out.pptx]
 *
 * 재설계 방침(사용자 요청):
 *   - 문제 정의 그림 = 기존 SW 구조도에서 문제를 표현. dpN_problem_arch.png는
 *     확정안 v2 패키지 구조 위에 「어디가 왜 막히는가」를 표시한 아키텍처 그림.
 *   - 그림 비중↑ · text 비중↓ : 문제 불릿을 3줄로 축약(그림을 가리키는 포인터),
 *     problemSplit=0.32(그림 68%) · topFrac=0.72(문제 행 확대).
 *   - DP 별 이미지는 따로 그림 (dp1_problem_arch / dp2_problem_arch).
 * 이미지: docs/mcr_assets/dp/dpN_problem_arch.png (신규 · 아키텍처 마찰점 그림)
 *         docs/mcr_assets/dp/dpN_c{1,2}.png (후보별 설계도 패널)
 */
const path = require("path");
const A = require(path.join(__dirname, "../.claude/skills/architect-ppt/lib/architect_deck.js"));

const ASSET = (f) => path.join(__dirname, "mcr_assets/dp", f);
const G = "1B7A4B", R = "B3402A"; // QA 우위/열위 강조색

/** 두 후보의 QA 별점 배열 → 갈리는 QA만 강조한 run 시퀀스 2개. */
function qaRuns(qa1, qa2) {
  const mk = (mine, other) => {
    const runs = [];
    mine.forEach((q, i) => {
      const diff = q.v !== other[i].v;
      const opts = diff ? { bold: true, color: q.v > other[i].v ? G : R } : {};
      runs.push({ text: `QA${i + 1} ${q.s}`, options: opts });
      if (i < mine.length - 1) runs.push({ text: " · " });
    });
    return [runs];
  };
  return [mk(qa1, qa2), mk(qa2, qa1)];
}
const q = (s, v) => ({ s, v }); // s = 표시 문자열, v = 비교값(상한 별 수)

const DPS = [
  {
    id: "DP-01", name: "실행 스택 소싱",
    problem: {
      items: [
        { text: "핵심 결정 — 실행 스택(Inference·Memory Engine)을 외부 채택할지 자체 구현할지, 그 경계선을 어디에 둘 것인가", bold: true },
        { text: "우측 구조도 ①②③ = vLLM의 「KV = GPU HBM 상주」 가정이 만드는 3대 구조적 마찰점", color: R },
        "제3 압력 — LMCache가 KV-계층 표준 선점: 경쟁(자체)할지 편승(외부)할지",
      ],
      image: ASSET("dp1_problem_arch.png"),
    },
    issues: [
      "경계선의 위치 — 차별 가치(tier-aware 배치·비연속 KV 1급 관리·근접 연산)가 외부 확장 통로(vLLM 확장점·LMCache 훅) 안에서 표현 가능한가",
      "확장점 밖 수정 지점(scheduler tier 인지, block table 일반화)이 연구·제품 가치의 핵심인가 주변부인가",
      "감당 가능한 유지보수 모델 — plugin 추종 / fork rebase / 독립 코어 / KV-계층 백엔드 추종",
      { text: "(DP2·DP6 커플링) 채택안·변형이 정책 위치와 근접연산 통로의 실현 가능 집합을 제약", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — 외부 스택 활용형 (vLLM 생태계)",
        diagram: ASSET("dp1_c1.png"),
        features: ["Inference Engine = vLLM(무수정), KV 골격은 변형 A(MCR 자체 주입)/B(LMCache 편승)로 소싱 — 자사 tier 자산은 변형 공통 모듈"],
        pros: ["생태계 무임승차 — 배칭·커널·모델 지원 흡수", "검증된 코어 · 현 자산(P/D proxy·LMCache 연동) 재사용", "초기 ≤6인월 — 연구 가설 검증 리드타임 최단"],
        cons: ["scheduler tier 비인지 — co-scheduling 이득 미회수", "비연속·압축 KV는 block table 밖 2급 시민", "\"vLLM 애드온\" 인식 리스크 (변형 B는 희석 더 강함)"],
        qa: [q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★☆", 2), q("★★★", 3)],
      },
      {
        name: "후보 2 — 자체 구현형 (독립 framework)",
        diagram: ASSET("dp1_c2.png"),
        features: ["실행 스택 전 층 자체 구현 — scheduler·block table·executor가 tier topology를 1급으로 인지 (확정안 v2의 무제약 구현)"],
        pros: ["placement×scheduling 진짜 co-design — 이론 상한 최고", "자사 HW 로드맵(HBM4·CMM-DC·HBF) 무제약 수용", "아키텍처 주도권·IP 확보"],
        cons: ["재구현 수십 인월+ — vLLM 동등 baseline 도달 리스크", "미검증 실행 코어의 수치 검증 부담", "신규 모델·기법 영구 추종 (리드타임 만성 열세)"],
        qa: [q("★★★(도달 ★☆)", 3), q("★★★", 3), q("★☆☆", 1), q("★☆☆", 1), q("★☆☆", 1)],
      },
    ],
  },
  {
    id: "DP-02", name: "KV 배치·압축의 관리 주체",
    problem: {
      items: [
        { text: "핵심 결정 — 이종 tier 위 KV의 배치·압축·이동을 누가 결정하는가: 품질 예산의 집행 주체", bold: true },
        { text: "결정에 필요한 두 정보(요청 문맥·자원 상태)가 서로 다른 패키지에 있음 — 우측 구조도의 「?」", color: R },
        "요청 문맥 = orchestration만 앎 / 자원 상태 = memory engine만 신선하게 앎 (μs~ms 변화)",
      ],
      image: ASSET("dp2_problem_arch.png"),
    },
    issues: [
      "품질 예산을 요청별로 차등 집행하려면 — 요청 문맥을 어느 레벨까지 내릴 것인가",
      "메모리 압박 스파이크 대응은 μs 반응 필요 — 어느 레벨까지 자율성을 줄 것인가",
      "Memory Engine의 독립 재사용성(타 엔진 이식·생태계 전략)을 policy 결합이 훼손하지 않는가",
      { text: "(DP1 커플링) 외부 스택에선 중앙 정책을 엔진 scheduler에 심을 수 없음 — 변형 B(LMCache)는 제약 최강", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — Orchestration 중앙 정책",
        diagram: ASSET("dp2_c1.png"),
        features: ["Scheduling에 KV Placement & Compression Policy 신설 — Router가 목표 tier·압축 수준·재사용까지 지시, Memory Engine은 집행 전담"],
        pros: ["전역 최적화 — quality-aware joint orchestration의 구현 위치", "요청별 품질 예산 중앙 집행 — 품질 편차 통제", "결정 로직 단일화 — 설명가능성"],
        cons: ["요청 단위 제어 루프 — μs 스파이크에 늦음 (tail 악화)", "tier 상태 상시 상향 보고 — 인터페이스 비대·결합도↑", "Memory Engine이 수동 executor로 격하"],
        qa: [q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★☆", 2), q("★★☆", 2)],
      },
      {
        name: "후보 2 — Memory Engine 자율 (hint)",
        diagram: ASSET("dp2_c2.png"),
        features: ["Cache Manager가 자체 정책(접근 온도·watermark) 내장 — Orchestration은 얇은 hint API(pin·priority·품질 예산)만 (madvise 모델)"],
        pros: ["μs 즉시 반응 — 압박 스파이크 흡수 (tail 방어)", "얇은 인터페이스 — DP1 후보1과 가장 정합", "Memory Engine 독립 이식성 — 생태계 전략 부합"],
        cons: ["문맥 부재 — 재사용 예정 KV 오강등, 전역 최적 미달", "품질 예산 로컬 집행 — 요청 간 품질 편차, joint orchestration 기여 소실"],
        qa: [q("★★★", 3), q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★★", 3)],
      },
    ],
  },
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, "mcr_dp12_deck.pptx");
  const pptx = A.newDeck();
  const TOTAL = DPS.length * 2;
  let page = 0;
  for (const dp of DPS) {
    page += 1;
    A.pageDpProblem(pptx, {
      title: `${dp.id}. ${dp.name} — 문제 정의`,
      page, total: TOTAL, titleSize: 22, band: "navy",
      problem: dp.problem, issues: dp.issues,
      topFrac: 0.72, problemSplit: 0.32, // 그림 비중↑(68%) · 문제 행 확대
    });
    page += 1;
    const [t1, t2] = qaRuns(dp.candidates[0].qa, dp.candidates[1].qa);
    A.pageDpCompare(pptx, {
      title: `${dp.id}. ${dp.name} — 후보구조 비교`,
      page, total: TOTAL, titleSize: 22, band: "green",
      candidates: [
        { ...dp.candidates[0], tradeoff: t1 },
        { ...dp.candidates[1], tradeoff: t2 },
      ],
    });
  }
  await A.writeDeck(pptx, out);
  console.log("written:", out, `(${TOTAL} slides)`);
})();
