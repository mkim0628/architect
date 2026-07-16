# MCR 설계포인트 전개 — DP1 · DP2 (v0.3)

변경 이력: v0.3 — DP1에 후보구조 3(KV-계층(LMCache) 확장형) 추가: 문제 정의에
KV-계층 생태계 압력 보강, 설계 쟁점 4 신설(DP2·DP6 커플링), 검토 노트를 3후보
구도로 재작성, 의존성 표 갱신. v0.2 — QA 평가표를
[`00_qa_definitions.md`](00_qa_definitions.md) v0.3 bin 기준으로 재채점 (DP1
후보2 QA4 ★★☆→★☆☆, DP2 후보2 QA3 ★☆☆→★★☆, 나머지 별점 유지·근거를 bin
판정문으로 전면 재작성). v0.1 — 최초 작성.

작성 기준: 확정안 v2 패키지 다이어그램. QA 정의·별점 기준은 [`00_qa_definitions.md`](00_qa_definitions.md)를 따른다 (잠정 — 공식 확정 시 재평가 필요).

---

## 0. QA 정의 (분리됨)

QA1–QA5의 정의, 측정 방법, **별점별 정량 bin과 그 선정 근거(레퍼런스 SLO)** 는
[`00_qa_definitions.md`](00_qa_definitions.md)로 분리되었다. 본 문서의 모든
QA 평가표 별점은 해당 문서의 bin 기준으로 해석한다.

> 본 문서의 평가표는 **00 v0.3 bin 기준으로 재채점**되었다 (전부 설계 단계
> 예측 `(F)`, 근거 등급 A 실측 / B 문헌 / C 구조 논증). QA1의 baseline은
> "P/D 분리 적용 + GPU HBM 단일 tier"임에 유의.

---

## DP1. Framework 실행 구조

### 문제 정의

MCR은 PIM/PNM/CXL 이종 메모리를 1급 자원으로 다루는 런타임이다. 그러나 현존 오픈소스 추론 프레임워크(vLLM)는 "KV cache는 GPU HBM에 있다"는 가정이 코드 전반에 배어 있다. 구체적으로:

- **Block 관리의 GPU 중심성**: PagedAttention block table과 allocator가 GPU/CPU 이분법 위에 설계되어 있고, swap 경로는 CPU 전용이다. PNM DRAM·CXL을 제3, 제4의 tier로 넣을 자리가 구조적으로 없다.
- **Scheduler의 tier 비인지**: iteration scheduler는 gpu block 잔량만 보고 admission을 결정한다. "이 요청의 KV 절반이 CXL에 압축 상태로 있다"는 정보가 스케줄 결정에 들어갈 통로가 없다.
- **KV Connector의 용도 제한**: v1 connector API는 P→D prefill 결과 전송용으로 설계되어, decode 진행 중의 tier 간 이동(승격/강등)이나 non-contiguous 재사용 경로로는 반쪽짜리다.

반대 방향의 압력도 강하다. vLLM 생태계는 continuous batching, chunked prefill, speculative decoding, 신규 모델 지원이 주 단위로 갱신된다. 독립 framework는 이 축적을 전부 재구현하고 영구히 추종해야 하며, "vLLM 동등 baseline 성능 도달" 자체가 하나의 대형 프로젝트다.

세 번째 압력은 **KV-계층 생태계의 선점**이다. LMCache가 vLLM 공식 KV offloading
connector로 프로덕션에 안착하며(GKE Inference·CoreWeave·Cohere 채택),
chunking·영속화·백엔드 추상화·압축(CacheGen)·비접두 재사용(CacheBlend)을 이미
갖춘 KV 데이터-이동 계층이 표준 지위를 굳히고 있다. MCR이 이 계층과 **경쟁**할지
(후보 1·2), 그 **위에 올라탈지**(후보 3)가 실행 구조 결정의 일부가 되었다. 단 이
계층은 백엔드를 수동적 put/get 저장소로 추상화하므로 — tier topology 인지 배치,
요청별 SLO 정책, 근접 연산이 들어갈 자리가 구조적으로 제한된다(배경 문서 ④).

### 설계 쟁점

1. MCR의 차별 가치(Memory Engine, tier-aware 배치)가 **vLLM의 공식 확장점**(platform plugin, KV connector, custom attention backend, worker extension) 안에서 표현 가능한가? 표현 불가능한 잔여분은 무엇인가?
2. 확장점 밖 수정이 필요한 지점(scheduler의 tier 인지, block table 일반화)이 연구·제품 가치의 **핵심인가 주변부인가**?
3. 조직 리소스로 감당 가능한 유지보수 모델은 무엇인가 — plugin 추종, fork rebase, 독립 코어 유지, KV-계층 백엔드 추종 중.
4. (DP2·DP6 커플링) 차별 가치 중 어디까지가 KV 데이터-이동 계층(LMCache)의 백엔드·정책 훅으로 표현 가능한가 — 근접 연산 오프로드(DP6)와 tier-aware decode 경로는 이 계층 밖이며, 이 경로 채택 시 중앙 정책(DP2 후보1)의 자리도 LMCache 골격에 제약된다.

### 후보구조 1 — vLLM 확장형 (plugin/connector 기반)

**구조**: Inference Orchestration은 vLLM 프로세스 밖의 독립 계층(현 disagg proxy 구조의 정식화). Inference Engine 자리는 vLLM이 그대로 담당. Memory Engine은 KV connector API + custom attention backend + worker plugin으로 vLLM에 주입하되, 코어는 vLLM 프로세스 밖 독립 모듈로 유지한다.

**주의 — fork와의 구분**: "vLLM 위에" 만드는 방식은 (1a) 공식 확장점만 쓰는 plugin형과 (1b) 코어를 직접 수정하는 fork형으로 갈린다. fork는 초기 개발 속도가 빠르지만 upstream이 주 단위로 움직이므로 6~12개월 후 rebase 비용이 급증한다. 본 후보구조는 1a를 기준으로 하고, 확장점이 막히는 지점은 upstream RFC 기여로 뚫는 것을 원칙으로 한다.

**장점**
- 생태계 무임승차: 배칭·커널·모델 지원의 지속 개선을 비용 없이 흡수
- 검증된 코어: 수치 정확성·edge case가 대규모 배포로 이미 검증됨
- 현 자산 재사용: 기 구축한 P/D proxy, LMCache 연동, 벤치마크 인프라가 그대로 유효
- 초기 구축 비용 최소 — 연구 가설 검증까지의 리드타임 단축

**단점**
- scheduler가 tier를 모름: placement 결정이 스케줄링과 통합되지 못해 사후적(reactive). tier-aware co-scheduling으로 얻을 이득을 구조적으로 미회수
- cross-tier non-contiguous KV가 2급 시민: block table 밖에서 관리 → 재사용 시 copy/포맷 변환 오버헤드
- upstream API 변경 리스크: connector/plugin API 자체가 아직 개정 중
- 아키텍처 주도권 부재 — MCR이 "vLLM 애드온"으로 인식될 전략적 리스크

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★☆ (F) | 1.1–1.5× bin 예측: connector 경유 압축·오프로딩으로 batch 확대 이득 일부 회수(KIVI 계열 2.35–3.47×의 부분 실현, B). 단 scheduler tier 비인지로 co-scheduling 이득 미회수 — decode wait 70–85%(A) 구간 개선 상한이 확장점에 걸려 ≥1.5× 도달 불확실(C) |
| QA2 | ★★☆ (F) | 1.5–3× bin 예측: 압축 2–4×(A)·CXL 오프로딩은 connector로 가능하나, block table 밖 관리라 재사용·압축 KV의 copy/포맷 변환 오버헤드가 유효 배율을 깎아 ≥3× 미달(C) |
| QA3 | ★★★ (F) | acc ≤1%p·ΔPPL ≤0.1은 KVQuant 3-bit급 기법 채택으로 달성 가능(B); 검증된 vLLM 코어라 회귀 리스크가 MCR 추가분에 국한(C). 요청별 bound는 connector 메타데이터로 집행 가능(C — DP2 채택안에 종속) |
| QA4 | ★★☆ (F) | (a) tier 추가는 자사 Memory Engine 어댑터 모듈에 갇히나, 확장점 밖 기능은 upstream RFC 경유 — 리드타임 1분기급(C). (b) KV 구조 변화는 upstream이 모델을 지원하므로 어댑터 갱신만 — +2주 가능(B: 2주 릴리스 주기). API 개정 시 재작업 리스크로 ★★★ 미달 |
| QA5 | ★★★ (F) | 초기 "수 인월"(A) ≤ 6인월 bin; plugin 경계 유지 시 추종 ≤0.5 FTE(C — 릴리스 주기당 수일) |

### 후보구조 2 — 독립 framework

**구조**: Memory Engine을 설계 중심에 놓고, scheduler·block table·executor가 tier topology를 1급으로 인지하는 클린 설계. 커널 계층은 FlashInfer/자체 커널 조합으로 구성. 확정안 v2 다이어그램을 제약 없이 그대로 구현하는 안.

**장점**
- memory-centric 설계 자유: block table이 tier-agnostic, placement·압축·스케줄링의 진짜 co-design 가능 (이론 성능 상한 최고)
- 자사 HW 로드맵(HBM4·CMM-DC·HBF)을 확장점 제약 없이 직접 수용
- 아키텍처 주도권·IP 확보 — MCR을 독립 플랫폼으로 포지셔닝 가능

**단점**
- 재구현 비용: continuous batching, chunked prefill, prefix caching, 모델 zoo 지원 등 vLLM이 수년·수백 contributor로 축적한 것을 자체 구현 — vLLM 동등 baseline 도달 자체가 리스크
- 검증 부담: 미검증 실행 코어의 수치 정확성·안정성 검증 비용
- 영구 추종 부담: 신규 모델·기법이 나올 때마다 자체 포팅 필요 (리드타임 만성 열세)

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★★ (상한) / ★☆ (도달 리스크) (F) | 상한: co-scheduling·압축·재사용의 진짜 co-design으로 ≥1.5× bin 도달 가능(C — 압축 단독으로도 2.35–3.47× 문헌(B)). 도달 리스크: vLLM 동등 배칭 효율 재현 실패 시 baseline 자체에 미달 — attainment ≥90% 유지 불확실(C) |
| QA2 | ★★★ (F) | ≥3× bin 예측: tier-agnostic block table로 압축 2–4×(A)와 tier 오프로딩을 1급 결합 — 관리 오버헤드 없는 원본 환산 배율 극대화(C) |
| QA3 | ★☆☆ (F) | bound 보장 자체가 리스크: 압축 기법의 acc/PPL은 문헌상 달성 가능(B)하나, 미검증 실행 코어의 수치 정확성 리스크가 저하의 총량을 키워 ≤2%p bound 보장을 장담 못 함(C) |
| QA4 | ★☆☆ (F) | (a) 디바이스 축은 ★★★급 — tier 추가가 어댑터 모듈에 갇히는 클린 설계(C). 단 (b) 독립 framework는 00 각주 규칙에 따라 **일반 모델 enablement 전체가 MCR 책임** — 신규 모델·기법 자체 포팅으로 리드타임 만성 열세 >1분기(C). a·b 동시 충족 요건이므로 종합 ★☆☆ |
| QA5 | ★☆☆ (F) | 초기 "수십 인월+"(A) > 24인월 bin 초과; 유지보수 인력 상시 소요 — vLLM 2주 릴리스(B) 추종을 자체 부담 시 > 2 FTE(C) |

### 후보구조 3 — KV-계층(LMCache) 확장형 (backend/policy-hook 기반)

**구조**: Inference Engine 자리는 vLLM 그대로. KV의 추출·이동·영속화 계층은
LMCache가 담당한다(vLLM 공식 KV offloading connector). MCR은 (a) 자사
tier(CXL·PNM DRAM·HBF)를 LMCache **storage backend connector 모듈**로 노출하고,
(b) 배치·압축·재사용 정책을 LMCache cache/storage manager의 정책 훅에 구현한다.
Memory Engine 코어는 LMCache 백엔드 인터페이스 뒤에 위치하고, Inference
Orchestration은 후보1과 동일하게 프로세스 밖 독립 계층.

**주의 — 후보1과의 구분**: 후보1은 vLLM의 확장점에 **자체 Memory Engine을
주입**하는 안(KV 계층의 골격을 MCR이 소유), 본 후보는 **기존 오픈소스 KV 계층에
올라타는** 안(골격·정책 훅·백엔드 추상화를 LMCache가 소유)이다. 상속 자산은 3
후보 중 최대, 아키텍처 골격 지배력은 최소.

**장점**
- 최대 상속: chunking·영속화·백엔드 추상화·압축(CacheGen)·비접두 재사용(CacheBlend)·엔진 간 KV 공유를 재구현 없이 획득 — 초기 비용 3 후보 중 최소, 기 구축 LMCache 연동 자산(A)이 그대로 출발점
- 엔진 중립성: vLLM·SGLang 통합을 무료로 획득 — Memory Engine 이식성·자사 메모리 SW 생태계 전략과 부합
- 생태계 포지셔닝: 자사 tier가 표준 KV 계층의 공식 백엔드로 등재되는 것 자체가 레퍼런스 가치 — 프로덕션 채택 실적 있는 계층에 편승
- 검증된 캐시 계층: 정합성·장애 경로가 대규모 배포로 검증됨

**단점**
- 스토리지 객체 추상화의 천장: 백엔드는 수동적 put/get 대상 — tier 대역폭·지연 topology 인지 배치, 요청별 SLO 정책이 들어갈 구조적 자리가 제한적 (정책 골격이 LMCache 소유)
- 근접 연산 표현 불가: 데이터 이동 전용 계층 — PIM/PNM 연산 오프로드(DP6)는 이 경로 밖에서 별도 통로(custom attention backend 등) 필요
- decode 경로 미개선: 주 효과가 prefill 재사용(TTFT)·용량 확장 — decode wait 70–85%(A) 자체는 다루지 못함
- 이중 upstream 종속: vLLM + LMCache 두 프로젝트의 API·릴리스를 동시 추종
- 차별화 희석 최대: MCR이 "LMCache 백엔드 하나"로 인식될 리스크 — 후보1의 "vLLM 애드온" 리스크보다 강함

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★☆ (F) | 1.1–1.5× bin 예측: 대표 워크로드(multiturn·agent memory·RAG)가 재사용 중심이라 prefill 절감·preemption 복원 이득 실현 가능(B — LMCache 보고 개선은 cache-hit 의존 상단). 단 decode wait 70–85%(A)를 다루는 tier-aware decode 경로·co-scheduling이 구조적으로 없어 ≥1.5× 도달 불가(C); 재사용 낮은 구간은 <1.1× 하향 리스크(C) — 동일 bin의 후보1보다 상한이 낮음 |
| QA2 | ★★★ (F) | ≥3× bin 예측: 다단 백엔드(CPU DRAM·SSD·원격) + CacheGen 압축을 상속해 원본 환산 수용량 확장이 이 후보의 주특기(B — 프로덕션 채택 사례); 자사 CXL tier는 백엔드 모듈로 즉시 기여(C). 단 재적재 지연이 가용 비율을 깎을 리스크(C) |
| QA3 | ★★☆ (F) | CacheGen 손실 압축 + CacheBlend selective recompute로 품질 회복 메커니즘 자체는 문헌 검증(B). 그러나 정책 골격이 LMCache 소유라 요청별 품질 예산 차등 집행 통로가 없음 — "전역 bound만 보장" ★★☆ bin 정의에 부합(C) |
| QA4 | ★★☆ (F) | (a) tier 추가 = 백엔드 connector 모듈 1개, LMCache 코어 무수정 — ★★★급(C). (b) KV 구조 영향 변화(MLA 등)는 vLLM과 LMCache **양쪽**의 대응을 모두 기다려야 함 — 이중 upstream 종속으로 ≤ upstream+2주 보장 불가, ≤1분기 예측(C). a·b 동시 충족 요건이라 종합 ★★☆ |
| QA5 | ★★★ (F) | 초기 3 후보 중 최소: KV 계층 전체를 상속하고 백엔드 connector + 정책 훅만 구현 — 기 구축 LMCache 연동 자산(A) 위에서 ≤6인월 예측(C). 추종은 백엔드 인터페이스 경계로 ≤0.5 FTE(C — 단 이중 upstream이라 후보1보다 변동성 큼) |

### 검토 노트

- 실질 결정 변수는 두 축이다. **축1 (후보1 vs 후보2)**: "확장점 밖에 있는 것이
  연구 가치의 핵심인가" — tier-aware co-scheduling과 non-contiguous KV 1급
  관리가 핵심 기여라면 후보1은 그 기여를 구조적으로 제한한다. **축2 (후보3 vs
  후보1·2)**: "MCR의 정체성이 KV 데이터-이동 계층인가, 배치×연산을 함께 결정하는
  메모리 시스템 런타임인가" — 후보3은 계층화(용량) 축의 최단 경로지만 근접
  연산(대역폭) 축과 decode 경로가 구조적으로 밖에 있다.
- QA 프로파일 요약: 후보3은 QA2·QA5에서 최강, QA1 상한과 QA3 집행 단위에서
  후보1에 열위, 골격 지배력(축2)에서 후보2에 열위 — 세 후보의 trade-off가 모두
  살아 있어 DP 자격을 유지한다.
- 현실적 절충은 **진화 경로형 결정**: 후보3으로 시작(자사 tier를 백엔드로 노출 —
  시장 진입·E2E 완주 최속)하되, 정책 훅·decode 경로가 막히는 지점을 ADR에
  목록화하고, 임계 초과 시 후보1(vLLM 확장점에 자체 Memory Engine)로, 그다음
  후보2로 전환한다. 후보3과 후보1은 상호 배타가 아니라 **공존 가능**(LMCache
  백엔드는 유지한 채 Memory Engine 코어를 자체화)하므로 전환 비용이 낮다 — 이
  경로의 실질 장점.

---

## DP2. KV 배치·압축의 관리 주체

### 문제 정의

이종 메모리 tier(GPU HBM / PNM DRAM / CXL) 위에서 KV cache의 배치(placement), 압축(compression level), 이동(promotion/demotion)을 **누가 결정하는가**. 이 결정에는 상반된 두 종류의 정보가 필요하다:

- **요청 문맥** (orchestration만 앎): SLO class, multiturn 재사용 확률, retrieval chunk의 공유도, 허용 품질 예산. 실측상 decode wait가 e2e의 70–85%이므로, "이 요청의 KV가 어느 tier에 어떤 압축 상태로 있는가"가 goodput을 직접 결정한다.
- **자원 상태** (memory engine만 신선하게 앎): tier별 잔량, 대역폭 포화도, 압박 스파이크. 이 정보는 μs~ms 단위로 변하며, request-granularity 제어 루프로는 따라잡을 수 없다.

압축에는 품질 비용이 있고(K가 V보다 민감하다는 K>V sensitivity 계열 결과 — 압축 대상·비율 선택이 품질을 좌우), 재사용에는 위치 비용이 있다(non-contiguous chunk의 selective recompute 여부). 즉 이 DP는 성능 문제이면서 동시에 **품질 예산의 집행 주체** 문제다. 구조적으로는 OS paging policy의 고전적 위치 논쟁(커널 자율 vs madvise 힌트 vs 응용 전권)과 동형이다.

### 설계 쟁점

1. 품질 예산(quality budget)을 요청별로 차등 집행하려면 결정 주체가 요청 문맥을 알아야 한다 — 어느 레벨까지 문맥을 내릴 것인가?
2. 메모리 압박 스파이크 대응은 μs 반응이 필요하다 — 어느 레벨까지 자율성을 줄 것인가?
3. Memory Engine의 독립 재사용성(타 엔진 이식, 자사 메모리 생태계 전략)을 policy 결합이 훼손하지 않는가?
4. (DP1 커플링) vLLM 확장형에서는 중앙 policy를 scheduler에 심을 수 없다 — DP1 채택안이 본 DP의 실현 가능 집합을 제약한다.

### 후보구조 1 — Orchestration 중앙 정책 (central policy, memory engine은 mechanism 전담)

**구조**: Scheduling 패키지에 KV Placement & Compression Policy 컴포넌트를 신설. KV-aware Router가 요청 배치 시 KV의 목표 tier·압축 수준·재사용/재계산 여부까지 함께 결정해 Memory Engine에 지시. Memory Engine은 지시 집행(mechanism)만 담당.

**장점**
- 전역 최적화: SLO class·재사용 확률·품질 예산을 반영한 배치 — quality-aware joint orchestration 연구의 자연스러운 구현 위치
- 품질 SLO 보장: 요청별 품질 예산을 중앙에서 집행 → 요청 간 품질 편차 통제 가능
- 결정 로직 단일화로 설명가능성·디버깅 용이

**단점**
- 반응 지연: 제어 루프가 request granularity → μs 단위 메모리 압박 스파이크에 늦어 stall/OOM성 지연 위험
- 인터페이스 비대화: tier 상태를 상시 상향 보고해야 정책이 성립 — orchestration↔memory 결합도 증가
- Memory Engine이 수동적 executor로 격하 → 독립 제품화·이식성 저하

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★☆ (F) | 정상 상태 배치 품질은 ≥1.5× 경로이나, μs 압박 스파이크에 request-granularity 정책 루프가 늦어 TPOT p99 tail 증가 — attainment ≥90% 경계 리스크로 ★★★ 미달(C) |
| QA2 | ★★★ (F) | ≥3× bin 예측: SLO class·재사용 확률 기반 배치로 오강등 miss 없이 tier·압축 이득을 온전히 회수(C) — 압축 2–4×(A) × tier 결합의 상한 실현 경로 |
| QA3 | ★★★ (F) | ★★★ bin의 "요청별 bound 집행" 조건을 구조적으로 정면 충족 — 품질 예산의 요청별 중앙 집행(C); acc ≤1%p·ΔPPL ≤0.1은 기법 문헌로 달성 가능(B) |
| QA4 | ★★☆ (F) | 정책이 tier 문맥·KV 의미론에 결합 — tier 추가/KV 구조 변화 시 중앙 정책(코어) 수정 발생, 단 ≤40% 범위·≤1분기 예측(C). 정책-메커니즘 결합으로 Memory Engine 단독 진화 제약 |
| QA5 | ★★☆ (F) | tier 상태 상시 상향 보고 인터페이스·상태 동기화 구현 — 초기 6–24인월 구간, 유지 ≤2 FTE 예측(C) |

### 후보구조 2 — Memory Engine 자율 (autonomous local policy)

**구조**: Cache Manager가 자체 정책(접근 온도 기반 승격/강등, watermark 기반 압축 트리거)을 내장. Orchestration은 얇은 힌트 API(pin, priority, 총 품질 예산)만 제공 — madvise 모델.

**장점**
- μs 반응: 자원 상태 변화에 즉시 대응, 압박 스파이크 흡수
- 얇은 인터페이스: 결합도 최소 — DP1 후보1(vLLM 확장형)과 가장 궁합이 좋음
- Memory Engine 독립성: 타 추론 엔진에도 이식 가능한 컴포넌트로 성립 — 자사 메모리 소프트웨어 생태계 전략과 부합

**단점**
- 문맥 부재: 재사용될 KV를 온도만 보고 강등하거나, SLO 여유 요청과 급한 요청을 동일 취급 → goodput 전역 최적 미달
- 품질 예산의 로컬 집행 → 요청 간 품질 불균형, "quality-aware joint orchestration"이라는 연구 기여 지점이 구조에서 사라짐

**QA 평가**

| QA | 평점 | 정량 근거 (00 v0.3 bin 판정) |
|----|------|-----------|
| QA1 | ★★★ (F) | attainment ≥90% 유지에 최강 — watermark 기반 μs 반응으로 압박 스파이크의 p99 tail 방어(C); 압축·tiering 기본 이득만으로 ≥1.5× 도달 가능(KIVI 계열 처리율 2.35–3.47×(B)). 단 오강등 miss가 배율을 깎으면 1.1–1.5×로 하향할 경계 리스크(C) |
| QA2 | ★★☆ (F) | 1.5–3× bin 예측: watermark 압축 트리거로 기본 배율은 확보하나, 문맥 없는 온도 정책이 재사용 예정 KV를 오강등 → miss·재계산 비용이 ≥3× 도달을 막음(C) |
| QA3 | ★★☆ (F) | **v0.2 ★☆☆에서 승격**: "전역 bound만 보장"이 v0.3 ★★☆ bin의 정의와 정확히 일치 — 전역 watermark 압축 수준 제한으로 acc ≤2%p(KIVI 2-bit 실측 상한(B)) 보수 운용 가능(C). 요청별 차등 불가로 ★★★ 미달 |
| QA4 | ★★★ (F) | (a) tier 추가 = Cache Manager 내 어댑터 모듈, 얇은 hint API라 코어(인터페이스) 무수정(C); (b) KV 구조 변화도 Memory Engine 모듈 내 수용 — +2주 추종 가능(C, 2주 주기(B)). 독립 이식성 최고 |
| QA5 | ★★★ (F) | 얇은 인터페이스·단계적 구현 — 초기 ≤6인월·유지 ≤0.5 FTE 예측(C) |

### 검토 노트

- 실질 채택 방향은 **계층 절충(hybrid)** 이 유력하다: mechanism과 기본 정책(온도·watermark)은 Memory Engine 자율로 두되, 품질·SLO가 걸린 결정만 orchestration이 예산·힌트로 하향(quality budget per request, pin/priority, 재사용 후보 명단). OS가 커널 페이징 + madvise로 수렴한 것과 같은 구조. 이렇게 하면 연구 기여(joint orchestration은 힌트 생성 로직에 위치)와 제품 전략(memory engine 독립성) 이 동시에 성립한다.
- 단, DP 문서에서는 순수형 두 후보의 긴장을 먼저 보인 뒤 hybrid를 채택안으로 제시하는 순서가 리뷰 설득력이 높다 — hybrid를 처음부터 후보로 세우면 trade-off 분석이 무뎌진다.

---

## DP 간 의존성

| 의존 | 내용 |
|------|------|
| DP1 → DP2 | vLLM 확장형(후보1) 채택 시 중앙 정책을 scheduler에 통합 불가 → DP2는 자율+힌트형으로 제약. KV-계층 확장형(후보3) 채택 시 정책 위치가 LMCache cache manager 골격에 추가 제약 — DP2 중앙 정책(후보1)의 실현 가능성이 3 후보 중 최소. 독립 framework(후보2) 채택 시 DP2 전 후보 실현 가능 |
| DP1 → DP6 | KV-계층 확장형(후보3)은 데이터 이동 전용 — 근접 연산 오프로드(DP6)는 KV-계층 경로 밖의 별도 통로(custom attention backend 등)를 전제해야 하며, DP6의 실현 가능 집합을 제약 |
| DP2 → 구조도 | 채택안에 따라 확정안 v2의 "policy 위치 미확정" 주석이 해소됨 (Scheduling 내 Policy 컴포넌트 신설 여부) |
| 공통 | 양 DP 모두 KV Index·KV Transport(신규 제안 컴포넌트)의 존재를 전제 |
