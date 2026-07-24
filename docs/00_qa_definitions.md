# MCR QA 정의 및 별점 평가 기준 (v1.1)

`02_design_points_dp1_dp2.md` §0의 잠정 QA 정의를 분리·승격한 문서.
모든 DP/후보구조 평가는 본 문서의 정량 bin을 기준으로 별점을 매긴다.
(잠정 — MCR 공식 QA 확정 시 본 문서를 개정하고 기존 평가표를 재평가한다.)

## QA 요약표 (우선순위 순 — v1.1 전면 재번호: 번호 = 우선순위)

| QA | Refinement | 시나리오 | 중요도 | 난이도 | 우선순위 |
|---|---|---|---|---|---|
| **Performance — Latency** (QA1. TTFT, prefill 성능) | baseline 대비 **TTFT 단축 배율** — 목표 1(KV 재사용)의 판정 지표 | 대표 워크로드(long-context RAG · multiturn · agent memory)를 동일 HW·동일 실행 구성에서 E2E 서빙하며 첫 토큰까지의 시간을 잰다 — KV 재사용(prefix·비접두)·복원 vs 재계산 판단의 효과 축. **평균 기준 판정 · p99 분포 병행**(꼬리는 cache-miss cold 요청이 지배). baseline = GPU HBM 단일 tier 구성(순증분 분리 측정), ablation: 재사용 off 대비 순기여. [측정: TTFT 단축 배율 **≥ 2×** → ★★★] | H | H | 1 |
| **Performance — Throughput** (QA2. throughput, decode 성능) | baseline 대비 **throughput 배율** — 목표 2(압축·tier 확장)·목표 3(KV 인지 스케줄링)의 판정 지표 | 동일 조건에서 생성 처리량(tokens/s·req/s)을 **iso-latency**(TPOT p99 ≤ baseline 운영점)로 잰다 — 압축·tier 확장의 batch 확대(목표 2)와 KV 인지 스케줄링의 이득 전환(목표 3)의 효과 축. throughput–latency 곡선 병행 보고. baseline = QA1과 동일, ablation: 압축 off / KV-blind 스케줄링 대비 순기여. [측정: throughput 배율 **≥ 2×** → ★★★] | H | H | 2 |
| **Accuracy** (QA3. 응답 품질) | 압축·재사용 품질 저하 상한(bound) — 성능·용량 수치의 유효 전제(gate) | 압축(양자화·토큰 eviction)·재사용을 실서빙 설정으로 활성화하고 long-context 벤치마크(LongBench 등)에서 baseline(비압축 FP16 KV·비재사용 — 품질의 이론적 상한) 대비 F1-score 차이(ΔF1)를 측정하고, bound 집행 단위(요청별 vs 전역)를 판정한다. 보조: ΔPPL(Wikitext-2). [측정: ΔF1 ≤ 1%p · 요청별 bound 집행 → ★★★] | H | H (v1.1 M→H) | 3 |
| **Resource Efficiency** (QA4. 메모리 효율) | 유효 KV 용량 (원본 환산 동시 수용량) | QA3 품질 bound를 지키는 조건에서 Σ_tier(용량 × 평균 압축률 × KV 가용 비율)로 원본 환산 유효 KV 용량을 산출하고 물리 HBM 용량 대비 배율을 구한다. baseline = HBM 단일 tier·비압축(정의상 1.0× — HBM당 수용 컨텍스트가 비용 결정). [측정: 유효 KV 용량 ≥ 3× → ★★★] | H | H | 4 |
| **Modifiability** (QA5. 확장성·진화성) | KV 구조 변화·신규 tier 수용 용이성 — framework 결합 격리를 코어/모듈 지표로 포괄(v1.1 Adaptability 흡수) | (a) 신규 tier 추가(1단계 commodity 조합 변경 + 로드맵 디바이스[HBM4/CMM-DC/HBF] 파라미터 대입 — 2단계 수용 사전 검증) 시 신규/변경 모듈 수, 코어 변경 LOC 비율(%), 공개 인터페이스 시그니처 변경 건수를 세고 (b) KV 구조 영향 모델 변화(GQA/MQA·MLA·sliding-window·linear attention)의 수용 리드타임을 upstream 공개 시점 기준으로 잰다. baseline = 현행 코드베이스. [측정: 신규 어댑터 모듈 ≤ 1 · 코어 변경 LOC 0 · 시그니처 변경 0건 · 수용 ≤ upstream + 2주 → ★★★] | M | H | 5 |
| **Maintainability** (QA6. 유지보수성 — 개발·운영 비용) | 초기 구축 + 지속 유지보수 비용 | 대표 워크로드 E2E 벤치 완주까지의 초기 구축 인월(person-month)과, upstream 추종(rebase)·회귀 검증을 포함한 연간 유지보수 FTE를 산정한다. baseline = DP1 후보별 비용 모델(02 실측 표현). [측정: 초기 ≤ 6 인월 · 유지 ≤ 0.5 FTE → ★★★] | M | M | 6 |

**중요도·난이도·우선순위 규칙**

- **중요도** (H/M/L): 해당 QA 미달이 MCR의 존재 가치·평가 결론에 주는 타격 크기.
- **난이도** (H/M/L): 상위 bin(★★★) 도달에 필요한 설계·구현·검증의 어려움.
- **우선순위 산정**: ① **중요도** 우선 ② 동률이면 성능 사슬 내 **역할** —
  최종 목표 > 그 유효성의 전제(gate) > 수단. H/H 4건이 이 규칙으로 갈린다:
  QA1·QA2(목표 — 동률 순번은 목표 번호 순, 판정 영향 없음) > QA3(품질
  bound — 위반 시 성능·용량 수치 무효인 gate) > QA4(유효 KV 용량, 수단)
  ③ 그 외 동률은 **난이도** (QA5 M/H > QA6 M/M). **역할이 난이도에 앞서는
  이유**: 난이도는 "달성이 어려운가", 우선순위는 "아키텍처가 무엇을 먼저
  보장해야 하는가"의 축 — gate가 무너지면 수단 지표의 수치 자체가 무효가
  되므로 검증 의존성 순서가 난이도에 앞선다(C).
- **QA1·QA2의 쌍 결합**: 구 QA1(단일 Performance)의 "TTFT·throughput 모두
  2×" AND 조건은 두 QA의 개별 별점으로 계승된다 — 종합 판정에서 **두 QA
  모두 ★★★이어야 구 ★★★와 동치**. 한쪽만 최적화한 설계(TTFT만 좋고
  throughput 희생, 또는 반대)는 다른 쪽 QA의 별점 하락으로 드러난다.
- **QA 번호 ↔ 우선순위**: v1.1 전면 재번호로 **전 QA가 번호 = 우선순위**다
  (구번호 매핑은 개정 이력 v1.1 참조 — 기존 DP 평가표는 구번호 기준이므로
  매핑 표로 읽고, 차기 DP 문서 개정에서 일괄 치환한다).

**개정 이력**
- v1.1: **QA 체계 검수 반영 — 분할·재번호·재판정.**
  ① **Performance를 2개 QA로 분할**: QA1 TTFT(prefill, 목표 1) ·
  QA2 throughput(decode, 목표 2·3). 단일 QA 내 2지표 AND는 축별 판정·DP
  별점 기여를 흐린다는 검수 의견 반영 — bin(각 ≥2×)·측정 조건은 분할 전과
  동일, AND 조건은 "두 QA 모두 ★★★" 요건으로 계승
  ② **Accuracy 난이도 M→H 재판정**: 목표 재정의로 비접두 재사용(선택
  재계산)·요청별 차등 압축·축출(스케줄링)이 모두 품질에 영향을 주는 **3중
  노출** 구조가 되어 요청별 bound 집행이 세 메커니즘의 통합 품질 추적을
  요구하고, C-03(training-free)으로 재학습 기반 회복 수단이 배제됨 —
  문헌 재현(M) 수준을 넘는 설계 부담(H). 이로써 H그룹 4건이 모두 H/H
  동률이 되어 우선순위는 역할 규칙만으로 결정
  ③ **Adaptability(구 QA6) 미선정 전환**: 중요도 M→L 재판정(1단계는 단일
  framework 위 실증이 목적 — 교체 리스크 노출 시점은 2단계/상용화) +
  측정축이 Modifiability의 코어/모듈 경계 지표와 중복(코어 변경 LOC·
  시그니처 건수가 framework 결합 격리를 대리 측정) + 어댑터 경계는 DP1
  결정 변수로 흡수. 요구사항 분석 v1.1 Utility Tree QA-10(미선정) 참조
  ④ **전면 재번호 (번호 = 우선순위)** — 구→신 매핑:
  구 QA1(Performance) → **신 QA1(TTFT) + 신 QA2(throughput)** /
  구 QA2(Accuracy) → **신 QA3** / 구 QA3(Resource Efficiency) → **신 QA4** /
  구 QA4(Modifiability) → **신 QA5** / 구 QA5(Maintainability) → **신 QA6** /
  구 QA6(Adaptability) → **미선정**(신 QA5가 대리 측정).
  **주의: 기존 DP1–DP8 평가표는 구번호 기준** — 위 매핑으로 읽고 차기 DP
  문서 개정에서 일괄 치환
- v1.0: **과제 목표 재정의(배경 v5 — MCR 1단계) 반영.** ① QA1 시나리오에서
  **retrieval(SSD-PIM 근접 가속, ADR-001) 축 제거** — 근접연산 오프로드가
  2단계(MCR 완성)로 이관됨에 따라 TTFT 축 근거를 KV 재사용 문헌(CacheBlend·
  SGLang)만으로 재구성(2× bin은 CacheBlend 하단 2.2×의 보수 반올림으로 여전히
  성립 — 수치 불변). SmartANNS·ADR-001 앵커는 2단계 참고로 유지 ② QA1
  throughput 축에 **KV 인지 스케줄링(목표 3)** 명시 ③ 표준 측정 조건에
  **축별 ablation**(재사용 off / 압축 off / KV-blind 스케줄링 — 목표 3축의
  순기여 분리) 추가 ④ QA4의 신규 tier 축을 "1단계 commodity 조합 변경 +
  2단계 자사 디바이스 수용의 사전 검증"으로 재규정(측정·bin 불변). 정량
  bin은 전 QA 무변경 — 기존 DP 평가표 재평가 불요(QA1 축 구성 주석만 갱신)
- v0.9: **QA1을 2지표(TTFT · throughput)로 재구성** — 추론의 두 단계에
  지표를 1:1 대응: **TTFT 단축 배율 = prefill 축**(KV 재사용·SSD-PIM
  retrieval 가속의 효과가 나타나는 곳), **throughput 배율 = decode 축**
  (tier 확장·압축의 batch 확대 효과가 나타나는 곳). 각각 baseline 대비
  **≥ 2×**가 ★★★ (둘 다 충족). v0.8의 지연 가드(TPOT ≤ baseline 1.5×)는
  근거 없는 임의 배수라는 리뷰 지적으로 폐기 — throughput 판정을
  **iso-latency**(TPOT p99 ≤ baseline, vLLM SOSP'23의 비교 방법론(B))로
  강화. TTFT는 평균 기준 판정·p99 분포 병행(재사용 hit/miss 이질성으로
  꼬리는 cold 요청이 지배). 축별 근거를 지표별로 재배열(CacheBlend·
  SmartANNS → TTFT / KIVI·vLLM → throughput)
- v0.8: **QA1 지표 전면 개정** — ① goodput@SLO(절대 SLO 450ms/200ms) →
  **baseline 대비 throughput 배율 + 지연 가드(TPOT p99 ≤ baseline 1.5×) +
  throughput–latency 곡선 병행 보고**. 사유: 연구 과제로 테스트베드 GPU
  종류·규모가 비확정 — 절대 SLO 앵커는 구성이 약하면 어떤 처리율에서도 미달
  (goodput=0)로 지표가 퇴화하고, 실서빙 SLA가 없는 과제 성격과도 불일치.
  배율 지표는 문헌(vLLM·KIVI·FlexGen·CacheBlend)과 직접 비교 가능. 지연
  가드는 FlexGen형(지연 붕괴 offline 처리량) 퇴화 구성을 배제 ② **★★★
  경계 1.5× → 2× 상향** — 구 근거(KIVI)는 양자화 단독 문헌이라 압축·재사용·
  tiering·근접연산을 결합하는 시스템의 목표 근거로는 논리 결함. 축별 단독
  실측(압축 2.35–3.47× · 재사용 2.8–5×/≤6.4× · paging 2–4× · 검색 ≤10.7×)이
  모두 2×를 넘으므로 결합 시스템에 2×를 요구 — 1.5×는 단독 기법 도달선으로
  ★★☆로 강등 ③ 평가 시나리오에 **retrieval(SSD-PIM 가속, ADR-001) 포함
  E2E**를 명시 ④ goodput@SLO는 상용화 단계 승격 경로로 유지. **주의: 기존
  DP1–DP8 평가표의 QA1 별점은 구 bin(≥1.5×) 기준 — 신 bin으로 재평가 필요**
- v0.7: **QA2 ↔ QA3 번호 교환** — 응답 품질(Accuracy)=QA2(우선순위 2),
  메모리 효율(Resource Efficiency)=QA3(우선순위 3)으로 번호를 우선순위에
  정렬. 본 문서 및 참조 문서 전체(요구사항 분석·도출 문서·DP 02~05·범위
  문서) 일괄 치환 — 과거 개정 이력 서술도 신 번호 기준으로 읽는다
- v0.6: ① 본문 절 순서를 우선순위 순(QA1→QA2→QA3→QA4→QA6→QA5)으로 재배열
  (번호는 식별자로 유지) ② QA2 ★★★ 경계 1%p의 선정 근거를 MLPerf 허용
  저하(99%)·KIVI 실측 평균(Δ0.25점)·SnapKV·LongBench 표본 오차 논증으로
  보강 ③ QA4 모델 변화 예에서 SSM 제외, linear attention 계열 포함
- v0.5: 요구사항 분석 v0.4 리뷰 반영 — ① QA1 baseline에서 P/D 분리 전제
  제거(동일 실행 구성의 GPU HBM 단일 tier로 재정의, 선정 이유 명시)
  ② QA2 주지표를 accuracy(%p)에서 **F1-score(ΔF1)** 로 전환(LongBench QA
  태스크 공식 지표), 압축 기법에 토큰 eviction 포함, gate 역할로 우선순위
  2 상향 ③ QA4 측정 정량화(모듈 수·코어 LOC 비율·시그니처 변경 건수)
  ④ QA5 명칭 Affordability → **Maintainability** ⑤ **QA6 Adaptability**
  (framework 교체) 신설 ⑥ 우선순위 규칙 개정(역할 tie-break 도입) 및
  번호-우선순위 분리(번호는 식별자로 고정)
- v0.4: ① QA별 중요도·난이도·우선순위 도입(산정 규칙 명시, 우선순위 = QA 번호)
  ② QA별 평가 시나리오를 기존 정의·측정 기술로부터 명문화 ③ 문서 상단에
  QA 요약표(QA·Refinement·시나리오·중요도·난이도·우선순위) 추가
- v0.3: ① QA1 baseline 정의 명시(P/D 분리 포함) 및 bin 근거를 메모리 측 증분
  문헌으로 교체 ② QA3 "유효 KV 용량" 용어를 원본 환산 기준으로 재정의
  ③ QA2 경계값을 문헌 실측치(KVQuant·KIVI)로 재앵커링(B급) ④ QA4 코어/모듈
  용어 정의 추가, 모델 축을 "KV 구조 영향 변화"로 재정의
- v0.2: 02 §0에서 분리, 별점별 정량 bin 도입

## 별점 체계 공통 규칙

- **3단계 만점 3**: `★★★` / `★★☆` / `★☆☆`. 모든 별점은 아래 각 QA의
  **정량 bin**에 대응해야 하며, bin 판정 근거 없는 별점은 무효.
- **평가 시점 표기**: 설계 단계 예측이면 `(F)` forecast, 실측이면 `(M)` measured.
  F 평가는 "어느 bin에 도달할 것으로 보는가 + 왜"를 근거에 명시.
- **근거 등급**: `A` 자체 실측 · `B` 문헌/벤치마크 인용 · `C` 구조 논증.
  근거에 등급을 병기한다 (예: "decode wait 70–85% 실측(A)").
- **상한/도달 리스크 분리**: 설계 상한과 도달 확률이 갈리면
  `★★★ (상한) / ★☆ (도달 리스크)`로 분리 표기.

## 용어 정의 (코어 / 모듈)

| 용어 | 정의 | MCR에서의 예 |
|---|---|---|
| **모듈** | 단일 책임을 갖고 통째로 교체·추가 가능한 부품. 수정해도 파급이 자신 안에 갇힘 | tier 어댑터, CompressionOp Kernel, Attention Engine, custom kernel |
| **코어** | 모듈들이 꽂히는 골격 — 스케줄러, tier/block 관리, 실행 파이프라인, **공개 인터페이스**(KV Locator, CompressionOp) | Scheduling, Cache Manager 골격, Tier Topology Model 자체 |

**판별 테스트**: 그 코드를 수정했을 때 **다른 모듈들을 재검증해야 하면 코어**,
그 부품만 다시 검증하면 되면 모듈이다. (인터페이스 시그니처 변경은 항상 코어 수정.)

## SLO 앵커 (외부 레퍼런스)

| 앵커 | 값 | 출처 |
|---|---|---|
| MLPerf Inference **Server** (Llama2-70B) | TTFT p99 ≤ 2,000 ms · TPOT p99 ≤ 200 ms | [MLCommons](https://mlcommons.org/2024/03/mlperf-llama2-70b/) |
| MLPerf Inference **Interactive** | TTFT p99 ≤ 450 ms · TPOT p99 ≤ 40 ms | [NVIDIA MLPerf v5.0](https://developer.nvidia.com/blog/nvidia-blackwell-delivers-massive-performance-leaps-in-mlperf-inference-v5-0/) |
| goodput 정의 · SLO attainment | SLO(TTFT·TPOT) 충족률 **≥ 90%** 유지 최대 처리율 | [DistServe (OSDI'24)](https://arxiv.org/pdf/2401.09670), [Hao AI Lab](https://haoailab.com/blogs/distserve/) |
| TPOT 인지 상한 | 인간 독해 속도 ~250 words/min → TPOT ≈ 50 ms면 체감 충분 | DistServe 상동 |
| KV 압축 용량·처리율 | 2-bit 양자화: peak memory 2.6× 절감, batch 4×, **처리율 2.35–3.47×** | [KIVI](https://arxiv.org/html/2402.02750v2) |
| KV 재사용 — **TTFT**(prefill) | RAG KV 재사용 + 선택 재계산(HKVD 10–15%): **TTFT 2.2–3.3× 단축**(부수 처리율 2.8–5×), 품질 저하 F1/Rouge-L 0.01–0.03 | [CacheBlend (EuroSys'25 Best Paper)](https://arxiv.org/abs/2405.16444) |
| prefix 재사용 — **TTFT**(prefill) | RadixAttention cross-request 재사용 — prefill 재계산 제거로 첫 토큰 지연 단축, prefix 공유 워크로드 처리율 최대 6.4× | [SGLang (NeurIPS'24)](https://arxiv.org/abs/2312.07104) |
| near-storage 검색 — retrieval (**2단계 참고**, v1.0) | SSD 기반 ANN에서 I/O가 실행 시간 ~67% → host CPU + SSD 협력 인덱싱으로 **QPS 최대 10.7×** — 2단계(근접연산 오프로드) 편입 시 RAG TTFT 임계 경로 단축 근거 | [SmartANNS (ATC'24)](https://www.usenix.org/system/files/atc24-tian.pdf) · [ADR-001](adr/ADR-001-ssd-pim-rag-retrieval.md) |
| paging — **throughput**(decode) | PagedAttention KV 관리만으로 동일 GPU **처리량 2–4×** | [vLLM (SOSP'23)](https://arxiv.org/abs/2309.06180) |
| KV 압축 품질 (PPL) | 3-bit 양자화 **ΔPPL < 0.1 (절대)** — Wikitext-2·C4, LLaMA/Llama-2/-3/Mistral | [KVQuant (NeurIPS'24)](https://arxiv.org/html/2401.18079v4) |
| KV 압축 품질 (accuracy) | 2-bit 양자화 LongBench accuracy 저하 **최대 2%p** (Llama/Mistral) | [KIVI](https://arxiv.org/html/2402.02750) |
| upstream 추종 주기 | vLLM 정규 릴리스 **2주 간격** | [vLLM RELEASE.md](https://github.com/vllm-project/vllm/blob/main/RELEASE.md) |
| 사내 확장성 기준 | 신규 장치 지원 시 기능 추가/변경 ≤ 전체의 40% | Architect 과제 원본 덱 QA-01 측정 기준 |
| KV 토큰 eviction 품질 | KV 예산 **20%**(80% eviction)로 full-cache 동등 성능 | [H2O (NeurIPS'23)](https://arxiv.org/abs/2306.14048) |
| long-context 벤치 지표 | LongBench QA 태스크군 공식 지표 = **F1** (요약 Rouge-L 등 태스크별) | [LongBench (ACL'24)](https://arxiv.org/abs/2308.14508) |
| 대안 framework 실재 | SGLang — RadixAttention 기반, vLLM 동급 이상 처리율 보고 | [SGLang (NeurIPS'24)](https://arxiv.org/abs/2312.07104) |
| 최적화 추론의 허용 저하 (벤치마크 표준) | MLPerf Inference closed division: 정확도 ≥ **참조 모델의 99%** (Llama2-70B는 99%/99.9% 두 트랙) | [MLCommons](https://mlcommons.org/2024/03/mlperf-llama2-70b/) · [MLPerf v5.0](https://mlcommons.org/2025/04/llm-inference-v5/) |
| KV 압축 실측 평균 저하 | KIVI 2-bit LongBench 평균 저하 **Δ0.25점** (Llama2-7B: 44.52 → 44.27) | [KIVI](https://arxiv.org/html/2402.02750v2) |
| LongBench 표본 규모 | QA 태스크당 **200 샘플**(MultiFieldQA 150) — F1 평균의 표본 오차 산정 기초 | [LongBench (ACL'24)](https://arxiv.org/html/2308.14508v1) |

**MCR 표준 측정 조건**(별도 명시 없으면 이 조건으로 측정, v1.0): ①
**TTFT** — 동일 부하에서 baseline 대비 단축 배율, 워크로드 **평균 기준
판정 · p99 분포 병행 보고** (재사용 hit/miss 이질성 때문에 꼬리는 cold
요청이 지배 — 평균이 재사용 효과를, p99가 cold-path 개선을 각각 보인다)
② **throughput** — **iso-latency 비교**: TPOT p99가 baseline과 같거나
좋은 운영점에서 배율을 판정(vLLM SOSP'23 "at the same level of latency"
비교 방법론(B)), throughput–latency 곡선을 병행 보고 ③ **축별
ablation**(v1.0) — 목표 3축의 순기여를 분리 보고: (a) 재사용 off (b) 압축
off (c) KV-blind 스케줄링(locality 무시 라우팅 + naive eviction)의 세 구성
대비 증분을 각각 측정 — 합산 배율만으로는 어느 목표가 달성됐는지 판정할 수
없기 때문(C). 대표 워크로드 = long-context RAG · multiturn · agent memory
(과제 범위 3.2-3). 절대 SLO(MLPerf TTFT 450 ms 등)는 QA1·QA2의 측정
조건이 아니라 **참고 앵커**다 — 상용화 단계의 goodput@SLO 승격(QA2 주) 및
DP7의 TTFT 예산 논의에서 참조한다.

---

## QA1. TTFT — prefill 성능 (baseline 대비 단축 배율)

(v1.1 — 구 QA1 "추론 성능"의 TTFT 축을 독립 QA로 분리. **목표 1(KV
재사용성 제고 → 지연시간 개선)의 판정 지표.**)

- **중요도: H** — "추론을 더 빠르게 시작한다"는 목표 1의 최종 판정 지표.
  장문 컨텍스트의 매 요청 전체 re-prefill(R-03·04)이 지연의 지배 요인이며,
  TTFT는 사용자가 체감하는 첫 지표다. 미달이면 목표 1 실패(C).
- **난이도: H** — 2×는 KV 재사용 hit rate에 의존하고, 재사용 이득은
  cache-hit·워크로드 의존(B)이 커서 대표 워크로드 3종 전반에서 bin을
  지키기 어렵다. 비접두 재사용은 품질(선택 재계산율)과의 트레이드오프,
  하위 tier 복원은 "복원 vs 재계산" 비용 판단 구조를 요구.
- **우선순위: 1** — 최종 목표 지표. QA2(throughput)와 목표 동률이며 순번은
  목표 번호 순(판정 영향 없음, 규칙은 문서 상단 참조).
- **평가 시나리오**: 동일 HW·동일 실행 구성에서 GPU HBM 단일 tier
  baseline과 MCR을 대표 워크로드(long-context RAG · multiturn · agent
  memory)로 E2E 구동하고 첫 토큰까지의 시간을 잰다. (retrieval 자체는 외부
  컴포넌트로 양쪽 동일 적용 — 그 가속은 2단계 이관, v1.0.)
  [측정: TTFT 단축 배율 **≥ 2×** → ★★★]

- **정의**: baseline 대비 TTFT(Time To First Token) 단축 배율(= baseline
  TTFT ÷ MCR TTFT) — prefill 성능. **KV 재사용**(prefix·비접두 재계산
  회피)과 **복원 vs 재계산 판단**의 효과가 나타나는 축.
- **측정**:
  - **워크로드 평균 기준 판정, p99 분포 병행 보고**: 재사용 hit/miss
    이질성 때문에 꼬리(p99)는 cache-miss cold 요청이 지배하므로, 평균이
    재사용의 실효 이득을, p99가 cold-path 개선을 각각 드러낸다.
  - **Baseline 정의 (필수)**: 동일 HW·동일 실행 구성에서 **GPU HBM 단일
    tier만 사용하는 구성** — KV 최적 운용 없이 현행 표준 서빙 스택이 달성
    가능한 최선이므로 순증분이 분리 측정된다. P/D 분리 여부는 전제하지
    않는다(실험 변수 — 양쪽 동일 적용). QA2와 동일 baseline 공유.
  - **ablation**: 재사용 off 구성 대비 증분으로 목표 1의 순기여를 분리
    (표준 측정 조건 ③). 보조 지표: cache hit rate(재사용 축의 중간 지표).

| 별점 | 기준 (baseline 대비 TTFT 단축 배율) |
|---|---|
| ★★★ | **≥ 2×** |
| ★★☆ | 1.5× – 2× |
| ★☆☆ | < 1.5× |

**bin 근거 (≥ 2×)**:
[CacheBlend (EuroSys'25 Best Paper)](https://arxiv.org/abs/2405.16444)가
RAG KV 재사용+선택 재계산(비접두 재사용)으로 **TTFT를 2.2–3.3× 단축**(B,
품질 저하 F1/Rouge-L 0.01–0.03)했고, [SGLang RadixAttention](https://arxiv.org/abs/2312.07104)의
prefix 재사용도 prefill 재계산을 없애 첫 토큰 지연을 줄인다(B).
prefix·비접두 재사용을 결합하고 복원 vs 재계산을 비용 기준으로 판단하는
MCR에 **2×**(CacheBlend 하단 2.2×의 보수 반올림)를 요구한다(C). 1.5×는
단일 기법 부분 적용 수준의 도달선으로 ★★☆(C).
(v1.0: retrieval 가속(SmartANNS·ADR-001) 축은 2단계 이관으로 근거에서
제외 — CacheBlend 하단만으로 2×가 성립하므로 bin 수치는 불변.)

## QA2. throughput — decode 성능 (baseline 대비 배율)

(v1.1 — 구 QA1 "추론 성능"의 throughput 축을 독립 QA로 분리. **목표
2(정확도 유지 압축 → 메모리 병목 해소)·목표 3(KV 인지 스케줄링)의 판정
지표.** QA1과 쌍 — 종합 판정에서 두 QA 모두 ★★★이어야 구 QA1 ★★★와 동치.)

- **중요도: H** — "더 많이 생성한다"는 목표 2·3의 최종 판정 지표. decode는
  매 토큰 누적 KV 전체를 읽는 memory-bandwidth-bound 연산으로 decode 대기가
  E2E latency의 70–85%(A) — 이 병목의 해소 여부가 여기서 판정된다(C).
- **난이도: H** — 2×는 압축·tier 확장의 batch 확대(목표 2)와 KV 인지
  스케줄링의 이득 전환(목표 3)에 의존하며, **iso-latency 조건**(지연을 팔지
  않고) 아래에서 달성해야 한다. 스케줄링이 KV-blind면 재사용·압축의 이득이
  시스템 처리량으로 전환되지 않으므로 세 메커니즘의 조율이 필요.
- **우선순위: 2** — 최종 목표 지표. QA1과 목표 동률, 순번은 목표 번호 순.
- **평가 시나리오**: QA1과 동일 구성에서 생성 처리량(tokens/s 또는 req/s)의
  baseline 대비 배율을 잰다.
  [측정: throughput 배율 **≥ 2×** (iso-latency 판정) → ★★★]

- **정의**: baseline 대비 생성 처리량 배율 — decode 성능. **압축·tier
  확장**(목표 2)이 KV 가용 용량을 키워 batch를 확대하고, **KV 인지
  스케줄링**(목표 3 — locality 라우팅·KV 공간 확보[압축/강등/축출 선택])이
  그 이득을 시스템 처리량으로 전환하는 축.
- **측정**:
  - **iso-latency 비교**: TPOT p99가 baseline과 같거나 좋은 운영점에서
    배율을 판정하고(vLLM SOSP'23 "at the same level of latency"
    방법론(B)), throughput–latency 곡선을 병행 보고한다(지연을 팔아
    처리량을 산 구성을 배제 + 배율이 체리피킹이 아님을 곡선으로 입증).
  - **Baseline**: QA1과 동일(GPU HBM 단일 tier, P/D 실험 변수 동일 적용).
  - **ablation**: 압축 off / KV-blind 스케줄링 구성 대비 증분으로 목표
    2·3의 순기여를 각각 분리(표준 측정 조건 ③). 보조 지표: decode wait
    비중(자체 실측 70–85%(A)가 개선 대상), batch 크기 분포.

> **주 — 왜 goodput@SLO가 아닌가 (v0.8~0.9, QA1·QA2 공통)**: 절대
> SLO(MLPerf TTFT 450 ms · TPOT 200 ms)는 벤치마크 시나리오에 고정된
> 제약이라, GPU 종류·규모가 비확정인 연구 테스트베드에서는 구성이 약하면
> 어떤 처리율에서도 미달(goodput = 0)로 지표가 퇴화한다. 실서빙 SLA가 없는
> 연구 과제 성격상 baseline 대비 **배율** 지표가 문헌(vLLM·KIVI·CacheBlend)
> 과의 비교성도 높다. 상용화 단계(실서빙 SLO 계약 확정 시)에는
> goodput@SLO(DistServe (B))로 승격한다.

| 별점 | 기준 (baseline 대비 throughput 배율, iso-latency 판정) |
|---|---|
| ★★★ | **≥ 2×** |
| ★★☆ | 1.5× – 2× |
| ★☆☆ | < 1.5× (또는 iso-latency 조건 미충족) |

**bin 근거 (≥ 2×)**:
[KIVI](https://arxiv.org/html/2402.02750v2) 2-bit 양자화가 batch 4×로
**처리율 2.35–3.47×**(B), [vLLM/PagedAttention (SOSP'23)](https://arxiv.org/abs/2309.06180)의
메모리 관리만으로 동일 GPU **처리량 2–4×**(B). tier 확장이 KV 가용 용량을
키워 batch를 더 확대하고, KV 인지 스케줄링이 그 이득을 시스템 처리량으로
전환하므로, 압축·paging 단독 하단인 **2×**를 결합 시스템의 하한으로
요구한다(C). 1.5×는 단독 기법 도달선으로 ★★☆(v0.8 결정 계승). *주의:
DistServe의 2–7.4×는 colocated → P/D 분리 전환 효과로, 실행 구성을 양쪽에
동일하게 두는 본 QA의 bin 근거가 아니다.*

## QA3. 응답 품질 (품질 저하 bound)

(v1.1 — 구 QA2에서 재번호. 목표 2의 "LLM 정확도 유지" 조건의 판정 지표.)

- **중요도: H** — QA1·QA2·QA4의 전제 조건: 품질 bound를 위반하면
  TTFT·throughput·유효 KV 용량 수치 자체가 무효(QA4는 "QA3 품질 bound를
  지키는 조건에서만 인정"). 목표 2가 "정확도를 유지한 채"를 목표 문장에
  명시하므로 gate가 곧 과제 정의의 일부. 서비스 품질 저하는 사용자에게
  직접 노출되는 리스크(C).
- **난이도: H** (v1.1 M→H 재판정) — near-lossless 압축 단독은 문헌 재현
  수준(KVQuant 3-bit ΔPPL < 0.1(B), KIVI 2-bit ≤ 2%p(B))이나, 목표 재정의로
  품질 영향원이 **3중**이 되었다: ① 요청별 차등 **압축**(수준 선택이
  요청마다 다름) ② **비접두 재사용**(선택 재계산율과 품질의 트레이드오프 —
  CacheBlend 0.01–0.03(B)) ③ 스케줄링의 **축출/강등 선택**(어떤 KV를
  버리는가가 품질에 영향). 요청별 bound 집행(★★★ 조건)은 세 메커니즘의
  품질 영향을 통합 추적하는 구조를 요구하고, C-03(training-free)으로 재학습
  기반 회복 수단이 배제되어 런타임 계층에서만 bound를 지켜야 한다(C).
- **우선순위: 3** — 중요도 H 그룹 내 **전제(gate)** — 성능·용량 수치의
  유효 조건이므로 목표 지표(QA1·QA2) 다음, 수단 지표(QA4) 앞
  (역할 규칙, 문서 상단 참조).
- **평가 시나리오**: 압축(양자화·토큰 eviction)·재사용을 실서빙 설정으로
  활성화한 상태에서 long-context 벤치마크(LongBench 등)를 수행하고,
  baseline(동일 모델·동일 벤치의 비압축 FP16 KV·비재사용 — 품질의 이론적
  상한) 대비 **F1-score 차이(ΔF1, %p)** 와 보조 지표 ΔPPL(Wikitext-2)을
  측정하며, bound의 집행 단위(요청별 vs 전역)를 판정한다.
  [측정: ΔF1 ≤ 1%p · 요청별 bound 집행 → ★★★]

- **정의**: 압축·재사용(및 축출 선택)으로 인한 품질 저하의 상한 보장 —
  QA1·QA2·QA4 수치의 유효 전제(gate).
- **측정**: **주지표 ΔF1(%p)** — long-context 벤치마크(LongBench 등)의
  F1-score를 baseline(비압축 FP16 KV·비재사용) 대비 차감. F1 채택 이유:
  LongBench의 QA 태스크군(HotpotQA·2WikiMQA 등) 공식 지표가 F1이며,
  정답의 부분 일치를 반영해 이진 accuracy보다 저하를 민감하게 잡는다(B).
  **보조지표 ΔPPL**(절대, Wikitext-2) — 태스크 무관 선행 신호(PPL은
  민감하지만 실사용 영향을 직접 반영하지 못해 주지표로는 부적합).
  bound의 **집행 단위**(요청별 vs 전역)를 함께 판정.

| 별점 | 기준 |
|---|---|
| ★★★ | **ΔF1 ≤ 1%p** (보조: ΔPPL ≤ 0.1 절대), **요청별** bound 집행 가능 |
| ★★☆ | **ΔF1 ≤ 2%p**, **전역** bound만 보장 |
| ★☆☆ | ΔF1 > 2%p 또는 bound 자체를 보장 못 함 |

**bin 근거** (전 경계 B급 실측 인용):
- **ΔF1 ≤ 2%p (중간 bin)**: KIVI 2-bit(최대 압축단)의 LongBench 실측 저하
  상한 "up to 2%"(B) — LongBench 점수는 태스크별 지표(QA군은 F1)의
  평균이므로 이 상한이 곧 F1 기준 저하 상한이다. 극한 압축을 쓰더라도
  문헌이 보인 저하 한계 이내여야 함.
- **ΔF1 ≤ 1%p (상위 bin)** — 네 갈래 근거의 교차점:
  - ① *벤치마크 제도 기준*: [MLPerf Inference](https://mlcommons.org/2024/03/mlperf-llama2-70b/)는
    closed division 제출이 **참조 모델 정확도의 99% 이상**(Llama2-70B는
    99%/99.9% 두 트랙, [v5.0 이후 99%가 표준](https://mlcommons.org/2025/04/llm-inference-v5/))을
    유지해야 유효로 인정(B) — "최적화된 추론이 허용받는 저하"가 제도화된
    유일한 업계 기준. LongBench F1 점수대(≈40~50점)에서 상대 99%는 절대
    Δ0.4~0.5점이므로, **절대 1%p(상대 ≈2%)는 MLPerf 99% 트랙보다 완화되고
    KIVI 극한 압축 실측 상한(2%p)보다 엄격한 중간 경계**다(C).
  - ② *실측 도달 가능성*: 최대 압축단(2-bit)인 KIVI조차 LongBench **평균**
    저하는 **Δ0.25점**(Llama2-7B 44.52 → 44.27)(B) — 1%p는 평균이 아니라
    모델·태스크 편차(worst-case "up to 2%")까지 흡수한 상한으로서 실현
    가능한 목표다.
  - ③ *기법 일반성*: 토큰 eviction 계열도 동일 수준 — [H2O](https://arxiv.org/abs/2306.14048)
    KV 예산 20%에서 full-cache 동등 성능(B), [SnapKV](https://arxiv.org/abs/2404.14469)
    프롬프트 KV 92% 압축에서 "negligible" 저하(B) — 양자화·eviction 어느
    쪽이든 1%p 이내 운용이 문헌 전반에서 재현된다.
  - ④ *통계 분해능*: LongBench QA 태스크는 태스크당 **200샘플**(B,
    [LongBench](https://arxiv.org/html/2308.14508v1)) — 샘플별 F1 표준편차를
    ~30점으로 두면 태스크 평균의 표준오차 ≈ 30/√200 ≈ 2.1점, 16개 태스크
    평균으로는 ≈ 0.5점(C). 즉 **1%p는 벤치마크가 신뢰 있게 검출할 수 있는
    최소 저하와 같은 자릿수** — 이보다 엄격한 경계는 측정 잡음과 구분
    불가하고, 이보다 느슨하면 검출 가능한 실질 저하를 허용하게 된다.
  - ⑤ *사내 연속성*: 02 문서의 기존 사내 기준 1%p(A)를 accuracy에서 F1로
    이관 — 기준선의 역사적 일관성 유지.
- **토큰 eviction도 동일 bound**: H2O가 KV 예산 20%(80% eviction)에서
  full-cache 동등 성능을 보고(B) — eviction 계열도 near-lossless 운용이
  가능하므로 기법 구분 없이 ΔF1 bound를 공통 적용한다.
- **보조 ΔPPL ≤ 0.1**: KVQuant가 3-bit에서 Wikitext-2·C4 기준 ΔPPL < 0.1을
  LLaMA/Llama-2/-3/Mistral 전반에서 입증(B) — "달성 가능한 near-lossless 선".
- 집행 단위 조건: K>V sensitivity(B) — 압축 대상 선택이 품질을 좌우하므로
  요청별 차등 집행 가능 여부가 bound 보장성을 가름(C).

## QA4. 메모리 효율 (유효 KV 용량)

(v1.1 — 구 QA3에서 재번호. 목표 2의 "메모리 병목 해소"의 정량 지표.)

- **중요도: H** — HBM이 희소 자원이며 "HBM 한 장당 서빙 가능한 컨텍스트"가
  비용 구조를 결정. QA2(throughput) 달성의 직접 수단이자 이종 tier 도입의
  존재 이유(1.5× 미만이면 압축 단독 대비 열위)(C).
- **난이도: H** — 압축 단독 1.5×는 문헌으로 입증(KIVI(B))되어 있으나, 상위 bin
  3×는 tier 오프로딩과 압축을 QA3 품질 bound 안에서 결합해야 도달 가능하며
  tier 활용률·압축률 분포 관리가 필요.
- **우선순위: 4** — 중요도 H 그룹 내 **수단 지표** — 목표(QA1·QA2)와 그
  유효 전제(QA3 gate) 다음 (역할 규칙, 문서 상단 참조).
- **평가 시나리오**: QA3 품질 bound를 지키는 설정에서
  Σ_tier(tier 용량 × 평균 압축률 × KV 가용 비율)로 원본 환산 유효 KV 용량을
  산출하고, 물리 HBM 용량 대비 배율을 구한다(= 동시 수용 가능한 컨텍스트 토큰
  수의 배율). 보조로 tier 활용률·압축률 분포를 함께 기록한다.
  [측정: 유효 KV 용량 ≥ 3× → ★★★]

- **정의**: **원본(비압축) 환산**으로 시스템이 동시에 수용할 수 있는 KV 총량의,
  물리 HBM 용량 대비 배율 (QA3 품질 bound를 지키는 조건에서만 인정).
  압축 n×는 같은 물리 공간에 원본 환산 n×의 KV를 담으므로 이 값을 **키운다**
  (저장된 압축 바이트가 아니라 "몇 토큰어치를 서빙할 수 있나"의 지표).
  등가 표현: **동시 수용 가능한 컨텍스트 토큰 수의 배율**.
- **측정**: 유효 KV 용량 ≈ Σ_tier(tier 용량 × 그 tier의 평균 압축률 × KV 가용
  비율) / 물리 HBM 용량. 분모가 HBM인 이유: HBM이 희소 자원이며 "HBM 한 장당
  서빙 가능한 컨텍스트"가 비용 구조를 결정. 보조: tier 활용률, 압축률 분포.

| 별점 | 기준 (유효 KV 용량 배율) |
|---|---|
| ★★★ | **≥ 3×** |
| ★★☆ | 1.5× – 3× |
| ★☆☆ | < 1.5× |

**bin 근거**: 압축 단독으로 peak memory 2.6× 절감·batch 4×가 near-lossless로
입증(KIVI 2-bit(B)) — 압축(02 실측 전제 2–4×(A))만 잘 써도 1.5×는 도달하므로
**tier 오프로딩과 압축을 함께 쓰는 MCR은 3×를 상위 bin**으로 요구. 1.5× 미만은
압축 단독 대비 열위 — 이종 tier 도입의 존재 이유 미달(C).

## QA5. 확장성·진화성 (Modifiability)

(v1.1 — 구 QA4에서 재번호. **구 QA6 Adaptability의 관심사(framework 결합
격리)를 코어/모듈 경계 지표로 대리 측정** — 하단 각주 참조.)

- **중요도: M** — 초기 가치 실증(QA1–4)에는 직결되지 않으나, 모델 구조
  변화(MLA·linear attention 등)와 메모리 디바이스 로드맵(HBM4/CMM-DC/HBF —
  2단계 수용 대비) 속도를 감안하면 중장기 유지 비용과 생존성을 좌우(C).
  특히 본 과제의 전 기법(재사용·압축·배치)이 KV cache를 전제하므로 **KV
  구조 변화는 과제 본질에 대한 변화**다.
- **난이도: H** — 코어/모듈 경계와 공개 인터페이스(KV Locator, CompressionOp)는
  되돌리기 어려운 초기 설계 결정이며, MLA(KV 정의 변경)·linear attention(고정 크기 상태로 KV 대체)처럼
  KV 구조 자체가 바뀌는 변화까지 "코어 수정 0"으로 수용하기는 어려움.
- **우선순위: 5** — M/H. 중요도 M 그룹 중 난이도가 높아 선순위.
- **평가 시나리오**: (a) 신규 메모리 tier 1종 추가 실험(1단계는 commodity
  조합 변경으로 검증하되, 로드맵 디바이스[HBM4/CMM-DC/HBF] 파라미터를
  대입하는 사전 검증 포함 — **2단계 자사 디바이스 수용의 접속점 확인**,
  v1.0)에서 **신규/변경 모듈 수 · 코어 변경 LOC 비율(%) · 공개 인터페이스
  시그니처 변경 건수**를 세고, (b) KV 구조 영향 모델 변화(GQA/MQA · MLA ·
  sliding-window/hybrid attention · linear attention 계열)의 수용 리드타임을
  upstream 공개 시점 기준으로 측정한다. baseline = 현행 코드베이스.
  [측정: 신규 어댑터 모듈 ≤ 1 · 코어 변경 LOC 0 · 시그니처 변경 0건 ·
  수용 ≤ upstream + 2주 → ★★★]

- **정의**: 신규 메모리 디바이스(HBM4/CMM-DC/HBF)와 **KV 구조에 영향을 주는
  모델 변화**(GQA 계열을 넘어 linear attention까지)의 수용 비용. (코어/모듈 정의는 문서 상단 용어 정의 참조.)
- **측정**: (a) tier 추가 시 변경 범위 — 4개 정량 지표: ① **신규/변경 모듈
  수** ② **코어 변경 LOC 비율(%)** = (코어 패키지·공개 인터페이스에서 변경된
  LOC) ÷ (코어 전체 LOC) ③ **공개 인터페이스(KV Locator·CompressionOp)
  시그니처 변경 건수** (하위호환 여부 병기) ④ 기능 변경 비율(%).
  (b) KV 구조 영향 모델 변화 — GQA/MQA(head 공유로 KV 크기 변화),
  MLA(latent KV — KV 정의 자체가 바뀜), sliding-window/hybrid attention,
  linear attention 계열(KV cache가 **고정 크기 순환 상태**로 대체 —
  Katharopoulos et al.(B), 실전 배치 예 MiniMax-01 lightning attention(B)) —
  의 수용 리드타임 (upstream 공개 시점 기준).

| 별점 | 기준 (a·b 모두 충족) |
|---|---|
| ★★★ | tier 추가 = topology 파라미터 등록 + **신규 어댑터 모듈 ≤ 1개 · 코어 변경 LOC 0 · 시그니처 변경 0건** · KV 구조 변화 수용 **≤ upstream + 2주** |
| ★★☆ | 코어 변경 LOC(또는 기능 변경 비율)이 전체의 **≤ 40%** · 시그니처 변경은 **하위호환**(기존 호출부 수정 불요) 형태만 · 수용 ≤ upstream + 1분기 |
| ★☆☆ | 코어 변경 > 40%, 비호환 시그니처 변경(호출부 전면 수정), 또는 수용 > 1분기 (만성 지연) |

**bin 근거**: 40% 기준은 Architect 과제 원본 덱 QA-01의 사내 측정 기준
계승(A). "upstream + 2주"는 vLLM 정규 릴리스가 2주 간격(B)이므로 **한 릴리스
주기 내 추종 = 실질 동시 지원**으로 정의. 1분기(≈6 릴리스 누락)를 넘으면
생태계 대비 만성 열세(C).

> **각주 — 일반 모델 enablement**: 신규 모델의 서빙 지원 일반(가중치 로딩,
> 커널, 토크나이저 등)은 DP1 후보1(vLLM 확장형)에서는 upstream의 책임이라
> MCR 평가 항목이 아니다. 단 **DP1 후보2(독립 framework) 채택 시**에는 그
> 전체가 MCR 책임이 되므로, 그 경우에만 (b)를 "일반 모델 지원 리드타임"으로
> 확장 적용한다 — 독립 framework의 최대 리스크(02 §DP1 후보2 단점)를 평가에서
> 놓치지 않기 위함.

> **각주 — framework 적응성(구 QA6 Adaptability)의 처리 (v1.1 미선정
> 전환)**: 서빙 framework 교체(vLLM → SGLang 등) 적응성은 v0.5~v1.0에서
> 독립 QA(구 QA6, M/H)였으나 v1.1 재평가로 미선정 전환했다 — ① 관심사
> (변화 수용)·측정축(코어 변경 LOC·시그니처 건수·전환 공수)이 본
> QA5와 중복: **framework 결합 코드가 어댑터 계층에 격리되어 있는지는 본
> QA의 "코어 변경 LOC 0 · 시그니처 변경 0건" 지표가 대리 측정**한다(결합이
> 코어에 새면 그 지표가 즉시 악화) ② 1단계는 단일 framework 위 실증이
> 목적이라 교체 리스크의 노출 시점이 2단계/상용화(중요도 M→L) ③ 어댑터
> 경계 자체는 DP1(framework 실행 구조)의 결정 변수로 흡수. 구 bin(결합
> 코드 ≤ 10% · 전환 ≤ 3인월)은 DP1 평가의 참고 기준으로 보존하고, upstream
> 방향 전환이 현실화되거나 2단계 진입 시 독립 QA로 재평가한다. (요구사항
> 분석 v1.1 Utility Tree QA-10 미선정 사유와 동일 논거.)

## QA6. 유지보수성 (Maintainability — 개발·운영 비용)

(v1.1 — 구 QA5에서 재번호. v0.5에서 Affordability → Maintainability로
개칭 — ISO/IEC 25010 표준 품질속성 어휘로 정렬. 정의·bin은 동일.)

- **중요도: M** — 프로젝트 지속 가능성(추종·유지 인력)을 좌우하나, 과제 성패의
  판정 지표는 아님. DP1(플랫폼 전략) 선택에 따라 수십 인월 단위로 갈리므로
  구조 결정 시 반드시 함께 평가(C).
- **난이도: M** — plugin 경계를 유지하면 관리 가능함이 02 실측 표현(A)으로
  뒷받침됨. 비용 산정 자체는 표준적 방법(인월·FTE 추정)으로 수행 가능.
- **우선순위: 6** — M/M. 중요도 M 그룹 중 난이도가 낮아 최후순위.
- **평가 시나리오**: 대표 워크로드 E2E 벤치 완주까지의 초기 구축
  인월(person-month)과, upstream 추종(rebase/2주 릴리스 주기)·회귀 검증을
  포함한 연간 유지보수 FTE를 산정한다.
  [측정: 초기 ≤ 6 인월 · 유지 ≤ 0.5 FTE → ★★★]

- **정의**: 초기 구축(대표 워크로드 E2E 벤치 완주까지) + 지속 유지보수 비용.
- **측정**: 초기 인월(person-month), 연간 유지보수 FTE(rebase/추종/검증 포함).

| 별점 | 기준 (둘 다 충족) |
|---|---|
| ★★★ | 초기 **≤ 6 인월** · 유지 **≤ 0.5 FTE** |
| ★★☆ | 초기 ≤ 24 인월 · 유지 ≤ 2 FTE |
| ★☆☆ | 초기 > 24 인월 또는 유지 > 2 FTE (상시 전담팀) |

**bin 근거**: 02 문서의 실측 표현 — plugin형 "초기 수 인월"(A) vs 독립형
"초기 수십 인월+, 유지보수 인력 상시 소요"(A) — 를 bin 경계로 수치화.
0.5 FTE는 plugin 경계 유지 시 추종 비용(2주 릴리스 주기당 ~수일(C)),
2 FTE는 fork rebase 비용이 6–12개월 후 급증한다는 관찰(02 §DP1, C)에서
fork/독립 유지의 하한으로 설정.

---

## 출처

- [MLCommons — Llama 2 70B MLPerf Inference Benchmark](https://mlcommons.org/2024/03/mlperf-llama2-70b/) (Server TTFT 2s / TPOT 200ms)
- [NVIDIA — MLPerf Inference v5.0](https://developer.nvidia.com/blog/nvidia-blackwell-delivers-massive-performance-leaps-in-mlperf-inference-v5-0/) (Interactive TTFT 450ms / TPOT 40ms)
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving (OSDI'24)](https://arxiv.org/pdf/2401.09670) · [해설 블로그](https://haoailab.com/blogs/distserve/) (goodput/SLO attainment 90% 정의, 250wpm — 상용화 단계 승격용 참고)
- [CacheBlend: Fast Large Language Model Serving for RAG with Cached Knowledge Fusion (EuroSys'25 Best Paper)](https://arxiv.org/abs/2405.16444) (RAG KV 재사용 — TTFT 2.2–3.3× 단축, 처리율 2.8–5×, 품질 저하 0.01–0.03 — QA1(TTFT) 2× bin 근거)
- [SmartANNS: Efficient Billion-Scale ANN Search with SmartSSDs (ATC'24)](https://www.usenix.org/system/files/atc24-tian.pdf) (SSD ANN I/O 병목 ~67%, 협력 인덱싱 QPS 최대 10.7× — v1.1부터 2단계[근접연산 오프로드]·ADR-001 참고)
- [KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache](https://arxiv.org/html/2402.02750v2) (2.6× 메모리, batch 4×, 처리율 2.35–3.47×, LongBench 저하 ≤2%p)
- [KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization (NeurIPS'24)](https://arxiv.org/html/2401.18079v4) (3-bit ΔPPL < 0.1, Wikitext-2·C4)
- [vLLM RELEASE.md](https://github.com/vllm-project/vllm/blob/main/RELEASE.md) (2주 릴리스 케이던스)
- [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of LLMs (NeurIPS'23)](https://arxiv.org/abs/2306.14048) (KV 예산 20%로 full-cache 동등 — 토큰 eviction 품질 근거)
- [SnapKV: LLM Knows What You are Looking for Before Generation (NeurIPS'24)](https://arxiv.org/abs/2404.14469) (프롬프트 KV 92% 압축에서 negligible 저하)
- [MLCommons — MLPerf Inference v5.0](https://mlcommons.org/2025/04/llm-inference-v5/) (closed division 정확도 기준 = 참조의 99%)
- [Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention (ICML'20)](https://arxiv.org/abs/2006.16236) (linear attention — KV cache의 고정 크기 상태 대체 원리)
- [MiniMax-01: Scaling Foundation Models with Lightning Attention](https://arxiv.org/abs/2501.08313) (linear attention 계열의 실전 배치 사례 — QA5 모델 변화 축 근거)
- [LongBench: A Bilingual, Multitask Benchmark for Long Context Understanding (ACL'24)](https://arxiv.org/abs/2308.14508) (QA 태스크군 지표 = F1)
- [SGLang: Efficient Execution of Structured Language Model Programs (NeurIPS'24)](https://arxiv.org/abs/2312.07104) (QA1 prefix 재사용 근거 · 대안 serving framework — 구 QA6[미선정 전환]·DP1 참고)
- 사내: Architect 과제 원본 덱 QA-01 (40% 기준), MCR 자체 P/D 분리 벤치 실측 (decode wait 70–85%)
