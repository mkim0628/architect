---
name: architect-qa
description: "Define Quality Attributes (QA) and score architecture candidates against them in the MCR/Architect-과제 methodology. Owns the QA definition document (per-QA: 정의 · 측정 방법 · 3-star 정량 bin · bin 선정 근거 with searched reference SLOs) and the scoring rules (bin 판정, 근거 등급 A/B/C, forecast/measured 표기, 상한/도달 리스크 분리). Use when the user asks to QA를 정의/정리/개정하라, 별점·평가표를 매기거나 검증하라, 품질속성 기준을 정량화하라, 레퍼런스 SLO를 찾아라, or when architect-dp needs a QA doc that doesn't exist yet. Canonical output: docs/00_qa_definitions.md."
---

# Architect QA Skill — QA 정의·평가

아키텍처 후보 평가의 **채점 기준(QA 정의 문서)** 을 만들고, 그 기준으로
후보를 **채점(QA 평가표)** 하는 스킬. 캐노니컬 예시:
`docs/00_qa_definitions.md` (MCR QA1–QA5). 템플릿:
[reference/qa-doc-template.md](reference/qa-doc-template.md).

역할 분담: **architect-dp**는 DP 문서 구조(문제정의→후보→평가표→노트)를,
**본 스킬**은 그 평가표의 채점 기준과 채점 행위를 담당한다. DP 문서에는 QA
표를 복제하지 않는다 — QA 정의 문서가 단일 출처(single source of truth).

## 철칙 3가지

1. **만점은 별 3개** (`★★★`/`★★☆`/`★☆☆`). 더 세분하지 않는다 — 설계 단계
   판별력은 3단계면 충분하고, 그 이상은 정밀성의 착시를 만든다.
2. **모든 별점 bin은 수치 기준** — "우수/보통/미흡" 같은 정성 라벨만으로 된
   bin은 무효. 각 bin 경계는 측정 가능한 값(배율·%p·인월·리드타임)이어야 한다.
3. **모든 수치는 선정 근거 필수** — bin 경계값마다 "왜 이 값인가"를 쓴다.
   근거가 없으면 **웹 검색으로 레퍼런스를 확보**한다: 업계 벤치마크 SLO
   (MLPerf 등), 대표 논문의 보고치, upstream 릴리스 주기, 사내 실측/기준.
   검색 불가 환경이면 사내 실측·구조 논증으로 대체하고 등급을 명시한다.

## QA 정의 문서 작성 규칙

파일 위치·이름: `docs/00_qa_definitions.md` (DP 문서보다 앞 번호 — 채점
기준이 채점보다 먼저). 버전을 달고, 잠정이면 "공식 확정 시 재평가" 명시.

각 QA 항목의 필수 4요소:

1. **정의** — 한 문장. 무엇을 보호하는 속성인가.
2. **측정 방법** — 지표, 측정 조건(baseline, 워크로드, percentile), 보조 지표.
3. **별점 bin 표** — 3행(★★★/★★☆/★☆☆), 각 행에 수치 구간.
   경계가 애매하면 안 됨: 임의 후보가 정확히 한 bin에 떨어져야 한다.
4. **bin 근거** — 각 경계값의 출처. 패턴:
   - 상위 bin = "문헌이 입증한 달성 가능선" (예: 2-bit 양자화 near-lossless → ≤0.5%p)
   - 중간 bin = "관례적 허용선/사내 기존 기준" (예: accuracy <1%p, 기능 변경 ≤40%)
   - 하위 bin = "존재 이유 미달선" (예: 압축 단독 대비 열위, 측정 잡음 수준)

공통 절: **SLO 앵커 표** — 외부 레퍼런스(벤치마크 SLO, 논문 보고치, 릴리스
주기)를 링크와 함께 모아두고, 각 QA bin 근거가 이 표를 인용하게 한다.
**표준 SLO** 한 줄(별도 명시 없을 때의 측정 조건)도 명시.

### 레퍼런스 SLO 검색 가이드

- 지연/처리율: MLPerf Inference 시나리오별 제약(Server/Interactive의 TTFT·TPOT
  p99), goodput·SLO attainment 정의 논문(DistServe 계열, attainment ≥90% 관례).
- 품질: 해당 압축/근사 기법의 대표 논문 보고치 (near-lossless 기준).
- 확장성/비용: upstream 프로젝트 릴리스 케이던스(추종 주기의 자연 단위),
  사내 기존 측정 기준.
- 인용은 **1차 출처**(논문/공식 문서) 우선. 검색 결과를 그대로 믿지 말고
  수치가 서로 다르면 보수적인 쪽을 취하고 각주로 남긴다.

## 채점(평가) 규칙

- 평가표 형식: 3열 **QA | 평점 | 정량 근거**.
- **bin 판정이 곧 별점**: "이 후보는 QA2에서 어느 bin에 떨어지는가"에 답하고
  그 bin의 별을 준다. bin 기준과 무관한 인상 점수 금지.
- **근거 등급 병기**: `A` 자체 실측 · `B` 문헌/벤치마크 · `C` 구조 논증.
- **시점 표기**: 설계 예측 `(F)` / 실측 `(M)`. F 평가는 "어느 bin에 도달할
  것으로 예측하며 왜"를 쓴다.
- **상한/도달 리스크 분리**: 설계 상한과 실현 확률이 갈리면
  `★★★ (상한) / ★☆ (도달 리스크)` — 합산·평균 내지 않는다.
- **비교 채점의 일관성**: 같은 QA 행에서 두 후보가 같은 별이면 그 QA는 결정
  변수가 아니다 — 근거 문장에서 차이를 밝히거나, bin 경계가 너무 성긴지 검토.

## 체크리스트 (QA 문서 저장/평가표 제출 전)

- [ ] 모든 QA에 필수 4요소(정의/측정/bin 표/bin 근거)가 있는가?
- [ ] 모든 bin 경계가 수치인가? (정성 라벨 단독 bin 없음)
- [ ] 모든 경계값에 출처(레퍼런스 링크 or 사내 실측 or 구조 논증+등급)가 있는가?
- [ ] SLO 앵커 표의 링크가 1차 출처인가?
- [ ] 평가표의 모든 별점이 bin 판정문 형태의 근거를 갖는가? (등급 A/B/C, F/M 포함)
- [ ] 채점 후 기존 문서들(DP 평가표)과 bin 기준 버전이 정합한가? (QA 문서 개정 시 기존 평가표 재평가 명시)

## 연계

- **architect-dp**: DP 문서 §0은 QA 정의 문서 링크만. DP 평가표는 본 스킬의
  채점 규칙을 따른다.
- **architect-ppt**: QA 정의는 P7 Utility Tree/ASR 슬라이드의 행(Scenario의
  `[측정: …]` 라인)과 정합해야 하고, 선정 QA는 P8 태그바·P9 dpCard의 QA
  나열과 일치해야 한다.
