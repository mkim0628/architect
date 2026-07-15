# MCR QA 정의 및 별점 평가 기준 (v0.2)

`02_design_points_dp1_dp2.md` §0의 잠정 QA 정의를 분리·승격한 문서.
모든 DP/후보구조 평가는 본 문서의 정량 bin을 기준으로 별점을 매긴다.
(잠정 — MCR 공식 QA 확정 시 본 문서를 개정하고 기존 평가표를 재평가한다.)

## 별점 체계 공통 규칙

- **3단계 만점 3**: `★★★` / `★★☆` / `★☆☆`. 모든 별점은 아래 각 QA의
  **정량 bin**에 대응해야 하며, bin 판정 근거 없는 별점은 무효.
- **평가 시점 표기**: 설계 단계 예측이면 `(F)` forecast, 실측이면 `(M)` measured.
  F 평가는 "어느 bin에 도달할 것으로 보는가 + 왜"를 근거에 명시.
- **근거 등급**: `A` 자체 실측 · `B` 문헌/벤치마크 인용 · `C` 구조 논증.
  근거에 등급을 병기한다 (예: "decode wait 70–85% 실측(A)").
- **상한/도달 리스크 분리**: 설계 상한과 도달 확률이 갈리면
  `★★★ (상한) / ★☆ (도달 리스크)`로 분리 표기.

## SLO 앵커 (외부 레퍼런스)

| 앵커 | 값 | 출처 |
|---|---|---|
| MLPerf Inference **Server** (Llama2-70B) | TTFT p99 ≤ 2,000 ms · TPOT p99 ≤ 200 ms | [MLCommons](https://mlcommons.org/2024/03/mlperf-llama2-70b/) |
| MLPerf Inference **Interactive** | TTFT p99 ≤ 450 ms · TPOT p99 ≤ 40 ms | [NVIDIA MLPerf v5.0](https://developer.nvidia.com/blog/nvidia-blackwell-delivers-massive-performance-leaps-in-mlperf-inference-v5-0/) |
| goodput 정의 · SLO attainment | SLO(TTFT·TPOT) 충족률 **≥ 90%** 유지 최대 처리율 | [DistServe (OSDI'24)](https://arxiv.org/pdf/2401.09670), [Hao AI Lab](https://haoailab.com/blogs/distserve/) |
| TPOT 인지 상한 | 인간 독해 속도 ~250 words/min → TPOT ≈ 50 ms면 체감 충분 | DistServe 상동 |
| KV 압축 품질·용량 레퍼런스 | 2-bit 양자화: peak memory 2.6× 절감, batch 4×, near-lossless | [KIVI](https://arxiv.org/html/2402.02750v2) |
| upstream 추종 주기 | vLLM 정규 릴리스 **2주 간격** | [vLLM RELEASE.md](https://github.com/vllm-project/vllm/blob/main/RELEASE.md) |
| 사내 확장성 기준 | 신규 장치 지원 시 기능 추가/변경 ≤ 전체의 40% | Architect 과제 원본 덱 QA-01 측정 기준 |

**MCR 표준 SLO**(별도 명시 없으면 이 조건으로 측정): 대화형 워크로드
TTFT p99 ≤ 450 ms · TPOT p99 ≤ 200 ms(장문 컨텍스트 감안해 Server/Interactive
절충), SLO attainment ≥ 90%, 대표 워크로드 = long-context RAG · multiturn ·
agent memory (과제 범위 3.2-3).

---

## QA1. 추론 성능 (goodput@SLO)

- **정의**: 표준 SLO를 attainment ≥ 90%로 유지하면서 달성하는 최대 처리율.
- **측정**: goodput(req/s @ SLO) — GPU HBM 단일 tier 동일 HW baseline 대비 배율.
  보조 지표: decode wait 비중 (자체 실측 70–85%(A)가 개선 대상).

| 별점 | 기준 (baseline 대비 goodput@SLO) |
|---|---|
| ★★★ | **≥ 1.5×** |
| ★★☆ | 1.1× – 1.5× |
| ★☆☆ | < 1.1× (측정 오차·운영 잡음 수준) 또는 SLO attainment < 90% |

**bin 근거**: P/D disaggregation 계열은 구조 변경만으로 goodput 2×+
(DistServe: 동일 SLO에서 최대 7.4× 요청 처리(B)), PD 통합/개선 연구들이
29–77% 개선(B)을 보고 — **1.5×를 "구조적 개선"과 "튜닝 수준 개선"의 경계**로
설정. 1.1× 미만은 A/B 테스트에서 통상 잡음과 구분 곤란.

## QA2. 메모리 효율 (유효 KV 용량)

- **정의**: 동일 물리 HBM에서 수용 가능한 유효 KV 용량 배율 (QA3 품질 bound를
  지키는 조건에서만 인정).
- **측정**: 유효 KV capacity / 물리 HBM capacity. 보조: tier 활용률, 압축률 분포.

| 별점 | 기준 (유효 KV 용량 배율) |
|---|---|
| ★★★ | **≥ 3×** |
| ★★☆ | 1.5× – 3× |
| ★☆☆ | < 1.5× |

**bin 근거**: 압축 단독으로 2.6× 메모리 절감·batch 4×가 near-lossless로 입증
(KIVI 2-bit(B)) — 압축(2–4×, 02 실측 전제(A))만 잘 써도 1.5×는 도달하므로
**tier 오프로딩과 압축을 함께 쓰는 MCR은 3×를 상위 bin**으로 요구. 1.5× 미만은
압축 단독 대비 열위 — 이종 tier 도입의 존재 이유 미달.

## QA3. 응답 품질 (품질 저하 bound)

- **정의**: 압축·재사용으로 인한 품질 저하의 상한 보장.
- **측정**: 대표 벤치마크 accuracy 저하(%p), PPL 증가율. bound의 **집행 단위**
  (요청별 vs 전역)를 함께 판정.

| 별점 | 기준 |
|---|---|
| ★★★ | accuracy 저하 **≤ 0.5%p** 그리고 PPL 증가 ≤ 1%, **요청별** bound 집행 가능 |
| ★★☆ | accuracy 저하 ≤ 1%p 그리고 PPL 증가 ≤ 3%, 전역 bound만 보장 |
| ★☆☆ | accuracy 저하 > 1%p 또는 bound 자체를 보장 못 함 |

**bin 근거**: 2-bit KV 양자화가 다수 모델에서 near-lossless(≈0.5%p 이내)(B)
— 이것이 달성 가능선이므로 상위 bin. 1%p는 02 문서의 기존 기준(A)이자 KV
압축 문헌의 관례적 허용선(B). K>V sensitivity(B) 때문에 요청별 차등 집행
가능 여부가 bound 보장성을 가름 → 집행 단위를 별점 조건에 포함.

## QA4. 확장성·진화성

- **정의**: 신규 메모리 디바이스(HBM4/CMM-DC/HBF)·신규 모델 수용 비용.
- **측정**: (a) tier 추가 시 변경 범위(수정 모듈 수, 기능 변경 비율),
  (b) 신규 모델 지원 리드타임 (upstream 공개 시점 기준).

| 별점 | 기준 (a·b 모두 충족) |
|---|---|
| ★★★ | tier 추가 = topology 파라미터 등록 + 어댑터 **≤ 1개 모듈**, 코어 수정 0 · 모델 지원 **≤ upstream + 2주** |
| ★★☆ | 코어 수정이 전체 기능의 **≤ 40%** · 모델 지원 ≤ upstream + 1분기 |
| ★☆☆ | 코어 재설계 수반(> 40%) 또는 모델 추종 > 1분기 (만성 지연) |

**bin 근거**: 40% 기준은 Architect 과제 원본 덱 QA-01의 사내 측정
기준을 계승(A). "upstream + 2주"는 vLLM 정규 릴리스가 2주 간격(B)이므로
**한 릴리스 주기 내 추종 = 실질 동시 지원**으로 정의. 1분기(6 릴리스 누락)를
넘으면 생태계 대비 만성 열세로 판정.

## QA5. 개발·운영 비용

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
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving (OSDI'24)](https://arxiv.org/pdf/2401.09670) · [해설 블로그](https://haoailab.com/blogs/distserve/) (goodput/SLO attainment 90%/250wpm/7.4×)
- [KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache](https://arxiv.org/html/2402.02750v2) (2.6× 메모리, 4× batch, near-lossless)
- [vLLM RELEASE.md](https://github.com/vllm-project/vllm/blob/main/RELEASE.md) (2주 릴리스 케이던스)
- 사내: Architect 과제 원본 덱 QA-01 (40% 기준), MCR 자체 P/D 분리 벤치 실측 (decode wait 70–85%)
