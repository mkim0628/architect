# 요구사항 → QA 도출 과정 상세 (v0.5)

(v0.5: QA 정의 v0.8의 QA1 지표 개정 반영 — §2.1을 goodput@SLO에서 baseline
대비 throughput 배율(지연 가드·곡선 병행)로 재작성, ★★★ 2× 근거를 축별
문헌(CacheBlend·SGLang·vLLM·SmartANNS)으로 교체, retrieval(SSD-PIM 가속)
축을 VOC(R-09)와 함께 체인에 편입.)
(v0.4: QA2↔QA3 번호 교환(QA 정의 v0.7) 반영 — §2 체인 순서도 번호순으로 재배열.)
(v0.3: ΔF1 ≤ 1%p 근거를 MLPerf 99% 기준·KIVI 실측 평균·SnapKV·LongBench
표본 오차 논증으로 보강, QA4 모델 변화 예에서 SSM 제외·linear attention 포함.)
(v0.2: 요구사항 분석 v0.4 리뷰 반영 — VOC 재귀속(User·MCAS), P/D 전제 제거,
QA2 F1 전환·gate 상향, QA5 Maintainability 개칭, QA6 Adaptability 추가,
C-02/R-14 삭제 반영.)

[00_requirements_analysis.md](00_requirements_analysis.md) §4의 Utility Tree가
**어떤 논리로** 수집 요구사항에서 QA1–QA6을 도출했는지의 근거 문서.
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
  하는가의 상한 → **품질**(→QA2). R-10 "디바이스 HW 스펙은 못 바꾼다" →
  설계 선택지를 지우는 외부 강제 → **제약**(C-01).
- 이 판별로 유효 VOC 22건 → 품질성 발화 10건:
  R-01·02·06·07·08·12·13·15·18·19·20·21·23 (일부 VOC는 기능+품질 양쪽으로
  정제됨).

## 2. QA별 도출 체인 — VOC에서 정량 bin까지

각 체인은 4단으로 구성된다:
**VOC(누가 왜)** → **품질 문장(무엇을 얼마나)** → **지표 선택(왜 이 지표)** → **정량 bin(왜 이 수치, 출처)**.

### 2.1 QA1. Performance — baseline 대비 TTFT(prefill) · throughput(decode)

1. **VOC**: R-01 (MCR 개발팀): 컨텍스트 길이 폭증으로 **KV cache 크기가 HBM
   용량을 넘어선다** — 타겟 메모리로 이 병목이 풀리는지가 효용성 입증의 핵심.
   R-07 (메모리 사업부): **E2E 관점의 제품 가치 확인** — 고객 신뢰의 근거.
   **R-09 (메모리 사업부): PIM/PNM 연산의 효용성을 E2E에서 테스트** —
   long-context RAG에서 retrieval(유사도 검색)은 TTFT 임계 경로에 있고
   ([ADR-001](adr/ADR-001-ssd-pim-rag-retrieval.md)), SSD 기반 ANN은 I/O가
   실행 시간의 ~67%(B, SmartANNS)라 **근접연산(SSD-PIM) 검색 가속이 E2E
   성능 경로에 직접 기여**한다 — KV 관리만 하는 일반 런타임과의 차별 축.
   R-11 (임원): baseline 대비 **E2E 정량 입증** 요구.
   보조 배경(수집 방법의 자체 실측): decode 대기가 E2E latency의
   70–85%(A) — decode는 매 토큰 누적 KV 전체를 읽는 memory-bandwidth-bound
   연산이라 메모리 개선이 곧 성능 개선으로 이어질 여지가 크다.
2. **품질 문장**: "추론을 더 빠르게 시작하고(prefill) 더 많이
   생성한다(decode) — retrieval을 포함한 E2E 경로에서."
3. **지표 선택 — 왜 TTFT · throughput 2지표인가**:
   추론은 **prefill(첫 토큰까지)** 과 **decode(토큰 생성 지속)** 두 단계로
   나뉘고 MCR의 최적화가 각 단계에 1:1로 대응한다. **TTFT = prefill 축**:
   KV 재사용(재계산 회피)과 retrieval 가속(RAG 검색 단축)이 직접 줄이는
   지표. **throughput = decode 축**: 이종 tier 확장·압축이 batch를 키워
   끌어올리는 지표. 하나의 합성 지표(goodput 등)로 뭉치면 어느 단계의
   개선인지 흐려지므로 두 축을 분리한다.
   *goodput@SLO를 안 쓰는 이유*: 절대 SLO(MLPerf TTFT 450 ms 등)는 벤치마크
   시나리오에 고정된 제약이라 GPU 종류·규모가 비확정인 연구 테스트베드에서
   취약하다(구성이 약하면 goodput = 0으로 퇴화). baseline 대비 **배율**이
   문헌(vLLM·KIVI·CacheBlend)과 직접 비교된다(C). throughput은
   **iso-latency**(TPOT p99 ≤ baseline 운영점, [vLLM SOSP'23](https://arxiv.org/abs/2309.06180)
   "at the same level of latency" 방법론(B))로 판정해 지연을 팔아 처리량을
   산 구성을 배제한다 — 곡선을 병행 보고. TTFT는 재사용 hit/miss 이질성
   때문에 **평균 기준 판정·p99 병행**(꼬리는 cold 요청이 지배).
   goodput@SLO([DistServe](https://arxiv.org/pdf/2401.09670)(B))는 상용화
   단계 승격 경로로 유지.
4. **baseline 정의와 이유**: 동일 HW·동일 실행 구성에서 **GPU HBM 단일
   tier만 사용하는 구성** — 타겟 메모리 없이 현행 표준 서빙 스택이 달성
   가능한 최선이므로, 타겟 메모리 도입의 **순증분**이 분리 측정된다.
   P/D 분리는 전제하지 않는다 — 실험 변수로 두되 양쪽에 동일 적용해 효과를
   상쇄시킨다.
5. **bin(각 축 ≥ 2×)의 근거 — 두 단계를 각 단계 문헌이 독립 뒷받침**:
   **① TTFT ≥ 2× (prefill 축)**:
   [CacheBlend (EuroSys'25 Best Paper)](https://arxiv.org/abs/2405.16444)가
   RAG KV 재사용+선택 재계산으로 **TTFT 2.2–3.3× 단축**(B, 품질 저하
   0.01–0.03), [SGLang RadixAttention](https://arxiv.org/abs/2312.07104)이
   prefix 재계산 제거로 첫 토큰 지연 단축(B), retrieval 구간은
   [SmartANNS (ATC'24)](https://www.usenix.org/system/files/atc24-tian.pdf)가
   협력 인덱싱으로 **QPS 최대 10.7×**(B, SSD-PIM 검색 가속 ADR-001). 재사용
   +검색 결합에 **2×**(CacheBlend 하단 2.2×의 보수 반올림)를 요구(C).
   **② throughput ≥ 2× (decode 축)**:
   [KIVI](https://arxiv.org/html/2402.02750v2) 2-bit가 batch 4×로 **처리율
   2.35–3.47×**(B), [vLLM/PagedAttention (SOSP'23)](https://arxiv.org/abs/2309.06180)이
   메모리 관리만으로 동일 GPU **처리량 2–4×**(B). 이종 tier 확장이 batch를
   더 키우므로 압축·paging 단독 하단 **2×**를 요구(C).
   **두 지표를 AND로 묶는 이유**: TTFT만 좋고 throughput이 나쁘면(또는 반대)
   한 단계만 최적화한 것 — MCR의 가치는 prefill·decode 결합이므로 둘 다
   2×를 요구한다(C). 구 단일-throughput 기준의 1.5× 지연 가드는 근거 없는
   임의 배수라 폐기하고 iso-latency로 대체(v0.9). 각 축의 이득은
   cache-hit·워크로드 의존(B)이라 대표 워크로드 3종 전반에서 충족을 요구.

### 2.2 QA2. Accuracy — 품질 저하 bound (gate, 우선순위 2)

1. **VOC**: R-06 (User): "압축·재사용 때문에 답변 품질이 떨어지면 쓸 수
   없다 — **상한을 보장**해달라."
2. **품질 문장 — 왜 '개선 목표'가 아니라 'bound'인가**: 압축(양자화·토큰
   eviction)은 본질적으로 lossy다. 품질은 올리는 대상이 아니라 **지키는
   제약**이며, QA1·QA3의 수치는 이 bound 안에서만 유효하다. 이 **gate 성격**
   때문에 우선순위도 수단 지표(QA3)보다 앞선다 — 아무리 빨라도 품질이
   baseline과 크게 다르면 그 성능은 무효.
3. **지표 선택 — 왜 F1인가**: 주지표는 **ΔF1(%p)** — 대표 long-context
   벤치마크 [LongBench](https://arxiv.org/abs/2308.14508)의 QA 태스크군
   (HotpotQA·2WikiMQA 등) **공식 지표가 F1**이며(B), 정답의 부분 일치를
   반영해 이진 accuracy보다 저하를 민감하게 잡는다. baseline = 동일 모델·
   동일 벤치의 **비압축(FP16 KV)·비재사용** 구성 — 품질의 이론적 상한이므로
   ΔF1이 곧 압축·재사용의 품질 비용. 보조지표 ΔPPL(Wikitext-2) — 태스크
   무관 선행 신호(민감하지만 실사용 영향을 직접 반영하지 못해 보조로 강등).
   추가 판정 축: bound의 **집행 단위**(요청별 vs 전역).
4. **정량 bin의 근거** (전 경계 B급 실측):
   - **ΔF1 ≤ 2%p (중간 bin)**: [KIVI](https://arxiv.org/html/2402.02750)
     2-bit(최대 압축단)의 LongBench 실측 저하 상한 "**up to 2%**" —
     LongBench 점수는 태스크별 지표(QA군 = F1)이므로 이 상한이 곧 F1 기준
     저하 상한. 극한 압축을 쓰더라도 문헌이 보인 한계 이내여야 한다.
   - **ΔF1 ≤ 1%p (상위 bin)** — 네 갈래 근거의 교차점:
     ① *벤치마크 제도 기준*: [MLPerf Inference](https://mlcommons.org/2024/03/mlperf-llama2-70b/)
     closed division은 **참조 모델 정확도의 99% 이상**을 유지해야 유효 제출
     (Llama2-70B는 99%/99.9% 두 트랙, [v5.0 이후 99%가 표준](https://mlcommons.org/2025/04/llm-inference-v5/))(B)
     — 업계 벤치마크가 "최적화된 추론"에 허용하는 저하의 제도화된 상한.
     LongBench F1 점수대(≈40~50점)에서 상대 99% ≈ 절대 0.4~0.5점이므로 절대
     1%p(상대 ≈2%)는 MLPerf 99%보다 완화, KIVI 실측 상한(2%p)보다 엄격한
     중간 경계(C).
     ② *실측 도달 가능성*: 최대 압축단(2-bit) KIVI조차 LongBench **평균**
     저하는 **Δ0.25점**(Llama2-7B 44.52 → 44.27)(B) — 1%p는 평균이 아니라
     worst-case 편차까지 흡수한 상한.
     ③ *기법 일반성*: [H2O](https://arxiv.org/abs/2306.14048) KV 예산 20%
     동등 성능(B), [SnapKV](https://arxiv.org/abs/2404.14469) 프롬프트 KV
     92% 압축에 "negligible" 저하(B) — 양자화·eviction 전반에서 재현.
     ④ *통계 분해능*: LongBench QA 태스크당 **200샘플**(B) → 태스크 평균
     F1의 표준오차 ≈ 30/√200 ≈ 2.1점, 다태스크 평균 ≈ 0.5점(C) — 1%p는
     벤치마크가 신뢰 있게 검출 가능한 최소 저하와 같은 자릿수. 여기에
     ⑤ 사내 기존 기준 1%p(A) 계승.
   - **토큰 eviction도 동일 bound**: [H2O (NeurIPS'23)](https://arxiv.org/abs/2306.14048)
     — KV 예산 **20%**(80% eviction)에서 full-cache 동등 성능 입증(B) →
     eviction 계열도 near-lossless 운용이 가능하므로 기법 구분 없이 공통 적용.
   - **보조 ΔPPL ≤ 0.1**: [KVQuant (NeurIPS'24)](https://arxiv.org/html/2401.18079v4)
     — 3-bit 양자화에서 Wikitext-2·C4 기준 **ΔPPL < 0.1**을 LLaMA/Llama-2/
     -3/Mistral 전반에서 입증 → "달성 가능한 near-lossless 선".
   - **요청별 집행 조건**: K>V sensitivity 계열 결과(B) — 압축 대상 선택이
     품질을 좌우하므로, 요청별 차등 집행 가능 여부가 bound의 보장성을
     가른다(C). 그래서 ★★★에만 "요청별" 조건이 붙는다.

### 2.3 QA3. Resource Efficiency — 유효 KV 용량

1. **VOC**: R-02 (MCAS 팀): 시뮬레이션으로 예측한 이종 메모리 시스템의
   효과가 실측에서 재현되는지 — **같은 HBM으로 동시 컨텍스트를 얼마나 더
   수용하는지** 정량으로 보고 싶다. R-01 (MCR 개발팀): KV cache 크기가
   HBM 용량을 넘어서는 병목.
2. **정량 배경 — 병목의 크기**: KV 크기 = 2(K,V) × layer 수 × KV head 수 ×
   head dim × 2 bytes(FP16) × 토큰 수. Llama-2-70B(GQA, 80 layer × 8 KV
   head × 128 dim) 기준 **토큰당 ≈ 320 KB → 32k 컨텍스트 1세션 ≈ 10.5 GB**.
   80 GB HBM 한 장에서 가중치를 빼면 동시 세션 수가 한 자릿수로 떨어진다 —
   용량이 곧 동시성(=처리율)의 상한이다.
3. **지표 선택 — 왜 '유효(원본 환산)' KV 용량인가**: 압축 후 저장 바이트가
   아니라 **"몇 토큰어치를 서빙할 수 있나"**가 비용을 결정한다. 분모를 물리
   HBM으로 두는 이유: HBM이 희소 자원이라 "HBM 한 장당 서빙 가능 컨텍스트"가
   비용 구조를 결정(C). 품질 bound(QA2)를 지키는 조건에서만 인정 — 안 그러면
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

### 2.4 QA4. Modifiability — 신규 디바이스·KV 구조 변화 수용성

1. **VOC**: R-17 (MCR 개발팀): tier 조합을 바꿔가며 실험 — 신규 tier 등록이
   쉬워야 함. R-21 (User): KV 구조가 바뀌는 신모델 즉시 서빙.
   R-13 (MCR 개발팀): vLLM 추종 부담. 배경: 메모리 사업부 로드맵
   (HBM4/CMM-DC/HBF)이 과제 기간 중에도 갱신된다.
2. **품질 문장 — 왜 QA인가**: 변화의 주기가 아키텍처 결정의 수명보다 짧다.
   (a) 디바이스 축 — 자사 메모리 로드맵이 과제 기간 중에도 갱신된다.
   (b) 모델 축 — KV 구조 자체가 바뀌는 변화가 실재한다:
   [DeepSeek-V2의 MLA](https://arxiv.org/abs/2405.04434)는 latent KV로 KV
   cache를 **93.3% 축소**(KV의 정의 자체가 변경, B),
   [linear attention](https://arxiv.org/abs/2006.16236)은 KV cache를 **고정
   크기 순환 상태로 대체**하며(B) [MiniMax-01](https://arxiv.org/abs/2501.08313)
   (lightning attention hybrid)처럼 상용 규모 배치 사례도 등장(B).
   구조가 이를 모듈 교체로 수용 못 하면 신모델마다 코어 재설계가 반복된다.
3. **지표 선택**: (a) tier 추가 시 4개 정량 지표 — 신규/변경 **모듈 수**,
   **코어 변경 LOC 비율(%)**, 공개 인터페이스 **시그니처 변경 건수**(하위호환
   여부 병기), 기능 변경 비율(%) — baseline = 현행 코드베이스.
   (b) 모델 변화 수용 리드타임(upstream 공개 시점 기준). 코어/모듈 판별
   테스트는 QA 정의 문서 상단(수정 시 타 모듈 재검증 필요 여부).
4. **정량 bin의 근거**:
   - **40%**: Architect 과제 원본 덱 QA-01의 사내 측정 기준 계승(A) —
     "신규 장치 지원 시 기능 추가/변경 ≤ 전체의 40%".
   - **upstream + 2주**: [vLLM 정규 릴리스가 2주 간격](https://github.com/vllm-project/vllm/blob/main/RELEASE.md)(B)
     → 한 릴리스 주기 내 추종 = 실질 동시 지원으로 정의.
   - **1분기 초과 = 만성 지연**: 1분기 ≈ 릴리스 6회 누락 → 생태계 대비
     만성 열세(C).

### 2.5 QA5. Maintainability — 개발·운영 비용 (구 Affordability)

1. **VOC**: R-12 (임원): 소수 인력 지속 유지 — 상시 전담팀 불가. R-13
   (개발팀): 2주 릴리스 추종 비용. R-08 (메모리 사업부): 자체 레퍼런스
   스택을 고객에 제공 — 유지되지 않는 스택은 제공물이 못 된다.
2. **품질 문장 — 왜 QA인가**: 연구 과제 산출물이 레퍼런스 스택으로
   성립하려면 과제 종료 후에도 유지되어야 한다. 구조 선택(DP1: plugin vs
   독립 framework)에 따라 비용이 **수 인월 vs 수십 인월+**로 한 자릿수
   이상 갈리므로 아키텍처 결정 변수다. 명칭은 ISO/IEC 25010의
   **Maintainability**로 정렬(v0.2).
3. **지표 선택**: 초기 구축 인월(person-month, "대표 워크로드 E2E 벤치
   완주"라는 검증 가능한 완료 조건 포함) + 연간 유지보수 FTE(rebase·추종·
   검증 포함). baseline = DP1 후보별 비용 모델(02 실측 표현).
4. **정량 bin의 근거**: 02 문서의 실측 표현(A) — plugin형 "초기 수 인월"
   vs 독립형 "초기 수십 인월+, 유지보수 인력 상시 소요" — 를 경계로 수치화.
   **0.5 FTE** = plugin 경계 유지 시 2주 릴리스 주기당 ~수일의 추종 비용(C).
   **2 FTE** = fork rebase 비용이 6–12개월 후 급증한다는 관찰(02 §DP1,
   C)에서 fork/독립 유지의 하한.

### 2.6 QA6. Adaptability — framework 교체 적응성 (v0.2 신설)

1. **VOC**: R-23 (MCR 개발팀): "vLLM이 유일한 선택지가 아니다 — SGLang 등
   대안이 부상하고 있어, framework를 갈아탈 때의 비용이 통제되도록 종속을
   관리해야 한다."
2. **품질 문장 — 왜 QA인가**: upstream framework는 외부 변수다 — 방향
   전환·정체·세력 교체가 실제로 일어난다.
   [SGLang (NeurIPS'24)](https://arxiv.org/abs/2312.07104)은 RadixAttention
   기반으로 vLLM 동급 이상의 처리율을 보고하며(B) 실존하는 교체 후보다.
   교체 비용이 통제되지 않으면 framework 종속이 MCR 고유 자산(Memory
   Engine·정책)의 수명을 좌우한다(C).
3. **지표 선택**: framework 결합 코드 비율(%, 정적 분석) · 교체 시 코어
   변경 LOC · 전환 공수(인월). baseline = 현 framework(vLLM) 결합 구조 —
   교체 비용이 곧 종속 위험의 크기.
4. **정량 bin의 근거**: 격리 상한 10%·전환 3인월은 어댑터(ports-and-
   adapters) 패턴 성립 시 결합부가 인터페이스 구현 계층에 국한된다는 구조
   논증(C) + plugin형 초기 구축 "수 인월"(A)에서 포팅은 그 이하라는 추정(C).
   40%는 사내 기준(A, QA4와 동일 계승).
5. **우선순위**: M/H — QA4와 동률이나 과제 본질 축(타겟 메모리·모델 수용)이
   리스크 헤지 축(framework 교체)에 우선하므로 5위. 선정 폭을 5→6으로
   확장해 Maintainability와 함께 선정.

## 3. 미선정 4건 — 왜 이 5개"만"인가

선정 논거의 완결성은 탈락 논거에서 나온다(사유 없는 탈락은 stakeholder 배신):

| 후보 | 탈락 논거 | 처리 |
|---|---|---|
| Availability (R-18) | KV는 원본에서 **재계산 가능한 파생 데이터** — 유실은 정확성이 아닌 성능 문제로 환원(C), QA1 측정에 흡수 | 실패모델은 DP3·DP5 구조 결정으로; 상용화 재평가 |
| Security (R-19) | 실증 단계 재사용 범위를 **사용자/세션 내로 한정**하면 위협 자체가 소거(정책 제약으로 완화) | DP3 커플링; 멀티테넌트 상용화 시 독립 QA로 |
| Interoperability (R-15) | 독립 QA가 아니라 **DP1의 결정 변수** — plugin/독립 선택이 곧 호환성 수준을 결정 | QA4·QA5 bin(upstream+2주, FTE)이 대리 측정; framework **교체** 축은 QA6(Adaptability)로 분리 승격 |
| Scalability (R-20) | **고정 N 테스트베드 전제**(§3.1)로 N 조정 자체가 범위 외 → 중요도 L | N 조정 진화 경로 활성화 시 재평가 |

## 4. 우선순위 산정 — 중요도·난이도 판정 근거

규칙(v0.2 개정): **① 중요도 → ② 동률 시 성능 사슬 내 역할(목표 > 전제 gate >
수단) → ③ 난이도 → ④ 과제 본질 축 우선.**

| QA | 중요도 판정 | 난이도 판정 | 우선순위 |
|---|---|---|---|
| QA1 Performance | **H** — 과제 최종 판정 지표. 미달 시 나머지가 우수해도 무의미 | **H** — TTFT 2×(재사용·retrieval)와 throughput 2×(tier·압축)를 **동시** 달성해야 함 | 1 (목표) |
| QA2 Accuracy | **H** — QA1·QA3의 전제(gate): bound 위반 시 성능·용량 수치 무효 | **M** — near-lossless가 문헌으로 입증된 선의 재현; 단 요청별 집행은 설계 부담 | 2 (gate — 목표 다음, 수단 앞) |
| QA3 Resource Efficiency | **H** — HBM당 컨텍스트가 비용 구조 결정, 이종 tier의 존재 이유 | **H** — 압축 단독(1.5×, 문헌 입증)을 넘어 품질 bound 안에서 tier 결합으로 3× | 3 (수단) |
| QA4 Modifiability | **M** — 초기 가치 실증엔 비직결, 중장기 생존성 좌우 | **H** — 코어/모듈 경계는 되돌리기 어려운 초기 결정; MLA·linear attention 수용은 어려움 | 4 |
| QA6 Adaptability | **M** — framework 종속 리스크의 통제 — 산출물 수명 좌우 | **H** — framework마다 확장점 형태가 달라 어댑터 경계 설계가 어려움 | 5 (M/H 동률서 과제 본질 축이 우선) |
| QA5 Maintainability | **M** — 지속 가능성 좌우하나 성패 지표 아님 | **M** — plugin 경계 유지 시 관리 가능(02 실측) | 6 |

## 5. PPT 반영 가이드 (P7 슬라이드)

- 헤드라인: "품질 발화 10건 → 시나리오화 → Utility Tree → **QA 6건 선정**"
  (§0 5단계를 소형 흐름도로).
- 본문: §2의 4단 체인 중 **VOC 번호 → QA → [측정: 방법+baseline] → 출처**
  만 남긴 축약 행으로 Utility Tree 표 구성(00_requirements_analysis.md
  §4.2와 동일).
- 각주 영역: 문헌 앵커 9종(DistServe·MLPerf·KIVI·KVQuant·vLLM·FlexGen·
  H2O·LongBench·SGLang) — 측정 방법·bin 수치의 출처임을 명시.
- 미선정 4건은 슬라이드 하단 1줄씩(§3 표의 탈락 논거 열).

## 출처 (본 문서 신규 인용분)

- [SEI — Quality Attribute Workshops (QAWs), Third Edition (CMU/SEI-2003-TR-016)](https://insights.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/)
- [SEI — ATAM: Method for Architecture Evaluation (CMU/SEI-2000-TR-004)](https://insights.sei.cmu.edu/library/atam-method-for-architecture-evaluation/)
- Bass, Clements, Kazman — *Software Architecture in Practice* (6-part QA scenario, Utility Tree)
- ISO/IEC 25010 — Systems and software Quality Requirements and Evaluation (SQuaRE)
- [DeepSeek-V2 (MLA — latent KV, KV cache 93.3% 축소)](https://arxiv.org/abs/2405.04434)
- [Transformers are RNNs: Linear Attention (ICML'20)](https://arxiv.org/abs/2006.16236) — KV cache의 고정 크기 상태 대체 원리
- [MiniMax-01: Scaling Foundation Models with Lightning Attention](https://arxiv.org/abs/2501.08313) — linear attention 실전 배치 사례
- [SnapKV (NeurIPS'24)](https://arxiv.org/abs/2404.14469) — 프롬프트 KV 92% 압축, negligible 저하
- [MLCommons — MLPerf Inference v5.0](https://mlcommons.org/2025/04/llm-inference-v5/) — closed division 정확도 = 참조의 99%
- [H2O: Heavy-Hitter Oracle for Efficient Generative Inference (NeurIPS'23)](https://arxiv.org/abs/2306.14048) — 토큰 eviction, KV 예산 20%로 동등 성능
- [LongBench (ACL'24)](https://arxiv.org/abs/2308.14508) — QA 태스크군 공식 지표 F1
- [SGLang (NeurIPS'24)](https://arxiv.org/abs/2312.07104) — 대안 serving framework (QA6 근거)
- [CacheBlend (EuroSys'25 Best Paper)](https://arxiv.org/abs/2405.16444) —
  RAG KV 재사용+선택 재계산: TTFT 2.2–3.3× 단축, 처리율 2.8–5× (QA1 2× bin 근거)
- [SmartANNS (ATC'24)](https://www.usenix.org/system/files/atc24-tian.pdf) —
  SSD ANN I/O 병목 ~67%, near-storage 협력 인덱싱 QPS 최대 10.7× (QA1 retrieval 축)
- 기존 앵커(DistServe·MLPerf·KIVI·KVQuant·vLLM SOSP'23·FlexGen·vLLM RELEASE.md)는
  [00_qa_definitions.md](00_qa_definitions.md) §출처 참조
