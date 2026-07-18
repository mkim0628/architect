# 차트 소스 원장 (Chart Source Ledger)

`evidence-charts` 스킬의 캐노니컬 산출물. 데크에 들어가는 모든 근거 차트의
수치·출처·등급을 기록한다. **차트 위 수치 = 이 원장 = 원 소스** 세 곳이
일치해야 한다. 등급: A 논문·공식 datasheet 보고치 / B 공식 블로그·벤치마크
·신뢰 언론 / C 공식 스펙 산술 유도(식 병기) / D illustrative.

| 차트 | Claim | 데이터 | 근거 위치 | 소스 | 등급 | 접근일 |
|---|---|---|---|---|---|---|
| `mcr_assets/bg_gap_evidence.png` (배경 2/2 ④) | 같은 하드웨어에서 런타임(메모리 관리·offloading 정책)만으로 처리량이 수 배~100×까지 갈린다 | vLLM 2–4× (동일 latency, vs FasterTransformer·Orca) / FlexGen 최대 100× (4-bit 압축 시; 비압축 69×, vs DeepSpeed ZeRO-Inference·HF Accelerate, OPT-175B, 단일 16GB T4) | vLLM: Abstract ("improves the throughput … by 2-4× with the same level of latency") / FlexGen: §1 ("If allowing 4-bit compression, FlexGen can reach 100× higher maximum throughput with effective batch size 144") | Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention (SOSP 2023) — arxiv.org/abs/2309.06180 · Sheng et al., FlexGen: High-Throughput Generative Inference of LLMs with a Single GPU (ICML 2023) — arxiv.org/abs/2303.06865 | A | 2026-07-18 |
