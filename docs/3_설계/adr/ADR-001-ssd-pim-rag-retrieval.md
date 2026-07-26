# ADR-001. RAG 유사도 검색의 SSD-PIM GEMV 가속 채택

- **상태**: Accepted
- **날짜**: 2026-07 (기록 시점; 결정은 선행)
- **관련 DP**: [DP7·DP8](../05_design_points_dp7_dp8.md) — 본 결정을 전제로 전개

## Context

RAG 워크로드에서 retrieval(임베딩 유사도 검색)은 TTFT 임계 경로에 있다.
코퍼스가 host 메모리를 넘어 SSD로 내려가면, SSD 기반 ANN은 후보 벡터를
host로 끌어올려 계산하는 구조가 되어 **PCIe 대역폭이 병목**이 된다 —
SPANN 계열 실측에서 I/O가 전체 실행 시간의 약 67%(B,
[SmartANNS/ATC'24](https://www.usenix.org/system/files/atc24-tian.pdf)).
한편 임베딩 유사도 연산은 내적(GEMV) — 산술 강도가 낮아 데이터 이동 비용이
지배하는, 근접연산의 전형적 적용 대상이다.

## Decision

**SSD 내부 DRAM에 부착된 PIM(GEMV 연산기) — SSD-PIM — 으로 임베딩 유사도
검색을 디바이스 내부에서 수행한다.** 후보 벡터를 host로 옮기지 않고, SSD
내부 대역폭(NAND→내부 DRAM→PIM)에서 내적·top-k를 계산해 결과만 외부로
내보낸다. 부착 위치는 HBM-PIM·host DRAM PIM이 아닌 **SSD 내부 DRAM**이다.

## Rationale

1. 벡터 코퍼스의 자연 서식지가 SSD(용량·비용) — 데이터가 있는 곳에 연산을 둔다(배경 1.3).
2. PCIe 병목(외부 인터페이스) 대비 SSD 내부 대역폭 활용 — near-storage ANN
   계열이 실증한 방향(B: SmartANNS QPS 최대 10.7×).
3. 자사 스토리지 제품 라인과의 시너지 — memory-centric 포트폴리오(배경 1.2)의
   스토리지 축 E2E 증명 vehicle(필요성 2.3).

## Consequences

- 검색의 **실행 구조**(전수 스캔 vs 인덱스 유도)와 **계약·소유**(가속 벡터DB
  서비스 vs 검색 가능한 tier)는 미결 — 각각 **DP7·DP8**로 전개한다.
- Tier Topology Model이 SSD-PIM을 어떻게 표현할지는 DP4(capability 표현)와
  DP8의 결합 결정에 종속된다.
- 확정안 v2의 "Retrieval Engine은 Request Manager 소속(device-resident 아님)"
  판단(01 §검수 2)은 DP8 후보2 채택 시 재개봉된다 — v2 검수 시점에는 SSD-PIM
  검색 capability가 논의 대상이 아니었다.
