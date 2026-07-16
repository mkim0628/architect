# MCR — Memory-Centric Runtime 아키텍처 설계

PIM/PNM/CXL 이종 메모리 시스템 위에서 LLM 추론을 가속하는 런타임(MCR)의 아키텍처 설계 문서 저장소. Architect 과정 설계과제 산출물.

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
| [diagrams/dp2_candidates.svg](diagrams/dp2_candidates.svg) | DP2 후보구조 설계도 — Orchestration 중앙 정책 vs Memory Engine 자율 |

## 설계 요약

- **구조**: control plane(Inference Orchestration) / data plane(Inference Engine · Memory Engine) 2계층. Memory Engine을 1급 패키지로 승격한 것이 memory-centric 논지의 구조적 표현.
- **DP1** — Framework 실행 구조: vLLM 확장형(plugin/connector) vs 독립 framework. 핵심 변수는 tier-aware co-scheduling이 확장점 밖에 있다는 사실이 연구 가치의 핵심인가 여부.
- **DP2** — KV 배치·압축 관리 주체: 중앙 정책(전역 최적·품질 예산 집행) vs 자율(μs 반응·독립 이식성). OS paging policy 논쟁과 동형. hybrid(mechanism 자율 + 품질/SLO hint 하향)가 유력 채택 방향.
- **DP 간 커플링**: vLLM 확장형 채택 시 DP2는 자율+hint형으로 제약. 독립 framework 채택 시 전 후보 실현 가능.
