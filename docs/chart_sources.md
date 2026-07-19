# 시각물 소스 원장 (Chart & Image Source Ledger)

`evidence-charts` 스킬의 캐노니컬 산출물. 데크에 들어가는 모든 근거
시각물(차트·실물 이미지)의 수치·출처·등급을 기록한다. **시각물 위 수치 =
이 원장 = 원 소스** 세 곳이 일치해야 한다. 등급: A 논문·공식 datasheet
보고치 / B 공식 블로그·보도자료·신뢰 언론 / C 공식 스펙 산술 유도(식 병기)
/ D illustrative.

| 시각물 | Claim | 데이터 | 근거 위치 | 소스 | 등급 | 접근일 |
|---|---|---|---|---|---|---|
| `mcr_assets/bg_gap_evidence.png` (배경 2/2 ④, 세로 column·log축) | 같은 하드웨어에서 런타임(메모리 관리·offloading 정책)만으로 처리량이 수 배~100×까지 갈린다 | vLLM 2–4× (동일 latency, vs FasterTransformer·Orca) / FlexGen 최대 100× (4-bit 압축 시; 비압축 69×, vs DeepSpeed ZeRO-Inference·HF Accelerate, OPT-175B, 단일 16GB T4) | vLLM: Abstract ("improves the throughput … by 2-4× with the same level of latency") / FlexGen: §1 ("If allowing 4-bit compression, FlexGen can reach 100× higher maximum throughput with effective batch size 144") | Kwon et al., Efficient Memory Management for LLM Serving with PagedAttention (SOSP 2023) — arxiv.org/abs/2309.06180 · Sheng et al., FlexGen: High-Throughput Generative Inference of LLMs with a Single GPU (ICML 2023) — arxiv.org/abs/2303.06865 | A | 2026-07-18 |
| `mcr_assets/ag_context.png` (배경 1/2 ① 하단, column·log축) | 워크로드가 장기 기억을 요구할수록 컨텍스트 길이가 자릿수 단위로 폭증한다 | Chatbot 4K / RAG 32K / Multi-turn agent 256K / Agent+장기기억 1M+ — 각 자릿수는 출시 모델 스펙에 앵커: Llama 2 4K, Mixtral 8x7B 32K, Qwen3-235B-2507 262K native, Gemini 1.5 Pro 1M | Llama 2: "doubled the context length" (Table 1: 4096) / Mixtral: "trained with a context size of 32k tokens" / Qwen3: "Context Length: 262,144 natively" / Gemini: "up to 1 million tokens in production" | Touvron et al., Llama 2 (arXiv 2307.09288) · Jiang et al., Mixtral of Experts (arXiv 2401.04088) · Qwen3-235B-A22B-Instruct-2507 model card — huggingface.co/Qwen · Google, "Our next-generation model: Gemini 1.5" (2024-02-15) — blog.google | D (워크로드 매핑) + A/B (자릿수 앵커) — 각주에 illustrative 명시 | 2026-07-18 |
| `mcr_assets/bg_offload.png` (배경 1/2 ② 하단, 2-panel) | 단순 offloading 경로는 tier마다 ~10×+ 낮아지는 대역폭 계단을 노출하고, 수동 스왑은 처리량 급락을 부른다 | 좌: HBM ~TB/s / DRAM ~100GB/s / SSD ~10GB/s — 앵커: H100 SXM HBM3 3.35TB/s, DDR5-6400 2ch = 102.4GB/s, PM1743 13GB/s. 우: 상대 처리량 collapse (illustrative) | H100: 스펙 표 "3.35TB/s" / DRAM: JEDEC 51.2GB/s/ch ×2ch (산술) / SSD: "up to 13,000 MB/s" / 우측 패널 정성 근거: FlexGen §1 (offloading 정책만으로 최대 처리량 100× 격차) | NVIDIA H100 제품 페이지 — nvidia.com/en-us/data-center/h100/ · JEDEC DDR5-6400 · Samsung Newsroom, PM1743 (2021-12-23) · Sheng et al., FlexGen (ICML 2023) — arxiv.org/abs/2303.06865 | B/C 혼합 + 우측 패널 D (각주에 illustrative 명시) | 2026-07-18 |
| `mcr_assets/bg_kv_evidence.png` (배경 1/2 ② 상단, line) | KV cache는 컨텍스트×동시 세션에 비례해 커져 HBM 용량을 초과한다 | KV/token(FP16) = 2·80·8·128·2B = 320KB (Llama-2-70B) → 128K 컨텍스트 시 40GB/세션; 4세션 64K·8세션 32K에서 H100 80GB 초과 | 산식: 2(K,V)×layers×kv_heads×head_dim×2B; config: layers 80·kv_heads 8·hidden 8192 (head_dim 128); H100 80GB·HBM3 | Touvron et al., Llama 2 (arXiv 2307.09288, Table 1: 70B GQA) + Llama-2-70b config.json (num_hidden_layers 80, num_key_value_heads 8, hidden_size 8192 — huggingface.co/NousResearch/Llama-2-70b-hf) · NVIDIA H100 제품 페이지 (80GB, 3.35TB/s) — nvidia.com/en-us/data-center/h100/ | C (산식 병기) | 2026-07-18 |
| `mcr_assets/gddr6_aim_photo.jpg` (배경 1/2 ③ 상단 합성 좌) | 메모리 업계가 근접 연산(PIM/PNM) 제품을 실제로 개발·출시 중이다 | SK hynix GDDR6-AiM(Accelerator-in-Memory) 제품 보도 사진 (2022-02 발표) | 기사 본문 이미지 `GDDR6-AiM_01` | SK hynix Newsroom, "SK hynix Develops PIM, Next-Generation AI Accelerator" (2022-02-16) — news.skhynix.com/sk-hynix-develops-pim-next-generation-ai-accelerator/ | B | 2026-07-18 |
| `mcr_assets/hbf_stack_excerpt.png` (배경 1/2 ③ 상단 합성 우) | 용량 축의 신규 tier(HBF)가 업계 표준화 단계로 등장했다 | SanDisk HBF Stack 구조 도판 발췌 — "Match HBM Bandwidth, Deliver 8-16x Capacity at Similar Cost"; SK hynix와 표준화 협력 (2025-08 MOU) | HBF Fact Sheet p.1 우측 "HBF STACK" 도판 | SanDisk, "High Bandwidth Flash Fact Sheet" — documents.sandisk.com (Sandisk-HBF-Fact-Sheet.pdf) · SanDisk Newsroom, SK hynix 표준화 협력 (2025-08-06) — sandisk.com/company/newsroom | B | 2026-07-18 |
| `mcr_assets/lpddr5_pim_photo.png` (배경 1/2 ③ 하단 합성 좌) | 자사(삼성)가 모바일 축 근접 연산(LPDDR-PIM) 제품 기술을 보유 | Samsung LPDDR5-PIM 칩 렌더 (Hot Chips 33 발표 슬라이드 "Expansion of PIM technology, LPDDR5-PIM" 발췌; LPDDR5X-6400 기반 시뮬레이션, 성능 최대 2.4×·에너지 효율 최대 4.35×) | 슬라이드 우상단 제품 렌더 | Samsung, Hot Chips 33 발표 자료 (2021-08) — Tom's Hardware 게재, tomshardware.com/news/samsung-demos-in-memory-processing-for-hbm2-gddr6-axdimm-ddr4-and-lpddr5x-chips · 관련 보도: Samsung Newsroom (2021-08-24) | B | 2026-07-18 |
| `mcr_assets/cxl_module_photo.jpg` (배경 1/2 ③ 하단 합성 우) | 자사(삼성)가 용량 축(CXL 확장) 제품을 보유 | Samsung 512GB CXL Memory Expander 제품 보도 사진 (2022-05-10 발표) | 기사 이미지 `CXL-Memory_main1` | Samsung Newsroom, "Samsung Electronics Introduces Industry's First 512GB CXL Memory Module" (2022-05-10) — news.samsung.com/global/samsung-electronics-introduces-industrys-first-512gb-cxl-memory-module | B | 2026-07-18 |

합성 (흰 배경 나란히 배치, 원본 비율 유지):
- `mcr_assets/industry_products_photos.png` = `gddr6_aim_photo.jpg` +
  `hbf_stack_excerpt.png` — 배경 1/2 ③ 상단 (업계: PIM/PNM + 신규 tier).
- `mcr_assets/samsung_portfolio_photos.png` = `lpddr5_pim_photo.png` +
  `cxl_module_photo.jpg` — 배경 1/2 ③ 하단 (자사: LPDDR-PIM + CXL).

덱 반영: `docs/mcr_background_2p.build.js` 가 위 시각물을 참조하며
`docs/mcr_background_2p.pptx` 로 빌드됨.
