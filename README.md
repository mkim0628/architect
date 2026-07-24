# MCR 1단계 — KV 캐시 최적 운용 AI 런타임 아키텍처 설계

LLM 추론에서 KV 캐시를 1급 관리 대상으로 최적 운용(재사용·압축·KV 인지 스케줄링)하는 AI 런타임의 아키텍처 설계 문서 저장소. Architect 과정 설계과제 산출물.

**목표 3축**: ① KV 재사용성 제고 → 지연시간(TTFT) 개선 ② LLM 정확도를 유지한 KV 압축 → 메모리 병목 해소 → 지연·처리량 개선 ③ KV 캐시 인지형 동적 스케줄링 → 처리량 개선.

**로드맵**: 본 과제는 MCR(Memory-Centric Runtime)의 **1단계** — commodity tier(HBM·DRAM·SSD)에서 KV 운용 정책·구조를 입증한다. 자사 memory-centric 디바이스(PIM/PNM·CXL·HBF) 1급 통합과 근접연산 오프로드는 **2단계(MCR 완성)** 진화 경로 — 1단계의 tier 추상화 인터페이스가 그 접속점이다. 상세: [docs/mcr_background_scope.md](docs/mcr_background_scope.md) (v5).

## 문서

| 문서 | 내용 |
|---|---|
| [docs/01_architecture_overview.md](docs/01_architecture_overview.md) | 패키지 구조 확정안 v2 — 검수 반영 사항, 의존 관계, 미결 사항 |
| [docs/02_design_points_dp1_dp2.md](docs/02_design_points_dp1_dp2.md) | DP1(Framework 실행 구조)·DP2(KV 배치·압축 관리 주체) — 문제 정의, 후보구조, QA 평가 |

## 다이어그램

| 파일 | 내용 |
|---|---|
| [diagrams/mcr_package_diagram_v2.svg](diagrams/mcr_package_diagram_v2.svg) | 전체 패키지 다이어그램 (확정안 v2) |
| [diagrams/dp1_candidates.svg](diagrams/dp1_candidates.svg) | DP1 후보구조 설계도 — vLLM 확장형 vs 독립 framework vs KV-계층(LMCache) 확장형 |
| [diagrams/dp2_candidates.svg](diagrams/dp2_candidates.svg) | DP2 후보구조 설계도 — Orchestration 중앙 정책 vs Memory Engine 자율 (+ DP1 채택안별 실현 가능성 매트릭스) |

## 설계 요약

- **구조**: control plane(Inference Orchestration) / data plane(Inference Engine · Memory Engine) 2계층. Memory Engine을 1급 패키지로 승격한 것이 memory-centric 논지의 구조적 표현.
- **DP1** — Framework 실행 구조: vLLM 확장형(plugin/connector) vs 독립 framework. 핵심 변수는 tier-aware co-scheduling이 확장점 밖에 있다는 사실이 연구 가치의 핵심인가 여부.
- **DP2** — KV 배치·압축 관리 주체: 중앙 정책(전역 최적·품질 예산 집행) vs 자율(μs 반응·독립 이식성). OS paging policy 논쟁과 동형. hybrid(mechanism 자율 + 품질/SLO hint 하향)가 유력 채택 방향.
- **DP 간 커플링**: vLLM 확장형 채택 시 DP2는 자율+hint형으로 제약. 독립 framework 채택 시 전 후보 실현 가능.
