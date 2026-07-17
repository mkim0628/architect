# 요구사항 → QA 도출 과정 상세 (v0.1)

[00_requirements_analysis.md](00_requirements_analysis.md) §4의 Utility Tree가
**어떤 논리로** 수집 요구사항에서 QA1–QA5를 도출했는지의 근거 문서.
발표 자료(P7 Utility Tree/ASR 슬라이드)의 설명 소스로 사용한다.
선정 QA의 정량 bin 자체는 [00_qa_definitions.md](00_qa_definitions.md)가 단일 출처.

## 0. 도출 방법론 — 표준 프로세스 5단계

SEI 계열 표준 방법론을 따른다:

| 단계 | 행위 | 방법론 근거 |
|---|---|---|
| ① 분류 | VOC 22건을 기능(FR)/품질(QA 후보)/제약(C)으로 3분류 | QAW: 이해관계자 발화에서 품질 요구를 분리 — [SEI, Quality Attribute Workshops, CMU/SEI-2003-TR-016](https://insights.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/) |
| ② 시나리오화 | 품질 발화를 **자극→환경→응답→응답 측정** 구조의 검증 가능한 시나리오로 재기술 | 6-part Quality Attribute Scenario — Bass·Clements·Kazman, *Software Architecture in Practice* (SEI series) |
| ③ 명명 | 시나리오를 표준 품질속성 어휘로 명명 (Performance, Modifiability, …) | ISO/IEC 25010 제품 품질 모델 + SAiP 품질속성 분류 |
| ④ 우선순위 | Utility Tree — 각 시나리오에 (사업 중요도, 달성 난이도) 2축 평가 | ATAM Utility Tree — [Kazman et al., ATAM: Method for Architecture Evaluation, CMU/SEI-2000-TR-004](https://insights.sei.cmu.edu/library/atam-method-for-architecture-evaluation/) |
| ⑤ 선정·정량화 | 상위 5개를 ASR(Architecturally Significant Requirement)로 선정, 각 시나리오의 `[측정]`을 문헌 앵커 기반 정량 bin으로 정제 | 본 과제 규칙(architect-qa 스킬): bin 경계마다 A(실측)/B(문헌)/C(논증) 등급 근거 필수 |

**핵심 원칙**: "빠르면 좋겠다" 같은 형용사는 QA가 아니다. **측정 가능한
응답 측정(response measure)이 붙은 시나리오만** Utility Tree에 올린다 —
그래서 모든 행에 `[측정: …]`이 있고, 그 수치마다 출처가 있다.

## 1. 분류 단계 — 왜 이 9건이 '품질 요구'인가

판별 질문: 그 발화가 **"시스템이 무엇을 할 수 있어야 한다"**(기능)인가,
**"그 일을 얼마나 잘 해야 한다"**(품질)인가, **"선택지를 지운다"**(제약)인가.

- 예: R-03 "chunk KV를 재사용하고 싶다" → 재사용이라는 **기능**(FR-04).
  R-06 "품질이 떨어지면 못 쓴다" → 재사용·압축이 **얼마나 잘** 되어야
  하는가의 상한 → **품질**(→QA3). R-14 "기존 기법 채용" → 압축 알고리즘
  개발이라는 선택지를 지움 → **제약**(C-02).
- 이 판별로 VOC 22건 → 품질성 발화 9건: R-01·02·06·07·12·13·15·18·19·20·21
  (일부 VOC는 기능+품질 양쪽으로 정제됨).

## 2. QA별 도출 체인 — VOC에서 정량 bin까지

각 체인은 4단으로 구성된다:
**VOC(누가 왜)** → **품질 문장(무엇을 얼마나)** → **지표 선택(왜 이 지표)** → **정량 bin(왜 이 수치, 출처)**.

### 2.1 QA1. Performance — goodput@SLO

1. **VOC**: R-01 (MCR 개발팀 실측): 자체 P/D 분리 벤치에서 **decode 대기가
   E2E latency의 70–85%**(근거 A) — decode는 매 토큰 누적 KV 전체를 읽는
   memory-bandwidth-bound 연산이라 토큰 생성이 메모리에 묶인다.
   R-11 (임원): baseline 대비 **E2E 정량 입증** 요구.
2. **품질 문장**: "지연 약속을 지키면서 단위 시간당 처리 요청 수를 높인다."
3. **지표 선택 — 왜 raw throughput이 아니라 goodput인가**:
   raw throughput은 SLO를 어긴 응답까지 세어 성능을 **과대평가**한다.
   [DistServe (OSDI'24)](https://arxiv.org/pdf/2401.09670)가 이 문제를
   지적하고 **goodput = SLO attainment ≥ 90%를 유지하는 최대 처리율**로
   정의했다(B). 같은 논문 계열이 인간 독해 속도 ~250 words/min → TPOT
   ≈ 50 ms면 체감 충분이라는 인지 상한도 제공.
4. **SLO 수치의 출처**: MLPerf Inference가 공표한 시나리오별 제약 —
   [Server(Llama2-70B) TTFT p99 ≤ 2,000 ms · TPOT p99 ≤ 200 ms](https://mlcommons.org/2024/03/mlperf-llama2-70b/),
   [Interactive TTFT p99 ≤ 450 ms · TPOT p99 ≤ 40 ms](https://developer.nvidia.com/blog/nvidia-blackwell-delivers-massive-performance-leaps-in-mlperf-inference-v5-0/)(B).
   MCR 표준 SLO는 장문 컨텍스트를 감안한 절충: **TTFT 450 ms(Interactive)
   · TPOT 200 ms(Server)**.
5. **bin(≥1.5×)의 근거**: 메모리 측 개선 단독의 문헌 상단이
   [KIVI](https://arxiv.org/html/2402.02750v2) — 2-bit KV 양자화로 batch
   4×, **처리율 2.35–3.47×**(B, cache-hit·워크로드 의존). 여기서 워크로드
   비의존적으로 요구 가능한 **보수 하한 1.5×**를 상위 bin으로 설정.
   1.1× 미만은 A/B 테스트 통상 잡음과 구분 곤란(C). *함정 방지: DistServe의
   2–7.4×는 P/D 미분리 baseline 대비 수치라 인용 불가 — 본 QA의 baseline은
   P/D 분리를 동일 적용한 단일 tier(과제 3.2-3)이므로 P/D 효과는 상쇄된다.*

### 2.2 QA2. Resource Efficiency — 유효 KV 용량

1. **VOC**: R-02 (Memory-centric AI System 팀): 이종 메모리 시스템이 HBM
   용량 병목을 실제로 푸는지 — **같은 HBM으로 동시 컨텍스트를 얼마나 더
   수용하는지** 정량으로 보고 싶다.
2. **정량 배경 — 병목의 크기**: KV 크기 = 2(K,V) × layer 수 × KV head 수 ×
   head dim × 2 bytes(FP16) × 토큰 수. Llama-2-70B(GQA, 80 layer × 8 KV
   head × 128 dim) 기준 **토큰당 ≈ 320 KB → 32k 컨텍스트 1세션 ≈ 10.5 GB**.
   80 GB HBM 한 장에서 가중치를 빼면 동시 세션 수가 한 자릿수로 떨어진다 —
   용량이 곧 동시성(=처리율)의 상한이다.
3. **지표 선택 — 왜 '유효(원본 환산)' KV 용량인가**: 압축 후 저장 바이트가
   아니라 **"몇 토큰어치를 서빙할 수 있나"**가 비용을 결정한다. 분모를 물리
   HBM으로 두는 이유: HBM이 희소 자원이라 "HBM 한 장당 서빙 가능 컨텍스트"가
   비용 구조를 결정(C). 품질 bound(QA3)를 지키는 조건에서만 인정 — 안 그러면
   품질을 팔아 용량을 사는 눈속임이 가능하다.
4. **bin(≥3×)의 근거 — 3단 논증**:
   - 런타임 메모리 관리만으로 성능이 갈린다는 실증:
     [vLLM/PagedAttention (SOSP'23)](https://arxiv.org/abs/2309.06180) —
     기존 시스템 KV 낭비 **60–80% → <4%**, 동일 GPU 처리량 **2–4×**(B).
   - 압축 단독의 입증치: [KIVI](https://arxiv.org/html/2402.02750v2) 2-bit —
     peak memory **2.6× 절감, batch 4×**(B) → 압축만 잘 써도 1.5×는 도달.
   - tier 활용의 상단: [FlexGen (ICML'23)](https://arxiv.org/abs/2303.06865) —
     동일 16GB GPU에서 offloading 배치 정책만으로 최대 처리량 **100×**(B).
   - ∴ 압축 단독 도달선(1.5×)이 중간 bin, **tier+압축을 결합하는 MCR은 3×**가
     상위 bin. 1.5× 미만이면 압축 단독 대비 열위 = 이종 tier 도입의 존재 이유
     미달(C).

### 2.3 QA3. Accuracy — 품질 저하 bound

1. **VOC**: R-06 (응용팀): "압축·재사용 때문에 답변 품질이 떨어지면 서비스에
   못 쓴다 — **상한을 보장**해달라."
2. **품질 문장 — 왜 '개선 목표'가 아니라 'bound'인가**: 압축은 본질적으로
   lossy다. 품질은 올리는 대상이 아니라 **지키는 제약**이며, QA1·QA2의 수치는
   이 bound 안에서만 유효하다(bound 위반 시 성능·용량 수치 무효 — 전제 조건형
   QA).
3. **지표 선택**: 대표 벤치마크 accuracy 저하(%p, LongBench 계열) + ΔPPL
   (절대, Wikitext-2) 이중 지표 — PPL은 민감하지만 과제 무관 저하도 잡고,
   accuracy는 실사용 영향을 직접 반영. 추가 판정 축: bound의 **집행 단위**
   (요청별 vs 전역).
4. **정량 bin의 근거** (전 경계 B급 실측):
   - **ΔPPL ≤ 0.1**: [KVQuant (NeurIPS'24)](https://arxiv.org/html/2401.18079v4)
     — 3-bit 양자화에서 Wikitext-2·C4 기준 **ΔPPL < 0.1**을 LLaMA/Llama-2/
     -3/Mistral 전반에서 입증 → "달성 가능한 near-lossless 선".
   - **accuracy ≤ 2%p**: [KIVI](https://arxiv.org/html/2402.02750) 2-bit
     (최대 압축단)의 LongBench 실측 저하 상한 "**up to 2%**" → 극한 압축을
     쓰더라도 문헌이 보인 한계 이내여야 한다는 하한선.
   - **accuracy ≤ 1%p**: 사내 기존 기준(A) + near-lossless 관례 허용선(B).
   - **요청별 집행 조건**: K>V sensitivity 계열 결과(B) — 압축 대상 선택이
     품질을 좌우하므로, 요청별 차등 집행 가능 여부가 bound의 보장성을
     가른다(C). 그래서 ★★★에만 "요청별" 조건이 붙는다.

### 2.4 QA4. Modifiability — 신규 디바이스·KV 구조 변화 수용성

1. **VOC**: R-07 (메모리 사업부): 로드맵 신제품(HBM4/CMM-DC/HBF)의 즉시 수용.
   R-21 (응용팀): KV 구조가 바뀌는 신모델 즉시 서빙. R-13 (개발팀): vLLM
   추종 부담.
2. **품질 문장 — 왜 QA인가**: 변화의 주기가 아키텍처 결정의 수명보다 짧다.
   (a) 디바이스 축 — 자사 메모리 로드맵이 과제 기간 중에도 갱신된다.
   (b) 모델 축 — KV 구조 자체가 바뀌는 변화가 실재한다:
   [DeepSeek-V2의 MLA](https://arxiv.org/abs/2405.04434)는 latent KV로 KV
   cache를 **93.3% 축소**(KV의 정의 자체가 변경, B),
   [Mamba 계열 SSM](https://arxiv.org/abs/2312.00752)은 **KV cache 부재**(B).
   구조가 이를 모듈 교체로 수용 못 하면 신모델마다 코어 재설계가 반복된다.
3. **지표 선택**: (a) tier 추가 시 변경이 **모듈**에 갇히는가 vs **코어**
   (골격·공개 인터페이스) 침범 + 기능 변경 비율(%), (b) 모델 변화 수용
   리드타임(upstream 공개 시점 기준). 코어/모듈 판별 테스트는 QA 정의 문서
   상단(수정 시 타 모듈 재검증 필요 여부).
4. **정량 bin의 근거**:
   - **40%**: Architect 과제 원본 덱 QA-01의 사내 측정 기준 계승(A) —
     "신규 장치 지원 시 기능 추가/변경 ≤ 전체의 40%".
   - **upstream + 2주**: [vLLM 정규 릴리스가 2주 간격](https://github.com/vllm-project/vllm/blob/main/RELEASE.md)(B)
     → 한 릴리스 주기 내 추종 = 실질 동시 지원으로 정의.
   - **1분기 초과 = 만성 지연**: 1분기 ≈ 릴리스 6회 누락 → 생태계 대비
     만성 열세(C).

### 2.5 QA5. Affordability — 개발·운영 비용

1. **VOC**: R-12 (임원): 소수 인력 지속 유지 — 상시 전담팀 불가. R-13
   (개발팀): 2주 릴리스 추종 비용. R-14 (개발팀): 알고리즘 재발명 여력 없음.
2. **품질 문장 — 왜 QA인가**: 연구 과제 산출물이 레퍼런스 스택으로
   성립하려면 과제 종료 후에도 유지되어야 한다. 구조 선택(DP1: plugin vs
   독립 framework)에 따라 비용이 **수 인월 vs 수십 인월+**로 한 자릿수
   이상 갈리므로 아키텍처 결정 변수다.
3. **지표 선택**: 초기 구축 인월(person-month, "대표 워크로드 E2E 벤치
   완주"라는 검증 가능한 완료 조건 포함) + 연간 유지보수 FTE(rebase·추종·
   검증 포함).
4. **정량 bin의 근거**: 02 문서의 실측 표현(A) — plugin형 "초기 수 인월"
   vs 독립형 "초기 수십 인월+, 유지보수 인력 상시 소요" — 를 경계로 수치화.
   **0.5 FTE** = plugin 경계 유지 시 2주 릴리스 주기당 ~수일의 추종 비용(C).
   **2 FTE** = fork rebase 비용이 6–12개월 후 급증한다는 관찰(02 §DP1,
   C)에서 fork/독립 유지의 하한.

## 3. 미선정 4건 — 왜 이 5개"만"인가

선정 논거의 완결성은 탈락 논거에서 나온다(사유 없는 탈락은 stakeholder 배신):

| 후보 | 탈락 논거 | 처리 |
|---|---|---|
| Availability (R-18) | KV는 원본에서 **재계산 가능한 파생 데이터** — 유실은 정확성이 아닌 성능 문제로 환원(C), QA1 측정에 흡수 | 실패모델은 DP3·DP5 구조 결정으로; 상용화 재평가 |
| Security (R-19) | 실증 단계 재사용 범위를 **사용자/세션 내로 한정**하면 위협 자체가 소거(정책 제약으로 완화) | DP3 커플링; 멀티테넌트 상용화 시 독립 QA로 |
| Interoperability (R-15) | 독립 QA가 아니라 **DP1의 결정 변수** — plugin/독립 선택이 곧 호환성 수준을 결정 | QA4·QA5 bin(upstream+2주, FTE)이 대리 측정 |
| Scalability (R-20) | **고정 N 테스트베드 전제**(§3.1)로 N 조정 자체가 범위 외 → 중요도 L | N 조정 진화 경로 활성화 시 재평가 |

## 4. 우선순위 산정 — 중요도·난이도 판정 근거

규칙: **중요도 우선 → 동률 시 난이도 → 둘 다 동률이면 목표 지표 > 수단 지표.**

| QA | 중요도 판정 | 난이도 판정 | 우선순위 |
|---|---|---|---|
| QA1 | **H** — 과제 최종 판정 지표. 미달 시 나머지가 우수해도 무의미 | **H** — tier×압축×재사용이 모두 맞물려야 1.5×; decode wait 70–85% 병목의 실제 해소 필요 | 1 (H/H 동률서 목표 지표 우선) |
| QA2 | **H** — HBM당 컨텍스트가 비용 구조 결정, 이종 tier의 존재 이유 | **H** — 압축 단독(1.5×, 문헌 입증)을 넘어 품질 bound 안에서 tier 결합으로 3× | 2 (수단 지표) |
| QA3 | **H** — QA1·QA2의 전제 조건(bound 위반 시 수치 무효) | **M** — near-lossless가 문헌으로 입증된 기법의 재현; 단 요청별 집행은 설계 부담 | 3 |
| QA4 | **M** — 초기 가치 실증엔 비직결, 중장기 생존성 좌우 | **H** — 코어/모듈 경계는 되돌리기 어려운 초기 결정; MLA·SSM 수용은 어려움 | 4 |
| QA5 | **M** — 지속 가능성 좌우하나 성패 지표 아님 | **M** — plugin 경계 유지 시 관리 가능(02 실측) | 5 |

## 5. PPT 반영 가이드 (P7 슬라이드)

- 헤드라인: "품질 발화 9건 → 시나리오화 → Utility Tree → **QA 5건 선정**"
  (§0 5단계를 소형 흐름도로).
- 본문: §2의 4단 체인 중 **VOC 번호 → QA → [측정] → 출처** 만 남긴 축약
  행으로 Utility Tree 표 구성(00_requirements_analysis.md §4.2와 동일).
- 각주 영역: 문헌 앵커 6종(DistServe·MLPerf·KIVI·KVQuant·vLLM·FlexGen) —
  bin 수치의 출처임을 명시.
- 미선정 4건은 슬라이드 하단 1줄씩(§3 표의 탈락 논거 열).

## 출처 (본 문서 신규 인용분)

- [SEI — Quality Attribute Workshops (QAWs), Third Edition (CMU/SEI-2003-TR-016)](https://insights.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/)
- [SEI — ATAM: Method for Architecture Evaluation (CMU/SEI-2000-TR-004)](https://insights.sei.cmu.edu/library/atam-method-for-architecture-evaluation/)
- Bass, Clements, Kazman — *Software Architecture in Practice* (6-part QA scenario, Utility Tree)
- ISO/IEC 25010 — Systems and software Quality Requirements and Evaluation (SQuaRE)
- [DeepSeek-V2 (MLA — latent KV, KV cache 93.3% 축소)](https://arxiv.org/abs/2405.04434)
- [Mamba: Linear-Time Sequence Modeling with Selective State Spaces (KV cache 부재)](https://arxiv.org/abs/2312.00752)
- 기존 앵커(DistServe·MLPerf·KIVI·KVQuant·vLLM SOSP'23·FlexGen·vLLM RELEASE.md)는
  [00_qa_definitions.md](00_qa_definitions.md) §출처 참조
