# 시각물 소스 원장 (Chart & Image Source Ledger)

`evidence-charts` 스킬의 캐노니컬 산출물. 데크에 들어가는 모든 근거
시각물(차트·실물 이미지)의 수치·출처·등급을 기록한다. **시각물 위 수치 =
이 원장 = 원 소스** 세 곳이 일치해야 한다. 등급: A 논문·공식 datasheet
보고치 / B 공식 블로그·보도자료·신뢰 언론 / C 공식 스펙 산술 유도(식 병기)
/ D illustrative.

| 시각물 | Claim | 데이터 | 근거 위치 | 소스 | 등급 | 접근일 |
|---|---|---|---|---|---|---|
| `mcr_assets/bg_gap_evidence.png` (배경 2/2 ④, 세로 column·log축) | 같은 하드웨어에서 런타임(메모리 관리·offloading 정책)만으로 처리량이 수 배~100×까지 갈린다 | vLLM 2–4× (동일 latency, vs FasterTransformer·Orca) / FlexGen 최대 100× (4-bit 압축 시; 비압축 69×, vs DeepSpeed ZeRO-Inference·HF Accelerate, OPT-175B, 단일 16GB T4) | vLLM: Abstract ("improves the throughput … by 2-4× with the same level of latency") / FlexGen: §1 ("If allowing 4-bit compression, FlexGen can reach 100× higher maximum throughput with effective batch size 144") | Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention (SOSP 2023) — arxiv.org/abs/2309.06180 · Sheng et al., FlexGen: High-Throughput Generative Inference of LLMs with a Single GPU (ICML 2023) — arxiv.org/abs/2303.06865 | A | 2026-07-18 |
| `mcr_assets/hbm3e_photo.png` (배경 1/2 ③ 상단) | 메모리 업계가 대역폭 축(HBM 고도화) 제품을 실제로 양산 중이다 | SK hynix HBM3E 양산 발표 보도 이미지 (2024-03-19) | 보도자료 본문 배너 이미지 | SK hynix Newsroom, "SK hynix Begins Volume Production of Industry's First HBM3E" (2024-03-19) — news.skhynix.com/sk-hynix-begins-volume-production-of-industry-first-hbm3e/ | B | 2026-07-18 |
| `mcr_assets/hbm_pim_photo.jpg` (배경 1/2 ③ 하단 합성 좌) | 자사(삼성)가 근접 연산(PIM) 제품을 보유 | Samsung HBM-PIM(Aquabolt-XL) 제품 보도 사진 (2021-02-17 발표) | 기사 다운로드 이미지 `HBM-PIM_PR_DL1` | Samsung Newsroom, "Samsung Develops Industry's First High Bandwidth Memory with AI Processing Power" (2021-02-17) — news.samsung.com/global/samsung-develops-industrys-first-high-bandwidth-memory-with-ai-processing-power | B | 2026-07-18 |
| `mcr_assets/cxl_module_photo.jpg` (배경 1/2 ③ 하단 합성 우) | 자사(삼성)가 용량 축(CXL 확장) 제품을 보유 | Samsung 512GB CXL Memory Expander 제품 보도 사진 (2022-05-10 발표) | 기사 이미지 `CXL-Memory_main1` | Samsung Newsroom, "Samsung Electronics Introduces Industry's First 512GB CXL Memory Module" (2022-05-10) — news.samsung.com/global/samsung-electronics-introduces-industrys-first-512gb-cxl-memory-module | B | 2026-07-18 |

합성: `mcr_assets/samsung_portfolio_photos.png` = `hbm_pim_photo.jpg` +
`cxl_module_photo.jpg` 를 흰 배경에 나란히 배치 (원본 비율 유지) — 배경
1/2 ③ 하단 슬롯에 삽입.

덱 반영: `docs/mcr_background_2p.build.js` 가 위 시각물을 참조하며
`docs/mcr_background_2p.pptx` 로 빌드됨.
