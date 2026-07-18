# 시각물 소스 원장 (Chart & Image Source Ledger)

`evidence-charts` 스킬의 캐노니컬 산출물. 데크에 들어가는 모든 근거
시각물(차트·실물 이미지)의 수치·출처·등급을 기록한다. **시각물 위 수치 =
이 원장 = 원 소스** 세 곳이 일치해야 한다. 등급: A 논문·공식 datasheet
보고치 / B 공식 블로그·보도자료·신뢰 언론 / C 공식 스펙 산술 유도(식 병기)
/ D illustrative.

| 시각물 | Claim | 데이터 | 근거 위치 | 소스 | 등급 | 접근일 |
|---|---|---|---|---|---|---|
| `mcr_assets/bg_gap_evidence.png` (배경 2/2 ④, 세로 column·log축) | 같은 하드웨어에서 런타임(메모리 관리·offloading 정책)만으로 처리량이 수 배~100×까지 갈린다 | vLLM 2–4× (동일 latency, vs FasterTransformer·Orca) / FlexGen 최대 100× (4-bit 압축 시; 비압축 69×, vs DeepSpeed ZeRO-Inference·HF Accelerate, OPT-175B, 단일 16GB T4) | vLLM: Abstract ("improves the throughput … by 2-4× with the same level of latency") / FlexGen: §1 ("If allowing 4-bit compression, FlexGen can reach 100× higher maximum throughput with effective batch size 144") | Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention (SOSP 2023) — arxiv.org/abs/2309.06180 · Sheng et al., FlexGen: High-Throughput Generative Inference of LLMs with a Single GPU (ICML 2023) — arxiv.org/abs/2303.06865 | A | 2026-07-18 |
| `mcr_assets/ag_context_evidence.png` (배경 1/2 ① 하단, column·log축) | 장기 기억 요구로 모델 컨텍스트 윈도가 5년 새 자릿수 단위로 폭증했다 | GPT-3 2K (2020) / Claude 2.1 200K (2023-11) / Gemini 1.5 Pro 1M (2024-02, production) / Llama 4 Scout 10M (2025-04) | GPT-3: 논문 §2.1 ("context window of nctx = 2048 tokens") / Claude 2.1: 발표문 ("200,000 tokens") / Gemini: 블로그 ("up to 1 million tokens in production", 연구는 10M) / Llama 4: 블로그 ("from 128K in Llama 3 to an industry leading 10 million tokens") | Brown et al., Language Models are Few-Shot Learners (NeurIPS 2020) — arxiv.org/abs/2005.14165 · Anthropic, "Introducing Claude 2.1" (2023-11-21) — anthropic.com/news/claude-2-1 · Google, "Our next-generation model: Gemini 1.5" (2024-02-15) — blog.google · Meta, "The Llama 4 herd" (2025-04-05) — ai.meta.com/blog/llama-4-multimodal-intelligence/ | A/B | 2026-07-18 |
| `mcr_assets/bg_kv_evidence.png` (배경 1/2 ② 상단, line) | KV cache는 컨텍스트×동시 세션에 비례해 커져 HBM 용량을 초과한다 | KV/token(FP16) = 2·80·8·128·2B = 320KB (Llama-2-70B) → 128K 컨텍스트 시 40GB/세션; 4세션 64K·8세션 32K에서 H100 80GB 초과 | 산식: 2(K,V)×layers×kv_heads×head_dim×2B; config: layers 80·kv_heads 8·hidden 8192 (head_dim 128); H100 80GB·HBM3 | Touvron et al., Llama 2 (arXiv 2307.09288, Table 1: 70B GQA) + Llama-2-70b config.json (num_hidden_layers 80, num_key_value_heads 8, hidden_size 8192 — huggingface.co/NousResearch/Llama-2-70b-hf) · NVIDIA H100 제품 페이지 (80GB, 3.35TB/s) — nvidia.com/en-us/data-center/h100/ | C (산식 병기) | 2026-07-18 |
| `mcr_assets/bg_offload_evidence.png` (배경 1/2 ② 하단, bar·log축) | 단순 offloading 경로는 tier마다 대역폭이 ~10×+ 낮아지는 계단을 노출한다 | HBM3 (H100 SXM) 3,350GB/s / CPU DRAM (DDR5-4800×8ch) 307GB/s / NVMe SSD (PM1743, PCIe 5.0) 13GB/s | H100: 스펙 표 "3.35TB/s" / DRAM: JEDEC DDR5-4800 38.4GB/s/ch × 8ch (산술) / SSD: 보도자료 "up to 13,000 MB/s" | NVIDIA H100 제품 페이지 — nvidia.com/en-us/data-center/h100/ · JEDEC DDR5 (채널당 38.4GB/s @4800MT/s, 서버 8ch 구성 가정) · Samsung Newsroom, "Samsung Develops High-Performance PCIe 5.0 SSD (PM1743)" (2021-12-23) — news.samsung.com/global/samsung-develops-high-performance-pcie-5-0-ssd-for-enterprise-servers | B/C 혼합 | 2026-07-18 |
| `mcr_assets/hbm3e_photo.png` (배경 1/2 ③ 상단) | 메모리 업계가 대역폭 축(HBM 고도화) 제품을 실제로 양산 중이다 | SK hynix HBM3E 양산 발표 보도 이미지 (2024-03-19) | 보도자료 본문 배너 이미지 | SK hynix Newsroom, "SK hynix Begins Volume Production of Industry's First HBM3E" (2024-03-19) — news.skhynix.com/sk-hynix-begins-volume-production-of-industry-first-hbm3e/ | B | 2026-07-18 |
| `mcr_assets/hbm_pim_photo.jpg` (배경 1/2 ③ 하단 합성 좌) | 자사(삼성)가 근접 연산(PIM) 제품을 보유 | Samsung HBM-PIM(Aquabolt-XL) 제품 보도 사진 (2021-02-17 발표) | 기사 다운로드 이미지 `HBM-PIM_PR_DL1` | Samsung Newsroom, "Samsung Develops Industry's First High Bandwidth Memory with AI Processing Power" (2021-02-17) — news.samsung.com/global/samsung-develops-industrys-first-high-bandwidth-memory-with-ai-processing-power | B | 2026-07-18 |
| `mcr_assets/cxl_module_photo.jpg` (배경 1/2 ③ 하단 합성 우) | 자사(삼성)가 용량 축(CXL 확장) 제품을 보유 | Samsung 512GB CXL Memory Expander 제품 보도 사진 (2022-05-10 발표) | 기사 이미지 `CXL-Memory_main1` | Samsung Newsroom, "Samsung Electronics Introduces Industry's First 512GB CXL Memory Module" (2022-05-10) — news.samsung.com/global/samsung-electronics-introduces-industrys-first-512gb-cxl-memory-module | B | 2026-07-18 |

합성: `mcr_assets/samsung_portfolio_photos.png` = `hbm_pim_photo.jpg` +
`cxl_module_photo.jpg` 를 흰 배경에 나란히 배치 (원본 비율 유지) — 배경
1/2 ③ 하단 슬롯에 삽입.

덱 반영: `docs/mcr_background_2p.build.js` 가 위 시각물을 참조하며
`docs/mcr_background_2p.pptx` 로 빌드됨.
