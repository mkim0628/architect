/**
 * mcr_dp_deck.build.js — MCR DP1~DP8 상세 덱 (DP당 2페이지 = 16장).
 * architect-ppt 스킬의 pageDpProblem / pageDpCompare 빌더 사용.
 *
 *   NODE_PATH=<pptxgenjs 위치> node docs/ppt/mcr_dp_deck.build.js [out.pptx]
 *
 * 내용 출처: docs/md/02·03·04·05_design_points_*.md (요약 발췌 — 별점은 QA 평가표 그대로).
 * 이미지: docs/ppt/mcr_assets/dp/dpN_problem.png (문제 정의 그림, 생성)
 *         docs/ppt/mcr_assets/dp/dpN_c{1,2}.png (diagrams/dpN_candidates.svg 패널 크롭)
 */
const path = require("path");
const A = require(path.join(__dirname, "../../.claude/skills/architect-ppt/lib/architect_deck.js"));

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
        { text: "실행 스택(Inference·Memory Engine)을 외부에서 채택하는가, 자체 구현하는가 — 자체 구현의 경계선", bold: true },
        "자체 압력: vLLM은 KV의 GPU HBM 상주를 가정 — block table 이분법 · scheduler tier 비인지 · connector 용도 제한",
        "외부 압력: 생태계가 주 단위 갱신 — 재구현·영구 추종 비용, \"vLLM 동등 baseline 도달\" 자체가 대형 프로젝트",
        "제3 압력: KV-계층(LMCache) 생태계 선점 — 경쟁할지(변형 A·후보2) 그 위에 올라탈지(변형 B)",
      ],
      image: ASSET("dp1_problem.png"),
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
        { text: "이종 tier 위 KV의 배치·압축·이동을 누가 결정하는가 — 품질 예산의 집행 주체 문제", bold: true },
        "요청 문맥은 orchestration만 안다 — SLO class·재사용 확률·품질 예산 (실측 decode wait 70–85%)",
        "자원 상태는 memory engine만 신선하게 안다 — tier 잔량·대역폭 포화, μs~ms 단위 변화",
        "압축의 품질 비용(K>V sensitivity) + 재사용의 위치 비용 — OS paging policy 위치 논쟁과 동형",
      ],
      image: ASSET("dp2_problem.png"),
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
  {
    id: "DP-03", name: "KV 재사용 범위·복원 전략",
    problem: {
      items: [
        { text: "무엇을 어디까지 재사용하고, 위치가 어긋난 KV를 어떻게 복원하는가", bold: true },
        "넓히는 압력: RAG의 동일 chunk가 요청마다 다른 위치 — CacheBlend 비연속 재사용 TTFT 2.2–3.3×·처리율 2.8–5×(B)",
        "좁히는 압력: RoPE 위치가 KV에 구워짐 — exact-prefix만 품질 저하 0, 비연속은 Index·복원 파이프라인 복잡도",
        "스토리지 dedup의 fixed vs content-defined chunking 논쟁과 동형",
      ],
      image: ASSET("dp3_problem.png"),
    },
    issues: [
      "재사용 단위 — block-aligned prefix 해시인가, 의미 단위 content-hash chunk인가 (KV Index 키 스키마)",
      "위치 불일치 복원 — 근사 사용(품질 비용) vs selective recompute(연산 비용)의 판단 기준·시점",
      "Index 유지 비용 — infix lookup 자료구조와 eviction 일관성을 Cache Manager가 감당 가능한가",
      { text: "(DP1·DP2 커플링) 비연속 KV는 block table 밖 — 재사용/재계산 판단은 품질 예산 집행 주체에 종속", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — Exact-prefix 재사용",
        diagram: ASSET("dp3_c1.png"),
        features: ["KV Index = 블록 단위 prefix 해시 체인 — 일치 구간만 그대로 사용, 복원 경로 없음 (vLLM prefix caching의 tier 확장판)"],
        pros: ["재사용발 품질 저하 구조적 0", "대규모 검증된 경로 — DP1 외부 스택과 완전 호환", "Index 단순 — eviction 일관성 용이"],
        cons: ["RAG 비연속 공유 chunk 히트 불가", "재사용률 상한이 워크로드 prefix 구조에 갇힘", "TTFT 개선 여지 대부분(비연속 기회) 포기"],
        qa: [q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★★", 3)],
      },
      {
        name: "후보 2 — 비연속 chunk + selective recompute",
        diagram: ASSET("dp3_c2.png"),
        features: ["content-hash chunk 단위 KV Index(prefix/infix) + 위치 불일치 chunk의 경계 토큰 10–15%만 재계산하는 복원 파이프라인 (CacheBlend형)"],
        pros: ["TTFT 2.2–3.3× · 처리율 2.8–5× (CacheBlend, B)", "chunk 전역 dedup — 유효 KV 용량 동반 상승", "재사용 축 joint orchestration 기여 성립"],
        cons: ["위치 근사·부분 재계산의 품질 비용 — bound 관리 필요", "Index·복원·판정 로직 신규 복잡도 (6–24인월)", "block table 밖 1급 KV 전제 — DP1 긴장"],
        qa: [q("★★★(도달 ★★☆)", 3), q("★★★", 3), q("★★☆", 2), q("★★☆", 2), q("★★☆", 2)],
      },
    ],
  },
  {
    id: "DP-04", name: "Tier Topology 추상화 수준",
    problem: {
      items: [
        { text: "Tier Topology Model이 하드웨어를 얼마나 자세히 표현하는가 — 수치 튜플 vs capability", bold: true },
        "억제 압력: \"디바이스마다 재설계하지 않는 구조\"(필요성 2.1) — 어댑터 1모듈·코어 0의 QA4 ★★★ bin",
        "노출 압력: PIM 근접연산·HBF 영속·CXL 공유는 (BW,용량,지연)으로 표현 불가 — E2E 증명 vehicle(2.3)과 정면 충돌",
        "OS 블록 추상화 vs ZNS/DAX 논쟁과 동형 — capability를 노출해야만 잡히는 이득",
      ],
      image: ASSET("dp4_problem.png"),
    },
    issues: [
      "표현력의 잔여분 — 근접연산·영속성·공유성 중 무엇이 수치 튜플 밖에 남는가",
      "파급 통제 — capability×정책 코드 분기·검증 매트릭스가 \"재설계 없는 구조\" 약속을 침식하는가",
      "이식성 vs 증명 — 범용 레퍼런스 지위와 자사 디바이스 증명 vehicle 중 우선순위 (사업 전략 결정)",
      { text: "(DP2·DP5 커플링) capability는 배치 정책 입력이며 SHARED는 DP5 후보2의 하드 전제", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — 공통 파라미터형",
        diagram: ASSET("dp4_c1.png"),
        features: ["tier 목록 × 수치 프로파일(대역폭·용량·지연) — 정책·커널은 수치만 소비하는 단일 코드 경로, 디바이스 추가 = 프로파일 등록 + DMA 어댑터 1모듈"],
        pros: ["QA4 ★★★ bin 정면 충족 — 무재설계 수용", "단일 경로 — 검증 매트릭스 최소", "타 엔진·타사 HW 이식성 최대 (범용 레퍼런스)"],
        cons: ["PIM in-place 압축·HBF 영속·CXL 공유 표현 불가", "압축/해제가 GPU 사이클 잠식 — 성능 상한 제한", "DP5 후보2·DP6 원천 배제 — 증명 vehicle 약화"],
        qa: [q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★★", 3), q("★★★", 3)],
      },
      {
        name: "후보 2 — Capability-aware 프로파일형",
        diagram: ASSET("dp4_c2.png"),
        features: ["프로파일 = 수치 튜플 + capability 디스크립터(NEAR_COMPUTE·PERSISTENT·SHARED·IN_PLACE_COMPRESS) — 정책이 capability를 질의해 오프로드·영속·공유 결정"],
        pros: ["자사 디바이스 차별 가치의 구조적 회수", "E2E 증명 vehicle 정면 충족 — DP5·DP6 개방", "CompressionOp 실행 위치 디바이스 위임 (의존 역전 활용)"],
        cons: ["capability×정책 분기 — 검증 매트릭스 확대 (6–24인월)", "capability 스키마 = 공개 인터페이스 — 코어 개정 리스크", "타사 HW에 무의미 — 레퍼런스 지위 저하"],
        qa: [q("★★★", 3), q("★★★", 3), q("★★★", 3), q("★★☆", 2), q("★★☆", 2)],
      },
    ],
  },
  {
    id: "DP-05", name: "P/D 분리 운용과 KV 이동 구조",
    problem: {
      items: [
        { text: "P/D 인스턴스 간 KV를 어떻게 옮기는가 — 전송(copy)인가 공유(참조 전달)인가", bold: true },
        "전송 압력: 검증된 P/D proxy·LMCache 자산(A), 실패 도메인이 인스턴스에 갇힘",
        "공유 압력: flip 지연의 물리 하한 O(KV/BW) — 장문 세션 수십 GB drain이 inner loop(초~분) 민첩성 잠식, CMM-DC 참조 전달은 O(메타데이터)",
        "DB의 shared-nothing vs shared-disk 논쟁과 동형 — 이동 비용과 공유 병목·장애 반경의 교환",
      ],
      image: ASSET("dp5_problem.png"),
    },
    issues: [
      "flip 민첩성의 하한 — 전송형 O(KV/BW) vs 공유형 O(메타데이터), inner loop 목표 주기에 어느 쪽이 필요한가",
      "병목의 이전 — 공유 tier BW가 P/D 양쪽 fan-in을 감당하는가, blast radius 허용선은",
      "KV 포맷 계약 — (재)직렬화 계약 vs 압축 상태 포함 in-place 포맷 합의",
      { text: "(DP4·DP1·DP3 커플링) 공유형은 SHARED capability 전제 — 공유 tier 채택 시 KV Index가 전역 재사용으로 확장", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — Point-to-point 직접 전송",
        diagram: ASSET("dp5_c1.png"),
        features: ["KV Transport = P↔D RDMA/NVLink 전송 엔진 (현 disagg proxy의 정식화) — 각 인스턴스가 로컬 tier 스택 독점, role flip = drain 완료 후 전환"],
        pros: ["검증 경로 — 현 자산 재사용 (초기 ≤6인월)", "실패 도메인 인스턴스 로컬 — blast radius 최소", "전제 조건 없음 — DP1·DP4 후보1과 완전 호환"],
        cons: ["flip 지연 하한 = KV 크기/링크 BW — 민첩성 제약", "drain 중 이중 점유 · 인스턴스 간 KV 사일로", "압축 상태 유지 전송의 직렬화·포맷 변환 비용"],
        qa: [q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★★", 3)],
      },
      {
        name: "후보 2 — 공유 tier 스테이징",
        diagram: ASSET("dp5_c2.png"),
        features: ["CXL pooled memory(CMM-DC)·HBF 공유 tier 위 참조 전달 — P가 쓰면 D는 매핑만, KV Transport는 소유권 메타데이터 교환 + 승격 프리페치로 축소"],
        pros: ["drain-free flip — inner loop 설계 의도 완성", "이중 점유 제거 + 인스턴스 간 전역 dedup", "CMM-DC E2E 증명의 가장 직접적인 시나리오"],
        cons: ["공유 tier BW fan-in 병목 (CXL BW 열위)", "공유 tier 장애의 blast radius 전 인스턴스", "소유권/일관성 프로토콜 신규 — 미검증 (>24인월)"],
        qa: [q("★★★(도달 ★★☆)", 3), q("★★★", 3), q("★★★", 3), q("★★☆", 2), q("★☆☆", 1)],
      },
    ],
  },
  {
    id: "DP-06", name: "근접연산(PIM/PNM) 오프로드",
    problem: {
      items: [
        { text: "PIM/PNM 오프로드의 대상·경계 — 수치 경로 밖(데이터 관리)까지인가, 안(decode attention)까지인가", bold: true },
        "정면 압력: decode는 memory-bandwidth-bound (실측 wait 70–85%) — attention은 GEMV 계열, AttAcc 2.81×·NeuPIMs 13%~3×(B)",
        "억제 압력: PIM 커널은 수치 경로 침범 — 누적 순서·정밀도 검증 부담, attention 변형마다 커널 재작성",
        "computational storage의 오프로드 경계 논쟁과 동형",
      ],
      image: ASSET("dp6_problem.png"),
    },
    issues: [
      "오프로드 경계 — 품질 검증 부담이 불연속으로 뛰는 단절점이 어디인가",
      "실행 모델 — Memory Engine 자율 실행인가, Inference Engine 커널 그래프 편입인가",
      "모델 종속성 관리 — attention 변형별 PIM 커널 재작성 비용을 누가 격리하는가",
      { text: "(DP4·DP1·DP2 커플링) NEAR_COMPUTE 표현이 하드 전제 — DP4 후보1 채택 시 DP6 성립 불가", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — 데이터 관리 연산 오프로드",
        diagram: ASSET("dp6_c1.png"),
        features: ["CompressionOp in-place 실행·KV scatter-gather·eviction scoring만 PIM/PNM으로 — 모델 수치 경로(attention·FFN)는 GPU 그대로, 의존 역전이 교체 지점"],
        pros: ["수치 경로 불침범 — 품질 영향 구조적 0", "압축/해제의 GPU 사이클 회수 — 압축 적용 확대", "모델 독립 — attention 변형과 무풍"],
        cons: ["decode attention 병목 그대로 — 이득 상한 제한", "PIM 툴체인·검증 인프라 고정 비용 동일 지불", "memory-centric 증명 임팩트가 간접적"],
        qa: [q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★★", 3), q("★★☆", 2)],
      },
      {
        name: "후보 2 — 모델 연산 오프로드 (AttAcc형)",
        diagram: ASSET("dp6_c2.png"),
        features: ["decode attention(score GEMV·softmax·weighted-sum)을 bank-level PIM에서 — Attention Engine에 PIM backend, KV 상주 tier에서 \"읽지 않고 계산\""],
        pros: ["decode wait 지배분 정면 공략 — 최대 2.81×(AttAcc)", "KV 승격 트래픽 절감 — DP5 fan-in 완화 시너지", "\"연산을 데이터로\"의 E2E 증명 그 자체"],
        cons: ["수치 경로 침범 — softmax/누적 검증 부담", "attention 변형마다 커널 재작성 — 만성 추종(>1분기)", "커널+검증+실기 확보 — 초기 >24인월"],
        qa: [q("★★★(도달 ★★☆)", 3), q("★★☆", 2), q("★★☆", 2), q("★☆☆", 1), q("★☆☆", 1)],
      },
    ],
  },
  {
    id: "DP-07", name: "SSD-PIM 검색 실행 구조",
    problem: {
      items: [
        { text: "SSD-PIM 검색의 실행 구조 — 전수 스캔(exact)인가 인덱스 유도 스캔(sublinear)인가 (전제: ADR-001)", bold: true },
        "스캔 압력: GEMV 엔진은 스트리밍 스캔 연산기 — recall 100%·인덱스 유지비 0·append-only, agent memory 상시 추가에 최강",
        "인덱스 압력: 전수 스캔 지연 ∝ 코퍼스/내부 BW — TTFT 예산(450ms) 구조적 초과, SmartANNS 계층 인덱스 QPS 최대 10.7×(B)",
        "DB의 full table scan vs index scan 논쟁과 동형",
      ],
      image: ASSET("dp7_problem.png"),
    },
    issues: [
      "TTFT 예산 내 코퍼스 상한 — 목표 규모에서 전수 스캔 지연이 예산의 몇 %인가 (종이 계산 → 실측)",
      "recall의 품질 환산 — ANN recall@k 손실이 응답 품질(QA3)에 주는 영향의 정량화",
      "갱신 경로 — agent memory 상시 문서 추가를 어느 후보가 감당하는가",
      { text: "(DP8 커플링) 인덱스를 host가 들면 서비스 모델과, 디바이스에 두면 tier 모델과 자연 정합", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — 전수 스캔형 (exact)",
        diagram: ASSET("dp7_c1.png"),
        features: ["코퍼스를 SSD-PIM 파티션에 샤딩 — 질의 브로드캐스트 → 파티션별 GEMV 전량 스캔 → 로컬 top-k → 전역 병합, 문서 추가는 append"],
        pros: ["recall 100% — 검색발 품질 저하 0", "인덱스 유지비 0 · append-only 갱신", "지연 결정론적 — SLO 예측 가능, 운영 단순"],
        cons: ["지연이 코퍼스 크기에 선형 — 상한이 구조에 박힘", "매 질의 전량 접근 — 에너지·대역폭 낭비", "상한 도달 시 대응 = 파티션 증설뿐"],
        qa: [q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★★", 3), q("★★★", 3)],
      },
      {
        name: "후보 2 — 인덱스 유도형 (SmartANNS형)",
        diagram: ASSET("dp7_c2.png"),
        features: ["상위 인덱스(IVF centroid/그래프 상위층, host DRAM)가 후보 클러스터 선별 — SSD-PIM은 선택 클러스터 내부만 부분 스캔, 증분 인덱싱 파이프라인 경유"],
        pros: ["sublinear 지연 — billion-scale에서도 예산 내 (QPS 10.7×)", "질의당 스캔 바이트·에너지 절감", "코퍼스 상한이 인덱스 품질의 함수 — 증설 없이 확장"],
        cons: ["recall < 100% — 품질 전이 (nprobe/ef 튜닝 상시)", "인덱스 빌드·증분 갱신 파이프라인 비용 (SPFresh급)", "불규칙 NAND 접근 — PIM 스트리밍 상성 저하"],
        qa: [q("★★★(도달 ★★☆)", 3), q("★★★", 3), q("★★☆", 2), q("★★☆", 2), q("★★☆", 2)],
      },
    ],
  },
  {
    id: "DP-08", name: "SSD-PIM의 계약·소유",
    problem: {
      items: [
        { text: "SSD-PIM이 런타임에 무엇으로 보이는가 — 가속 벡터DB 서비스인가, 검색 가능한 메모리 tier인가 (전제: ADR-001)", bold: true },
        "분리 압력: 외부 벡터DB 자리에 API만 꽂으면 v2 구조 변경 0 — 표준 계약으로 독립 제품화 가능",
        "동거 압력: retrieval hit ≡ KV hit — \"retrieve the text, then recompute\"가 \"retrieve the KV\"로, 텍스트/벡터/KV 3중 저장 해소",
        "NAS vs 공유 블록의 계약 수준 논쟁과 동형 — 깨끗한 경계냐, 융합이 여는 이득이냐",
      ],
      image: ASSET("dp8_problem.png"),
    },
    issues: [
      "산출물 계약 — 검색 결과가 chunk id(텍스트)인가 KV 참조인가 (후속 파이프라인이 통째로 갈림)",
      "키 공간 — 벡터 인덱스 키와 KV Index(DP3) 키를 통합하는가",
      "소유 패키지 — Request Manager(제어 평면)인가 Memory Engine Tier & Lifecycle(데이터 평면)인가",
      { text: "(DP4·DP3 커플링) tier 모델은 SEARCH capability 하드 전제 — 융합 이득은 DP3 후보2 채택에 종속 (사실상 동시 결정)", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — 가속 벡터DB 서비스",
        diagram: ASSET("dp8_c1.png"),
        features: ["SSD-PIM이 query→top-k(chunk id) 표준 API 노출 — Retrieval Engine이 외부 벡터DB 자리에서 호출, Memory Engine은 디바이스를 모름"],
        pros: ["v2 구조 무변경 — 백엔드 교체로 완결 (리스크 최소)", "표준 계약 — 독립 제품화·타 스택 이식", "장애 격리 — 검색 실패가 KV 경로와 무관"],
        cons: ["hit 후에도 prefill 재계산 잔존 — TTFT 지배 몫 미회수", "텍스트/벡터/KV 3중 저장 중복 잔존", "memory-centric 융합 기여 지점 소실"],
        qa: [q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★★", 3)],
      },
      {
        name: "후보 2 — 검색 가능한 메모리 tier",
        diagram: ASSET("dp8_c2.png"),
        features: ["SSD-PIM을 SEARCH capability tier로 등록 — 벡터 인덱스 키 = KV Index content-hash 키 통합, 검색 결과 = KV 참조 → 승격 프리페치 직결"],
        pros: ["retrieval hit ≡ KV hit — prefill 재계산 소멸 (CacheBlend 융합)", "3중 저장 → co-location dedup", "검색-재사용 단일 near-data 경로 — MCR 고유 기여"],
        cons: ["KV Locator·tier 모델(코어) 개정", "장애 도메인 결합 + v2 검수2 재개봉 설득", "키 통합·레이아웃·승격 파이프라인 — 초기 >24인월"],
        qa: [q("★★★(도달 ★★☆)", 3), q("★★★", 3), q("★★☆", 2), q("★★☆", 2), q("★☆☆", 1)],
      },
    ],
  },
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, "mcr_dp_deck.pptx");
  const pptx = A.newDeck();
  const TOTAL = DPS.length * 2;
  let page = 0;
  for (const dp of DPS) {
    page += 1;
    A.pageDpProblem(pptx, {
      title: `${dp.id}. ${dp.name} — 문제 정의`,
      page, total: TOTAL, titleSize: 22, band: "navy",
      problem: dp.problem, issues: dp.issues,
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
