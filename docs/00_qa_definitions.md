# MCR QA 정의 및 별점 평가 기준 (v0.4)

`02_design_points_dp1_dp2.md` §0의 잠정 QA 정의를 분리·승격한 문서.
모든 DP/후보구조 평가는 본 문서의 정량 bin을 기준으로 별점을 매긴다.
(잠정 — MCR 공식 QA 확정 시 본 문서를 개정하고 기존 평가표를 재평가한다.)

## QA 요약표 (우선순위 순)

| QA | Refinement | 시나리오 | 중요도 | 난이도 | 우선순위 |
|---|---|---|---|---|---|
| **Performance** (QA1. 추론 성능) | SLO 유지 하 최대 처리율 (goodput@SLO) | P/D 분리를 동일하게 적용한 GPU HBM 단일 tier baseline 대비, 표준 SLO(TTFT p99 ≤ 450 ms · TPOT p99 ≤ 200 ms)를 attainment ≥ 90%로 유지하며 달성하는 처리율 배율을 대표 워크로드(long-context RAG · multiturn · agent memory)로 측정한다. [측정: baseline 대비 goodput@SLO ≥ 1.5× → ★★★] | H | H | 1 |
| **Resource Efficiency** (QA2. 메모리 효율) | 유효 KV 용량 (원본 환산 동시 수용량) | QA3 품질 bound를 지키는 조건에서 Σ_tier(용량 × 평균 압축률 × KV 가용 비율)로 원본 환산 유효 KV 용량을 산출하고 물리 HBM 용량 대비 배율을 구한다(= 동시 수용 가능한 컨텍스트 토큰 수의 배율). [측정: 유효 KV 용량 ≥ 3× → ★★★] | H | H | 2 |
| **Accuracy** (QA3. 응답 품질) | 압축·재사용에 의한 품질 저하 상한(bound) 보장 | 압축·재사용을 실서빙 설정으로 활성화한 상태에서 대표 벤치마크 accuracy 저하(%p)와 Wikitext-2 ΔPPL(절대)을 비압축 대비로 측정하고, bound 집행 단위(요청별 vs 전역)를 판정한다. [측정: accuracy 저하 ≤ 1%p · ΔPPL ≤ 0.1 · 요청별 bound 집행 → ★★★] | H | M | 3 |
| **Modifiability** (QA4. 확장성·진화성) | 신규 메모리 디바이스·KV 구조 변화 수용 용이성 | (a) 신규 tier(HBM4/CMM-DC/HBF) 추가 시 변경이 어댑터 모듈에 갇히는지, 코어까지 침범하는지와 기능 변경 비율을 산정하고 (b) KV 구조 영향 모델 변화(GQA/MQA·MLA·sliding-window·SSM)의 수용 리드타임을 upstream 공개 시점 기준으로 측정한다. [측정: 어댑터 모듈 ≤ 1개 · 코어 수정 0 · 수용 ≤ upstream + 2주 → ★★★, 코어 수정 ≤ 전체 기능의 40% → ★★☆] | M | H | 4 |
| **Affordability** (QA5. 개발·운영 비용) | 초기 구축 + 지속 유지보수 비용 | 대표 워크로드 E2E 벤치 완주까지의 초기 구축 인월(person-month)과, upstream 추종(rebase)·회귀 검증을 포함한 연간 유지보수 FTE를 산정한다. [측정: 초기 ≤ 6 인월 · 유지 ≤ 0.5 FTE → ★★★] | M | M | 5 |

**중요도·난이도·우선순위 규칙**

- **중요도** (H/M/L): 해당 QA 미달이 MCR의 존재 가치·평가 결론에 주는 타격 크기.
- **난이도** (H/M/L): 상위 bin(★★★) 도달에 필요한 설계·구현·검증의 어려움.
- **우선순위 산정**: 중요도가 높을수록, 난이도가 높을수록 우선순위가 높다.
  **중요도 우선, 동률 시 난이도**로 비교하고, 둘 다 동률이면 **최종 목표 지표가
  수단 지표에 우선**한다 (QA1·QA2가 H/H 동률 — goodput이 과제의 최종 판정
  지표이고 유효 KV 용량은 그 달성 수단이므로 QA1 > QA2).
- **우선순위 ↔ QA 번호**: 우선순위가 높을수록 QA 번호가 낮다. 본 판 평가 결과
  우선순위 순서가 기존 QA1→QA5 번호 순서와 일치하므로 번호 재부여는 없다
  (타 문서의 QA 번호 참조도 그대로 유효).

**개정 이력**
- v0.4: ① QA별 중요도·난이도·우선순위 도입(산정 규칙 명시, 우선순위 = QA 번호)
  ② QA별 평가 시나리오를 기존 정의·측정 기술로부터 명문화 ③ 문서 상단에
  QA 요약표(QA·Refinement·시나리오·중요도·난이도·우선순위) 추가
- v0.3: ① QA1 baseline 정의 명시(P/D 분리 포함) 및 bin 근거를 메모리 측 증분
  문헌으로 교체 ② QA2 "유효 KV 용량" 용어를 원본 환산 기준으로 재정의
  ③ QA3 경계값을 문헌 실측치(KVQuant·KIVI)로 재앵커링(B급) ④ QA4 코어/모듈
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
| KV 압축 품질 (PPL) | 3-bit 양자화 **ΔPPL < 0.1 (절대)** — Wikitext-2·C4, LLaMA/Llama-2/-3/Mistral | [KVQuant (NeurIPS'24)](https://arxiv.org/html/2401.18079v4) |
| KV 압축 품질 (accuracy) | 2-bit 양자화 LongBench accuracy 저하 **최대 2%p** (Llama/Mistral) | [KIVI](https://arxiv.org/html/2402.02750) |
| upstream 추종 주기 | vLLM 정규 릴리스 **2주 간격** | [vLLM RELEASE.md](https://github.com/vllm-project/vllm/blob/main/RELEASE.md) |
| 사내 확장성 기준 | 신규 장치 지원 시 기능 추가/변경 ≤ 전체의 40% | Architect 과제 원본 덱 QA-01 측정 기준 |

**MCR 표준 SLO**(별도 명시 없으면 이 조건으로 측정): 대화형 워크로드
TTFT p99 ≤ 450 ms · TPOT p99 ≤ 200 ms(장문 컨텍스트 감안해 Server/Interactive
절충), SLO attainment ≥ 90%, 대표 워크로드 = long-context RAG · multiturn ·
agent memory (과제 범위 3.2-3).

---

## QA1. 추론 성능 (goodput@SLO)

- **중요도: H** — MCR의 존재 목적이 "SLO를 지키면서 처리율을 올리는 것"이며,
  과제의 최종 판정 지표. 이 QA 미달이면 나머지 QA가 모두 우수해도 무의미(C).
- **난이도: H** — 이종 tier 오케스트레이션·압축·재사용이 모두 맞물려야 1.5×에
  도달하며, decode wait 70–85%(A) 병목을 실제로 해소해야 함. 워크로드 의존성이
  커서 대표 워크로드 전반에서 bin을 지키기 어려움.
- **우선순위: 1** — H/H. QA2와 동률이나 최종 목표 지표이므로 최우선
  (규칙은 문서 상단 참조).
- **평가 시나리오**: 동일 HW에서 P/D 분리를 동일하게 적용한 GPU HBM 단일 tier
  baseline과 MCR을 대표 워크로드(long-context RAG · multiturn · agent memory)로
  구동하고, 표준 SLO(TTFT p99 ≤ 450 ms · TPOT p99 ≤ 200 ms)를 attainment ≥ 90%로
  유지하면서 달성하는 최대 처리율(goodput)의 배율을 비교한다.
  [측정: baseline 대비 goodput@SLO ≥ 1.5× → ★★★]

- **정의**: 표준 SLO를 attainment ≥ 90%로 유지하면서 달성하는 최대 처리율.
- **측정**: goodput(req/s @ SLO), baseline 대비 배율.
  **Baseline 정의 (필수)**: 동일 HW에서 **P/D 분리를 동일하게 적용한
  GPU HBM 단일 tier** 구성 (과제 범위 3.2-3). 즉 본 QA는 P/D 분리 효과가
  아니라 **이종 tier + 압축 + 재사용 orchestration의 증분**을 측정한다.
  보조 지표: decode wait 비중 (자체 실측 70–85%(A)가 개선 대상).

| 별점 | 기준 (baseline 대비 goodput@SLO) |
|---|---|
| ★★★ | **≥ 1.5×** |
| ★★☆ | 1.1× – 1.5× |
| ★☆☆ | < 1.1× (측정 오차·운영 잡음 수준) 또는 SLO attainment < 90% |

**bin 근거**: 메모리 측 개선 단독의 문헌 상단 — 압축으로 batch를 4×로 키워
**처리율 2.35–3.47×**(KIVI(B), 단 cache-hit·워크로드 의존) — 에서 1.5×를
워크로드 비의존적으로 요구 가능한 보수적 하한으로 설정. 1.1× 미만은 A/B
테스트에서 통상 잡음과 구분 곤란(C). *주의: DistServe의 2×~7.4×는 P/D 미분리
(colocated) baseline 대비 수치로, P/D가 양쪽에 모두 적용되는 본 QA의 bin
근거가 아니다 — DistServe는 goodput·attainment ≥90% **정의**의 출처로만 인용.*

## QA2. 메모리 효율 (유효 KV 용량)

- **중요도: H** — HBM이 희소 자원이며 "HBM 한 장당 서빙 가능한 컨텍스트"가
  비용 구조를 결정. QA1(goodput) 달성의 직접 수단이자 이종 tier 도입의
  존재 이유(1.5× 미만이면 압축 단독 대비 열위)(C).
- **난이도: H** — 압축 단독 1.5×는 문헌으로 입증(KIVI(B))되어 있으나, 상위 bin
  3×는 tier 오프로딩과 압축을 QA3 품질 bound 안에서 결합해야 도달 가능하며
  tier 활용률·압축률 분포 관리가 필요.
- **우선순위: 2** — H/H. QA1과 동률이나 수단 지표이므로 차순위.
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

## QA3. 응답 품질 (품질 저하 bound)

- **중요도: H** — QA1·QA2의 전제 조건: 품질 bound를 위반하면 goodput·유효 KV
  용량 수치 자체가 무효(QA2는 "QA3 품질 bound를 지키는 조건에서만 인정").
  서비스 품질 저하는 사용자에게 직접 노출되는 리스크(C).
- **난이도: M** — near-lossless 압축 자체는 문헌으로 입증된 기법의 재현
  (KVQuant 3-bit ΔPPL < 0.1(B), KIVI 2-bit ≤ 2%p(B)). 단 **요청별** bound
  집행(★★★ 조건)은 압축 대상 선택·차등 집행 설계가 필요해 추가 부담.
- **우선순위: 3** — H/M. 중요도 H 그룹 중 난이도가 낮아 후순위.
- **평가 시나리오**: 압축·재사용을 실서빙 설정으로 활성화한 상태에서 대표
  벤치마크(LongBench 등) accuracy 저하(%p)와 Wikitext-2 기준 ΔPPL(절대)을
  비압축 대비로 측정하고, bound의 집행 단위(요청별 vs 전역)를 판정한다.
  [측정: accuracy 저하 ≤ 1%p · ΔPPL ≤ 0.1(절대) · 요청별 bound 집행 → ★★★]

- **정의**: 압축·재사용으로 인한 품질 저하의 상한 보장.
- **측정**: 대표 벤치마크 accuracy 저하(%p) + PPL 증가(절대 ΔPPL, Wikitext-2
  기준). bound의 **집행 단위**(요청별 vs 전역)를 함께 판정.

| 별점 | 기준 |
|---|---|
| ★★★ | accuracy 저하 **≤ 1%p** 그리고 **ΔPPL ≤ 0.1 (절대)**, **요청별** bound 집행 가능 |
| ★★☆ | accuracy 저하 **≤ 2%p**, **전역** bound만 보장 |
| ★☆☆ | accuracy 저하 > 2%p 또는 bound 자체를 보장 못 함 |

**bin 근거** (전 경계 B급 실측 인용):
- **ΔPPL ≤ 0.1**: KVQuant가 3-bit에서 Wikitext-2·C4 기준 ΔPPL < 0.1을
  LLaMA/Llama-2/-3/Mistral 전반에서 입증(B) — "달성 가능한 near-lossless 선".
- **accuracy ≤ 1%p**: 02 문서의 기존 사내 기준(A)이자 KV 압축 문헌의
  near-lossless 관례 허용선(B).
- **accuracy ≤ 2%p**: KIVI 2-bit(최대 압축단)의 LongBench 실측 저하 상한
  "up to 2%"(B) — 극한 압축을 쓰더라도 문헌이 보인 저하 한계 이내여야 함.
- 집행 단위 조건: K>V sensitivity(B) — 압축 대상 선택이 품질을 좌우하므로
  요청별 차등 집행 가능 여부가 bound 보장성을 가름(C).

## QA4. 확장성·진화성

- **중요도: M** — 초기 가치 실증(QA1–3)에는 직결되지 않으나, 메모리 디바이스
  로드맵(HBM4/CMM-DC/HBF)과 모델 구조 변화(MLA·SSM 등) 속도를 감안하면
  중장기 유지 비용과 생존성을 좌우(C).
- **난이도: H** — 코어/모듈 경계와 공개 인터페이스(KV Locator, CompressionOp)는
  되돌리기 어려운 초기 설계 결정이며, MLA(KV 정의 변경)·SSM(KV 부재)처럼
  KV 구조 자체가 바뀌는 변화까지 "코어 수정 0"으로 수용하기는 어려움.
- **우선순위: 4** — M/H. 중요도 M 그룹 중 난이도가 높아 선순위.
- **평가 시나리오**: (a) 신규 메모리 tier(HBM4/CMM-DC/HBF) 1종 추가 시 변경이
  어댑터 **모듈**에 갇히는지 **코어**(골격·공개 인터페이스)까지 침범하는지와
  기능 변경 비율(%)을 산정하고, (b) KV 구조 영향 모델 변화(GQA/MQA · MLA ·
  sliding-window/hybrid attention · SSM 계열)의 수용 리드타임을 upstream 공개
  시점 기준으로 측정한다. [측정: tier 추가 = topology 파라미터 등록 + 어댑터
  모듈 ≤ 1개 · 코어 수정 0, KV 구조 변화 수용 ≤ upstream + 2주 → ★★★ /
  코어 수정 ≤ 전체 기능의 40% · 수용 ≤ upstream + 1분기 → ★★☆]

- **정의**: 신규 메모리 디바이스(HBM4/CMM-DC/HBF)와 **KV 구조에 영향을 주는
  모델 변화**의 수용 비용. (코어/모듈 정의는 문서 상단 용어 정의 참조.)
- **측정**: (a) tier 추가 시 변경 범위 — 수정이 **모듈**에 갇히는가, **코어**
  (골격·공개 인터페이스)까지 침범하는가, 기능 변경 비율(%).
  (b) KV 구조 영향 모델 변화 — GQA/MQA(head 공유로 KV 크기 변화),
  MLA(latent KV — KV 정의 자체가 바뀜), sliding-window/hybrid attention,
  SSM 계열(KV 부재) — 의 수용 리드타임 (upstream 공개 시점 기준).

| 별점 | 기준 (a·b 모두 충족) |
|---|---|
| ★★★ | tier 추가 = topology 파라미터 등록 + **어댑터 모듈 ≤ 1개, 코어 수정 0** · KV 구조 변화 수용 **≤ upstream + 2주** |
| ★★☆ | 코어 수정이 전체 기능의 **≤ 40%** · 수용 ≤ upstream + 1분기 |
| ★☆☆ | 코어 재설계 수반(> 40%) 또는 수용 > 1분기 (만성 지연) |

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

## QA5. 개발·운영 비용

- **중요도: M** — 프로젝트 지속 가능성(추종·유지 인력)을 좌우하나, 과제 성패의
  판정 지표는 아님. DP1(플랫폼 전략) 선택에 따라 수십 인월 단위로 갈리므로
  구조 결정 시 반드시 함께 평가(C).
- **난이도: M** — plugin 경계를 유지하면 관리 가능함이 02 실측 표현(A)으로
  뒷받침됨. 비용 산정 자체는 표준적 방법(인월·FTE 추정)으로 수행 가능.
- **우선순위: 5** — M/M. 중요도 M 그룹 중 난이도가 낮아 최후순위.
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
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving (OSDI'24)](https://arxiv.org/pdf/2401.09670) · [해설 블로그](https://haoailab.com/blogs/distserve/) (goodput/SLO attainment 90% 정의, 250wpm)
- [KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache](https://arxiv.org/html/2402.02750v2) (2.6× 메모리, batch 4×, 처리율 2.35–3.47×, LongBench 저하 ≤2%p)
- [KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization (NeurIPS'24)](https://arxiv.org/html/2401.18079v4) (3-bit ΔPPL < 0.1, Wikitext-2·C4)
- [vLLM RELEASE.md](https://github.com/vllm-project/vllm/blob/main/RELEASE.md) (2주 릴리스 케이던스)
- 사내: Architect 과제 원본 덱 QA-01 (40% 기준), MCR 자체 P/D 분리 벤치 실측 (decode wait 70–85%)
