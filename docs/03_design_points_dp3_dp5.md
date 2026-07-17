# MCR 설계포인트 전개 — DP3 · DP4 · DP5 (v0.1)

작성 기준: 확정안 v2 패키지 다이어그램([`01_architecture_overview.md`](01_architecture_overview.md)).
QA 정의·별점 기준은 [`00_qa_definitions.md`](00_qa_definitions.md) v0.3을 따른다.
DP1·DP2는 [`02_design_points_dp1_dp2.md`](02_design_points_dp1_dp2.md) 참조.

---

## 0. QA 정의 (참조)

QA1–QA6의 정의·측정 방법·별점별 정량 bin·근거는
[`00_qa_definitions.md`](00_qa_definitions.md) 참조. 본 문서의 모든 QA 평가표
별점은 해당 문서의 bin 기준으로 해석한다 (전부 설계 단계 예측 `(F)`,
근거 등급 A 실측 / B 문헌 / C 구조 논증).

---

## DP3. KV 재사용 범위·복원 전략

### 문제 정의

확정안 v2는 KV Index를 "재사용 핵심 자료구조"로 신설하고(01 §검수 4),
Retrieval Engine → Router의 연결을 "**non-contiguous reuse 연구의 구조적
표현**"(01 §검수 2)이라 명시했다. 그러나 **무엇을 어디까지 재사용하고,
위치가 어긋난 KV를 어떻게 복원하는가**는 미결이다.

재사용을 넓히려는 압력:

- **위치 민감성의 벽**: KV에는 position encoding(RoPE)이 구워져 있어 exact-prefix
  일치 구간만 그대로 재사용 가능하다. 그런데 RAG에서는 **동일 chunk가 요청마다
  다른 위치**에 등장 — prefix 전용 재사용은 RAG 공유 기회의 대부분을 놓친다.
- **비연속 재사용의 입증된 이득**: CacheBlend(EuroSys'25 Best Paper)는 비연속
  chunk를 재사용하되 **토큰의 10–15%만 selective recompute**하여 TTFT
  2.2–3.3× 단축·처리율 2.8–5×를 품질 저하 없이 달성(B).
- **장기 기억 워크로드**: agent memory는 세션을 넘는 KV 영속을 요구(배경 1.1) —
  재사용 단위가 세션 prefix를 넘어 사용자·코퍼스 단위 chunk로 확장된다.

좁게 유지하려는 압력도 강하다. 비연속 재사용은 품질 비용(위치 근사)과 KV
Index·복원 파이프라인 복잡도를 수반하며, block table 밖의 1급 KV 관리를
전제한다(DP1 커플링). exact-prefix는 vLLM prefix caching으로 **대규모 검증된
경로**(B)이고 품질 저하가 구조적으로 0이다. 구조적으로는 스토리지 dedup의
**fixed chunking vs content-defined chunking** 논쟁과 동형이다 — 단순 경계는
싸지만 놓치고, 내용 기반 경계는 다 잡지만 비싸다.

### 설계 쟁점

1. **재사용 단위**: block-aligned prefix 해시인가, 의미 단위 content-hash
   chunk인가 — KV Index의 키 스키마가 여기서 갈린다.
2. **위치 불일치 복원**: 근사 사용(품질 비용) vs selective recompute(연산 비용)
   의 판단 기준과 시점 — 품질 예산 집행의 일부가 된다.
3. **Index 유지 비용**: infix lookup 자료구조와 eviction의 일관성 유지를
   Cache Manager가 감당 가능한가.
4. **(DP1·DP2 커플링)** 비연속 KV는 vLLM block table 밖 — DP1 확장형에서 2급
   시민 제약(02 §DP1 후보1 단점)과 정면 충돌. 재사용/재계산 판단 주체는 DP2의
   품질 예산 집행 주체 결정에 종속.

### 후보구조 1 — Exact-prefix 재사용 (block-aligned)

**구조**: KV Index = 블록 단위 prefix 해시 체인. Router는 KV Locator로 prefix
일치 길이만 조회. 복원 경로 없음 — 일치 구간은 그대로 쓰고 불일치 지점부터
전량 재계산. vLLM prefix caching의 tier 확장판.

**장점**
- 품질 저하 구조적 0 — 위치가 보존된 KV만 재사용
- vLLM prefix caching으로 대규모 검증된 경로 — DP1 확장형과 완전 호환
- Index 단순(해시 체인) — eviction 일관성 관리 용이

**단점**
- RAG의 비연속 공유 chunk 히트 불가 — 시스템 프롬프트·multiturn 이어붙기만 회수
- 재사용률 상한이 워크로드 구조에 갇힘 — agent 장기기억(중간 삽입) 미회수
- TTFT 개선 여지의 대부분(비연속 기회)을 구조적으로 포기

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★☆ (F) | 1.1–1.5× bin: multiturn·시스템 프롬프트 prefix 히트의 TTFT 절감은 회수(B: prefix caching 관례 이득). 비연속 기회(CacheBlend가 보인 TTFT 2.2–3.3× 구간(B))는 미회수 — ≥1.5× 불확실(C) |
| QA2 | ★★★ (F) | 재사용발 품질 저하 0%p·ΔPPL 0 — 위치 보존 재사용만 수행, bound 집행 문제 자체가 없음(C) |
| QA3 | ★★☆ (F) | 1.5–3× bin: 공유 prefix dedup + 압축 2–4×(A)로 도달. 비연속 chunk의 중복 저장은 잔존 — ≥3× 미달(C) |
| QA4 | ★★★ (F) | Index는 모듈 — KV 구조 변화(GQA/MLA) 시 해시 키 스키마만 갱신, 코어 무수정(C), +2주 추종(B: 2주 주기) |
| QA5 | ★★★ (F) | vLLM 검증 경로의 tier 확장 — 초기 ≤6인월(C), 회귀 검증 부담 최소 |

### 후보구조 2 — 비연속 chunk 재사용 + selective recompute

**구조**: KV Index를 content-hash 기반 chunk 단위 prefix/infix lookup으로 설계
(01의 KV Index 신설 목적 그대로). Router가 retrieval chunk 목록으로 재사용
후보 명단을 생성하고, 위치 불일치 chunk는 경계 토큰 selective recompute
(CacheBlend 방식)로 복원. Memory Engine에 복원 파이프라인(재배치·부분 재계산
스케줄)이 추가된다.

**장점**
- RAG·agent 워크로드의 재사용률 상한 최대 — CacheBlend 실측 TTFT 2.2–3.3×·
  처리율 2.8–5×(B), 히트율 85%+ 보고
- chunk 단위 dedup으로 유효 KV 용량 동반 상승
- "재사용 축의 joint orchestration"이라는 연구 기여 지점을 구조로 성립

**단점**
- 위치 근사·부분 재계산의 품질 비용 — bound 관리 필요 (K>V sensitivity와 결합)
- Index(content-hash·infix)·복원 파이프라인·판정 로직의 신규 복잡도
- block table 밖 1급 KV 전제 — DP1 확장형과 구조적 긴장, eviction↔Index 일관성

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★★ (상한) / ★★☆ (도달 리스크) (F) | 상한: 비연속 재사용으로 TTFT 2.2–3.3×·처리율 2.8–5×(B: CacheBlend) — ≥1.5× bin 초과 달성 경로. 도달 리스크: 이득이 cache-hit율에 종속 — 공유도 낮은 워크로드에선 1.1–1.5×로 하향(C) |
| QA2 | ★★☆ (F) | selective recompute(토큰 10–15% 재계산)로 품질 유지가 문헌 입증(B: CacheBlend "no measurable quality loss")이나, 재계산 비율을 낮추면 저하 발생 — 전역 bound 운용이 현실적, 요청별 집행은 DP2 채택안에 종속(C) → ★★☆ bin |
| QA3 | ★★★ (F) | ≥3× bin: chunk 전역 dedup + 압축 2–4×(A) 결합 — 공유 코퍼스가 큰 RAG에서 원본 환산 배율 극대화(C) |
| QA4 | ★★☆ (F) | KV 구조 변화(MLA 등)가 Index 키·복원 로직 양쪽에 파급 — 공개 인터페이스(KV Locator 조회 계약) 개정 가능성 ≤40%·+1분기(C) |
| QA5 | ★★☆ (F) | content-hash Index·복원 파이프라인·판정 로직 신규 — 초기 6–24인월 구간, 품질 회귀 검증 상시 부담 ≤2 FTE(C) |

### 검토 노트

- 실질 결정 변수는 "**대표 워크로드에서 비연속 공유가 재사용 기회의
  지배분인가**"다. long-context RAG·agent memory에서 prefix-only 히트율 vs
  chunk 히트율의 실측 격차(현 벤치 인프라로 측정 가능)가 답을 준다 —
  CacheBlend의 85%+ 히트율이 자사 워크로드에서 재현되면 후보1은 이득의
  대부분을 버리는 선택이 된다.
- **진화 경로형 결정**이 유효: 후보1로 시작하되 **KV Index의 키 스키마를
  처음부터 content-hash로 설계**(prefix는 content-hash의 특수형) — 실측 히트율
  격차가 임계(chunk 히트 기회 ≥ prefix 히트의 2×)를 넘으면 복원 파이프라인만
  증설하여 후보2로 전환. 전환 트리거를 ADR에 명시.
- 재사용/재계산 판단은 품질 예산 집행의 일부 — DP2가 hybrid(자율+힌트)로
  가면 "재사용 후보 명단"이 orchestration→memory 힌트 채널로 내려간다
  (02 §DP2 검토 노트와 정합).

---

## DP4. Tier Topology Model의 하드웨어 추상화 수준

### 문제 정의

과제 범위는 "메모리 디바이스 HW 설계 자체는 **Tier Topology Model의
파라미터(대역폭·용량·지연)로만 취급**"(scope §3.3)이라 선언했고, 필요성 2.1은
"디바이스가 나올 때마다 **재설계하지 않는 구조**"를 요구한다. QA4의 ★★★
bin(어댑터 ≤1모듈·코어 0)이 이 방향의 압력이다.

반대 압력은 QA 정의 자체에 내재한다: QA4의 측정 대상인 HBM4/**CMM-DC**/HBF는
수치 스펙만 다른 디바이스가 아니다 —

- **PIM/PNM**: 근접연산(압축/해제 오프로드) — "연산을 데이터로"(배경 1.3)라는
  과제 전제 그 자체가 (BW, 용량, 지연) 튜플로 **표현 불가능한 capability**
- **HBF**: 영속성 — agent 장기 기억(세션 넘는 KV 자산화)의 하드웨어 대응물
- **CMM-DC(CXL pooling)**: 인스턴스 간 **공유성** — DP5 후보2의 전제 조건

수치 튜플만 쓰면 이 차별 가치를 레퍼런스 스택이 증명하지 못해 필요성 2.3
(E2E 증명 vehicle)과 정면 충돌한다. 구조적으로는 OS 블록 디바이스 추상화 논쟁과
동형이다 — 균일 블록 추상화가 이식성을 주지만, ZNS/DAX처럼 **capability를
노출해야만 잡히는 이득**이 존재한다.

### 설계 쟁점

1. **표현력의 잔여분**: 수치 튜플이 로드맵 디바이스의 결정 관련 차이를 어디까지
   담는가 — 근접연산·영속성·공유성 중 무엇이 표현 밖에 남는가?
2. **파급 통제**: capability 플래그가 정책·커널의 코드 경로 분기를 낳아
   "재설계 없는 구조" 약속을 침식하는가 — 분기 수 × 검증 매트릭스의 상한은?
3. **이식성 vs 증명**: Memory Engine의 타 엔진·타사 HW 이식성(레퍼런스 지위)과
   자사 디바이스 차별 증명(vehicle 지위) 중 어느 쪽이 우선인가?
4. **(DP2·DP5 커플링)** capability 인지는 배치 정책의 입력(DP2)이며, DP5
   후보2(공유 스테이징)는 SHARED capability 표현을 전제한다 — 본 DP가 DP5의
   실현 가능 집합을 결정.

### 후보구조 1 — 공통 파라미터형 (uniform parametric)

**구조**: Tier Topology Model = tier 목록 × 수치 프로파일 (대역폭, 용량, 지연
[, 비용/W]). 정책·커널은 수치만 소비하는 단일 코드 경로. 디바이스 추가 =
프로파일 등록 + DMA 어댑터 1모듈.

**장점**
- QA4 ★★★ bin의 정면 충족 — 어댑터 ≤1모듈·코어 0, 로드맵 디바이스 무재설계 수용
- 정책 코드 단일 경로 — 검증 매트릭스 최소, 동작 예측 가능
- Memory Engine의 타 엔진·타사 HW 이식성 최대 — "범용 레퍼런스" 지위

**단점**
- PIM in-place 압축·HBF 영속·CXL 공유 표현 불가 — 자사 차별 기능의 구조적 미회수
- 압축/해제가 GPU 사이클을 계속 잠식 — 성능 상한 제한
- DP5 후보2(공유 스테이징) 원천 배제 — E2E 증명 vehicle(2.3) 약화

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★☆ (F) | 1.1–1.5× bin: tiering+압축 기본 이득은 수치 축으로 회수(B: KIVI 계열). 압축/해제 연산이 GPU에 남아 decode 사이클 잠식 — 근접연산 오프로드 미사용으로 ≥1.5× 불확실(C) |
| QA2 | ★★★ (F) | 추상화 수준과 직교 — 압축 기법 선택의 문제(B: KVQuant/KIVI bin 충족 가능). *비차별* |
| QA3 | ★★★ (F) | ≥3× bin: 용량·압축은 수치 축으로 충분히 표현 — 압축 2–4×(A) × CXL 용량 tier로 도달(C). *본 QA는 두 후보를 가르지 않음* |
| QA4 | ★★★ (F) | bin 정의 정면 충족: tier 추가 = 프로파일 등록 + 어댑터 1모듈, 코어 0(C); KV 구조 변화 축은 topology와 직교 — +2주(C) |
| QA5 | ★★★ (F) | 단일 코드 경로·최소 검증 폭 — 초기 ≤6인월, 유지 ≤0.5 FTE(C) |

### 후보구조 2 — Capability-aware 프로파일형

**구조**: 프로파일 = 수치 튜플 + **capability 디스크립터**
(`NEAR_COMPUTE{ops}`, `PERSISTENT`, `SHARED`, `IN_PLACE_COMPRESS` …). 정책은
capability를 질의해 오프로드·영속 배치·공유 스테이징을 결정. CompressionOp
실행 위치가 디바이스로 위임 가능해진다(의존 역전의 활용).

**장점**
- 자사 디바이스 차별 가치의 구조적 회수 — PIM 오프로드로 GPU 사이클 보존,
  HBF 영속으로 agent 장기기억, SHARED로 DP5 후보2 개방
- E2E 증명 vehicle(필요성 2.3)의 정면 충족 — "이 capability가 있어서 이만큼
  빨라진다"를 스택이 직접 보여줌

**단점**
- capability × 정책 조합의 코드 분기·검증 매트릭스 확대
- capability 스키마가 공개 인터페이스(코어) — 신규 capability 등장 시 코어 개정
- 타사 HW에 무의미한 스키마 — 이식성·범용 레퍼런스 지위 저하

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★★ (F) | ≥1.5× bin 경로: 압축/해제를 PIM/PNM에 오프로드해 decode의 GPU 사이클 보존 — decode wait 70–85%(A) 구간에 tiering 이득 + 오프로드 이득이 중첩(C) |
| QA2 | ★★★ (F) | *비차별* — 추상화 수준과 직교(C) |
| QA3 | ★★★ (F) | 후보1과 동일 ≥3× — *본 QA는 두 후보를 가르지 않음* (용량·압축은 양쪽 다 수치 축) |
| QA4 | ★★☆ (F) | capability 스키마 = 공개 인터페이스: 신규 capability(새 오프로드 연산 등) 등장 시 스키마 개정이 코어 수정 — ≤40%·+1분기 예측(C). 어댑터 자체는 모듈 범위 |
| QA5 | ★★☆ (F) | capability 조합별 정책 분기·검증 매트릭스 — 초기 6–24인월, 유지 ≤2 FTE(C) |

### 검토 노트

- 실질 결정 변수는 "**MCR의 존재 이유가 범용 이식 스택인가, 자사 디바이스 증명
  스택인가**"다 — 필요성 2.3의 두 얼굴(레퍼런스 지위 vs 증명 vehicle)이 정면
  충돌하는 유일한 지점이며, QA 가중치(성능·증명 ↔ 진화성·비용)의 문제라기보다
  **사업 전략의 문제**라 리뷰에서 반드시 상위 결정권자의 입력을 받아야 한다.
- **hybrid — 2계층 프로파일**이 유력: 필수층(수치 튜플, 모든 정책이 소비) +
  선택층(capability 디스크립터, 인지하는 정책만 소비, 미인지 시 무시 =
  하위호환). OS가 블록 추상화 위에 ZNS/DAX를 opt-in 확장으로 수렴한 구조와
  동형. 후보로 세우지 않은 이유: "무엇이 필수층인가"는 순수형 긴장이 정리된
  뒤에만 답할 수 있다.
- 진화 경로: 후보1 스키마로 시작 + capability 슬롯만 예약(빈 필드) → DP5
  실측(공유 스테이징 이득)이 임계를 넘으면 `SHARED`부터 선택층 개방.

---

## DP5. P/D 분리 운용과 KV 이동 구조

### 문제 정의

확정안 v2는 KV Transport를 신설하며 intra-node Migration과 "**경로·실패모델
분리**"를 명시했고(01 §검수 4), Autoscaler inner loop(P/D role flip)는 **KV
drain → KV Transport 의존**으로 설계됐다(01 §검수 5). 즉 "P/D 인스턴스 간 KV
이동이 1급 문제"까지는 확정 — **어떻게 이동하는가**가 미결이다.

전송(copy) 방식으로 미는 압력:

- **검증된 경로**: 현 P/D proxy·LMCache 연동 자산(A)과 vLLM 생태계의
  connector/전송 라이브러리 방향(B)이 모두 point-to-point 전송 — 초기 리스크 최소
- **실패 도메인 분리**: 인스턴스 로컬 tier 스택은 장애가 인스턴스에 갇힘

이동 제거(공유) 방식으로 미는 압력:

- **flip 지연의 물리 하한**: 전송형 role flip은 drain 완료까지 O(KV 크기/링크
  BW) — 장문 컨텍스트 세션 수십 개면 수십 GB 급 drain(C 추정)이 inner loop
  (초~분 목표)의 민첩성을 잠식
- **memory-centric 정체성**: "데이터를 옮기지 말고 위치를 재정의하라"(배경
  1.3)의 P/D 판 — CXL pooled memory(CMM-DC) 위 **참조 전달**은 이동 자체를
  O(메타데이터)로 만든다
- **사업 증명**: CMM-DC의 E2E 증명 vehicle(필요성 2.3)로 이보다 직접적인
  시나리오가 없다

구조적으로는 DB의 **shared-nothing vs shared-disk** 논쟁과 동형이다 — 이동
비용과 공유 병목·장애 반경의 교환.

### 설계 쟁점

1. **flip 민첩성의 하한**: 전송형 O(KV/BW) vs 공유형 O(메타데이터) — inner
   loop이 목표하는 재배치 주기(초~분)에 어느 쪽이 필요한가?
2. **병목의 이전**: 공유 tier의 대역폭이 P/D 양쪽 fan-in을 감당하는가 — 승격
   트래픽 집중 시 새 병목이 되지 않는가? 실패 도메인 공유(blast radius)의 허용선은?
3. **KV 포맷 계약**: 전송형은 (재)직렬화 계약, 공유형은 압축 상태 포함 in-place
   포맷 합의 — KV Locator·CompressionOp 인터페이스에 어느 쪽 계약을 넣는가?
4. **(DP4·DP1·DP3 커플링)** 공유형은 DP4의 `SHARED` capability 표현을 전제.
   DP1 확장형에선 공유 매핑이 확장점 밖일 가능성. 공유 tier 채택 시 DP3의 KV
   Index가 인스턴스 간 전역 재사용으로 확장 가능.

### 후보구조 1 — Point-to-point 직접 전송 (transfer)

**구조**: KV Transport = P↔D 인스턴스 간 RDMA/NVLink 전송 엔진(현 disagg
proxy 자산의 정식화). 각 인스턴스가 로컬 tier 스택을 독점. role flip =
drain(전송) 완료 후 역할 전환.

**장점**
- 검증 경로 — 현 P/D proxy·LMCache 자산(A) 재사용, vLLM 생태계 방향과 정합(B)
- 실패 도메인이 인스턴스 로컬에 갇힘 — blast radius 최소
- DP1 확장형·DP4 후보1과 완전 호환 (전제 조건 없음)

**단점**
- flip 지연 하한 = KV 크기/링크 BW — inner loop 민첩성 제약 (drain 동안 이중 점유)
- 인스턴스별 KV 사일로 — 인스턴스 간 중복 저장, 전역 dedup 불가
- 압축 상태 유지 전송의 직렬화/포맷 변환 비용

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★☆ (F) | 1.1–1.5× bin: 정상 상태 goodput은 tiering 이득 그대로. 부하 급변 시 flip drain(O(KV/BW))이 재배치를 지연 — p99 tail·attainment 경계 리스크로 ≥1.5× 불확실(C) |
| QA2 | ★★★ (F) | 전송은 무손실 복사 — 품질 영향 구조적 0(C). *비차별* |
| QA3 | ★★☆ (F) | 1.5–3× bin: drain 중 원본+사본 이중 점유, 인스턴스 간 중복 저장 잔존 — 전역 dedup 불가로 ≥3× 미달(C) |
| QA4 | ★★★ (F) | Transport = 독립 모듈 — 링크 세대 교체(RDMA→차세대)도 어댑터 범위, 코어 0(C); DP4 후보1의 수치 축으로 충분 |
| QA5 | ★★★ (F) | 기존 자산 정식화 — 초기 ≤6인월(A: 현 proxy 구축 경험), 유지 ≤0.5 FTE(C) |

### 후보구조 2 — 공유 tier 스테이징 (shared pooled staging)

**구조**: KV "이동"을 CXL pooled memory(CMM-DC)·HBF 공유 tier 위 **참조
전달**로 대체. P가 공유 tier에 쓰면 D는 매핑만 — KV Transport는 포인터/소유권
메타데이터 교환 + 승격 프리페치 엔진으로 축소. role flip = drain-free
(소유권 이전).

**장점**
- flip이 O(메타데이터) — Autoscaler inner loop의 설계 의도(초~분 민첩성) 완성
- 이중 점유 제거 + 인스턴스 간 chunk 전역 재사용 개방 (DP3 후보2와 시너지)
- CMM-DC E2E 증명 vehicle(2.3)의 가장 직접적인 시나리오

**단점**
- 공유 tier BW fan-in 병목 — decode 승격 트래픽 집중 시 새 병목(CXL BW는 HBM
  대비 열위)
- 실패 도메인 공유 — 공유 tier 장애의 blast radius가 전 인스턴스
- 소유권/일관성 프로토콜 신규 개발 — 미검증, CXL 3.x pooling HW 성숙도 리스크

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★★ (상한) / ★★☆ (도달 리스크) (F) | 상한: drain-free flip으로 부하 추종 재배치가 민첩 — 급변 워크로드에서 attainment 유지 + ≥1.5× 경로(C). 도달 리스크: 공유 tier BW 포화 시 승격 지연이 tail 잠식 — CXL BW 열위(B 일반론)로 fan-in 실측 전까지 불확실(C) |
| QA2 | ★★★ (F) | 참조 전달 무손실 — *비차별* (C) |
| QA3 | ★★★ (F) | ≥3× bin: 이중 점유 제거 + 인스턴스 간 전역 dedup — 압축 2–4×(A) × 공유 용량 pool 결합의 상한 경로(C) |
| QA4 | ★★☆ (F) | `SHARED` capability + 소유권 프로토콜이 공개 인터페이스(코어) — CXL 세대 진화 시 프로토콜 개정 ≤40%·+1분기(C). DP4 후보2 전제 |
| QA5 | ★☆☆ (F) | 소유권/일관성 프로토콜·장애 처리 신규 + pooled HW 검증 인프라 — 초기 >24인월 리스크(C). 단 KV는 단일 writer(P가 쓰고 동결)라 프로토콜 단순화 여지 있음 — 실측 설계 후 재평가 |

### 검토 노트

- 실질 결정 변수는 두 개의 실측 질문이다: "**role flip 민첩성이 goodput의 1차
  병목인가**"(현 P/D 벤치에 부하 급변 시나리오 추가로 측정 가능), 그리고
  "**공유 tier BW가 승격 fan-in을 감당하는가**"(CMM-DC 실기 또는 지연 주입
  에뮬레이션으로 측정). 두 질문 모두 E2E 벤치 인프라(범위 3.2-3)의 확장으로
  답할 수 있다.
- hybrid — **온도 이원화 경로**(hot 세션은 direct 전송, warm/cold는 공유
  스테이징)가 자연스러운 절충이나 후보로 세우지 않았다: 경로 선택 정책은
  DP2의 배치 정책과 같은 축이므로, 순수형의 긴장(이동 vs 공유)을 먼저 보여야
  절충의 설계 변수가 명확해진다.
- **진화 경로형 결정**: 후보1로 시작(자산·성숙도) + **KV Locator를 처음부터
  위치 투명(참조 기반)으로 설계**해 공유 스테이징 삽입점을 예약 → CMM-DC 실기
  확보·fan-in 실측 통과를 전환 트리거로 ADR화. 이렇게 하면 후보2 전환 시
  인터페이스 개정 없이 Transport 구현만 교체된다.

---

## DP 간 의존성 (DP1–DP5 통합)

| 의존 | 내용 |
|------|------|
| DP1 → DP3 | vLLM 확장형(DP1 후보1)에서는 block table 밖 비연속 KV가 2급 시민 — DP3 후보2의 복원 파이프라인이 copy/포맷 변환 오버헤드를 안고 시작 (02 §DP1 후보1 단점의 구체화) |
| DP2 → DP3 | 재사용/재계산 판단 = 품질 예산 집행의 일부 — DP2 채택안(중앙/자율/hybrid)이 판단 로직의 위치를 결정. hybrid 시 "재사용 후보 명단"이 힌트 채널로 하향 |
| DP4 → DP5 | DP5 후보2(공유 스테이징)는 DP4의 `SHARED` capability 표현을 전제 — DP4 후보1(순수 파라미터형) 채택 시 DP5 후보2 원천 배제 |
| DP5 → DP3 | 공유 tier 채택 시 KV Index가 인스턴스 간 전역 재사용으로 확장 가능 — DP3 후보2의 이득 상한 상승 |
| DP3 → 구조도 | KV Index의 키 스키마(prefix 해시 vs content-hash) 확정 — 확정안 v2의 "KV Index (신설)" 주석 해소 |
| DP5 → 구조도 | KV Transport의 구현 형태(전송 엔진 vs 참조 교환) 확정 — "KV Transport (신설)" 주석 해소 |
| 공통 | 전 DP 평가는 [`00_qa_definitions.md`](00_qa_definitions.md) v0.3 bin 전제. DP3·DP5 모두 KV Locator 인터페이스의 초기 설계(content-hash 키, 위치 투명 참조)에 선행 요구사항을 건다 |
