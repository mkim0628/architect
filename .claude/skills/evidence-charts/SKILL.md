---
name: evidence-charts
description: "Turn slide claims into evidence-backed charts: find real numbers in external sources (논문 arXiv/SOSP/ICML, vendor datasheets·newsroom, industry news/market research), record them in a source ledger (docs/chart_sources.md), and render Excel-default-style chart PNGs (Office palette, Calibri-look, Source footnote) for deck insertion. Use whenever the user asks to 배경/필요성 슬라이드 내용에 맞는 이미지를 차트로 만들라, 근거 있는 소스(논문·뉴스)로 차트/그래프를 그려라, 출처 있는 데이터 시각화, 엑셀에서 그린 것 같은 차트, or when an architect-ppt slide needs a visual for a factual claim — this replaces architect-ppt's illustrative-chart fallback with sourced charts. Trigger even if the user only says '이 주장 뒷받침할 데이터 찾아서 그래프로' without the word chart/차트."
---

# Evidence Charts — 근거 소스 수집 → 엑셀풍 차트

슬라이드의 사실 명제(claim)마다 **외부 근거 소스에서 실제 수치를 찾아**,
그 수치로 **엑셀 기본 스타일 차트(PNG)** 를 그리는 스킬. 모든 차트는 Source
각주를 달고 원장(`docs/chart_sources.md`)에 등록된다. 손으로 그린 개념도
(`docs/mcr_assets/make_assets.py` 류)의 예시 수치를 근거 수치로 승격하는
작업이 전형적 사용처다.

## 철칙 3가지

1. **차트의 모든 수치는 소스 원문에 있는 값** — 그럴듯한 값을 지어 넣지
   않는다. 소스에서 수치를 찾은 위치(§/Fig./Table/문장)까지 원장에 적는다.
   근거 수치가 없는 차트는 이 스킬의 산출물이 아니다.
2. **모든 차트에 Source 각주 + 원장 등록** — `excelchart.py`는 `source=`
   없이 실행을 거부한다. 차트 위 수치 = 각주 소스의 수치 = 원장의 수치,
   세 곳이 일치해야 한다.
3. **못 찾으면 등급을 낮추되 명시한다** — 보고치(A/B)가 없으면 공식
   스펙으로부터의 산술 유도(C, 계산식 명시)까지는 허용. 그마저 없으면
   illustrative(D)로 차트 제목·원장에 "illustrative"를 박아 구분한다.
   D는 최후 수단이며, 기본 응답은 "이 claim은 근거 차트화 불가"라고
   보고하는 것이다.

## Workflow

1. **Claim 분해** — 슬라이드(또는 문서)의 각 콘텐츠 블록을 "차트 하나로
   증명할 한 문장"으로 환원한다. 예: "② KV cache는 컨텍스트×세션에 비례해
   HBM을 초과한다" → *모델 X에서 컨텍스트 N일 때 KV가 HBM 용량을 넘는다*.
   한 블록에 명제가 둘이면 차트도 둘로 나눈다 (억지로 한 장에 합치지 않기).
2. **소스 탐색** — WebSearch/WebFetch로 1차 출처를 찾는다. claim 유형별
   검색처·앵커 소스·쿼리 패턴은 [reference/source-playbook.md](reference/source-playbook.md)
   를 읽고 따른다. MCR 배경 ①~⑥의 검증된 앵커 소스 표가 있으므로 그
   도메인이면 playbook부터 연다.
3. **수치 추출·검증** — 수치는 초록/본문/표에서 원문 그대로 옮긴다. 소스 간
   수치가 다르면 보수적인 쪽을 취하고 원장 비고에 남긴다. 뉴스가 논문을
   인용한 경우 논문(1차)으로 거슬러 올라가 확인한다.
4. **원장 기록** — `docs/chart_sources.md`에 아래 형식으로 추가한다 (차트를
   그리기 *전에* 기록 — 원장이 차트의 입력이다).
5. **차트 렌더** — `scripts/excelchart.py`의 `ExcelChart`로 그린다 (아래
   API). 스타일 토큰과 타입 선택 규칙은
   [reference/excel-style.md](reference/excel-style.md) 참조. 커스텀
   matplotlib 코드로 스타일을 다시 만들지 말 것 — 데크 전체 차트의 일관성이
   이 헬퍼에 달려 있다.
6. **QA** — 생성된 PNG를 열어 보고(Read) 체크리스트를 통과시킨 뒤, PPT
   삽입(architect-ppt의 `image:` 필드) 또는 사용자 전달.

## 원장 형식 (docs/chart_sources.md)

| 열 | 내용 |
|---|---|
| 차트 | 파일명 (`bg_gap.png`) + 대상 슬라이드/블록 (배경 2/2 ④) |
| Claim | 차트가 증명하는 한 문장 |
| 데이터 | 차트에 실린 수치 전부 (예: Orca 1.0× / vLLM 2.7×) |
| 근거 위치 | 소스 내 위치 (§6.2, Fig.12) |
| 소스 | 표기 형식: `Kwon et al., …PagedAttention (SOSP 2023) — arxiv.org/abs/2309.06180` |
| 등급 | A 논문·공식 datasheet 보고치 / B 공식 블로그·벤치마크·신뢰 언론 / C 공식 스펙 산술 유도(식 병기) / D illustrative |
| 접근일 | YYYY-MM-DD |

## ExcelChart API (scripts/excelchart.py)

```python
import sys; sys.path.insert(0, ".claude/skills/evidence-charts/scripts")
from excelchart import ExcelChart

c = ExcelChart("Same GPU, runtime only: serving throughput",
               source="Kwon et al., ... PagedAttention (SOSP 2023), §6 — arxiv.org/abs/2309.06180")
c.column(["Orca (baseline)", "vLLM"], {"Throughput (x)": [1.0, 2.7]},
         value_labels=True, fmt="{:.1f}x", ylabel="Relative throughput")
c.save("docs/mcr_assets/bg_gap.png", w=5.2, h=3.0)
```

- 타입: `column` / `bar`(가로, 위→아래) / `line(x, {...}, markers=)` /
  `stacked_column`. 공통: `value_labels`, `fmt`, `ylabel|xlabel`,
  `ylog|xlog`(크기 계단 표현), `colors`(팔레트 오버라이드).
- 기준선: `c.hline(90, "HBM capacity")` — 용량 한계선 등.
- `save(path, w, h)` 는 인치 단위(슬라이드 셀에 맞게 5–7" 폭 권장), 200dpi.
- 폰트: Calibri→Carlito→DejaVu 자동 폴백. **차트 내 라벨은 영어**로 쓴다
  (이 환경에 CJK 폰트가 없어 한글은 □로 깨진다 — 기존 mcr_assets도 영어
  라벨 관례). 한글 라벨이 꼭 필요하면 `fonts-nanum` 설치를 시도하고,
  실패하면 영어로 쓰고 슬라이드 본문 텍스트가 한글을 담당하게 한다.

## 차트 타입 선택

- 소수 항목의 크기 비교 (baseline vs 개선, 제품 간) → `column`
- 항목 이름이 길거나 5개 이상, 크기 순 나열 → `bar`
- 시간·규모에 따른 추세 (컨텍스트 길이↑, 연도별) → `line`
- 구성비 (latency 분해, 비용 구성) → `stacked_column`
- 자릿수가 다른 계단 (tier별 대역폭 ~10×) → `bar` + `xlog=True`

## QA 체크리스트 (차트 전달 전)

- [ ] 차트의 모든 수치가 원장에 있고, 원장의 근거 위치가 실제 소스에서
      확인됐는가?
- [ ] Source 각주가 붙어 있고 1차 출처인가? (뉴스가 논문 인용 시 논문 표기)
- [ ] 등급 C면 계산식이, D면 "illustrative" 표기가 제목·원장에 있는가?
- [ ] PNG를 Read로 열어봤는가 — 라벨 잘림/겹침, 한글 깨짐(□) 없음?
- [ ] 축·단위가 claim과 정합한가? (배율 claim에 절대값 축 금지, 로그축은
      라벨에 log scale 명시)
- [ ] 같은 데크의 다른 차트와 스타일이 동일한가? (전부 ExcelChart 경유)

## 연계

- **architect-ppt**: 이 스킬의 PNG를 슬라이드 `image:` 필드로 넘긴다.
  architect-ppt의 "Image sourcing rule"(웹 이미지 검색 → 실패 시
  illustrative 생성)에서, **사실 명제 블록은 이 스킬의 근거 차트가 웹
  이미지보다 우선**한다. 원장 소스들은 데크 마지막 '참고 문헌' 슬라이드로
  승격할 수 있다.
- **architect-qa**: 원장의 A/B급 소스는 QA 정의 문서의 SLO 앵커 표와 상호
  인용 가능 — 같은 수치를 두 문서가 다르게 적지 않도록 원장을 우선한다.
