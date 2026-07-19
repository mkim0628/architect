# Source Playbook — claim 유형별 근거 소스 탐색

목표: 차트에 넣을 **실수치**를 1차 출처에서 찾는다. 아래 순서로 좁힌다.

## 검색 전략

1. **1차 출처 우선순위**: 피어리뷰 논문(SOSP/OSDI/ICML/MLSys/FAST …) >
   공식 datasheet·표준 문서(JEDEC/CXL Consortium) > 벤더 공식
   블로그·뉴스룸 > 벤치마크 리더보드(MLPerf) > 시장조사 보도자료
   (TrendForce/Yole) > 일반 언론. 언론 기사가 수치를 인용하면 반드시 원
   논문/보도자료로 거슬러 올라가 수치를 재확인한다.
2. **쿼리 패턴**: `<시스템명> <지표> <단위>` 형태가 잘 걸린다.
   예: `vLLM PagedAttention throughput improvement SOSP`,
   `HBM3e bandwidth per stack datasheet`, `LLM agent average steps per task`,
   `HBM market revenue growth TrendForce 2025`.
   보고치가 안 나오면 `arxiv <주제> survey` 로 서베이 논문의 비교 표를 노린다.
3. **arXiv 수치 확인**: `arxiv.org/abs/<id>` 초록에서 핵심 배율이 대개
   나온다. 본문 수치가 필요하면 HTML 버전(`arxiv.org/abs/<id>` → "HTML" 링크
   또는 `ar5iv.org/abs/<id>`)을 WebFetch — PDF보다 표 추출이 쉽다.
4. **상충 처리**: 같은 지표의 수치가 소스마다 다르면 보수적인(작은 개선폭)
   쪽을 차트에 싣고 원장 비고에 다른 값을 남긴다.
5. **접근일 기록**: 뉴스·시장조사·리더보드는 값이 바뀐다. 원장에 접근일
   필수.

## Claim 유형별 검색처

| Claim 유형 | 1차 후보 | 백업 |
|---|---|---|
| 시스템 성능 비교 (배율) | 해당 시스템 논문의 Evaluation 절 | MLPerf Inference 결과, 벤더 기술 블로그 |
| HW 스펙 (대역폭·용량·지연) | 벤더 datasheet, JEDEC/CXL 표준 | Hot Chips/ISSCC 발표자료, AnandTech/ServeTheHome 실측 |
| 시장·산업 동향 (성장률·점유율) | TrendForce·Yole·Omdia 보도자료 | Reuters/Bloomberg 산업 기사 (원 조사기관 명시분만) |
| 워크로드 특성 (스텝 수·토큰량·채택률) | 해당 워크로드 논문·서베이 (SWE-bench, AgentBench 류) | LangChain/Anthropic 등 공식 usage 리포트 |
| 모델 구조 유도값 (KV 크기 등) | 모델 공식 config + 공식 산식 → **C등급, 식 병기** | 벤더 기술 블로그의 동일 계산 |

## MCR 배경 ①~⑥ 앵커 소스

이 저장소의 `docs/mcr_background_scope.md` ①~⑥ 블록용으로 검증된
출발점. **괄호 수치는 소스가 실제 보고한 값** — 재확인 후 그대로 쓴다.

| 블록 | claim | 앵커 소스 | 확인된 보고치 |
|---|---|---|---|
| ① Agent 워크로드 | multi-turn loop·툴 호출이 기본 | ReAct (arXiv 2210.03629), SWE-agent (arXiv 2405.15793), Anthropic "Building Effective Agents" | 스텝 수·툴 호출 횟수는 논문 Evaluation 표에서 추출 |
| ① 컨텍스트 폭증 | 장기 기억 → 컨텍스트 길이 증가 | 모델 공식 스펙 연표 (GPT-3 2K→GPT-4 128K→Gemini 1.5 1M→Llama 4 10M), 각 벤더 공식 발표 | 컨텍스트 윈도 연도별 line 차트 (B) |
| ② KV 증가 | KV ∝ 컨텍스트×세션, HBM 초과 | KV 산식: `2·layers·kv_heads·head_dim·bytes/token` × 모델 config (C, 식 병기) | Llama-2-70B ≈ 0.31MB/token → 128K ≈ 40GB, H100 80GB 대비 |
| ② decode bound | decode가 latency 지배 | 사내 P/D 분리 벤치 실측 (A, 70–85%) — repo 문서 인용 | 외부 백업: DistServe (arXiv 2401.09670)의 prefill/decode 특성 분석 |
| ② offloading 계단 | tier마다 대역폭 ~10×↓ | H100 datasheet (HBM3 3.35TB/s), DDR5-6400 8ch ≈ 410GB/s, PCIe 5.0 x4 NVMe ≈ 14GB/s | log-bar 차트 (A/C 혼합, 채널 수 가정 병기) |
| ③ 업계 제품군 | 메모리 중심 제품 등장, 계층 심화 | JEDEC HBM4 표준 발표, CXL Consortium 3.x, Samsung Newsroom(HBM-PIM/CXL), SK hynix·SanDisk HBF 발표, TrendForce HBM 시장 전망 | HBM 시장 성장률·세대별 대역폭 line/column (B) |
| ④ 런타임이 성능 결정 | 같은 HW에서 런타임만으로 격차 | vLLM SOSP'23 (arXiv 2309.06180); FlexGen ICML'23 (arXiv 2303.06865) | KV 낭비 60–80%→<4%, 처리량 2–4× (vLLM); 동일 16GB T4에서 최대 100× (FlexGen) |
| ⑤ 현 런타임 한계 | KV 계층도 수동 백엔드 | LMCache (arXiv 2510.09665) + 아키텍처 문서, Mooncake (arXiv 2407.00079), CacheGen (arXiv 2310.07240), CacheBlend (arXiv 2405.16444) | 기능 유무 비교는 차트보다 표가 적합할 수 있음 — 억지 차트화 금지 |
| ⑥ MCR 필요 | goodput@SLO 개선 여지 | DistServe (goodput 정의, 최대 7.4× 보고), Sarathi-Serve (arXiv 2403.02310) | 개선 배율 column (A) |

## 실물 이미지 소싱 (제품 사진·보도 이미지)

존재·등장 claim(SKILL.md의 판단 규칙)에 쓸 실제 이미지를 구하는 방법.

1. **공식 뉴스룸/프레스킷 우선** — 보도용으로 배포된 이미지라 품질·권리
   면에서 안전하다. 자주 쓰는 곳:
   - Samsung: `news.samsung.com/global` (이미지 호스트
     `img.global.news.samsung.com`), semiconductor.samsung.com
   - SK hynix: `news.skhynix.com` (이미지 호스트 `d36ae2cxtn9mcr.cloudfront.net`)
   - Micron/NVIDIA/SanDisk 등: 각 사 newsroom·press kit 페이지
   - 표준 단체: JEDEC·CXL Consortium 발표 자료
2. **URL 확보** — 제품 발표 기사를 WebFetch해서 "이미지 src URL을 나열하라"
   고 요청하면 직접 링크가 나온다. 그 다음
   `curl -sSL --cacert /root/.ccr/ca-bundle.crt -o <파일> "<URL>"` 로 받는다.
3. **봇 차단(403) 우회** — 일부 뉴스룸(SK hynix 등)은 기본 UA를 차단한다.
   `curl -A "Mozilla/5.0 ..."` 브라우저 UA로 HTML을 받아
   `grep -oE 'https://[^"]*\.(jpg|png|webp)'` 로 이미지 URL을 추출하면 대개
   CDN 직링크는 열려 있다.
4. **다운로드 후 검증** — `file`로 실제 이미지인지 확인하고, Read로 열어
   내용이 claim과 맞는지 본다 (로고만 있는 배너, 무관한 썸네일 주의).
5. **합성 허용** — 한 슬롯에 제품 두 개를 보여야 하면 PIL로 나란히 붙인다
   (흰 배경, 원본 비율 유지). 원장에는 원본 이미지별로 출처를 적는다.
6. **출처·권리 표기** — 보도 이미지는 출처 표기 후 인용이 관례지만
   저작권은 각 사에 있다. 원장에 기사 제목·게시일·URL을 적고, 대외 공개
   자료로 나갈 데크면 사용 범위를 사용자에게 알린다.

이미지 표기 형식: `Samsung Newsroom, "Samsung Develops Industry's First
HBM-PIM" (2021-02-17) — news.samsung.com/global/...`

## 표기 형식

- 논문: `Kwon et al., Efficient Memory Management for LLM Serving with
  PagedAttention (SOSP 2023), §6.2 — arxiv.org/abs/2309.06180`
- 벤더 자료: `NVIDIA H100 Tensor Core GPU Datasheet (2023) — nvidia.com/...`
- 뉴스·시장조사: `TrendForce, "..." (2025-03-11) — trendforce.com/...`
- 유도값(C): 소스 표기 뒤에 산식. 예:
  `KV/token = 2·80·8·128·2B (Llama-2-70B config — huggingface.co/meta-llama/...)`
- 각주가 길면 차트에는 축약형(`Kwon et al., SOSP'23 — arxiv.org/abs/2309.06180`),
  원장에 전체 표기.
