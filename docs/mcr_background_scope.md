# MCR 과제 — 배경 · 필요성 · 범위 (v2)

변경 이력: v2 — 배경을 ①~⑤ 5단 논리(배경1: 병목→업계 해법→자사 재료 /
배경2: 현 런타임 한계→필요성)로 재구성. "승부처의 이동" 추상 명제를 "현재
런타임의 한계"라는 검증 가능한 사실 명제로 대체하고, vLLM·FlexGen 실측 근거와
LMCache 비교를 ④에 편입. v1 — 배경·필요성·범위 병합안 최초 작성.

## 1. 과제 배경 1 — 병목, 해법, 그리고 자사의 재료

### 1.1 ① AI 추론의 메모리 병목이 심화되고 있다

컨텍스트 길이가 폭증하면서 추론의 지배 항목이 연산에서 메모리로 넘어갔다.

- **대역폭 병목**: decode는 매 토큰마다 누적된 KV cache 전체를 읽는
  memory-bandwidth-bound 연산으로, 추론 시간을 지배한다 — 자체 P/D 분리 벤치
  실측에서 decode 대기가 end-to-end latency의 70–85%(A).
- **용량 병목**: KV cache는 컨텍스트 길이 × 동시 세션 수에 비례해 HBM 용량을
  압박한다. Agent 워크로드는 세션을 넘는 장기 기억을 요구하기 시작해 — KV가
  일회성 버퍼가 아니라 세션·사용자 단위로 영속하는 자산이 되면서 — 이 병목을
  구조적으로 심화시킨다.

### 1.2 ② 업계는 메모리 중심 해법으로 대응하고 있다

두 병목 각각에 대해 하드웨어 차원의 대응이 진행 중이다.

- 대역폭 병목에는 **근접 연산(PIM/PNM)** — 데이터를 연산기로 가져오는 대신
  연산을 데이터가 있는 곳으로 보내, 데이터 이동량 자체를 줄인다.
- 용량 병목에는 **메모리 계층화(tiered memory / offloading)** — HBM 밖의 크고
  싼 tier로 데이터를 내렸다가 필요할 때 가져와 용량을 확장한다.

### 1.3 ③ 자사도 이 두 방향의 제품군을 모두 만들고 있다

②의 두 방향 — 근접 연산(PIM·CIM 계열)과 계층화(Custom HBM·HBF·CXL 기반 확장) —
에 해당하는 memory-centric 제품 포트폴리오를 자사가 보유·개발 중이다. 각
디바이스는 근접연산·대역폭·용량이라는 서로 다른 축의 무기를 제공하며, 조합하면
GPU HBM 단일 체계로는 불가능했던 설계 공간이 열린다. **즉 병목을 풀 하드웨어
재료는 갖춰지고 있다.**

## 2. 과제 배경 2 — 그 재료를 쓸 소프트웨어가 없다

### 2.1 ④ 현재의 추론 런타임은 이 재료를 활용하지 못한다

디바이스는 스스로 성능이 되지 않는다 — 데이터를 어디에 두고 언제 옮기고 어떤
연산을 어디서 실행할지를 결정하는 것은 런타임이다. 그런데 현재 런타임 지형을
보면:

- **GPU 중심 설계**: vLLM 등 기존 스택은 "연산은 GPU, KV는 GPU HBM"이라는 단일
  메모리 가정 위에 설계되어 있다. 메모리는 GPU의 부속물로 취급되어 PIM/PNM 같은
  근접 연산 디바이스는 표현할 자리가 없고, HBM 용량을 넘는 순간
  preemption·재계산·스왑으로 성능이 급락하며, offloading이 있어도 콜드 데이터를
  밀어내는 정적·수동적 부가 기능 수준이다.
- **메모리 활용 한계의 실측 근거**: 같은 하드웨어에서 런타임의 메모리 관리만으로
  성능이 갈린다는 것이 이미 입증되어 있다. GPU 중심 런타임들은 KV cache 메모리의
  **60–80%를 단편화·과잉예약으로 낭비**해 왔고, 메모리 관리 방식(paging)을 고친
  것만으로 같은 GPU에서 처리량 2–4×가 갈렸다(vLLM, SOSP'23 — 메모리를 1급으로
  다루지 않는 런타임의 낭비가 그만큼 크다는 실증). 계층 메모리로 가면 격차는 더
  벌어진다: 같은 16GB GPU 한 장에서 **offloading 배치 정책만으로 최대 처리량
  100×** 차이(FlexGen, ICML'23 vs Accelerate·ZeRO-Inference).
- **KV 계층의 등장과 그 한계**: 업계도 이 한계를 인지해 KV를 HBM 밖으로 내리는
  계층이 등장했다 — LMCache는 KV를 CPU DRAM·SSD·원격 저장소(Redis 등) 계층에
  영속화·재사용하고 압축(CacheGen)·비접두 재사용(CacheBlend)까지 갖춘, vLLM 공식
  KV offloading connector의 대표 구현이다. 그러나 이들 계층조차 **commodity
  저장소를 수동적 put/get 백엔드로 추상화**할 뿐이다: 디바이스의
  대역폭·지연·용량 특성을 인지하는 배치(topology-aware placement)도, 연산을
  데이터로 보내는 근접 연산도, 요청별 SLO·품질 예산 기반의 정책도 없다 — 데이터
  이동만 있고 연산 배치가 없으므로 대역폭 병목 축은 다루지 못한다.

즉 문제 인식(KV는 HBM 밖으로)은 업계 공통이 되었으나, **자사 메모리 디바이스가
1급 자원으로 들어갈 자리는 어느 런타임에도 없다.**

### 2.2 ⑤ 따라서 자사 메모리 제품군을 활용하는 런타임 개발이 필요하다

③의 재료와 ④의 공백을 합치면 결론은 하나다: 자사 메모리 포트폴리오를 GPU의
부속이 아닌 **1급 자원으로 다루며, 데이터 배치·이동·압축·재사용과 연산 배치를
요청별 SLO·품질 예산 기준으로 조율하는 메모리 중심 런타임, MCR(Memory-Centric
Runtime)** 을 직접 개발해야 한다. 이 런타임은 동시에:

1. 자사 메모리 제품군의 **레퍼런스 소프트웨어 스택** — 응용(LLM 서빙)과
   디바이스를 잇는 실현 계층
2. GPU HBM 단일 tier 대비 성능 개선을 정량 입증하는 **E2E 증명 수단**

이 된다. 즉 본 과제의 산출물은 설계 과제의 결과물인 동시에 자사 메모리 사업의
소프트웨어 자산이다.

## 3. 과제 범위 · 목적 (따라서 ~를 할 것이다)

### 3.1 목적

계층화된 이종 메모리 시스템 위에서 LLM 추론의 **goodput@SLO를 극대화**하는
런타임, **MCR(Memory-Centric Runtime)의 아키텍처를 설계**하고, 이를 자사
memory-centric 디바이스의 레퍼런스 스택으로 성립시킨다.

### 3.2 범위 (In Scope)

1. **MCR 레퍼런스 아키텍처 설계** (← 배경 ④·⑤): Inference Orchestration(control
   plane) / Inference Engine / Memory Engine(data plane)의 3-패키지 구조와 공개
   인터페이스(KV Locator, CompressionOp) 정의. 디바이스는 Tier Topology Model의
   파라미터로 plug-in되는 구조로 설계하여 로드맵 디바이스 수용성을 확보
2. **핵심 설계 결정(DP) 도출·평가** (← 배경 ④·⑤): DP1 실행 스택 소싱 —
   Inference·Memory Engine의 외부 채택 vs 자체 구현(외부 스택 활용형[변형:
   vLLM 확장 / LMCache 편승] vs 자체 구현형), DP2 KV 배치·압축 관리 주체(중앙
   정책 vs 자율) — 후보구조, QA 평가, ADR
3. **E2E 실행 경로 확보 및 정량 성능 증명** (← 배경 ①·⑤): 대표 워크로드
   (long-context RAG, multiturn, agent memory) 기준 P/D disaggregated 벤치마크가
   자사 메모리 tier 위에서 완주하는 E2E 경로를 구축하고, GPU HBM 단일 tier
   baseline 대비 goodput@SLO·유효 KV capacity·품질 bound 개선을 실측·비용 모델로
   입증

### 3.3 범위 외 (Out of Scope)

- **메모리 디바이스 HW 설계 자체** — Tier Topology Model의 파라미터(대역폭·용량·지연)로만 취급
- **모델 학습·압축 알고리즘 자체의 개발** — 압축 mechanism은 기존 기법을 채용하고, 본 과제는 이를 조율하는 구조와 정책의 위치를 다룸
- **클러스터 인프라 provisioning** — desired state 산출까지가 런타임 책임이며, 집행은 인프라 계층에 위임

### 3.4 QA 연결

목적(goodput@SLO)은 QA1로 직결되며, ⑤의 조율 요구(배치×압축×재사용)는
QA2(메모리 효율)·QA3(응답 품질)로, ⑤의 1급 자원 아키텍처 요구는
QA4(확장성·진화성)로, 레퍼런스 스택 성립 요건은 QA5(개발·운영 비용)와 DP1의
판단 기준으로 계승된다. 상세 정의는 [00_qa_definitions.md](00_qa_definitions.md)
참조.

### 참고 문헌 (배경 ④ 근거)

- [vLLM — Efficient Memory Management for LLM Serving with PagedAttention (SOSP'23)](https://arxiv.org/abs/2309.06180) — KV 낭비 60–80% → <4%, 동일 latency 처리량 2–4×
- [FlexGen — High-Throughput Generative Inference of LLMs with a Single GPU (ICML'23)](https://arxiv.org/abs/2303.06865) — 동일 16GB T4, offloading 정책으로 최대 처리량 100×
- [LMCache — An Efficient KV Cache Layer for Enterprise-Scale LLM Inference](https://arxiv.org/abs/2510.09665) · [아키텍처 문서](https://docs.lmcache.ai/developer_guide/architecture.html) — CPU RAM/SSD/원격 백엔드, CacheGen/CacheBlend
