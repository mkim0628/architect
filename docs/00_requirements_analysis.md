# MCR 요구사항 분석 (v0.1)

입력: [mcr_background_scope.md](mcr_background_scope.md) (배경·필요성·범위 v2).
산출: FR·제약사항 → 시스템 경계·Use Case → 품질 속성 선정(Utility Tree) →
Architecture Driver. 하류 문서: [00_qa_definitions.md](00_qa_definitions.md)
(선정 QA의 정의·정량 bin **단일 출처**),
[02](02_design_points_dp1_dp2.md)–[05](05_design_points_dp7_dp8.md) DP 문서.

**정제 요약**: 수집 22건 → 기능 요구사항 **9건** · 품질 요구(QA 후보) **9건** ·
제약사항 **2건** · 범위 판정 **1건** (원시 요구사항 전량: [부록 A](#부록-a-수집-원시-요구사항voc)).

**개정 이력**
- v0.1: 최초 작성 (architect-requirements 스킬 절차 적용). 기존
  `00_qa_definitions.md` v0.4의 QA1–QA5·우선순위와 정합하도록 Utility Tree 구성.

## 1. 요구사항 수집

### 1.1 주요 Stakeholder 및 역할

| Stakeholder | 역할 | 주요 관심사 |
|---|---|---|
| 메모리 사업부 (제품기획·디바이스 설계팀) | 과제 발주. memory-centric 제품군(PIM/PNM · CXL · Custom HBM/HBF · SSD-PIM) 로드맵 보유, MCR을 레퍼런스 SW 스택으로 요구 | 자사 디바이스의 **1급 자원** 활용, 신규 디바이스 수용 용이성, 근접연산의 실증 |
| AI 서빙 플랫폼팀 | 사내 LLM 서비스의 서빙 인프라 운영 (MCR의 1차 운영 주체) | SLO(TTFT·TPOT) 하 처리율, HBM 용량 한계, 운용 자동화 |
| 응용/모델 서비스팀 | long-context RAG · multiturn · agent 서비스 개발 (MCR의 1차 사용자) | 장문 컨텍스트 비용, 세션·장기 기억, 응답 품질 유지 |
| 개발 임원 (랩장) | 과제 승인·자원 배정, 타 과제/사업부 협력 조율 | E2E 정량 증명(baseline 대비), 일정, 지속 유지 가능성 |
| MCR 개발팀 | 런타임 개발·유지보수 | 개발 비용, upstream(vLLM) 추종 부담, 코어/모듈 경계 |
| 고객사 (자사 메모리 채택 CSP·서버 제조사) | 레퍼런스 스택을 받아 시스템 구축하는 외부 수요처 | 도입 용이성(기존 생태계 호환), 실측 성능 증거, 확장성 |
| (간접) 오픈소스 커뮤니티 (vLLM 등) | upstream 프레임워크·KV 계층(LMCache 등)의 진화 주체 | — 요구를 내지는 않으나 릴리스 주기·인터페이스 변화가 제약으로 작용 |

### 1.2 요구사항 수집 방법

| 방법 | 대상/출처 | 산출 |
|---|---|---|
| Stakeholder 인터뷰·VOC 접수 | 사업부·플랫폼팀·응용팀·임원·고객사 | 원시 요구사항 R-01~R-22 (부록 A) |
| QAW (Quality Attribute Workshop) | 이해관계자 합동 — 품질 요구를 시나리오 형태로 구체화 | §4.2 Utility Tree의 시나리오 행 |
| 자체 벤치마크 실측 | P/D 분리 벤치 — decode 대기 70–85% (근거 A) | R-01의 정량 근거, QA1 baseline 정의 |
| 문헌·업계 벤치마크 조사 | MLPerf · DistServe · KIVI · KVQuant · vLLM(SOSP'23) · FlexGen (근거 B) | QA 정의 문서의 SLO 앵커 표 |
| upstream 로드맵·릴리스 분석 | vLLM 정규 릴리스 2주 케이던스 (근거 B) | R-13, QA4·QA5 bin 근거 |
| 유사 시스템 분석 | LMCache 등 KV offloading 계층 (근거 B) | 범위 문서 배경 ④, DP1 후보 발굴 |

## 2. 요구사항 도출 (정제 → FR · 제약사항)

정제 규칙: ① 중복 병합 ② 검증 가능한 문장으로 재기술 ③ 기능(FR)/품질(QA
후보 — §4)/제약(C) 3분류 ④ 범위 밖 항목 기각(사유 기록). 품질 분류분 9건은
§4.2 Utility Tree로 보낸다.

### 2.1 기능 요구사항 (FR)

| 번호 | 태그 | 설명 | 출처 |
|---|---|---|---|
| FR-01 | 워크로드 서빙 | 대표 워크로드(**long-context RAG · multiturn · agent memory**)의 추론 요청을 admission → retrieval/context → 배칭 → 실행 → 응답으로 E2E 처리할 수 있어야 한다. | R-03·R-04·R-11 |
| FR-02 | 이종 tier KV 배치 | KV cache를 GPU HBM 밖 **이종 메모리 tier**(CXL·DRAM·HBF·SSD 등)에 두고, 디바이스 특성(대역폭·지연·용량)을 인지해 **배치·이동(승격/강등)** 할 수 있어야 한다. | R-02·R-08 |
| FR-03 | KV 압축 | 검증된 기존 압축 기법(양자화 등)을 **KV cache에 적용·해제**할 수 있어야 한다. | R-02·R-14 |
| FR-04 | KV 영속·재사용 | KV를 **세션·사용자 단위로 영속화**하고, prefix 및 non-prefix(비접두) **재사용**을 할 수 있어야 한다. | R-03·R-04·R-05 |
| FR-05 | P/D 분리 실행 | **prefill/decode 분리** 구성에서 인스턴스 간 KV 전송을 포함해 추론을 실행할 수 있어야 한다. | R-11·R-17 |
| FR-06 | 요청별 SLO 정책 | **요청별 SLO·품질 예산**을 기준으로 배치×압축×재사용 수준을 차등 조율할 수 있어야 한다. | R-16 |
| FR-07 | 근접연산 오프로드 | **PIM/PNM 디바이스로 연산을 오프로드**(예: 압축 연산, RAG 검색)해 실행할 수 있어야 한다. | R-08·R-09 |
| FR-08 | 디바이스 plug-in | 신규 메모리 디바이스를 **Tier Topology Model 파라미터로 등록**해 지원할 수 있어야 한다. | R-07 |
| FR-09 | 모니터링·스케일링 | HW·SLO telemetry를 수집하고 스케일링 **desired state를 산출**할 수 있어야 한다 (집행은 인프라 계층에 위임). | R-17 |

### 2.2 제약사항 (C)

| 번호 | 제약사항 | 설명 | 출처 |
|---|---|---|---|
| C-01 | 디바이스 불변 | 메모리 디바이스 **HW 설계는 과제에서 변경 불가** — Tier Topology Model의 파라미터(대역폭·용량·지연)로만 취급한다 (범위 3.3). | R-10 |
| C-02 | 기존 압축 기법 채용 | 압축·모델 학습 **알고리즘 자체를 개발하지 않는다** — 검증된 기존 기법을 채용하고, 이를 조율하는 구조와 정책의 위치만 다룬다 (범위 3.3). | R-14 |

## 3. 시스템 경계 및 Use Case

### 3.1 시스템 경계

시스템 = **MCR** (Inference Orchestration / Inference Engine / Memory Engine
3-패키지, [01_architecture_overview.md](01_architecture_overview.md)).
범위 문서 3.3 Out of Scope와 정합.

| 경계 내 (MCR 책임) | 경계 외 (책임 주체) |
|---|---|
| KV 배치·이동·압축·재사용의 **정책 + 메커니즘** (FR-02·03·04·06) | 메모리 디바이스 HW 설계 — 메모리 사업부 (C-01) |
| 요청 파이프라인·스케줄링/라우팅·P/D 운용 (FR-01·05) | 압축 알고리즘 자체의 연구·개발 — 기존 문헌 기법 채용 (C-02) |
| 근접연산 오프로드의 대상 선정·실행 구조 (FR-07) | 클러스터 provisioning **집행** — 인프라 계층 (desired state 소비) |
| 디바이스 plug-in 경계 = 공개 인터페이스(KV Locator·CompressionOp)와 Tier Topology Model (FR-08) | 모델 **학습** 지원 — 범위 외 (R-22 판정) |
| telemetry 수집·desired state **산출** (FR-09) | 신규 모델 일반 enablement(가중치·토크나이저 등) — upstream 책임 (DP1 후보1 전제, QA 정의 문서 QA4 각주) |

### 3.2 액터

| 액터 | 구분 | 정의 |
|---|---|---|
| LLM 응용 클라이언트 | 1차 | RAG·multiturn·agent 서비스 — 추론 요청을 발행하고 응답을 소비 |
| 운영자 (SRE) | 1차 | SLO 정책 설정, 신규 tier 등록, 운용·관제 수행 |
| 메모리 tier 디바이스 | 2차 | HBM·CXL·HBF·SSD-PIM 등 — 시스템이 KV 저장·근접연산에 활용 |
| 인프라 계층 | 2차 | cluster orchestrator — MCR이 산출한 desired state를 받아 집행 |

### 3.3 Use Case

![MCR Use-case diagram](../diagrams/req_usecase_mcr.svg)

draw.io 소스: [`diagrams/req_usecase_mcr.drawio`](../diagrams/req_usecase_mcr.drawio)

| 번호 | Use Case | 근거 FR |
|---|---|---|
| UC-01 | long-context RAG 요청 서빙 (retrieval 결과를 컨텍스트로 추론) | FR-01 |
| UC-02 | multiturn 세션 서빙 (턴 간 컨텍스트 유지) | FR-01·FR-04 |
| UC-03 | agent memory 영속·복원 (세션을 넘는 장기 기억) | FR-04 |
| UC-04 | KV tier 배치·승격·강등 (topology-aware placement) | FR-02 |
| UC-05 | KV 압축·복원 | FR-03 |
| UC-06 | KV 재사용 판정·복원 (prefix/non-prefix, KV Index 조회) | FR-04 |
| UC-07 | P/D 분리 스케줄링·인스턴스 간 KV 전송 | FR-05 |
| UC-08 | 요청별 SLO 정책 적용 (배치×압축×재사용 차등) | FR-06 |
| UC-09 | 근접연산 오프로드 실행 (CompressionOp, SSD-PIM 검색) | FR-07 |
| UC-10 | 신규 tier 등록 (Tier Topology 파라미터 plug-in) | FR-08 |
| UC-11 | 모니터링·desired state 산출 (2-loop autoscaling) | FR-09 |

FR 커버리지: FR-01(UC-01·02) · FR-02(UC-04) · FR-03(UC-05) ·
FR-04(UC-02·03·06) · FR-05(UC-07) · FR-06(UC-08) · FR-07(UC-09) ·
FR-08(UC-10) · FR-09(UC-11) — **전 FR이 ≥1개 UC에 매핑** ✓.

## 4. 품질 속성 선정

### 4.1 QA 후보 도출

수집 요구사항의 품질 분류분 9건을 시나리오 + `[측정]` 형태로 정제 — 아래
Utility Tree에 전량 수록. 출처 VOC 매핑: QA-01 ← R-01·R-11 / QA-02 ← R-02 /
QA-03 ← R-06 / QA-04 ← R-07·R-13·R-21 / QA-05 ← R-12·R-13 / QA-06 ← R-18 /
QA-07 ← R-19 / QA-08 ← R-15 / QA-09 ← R-20. 선정 5건의 `[측정]` 라인은
[00_qa_definitions.md](00_qa_definitions.md)의 ★★★ bin과 동일.

### 4.2 Utility Tree 및 선정

우선순위 규칙(QA 정의 문서와 동일): **중요도 우선, 동률 시 난이도, 둘 다
동률이면 최종 목표 지표 > 수단 지표**. 상위 5개 선정(과제 표준).

| 번호 | QA | Refinement | Scenario [측정] | 중요도 | 난이도 | 우선순위 | 선정 |
|---|---|---|---|---|---|---|---|
| QA-01 | Performance | SLO 유지 하 최대 처리율 (goodput@SLO) | 대표 워크로드에서 P/D 분리를 동일 적용한 **GPU HBM 단일 tier baseline 대비**, 표준 SLO(TTFT p99 ≤ 450 ms · TPOT p99 ≤ 200 ms)를 attainment ≥ 90%로 유지하며 달성하는 처리율 배율을 측정한다. [측정: baseline 대비 goodput@SLO ≥ 1.5× → ★★★] | H | H | 1 | **O** |
| QA-02 | Resource Efficiency | 유효 KV 용량 (원본 환산 동시 수용량) | QA-03 품질 bound를 지키는 조건에서 Σ_tier(용량 × 평균 압축률 × KV 가용 비율)로 **원본 환산 유효 KV 용량**을 산출, 물리 HBM 대비 배율을 구한다. [측정: 유효 KV 용량 ≥ 3× → ★★★] | H | H | 2 | **O** |
| QA-03 | Accuracy | 압축·재사용 품질 저하 bound | 압축·재사용을 실서빙 설정으로 활성화한 상태에서 **accuracy 저하(%p)·ΔPPL**을 비압축 대비 측정하고 bound 집행 단위(요청별/전역)를 판정한다. [측정: accuracy 저하 ≤ 1%p · ΔPPL ≤ 0.1 · 요청별 bound → ★★★] | H | M | 3 | **O** |
| QA-04 | Modifiability | 신규 디바이스·KV 구조 변화 수용성 | 신규 tier(HBM4/CMM-DC/HBF) 추가 시 변경이 **모듈에 갇히는지**와, KV 구조 영향 모델 변화(GQA/MLA/SSM)의 **수용 리드타임**을 측정한다. [측정: 어댑터 모듈 ≤ 1개 · 코어 수정 0 · 수용 ≤ upstream + 2주 → ★★★] | M | H | 4 | **O** |
| QA-05 | Affordability | 개발·운영 비용 | 대표 워크로드 E2E 벤치 완주까지 **초기 구축 인월**과 upstream 추종 포함 **연간 유지보수 FTE**를 산정한다. [측정: 초기 ≤ 6 인월 · 유지 ≤ 0.5 FTE → ★★★] | M | M | 5 | **O** |
| QA-06 | Availability | 영속 KV 자산의 유실 복구 | 노드 장애로 영속 KV(agent memory 등) 일부가 유실될 때 재계산(re-prefill)으로 세션을 복구한다. [측정: KV 유실 시 세션 손실 0, 복구 비용은 QA-01 goodput 저하로 계상] | M | M | 6 | |
| QA-07 | Security | 사용자 간 KV 재사용 격리 | 타 사용자 요청이 내 KV 블록의 재사용을 시도할 때 차단된다. [측정: cross-user KV 재사용 0건 — 재사용 범위 = 사용자/세션 내] | M | M | 7 | |
| QA-08 | Interoperability | 기존 서빙 생태계 호환 | vLLM 기반 스택을 쓰는 조직이 MCR 도입 시 응용 수정 없이 전환한다. [측정: 서빙 API 호환 유지, 응용 코드 수정 0건] | M | M | 8 | |
| QA-09 | Scalability | 클러스터 수평 확장 | 노드 추가 시 goodput이 선형에 가깝게 확장된다. [측정: N노드 goodput ≥ 0.8·N × 단일 노드] | L | H | 9 | |

**미선정 사유** (전건 기록):

- **QA-06 Availability** — KV는 원본 컨텍스트에서 재계산 가능한 파생
  데이터라 유실이 정확성이 아닌 **성능 문제로 환원**되어 QA-01 측정에
  흡수(C). 영속 KV의 실패모델은 DP3(재사용 복원 전략)·DP5(KV Transport
  실패모델)의 구조 결정으로 다룬다. 상용화 단계 재평가.
- **QA-07 Security** — 실증 단계에서는 재사용 범위를 **사용자/세션 내로
  한정**하는 정책 제약으로 완화(DP3 커플링, 위 [측정]이 그 제약).
  멀티테넌트 상용화 시 독립 QA로 재평가.
- **QA-08 Interoperability** — 독립 QA가 아니라 **DP1(framework 실행
  구조)의 결정 변수로 흡수**. upstream 추종성은 QA4·QA5의 bin(upstream +
  2주, 유지 FTE)이 대리 측정.
- **QA-09 Scalability** — 클러스터 provisioning **집행이 범위 외**(3.3)이고
  desired state 산출은 FR-09로 기능 요건화되어, 이번 과제 판정에 주는
  타격이 낮아 중요도 L 판정.
- M/M 동률(QA-06·07·08)의 순번은 리스크 노출 시점 순(실증 단계에서도
  노출되는 가용성 → 멀티테넌트 전제인 보안 → DP1로 흡수되는 호환성)의
  구조 논증(C) — 선정 결과에는 영향 없음.

### 4.3 선정 QA 정제 (번호 매핑)

선정 5건의 정의·측정 방법·정량 bin·bin 근거는
[00_qa_definitions.md](00_qa_definitions.md) (v0.4)가 **단일 출처**다 —
본 문서에는 Utility Tree 요약 행만 둔다. 우선순위 = QA 번호.

| Utility Tree | QA 정의 문서 | 비고 |
|---|---|---|
| QA-01 Performance | QA1. 추론 성능 (goodput@SLO) | H/H, 우선순위 1 일치 |
| QA-02 Resource Efficiency | QA2. 메모리 효율 (유효 KV 용량) | H/H, 우선순위 2 일치 |
| QA-03 Accuracy | QA3. 응답 품질 (품질 저하 bound) | H/M, 우선순위 3 일치 |
| QA-04 Modifiability | QA4. 확장성·진화성 | M/H, 우선순위 4 일치 |
| QA-05 Affordability | QA5. 개발·운영 비용 | M/M, 우선순위 5 일치 |

## 5. Architecture Driver 선정

**[기능 9, QA 5, Constraint 2 — Drivers 총 16종 선정]**

| Driver | 아키텍처에 주는 함의 | 관련 DP/컴포넌트 |
|---|---|---|
| FR-01 워크로드 서빙 | 요청 파이프라인(admission → retrieval → 세션 배칭)의 control plane 분리 | Request Manager (Request Lifecycle Manager · Retrieval Engine · Multiturn Batcher) |
| FR-02 이종 tier KV 배치 | Memory Engine의 1급 패키지화, placement 정책의 위치 결정 | [DP2](02_design_points_dp1_dp2.md)·[DP4](03_design_points_dp3_dp5.md) / Cache Manager · Tier & Lifecycle |
| FR-03 KV 압축 | 압축 policy/mechanism 분리, 커널 의존 역전 | [DP2](02_design_points_dp1_dp2.md) / Memory Compressor · CompressionOp Kernel |
| FR-04 KV 영속·재사용 | 재사용 범위·복원 전략과 조회 자료구조 | [DP3](03_design_points_dp3_dp5.md) / KV Index |
| FR-05 P/D 분리 실행 | 인스턴스 간 KV 이동 경로·실패모델의 분리 | [DP5](03_design_points_dp3_dp5.md) / KV Transport · Autoscaler(inner) |
| FR-06 요청별 SLO 정책 | 정책의 중앙(스케줄러) vs 자율(엔진) 위치 결정 | [DP2](02_design_points_dp1_dp2.md) / Scheduling (KV-aware Router · SLO/QoS Monitor) |
| FR-07 근접연산 오프로드 | 오프로드 대상·실행 구조, SSD-PIM 검색의 계약·소유 | [DP6](04_design_points_dp6.md)·[DP7·DP8](05_design_points_dp7_dp8.md) / [ADR-001](adr/ADR-001-ssd-pim-rag-retrieval.md) |
| FR-08 디바이스 plug-in | HW 추상화 수준(파라미터 vs 전용 어댑터) 결정 | [DP4](03_design_points_dp3_dp5.md) / Tier Topology Model |
| FR-09 모니터링·스케일링 | 2-loop autoscaler와 desired state 인터페이스 | Resource Manager (Hardware Monitor · Autoscaler) |
| QA1 추론 성능 | 전 DP 평가의 1순위 축 (baseline = P/D 동일 적용 단일 tier) | DP1–DP8 QA 평가표 |
| QA2 메모리 효율 | tier 오프로딩 × 압축의 결합 구조 요구 (압축 단독 초과) | DP2·DP4 |
| QA3 응답 품질 | 요청별 품질 bound의 집행 구조 (전역 아닌 요청 단위) | DP2·DP3 |
| QA4 확장성·진화성 | 코어/모듈 경계와 공개 인터페이스의 안정성 설계 | DP1·DP4 / KV Locator · CompressionOp |
| QA5 개발·운영 비용 | framework 실행 구조(plugin vs 독립)의 핵심 판단 기준 | [DP1](02_design_points_dp1_dp2.md) |
| C-01 디바이스 불변 | 디바이스를 파라미터로 추상화하도록 강제 (전용 코드 최소화) | DP4 / Tier Topology Model |
| C-02 기존 압축 기법 채용 | mechanism은 채용, MCR 고유 가치는 조율 정책에 집중 | DP2 / Memory Compressor |

전 driver가 DP 또는 확정 컴포넌트에 매핑 ✓ (FR-01·FR-09는 확정안 v2에서
구조 확정 — DP 불필요).

산출물: **"MCR (Memory-Centric Runtime)"**

---

## 부록 A. 수집 원시 요구사항(VOC)

| 번호 | 출처 | 내용 | 정제 결과 |
|---|---|---|---|
| R-01 | AI 서빙 플랫폼팀 | "장문 컨텍스트에서 decode 대기가 E2E latency의 70–85%다(자체 P/D 벤치, A) — 토큰 생성이 메모리에 묶여 있다. SLO를 지키면서 처리율을 올려달라." | QA-01 |
| R-02 | AI 서빙 플랫폼팀 | "피크 시간대 HBM 용량 부족으로 preemption·재계산·스왑이 발생해 처리율이 급락한다. 같은 HBM으로 동시 세션을 더 받고 싶다." | QA-02, FR-02, FR-03 |
| R-03 | 응용/모델 서비스팀 | "RAG 프롬프트가 수십 k 토큰인데 매 요청 전체를 re-prefill한다 — 같은 문서 chunk의 KV를 재사용하고 싶다." | FR-01, FR-04 |
| R-04 | 응용/모델 서비스팀 | "multiturn 대화에서 세션이 이어질 때마다 이전 턴 컨텍스트 복원 비용이 크다." | FR-01, FR-04 |
| R-05 | 응용/모델 서비스팀 | "agent가 세션을 넘는 장기 기억을 요구한다 — KV가 일회성 버퍼가 아니라 세션·사용자 단위로 영속하는 자산이 되어야 한다." | FR-04 |
| R-06 | 응용/모델 서비스팀 | "압축·재사용 때문에 답변 품질이 떨어지면 서비스에 못 쓴다 — 품질 저하의 상한을 보장해달라." | QA-03 |
| R-07 | 메모리 사업부 | "HBM4/CMM-DC/HBF 등 로드맵 신제품이 나오면 스택에 바로 올라갈 수 있어야 한다." | QA-04, FR-08 |
| R-08 | 메모리 사업부 | "자사 디바이스를 GPU의 부속이 아닌 1급 자원으로 다루는 레퍼런스 스택이 필요하다." | FR-02, FR-07 |
| R-09 | 메모리 사업부 | "PIM/PNM 근접연산을 실제 서빙 경로에서 증명해달라 — 데이터 이동만 있고 연산 배치가 없는 기존 KV 계층과 달라야 한다." | FR-07 |
| R-10 | 메모리 사업부 | "디바이스 HW 스펙은 이 과제에서 바꿀 수 없다 — 주어진 스펙(대역폭·용량·지연)을 전제로 설계하라." | C-01 |
| R-11 | 개발 임원 | "GPU HBM 단일 tier baseline 대비 개선을 E2E 정량으로 입증해야 사업 설득이 된다. 대표 워크로드 벤치가 완주해야 한다." | QA-01(baseline), FR-01, FR-05 |
| R-12 | 개발 임원 | "과제 종료 후에도 소수 인력으로 지속 유지 가능해야 한다 — 상시 전담팀은 불가." | QA-05 |
| R-13 | MCR 개발팀 | "vLLM은 2주마다 릴리스된다(B) — 구조에 따라 추종 비용이 수십 인월로 갈린다." | QA-05, QA-04 |
| R-14 | MCR 개발팀 | "압축 알고리즘을 새로 연구할 여력은 없다 — 검증된 기존 기법(양자화 등)을 채용하자." | C-02, FR-03 |
| R-15 | 고객사 | "기존 서빙 API·생태계(vLLM 호환)와의 호환성이 도입의 전제 조건이다." | QA-08 |
| R-16 | AI 서빙 플랫폼팀 | "요청마다 SLO가 다르다(interactive vs batch) — 요청별로 배치·압축·재사용 수준을 다르게 가져가달라." | FR-06 |
| R-17 | AI 서빙 플랫폼팀 | "P/D 분리 운용 중 부하 변화에 따라 role 전환과 스케일링이 자동으로 되어야 한다." | FR-05, FR-09 |
| R-18 | AI 서빙 플랫폼팀 | "장애로 영속 KV가 유실되면 어떻게 되나 — 세션이 깨지지 않고 복구되어야 한다." | QA-06 |
| R-19 | AI 서빙 플랫폼팀 (보안 담당) | "사용자 간 KV 재사용은 프롬프트 유출 통로가 될 수 있다 — 격리를 보장하라." | QA-07 |
| R-20 | 고객사 | "클러스터 규모를 늘릴 때 노드 추가만으로 선형에 가깝게 확장되어야 한다." | QA-09 |
| R-21 | 응용/모델 서비스팀 | "MLA·hybrid attention 등 KV 구조가 바뀌는 신모델이 나오면 곧바로 서빙하고 싶다." | QA-04 |
| R-22 | 개발 임원 | "모델 학습 지원은 이번 과제 범위가 아니다 — 추론 서빙에 집중하라." | 범위 판정 (§3.1 경계 외 반영, 기각 아님) |
