---
name: architect-requirements
description: "Run the requirements analysis phase of the MCR/Architect-과제 methodology: 요구사항 수집(stakeholder·역할 표 + 수집 방법) → 요구사항 도출(VOC 정제 → FR·제약사항 C) → FR 기반 시스템 경계 정의·Use Case 도출(UC 목록 + use-case diagram) → 품질 속성 선정(QA 후보 도출 → Utility Tree(중요도·난이도·우선순위) → 상위 5개 선정·정제) → Architecture Driver 선정(FR+선정QA+C 수렴). Use when the user asks to 요구사항을 분석/수집/도출/정제하라, stakeholder를 정리하라, Use Case를 도출하라, Utility Tree/ASR을 만들라, Architecture Driver를 선정하라. Canonical output: docs/00_requirements_analysis.md. 선정 QA의 정량 bin 정제는 architect-qa에, driver의 DP 전개는 architect-dp에 위임."
---

# Architect Requirements Skill — 요구사항 분석

과제 배경·범위 문서에서 출발해 **Architecture Driver까지** 도달하는 요구사항
분석 방법론. 캐노니컬 산출물: `docs/00_requirements_analysis.md`
(QA 정의 문서 `00_qa_definitions.md`의 상류 입력 — 분석이 채점 기준보다 먼저).
템플릿: [reference/template.md](reference/template.md).

역할 분담: **본 스킬**은 수집→FR/C→UC→QA 선정→Driver까지의 분석 파이프라인을,
**architect-qa**는 선정된 QA의 정량 bin 정의·채점을, **architect-dp**는
driver가 만드는 미결 설계 결정(DP)의 전개를 담당한다.

## 철칙 3가지

1. **전 구간 추적성(traceability)** — 모든 FR·QA 후보·제약사항은 출처
   VOC(원시 요구사항) 번호를, 모든 UC는 근거 FR 번호를, 모든 driver는
   FR/QA/C 번호를 달아야 한다. 출처 없는 항목은 무효 — 분석자가 지어낸
   요구사항과 수집된 요구사항이 구분되지 않으면 분석이 아니다.
2. **정제 전/후 수량 명시** — "수집 N건 → FR a건 · QA 후보 b건 · 제약 c건
   (· 범위 판정 d건)"을 문서 머리에 쓴다. 원시 VOC 전량은 부록 표로 보존한다
   (버린 것도 사유와 함께 — 무엇을 버렸는지가 무엇을 담았는지만큼 중요).
3. **품질 요구는 시나리오로만 인정** — QA 후보는 "빠르면 좋겠다" 같은 형용사가
   아니라 자극→환경→응답측정 구조의 시나리오 문장 + `[측정: …]` 기준으로
   기술해야 Utility Tree에 오를 수 있다.

## 절차 (5단계)

### 1단계. 요구사항 수집

1. **주요 stakeholder 및 역할** — 표 3열 `Stakeholder | 역할 | 주요 관심사`.
   빠뜨리기 쉬운 축을 점검: 발주자(사업부·임원), 운영자, 최종 응용/사용자,
   개발·유지보수팀, 외부 고객사, (간접) upstream 커뮤니티.
2. **요구사항 수집 방법** — 표 `방법 | 대상/출처 | 산출`. 인터뷰·VOC 접수,
   QAW(Quality Attribute Workshop), 자체 벤치마크 실측, 문헌·업계 벤치마크
   조사, upstream 로드맵 분석, 유사 시스템 분석 중 과제에 실제 쓴 것만.
   실측·문헌 출처에는 근거 등급(`A` 실측 · `B` 문헌 · `C` 논증)을 병기한다.
3. 수집 결과는 **원시 요구사항(VOC) 표** — `번호(R-NN) | 출처 stakeholder |
   내용 | 정제 결과 매핑` — 로 부록에 전량 보존.

### 2단계. 요구사항 도출 (정제 → FR · 제약사항)

- 정제 규칙: ① 중복 병합 ② 검증 가능한 문장으로 재기술("~할 수 있어야 한다")
  ③ 3분류 — **기능(FR)** / **품질(QA 후보 — 4단계로)** / **제약(C)** ④ 범위
  밖 항목은 버리되 사유 기록.
- **FR 표**: `번호(FR-NN) | 태그 | 설명 | 출처`. 태그는 2~6자 명사구(PPT
  태그바 재사용). 설명의 핵심 어구는 **bold**.
- **제약사항 표**: `번호(C-NN) | 제약사항 | 설명 | 출처`. 제약은 "선택지를
  줄이는 외부 강제"만 — 품질 목표(측정 가능한 개선 방향)는 QA로 보낸다.

### 3단계. 시스템 경계 정의 및 Use Case 도출

- **시스템 경계**: FR을 근거로 In/Out을 표로 명시 — `경계 내(시스템 책임) |
  경계 외(누구 책임인지)`. 범위 문서의 Out of Scope와 정합해야 한다.
- **액터 목록**: 경계 밖에서 시스템과 상호작용하는 주체(1차: 기능을 요청,
  2차: 시스템이 활용). 액터마다 한 줄 정의.
- **UC 목록**: `번호(UC-NN) | Use Case | 근거 FR`. 모든 FR이 ≥1개 UC에
  매핑되어야 하고(빠진 FR = 경계 정의 누락), UC가 FR에 없는 기능을
  요구하면 FR 누락 신호다.
- **Use-case diagram 필수** — 이미지(`.svg`) + draw.io 소스(`.drawio`) 2종
  세트, `diagrams/req_usecase_{시스템}.{svg,drawio}`. 시스템 경계 박스 +
  액터 + UC 타원(크림 `#F5E6C8` 채움 + 갈색 테두리 — house style),
  `<<include>>`/`<<extend>>`는 점선. md에 이미지 임베드 + 소스 링크 한 줄.

### 4단계. 품질 속성 선정

1. **QA 후보 도출** — 수집 요구사항 중 품질 분류분을 QA 후보로 정제:
   `품질속성(QA) | Refinement(구체 관심사) | 시나리오 + [측정: …]`.
   후보 단계에서는 넓게(8~12개) — 여기서 좁히면 Utility Tree가 알리바이가 된다.
2. **Utility Tree 적용 및 선정** — 전 후보를 한 표에:
   `번호 | QA | Refinement | Scenario [측정] | 중요도 | 난이도 | 우선순위 | 선정`.
   - **중요도/난이도** H/M/L. 우선순위는 **중요도 우선, 동률 시 난이도,
     둘 다 동률이면 최종 목표 지표 > 수단 지표** (QA 정의 문서의 규칙과 동일).
   - **상위 5개 선정**(기본값 — 과제 표준. 달라지면 사유 명시), 선정 행 표시.
   - **미선정 후보에도 사유를 쓴다** — "범위 외", "타 QA/DP로 흡수", "후속
     단계 재평가" 등. 사유 없는 탈락은 수집 단계의 stakeholder를 배신하는 것.
3. **선정 QA 정제** — 선정 5개의 정의·측정·정량 bin·bin 근거는
   **architect-qa 스킬**로 QA 정의 문서(`docs/00_qa_definitions.md`)에
   정제한다. 요구사항 문서에는 Utility Tree 행(요약)만 두고 QA 정의 문서를
   단일 출처로 링크 — 시나리오·bin을 복제하지 않는다. 이미 QA 정의 문서가
   있으면 Utility Tree가 그 문서와 **정합**해야 한다(번호 매핑 표 필수).

### 5단계. Architecture Driver 선정

- **FR 전량 + 선정 QA + 제약사항 C**가 driver로 수렴한다 — 합계를 명시:
  `[기능 a, QA 5, Constraint c — Drivers 총 N종 선정]`.
- **Driver → 설계 매핑 표**: `Driver | 아키텍처에 주는 함의 | 관련 DP/컴포넌트`.
  driver가 만드는 미결 설계 결정은 **architect-dp** 스킬의 DP로 전개하고,
  이미 DP 문서가 있으면 해당 DP 번호를 링크한다. 어느 DP/컴포넌트에도 닿지
  않는 driver는 경고 신호 — 아키텍처가 그 driver를 무시하고 있다는 뜻.
- 마지막에 산출물 한 줄 — drivers가 정의하는 시스템 이름 (예:
  `"MCR (Memory-Centric Runtime)"`).

## 체크리스트 (저장 전 필수)

- [ ] 문서 머리에 입력 문서(배경·범위) 링크와 정제 전/후 수량이 있는가?
- [ ] 모든 FR·C·QA 후보에 출처 VOC 번호가, 모든 VOC에 정제 결과 매핑이 있는가?
- [ ] 모든 FR이 ≥1개 UC에 매핑되고, 시스템 경계가 범위 문서 Out of Scope와 정합하는가?
- [ ] Use-case diagram 2종 세트(svg+drawio)가 있고 md에 임베드됐는가?
- [ ] Utility Tree의 모든 행에 시나리오+`[측정]`·중요도·난이도·우선순위가 있고, 우선순위 규칙이 QA 정의 문서와 동일한가?
- [ ] 미선정 QA 후보 전부에 탈락 사유가 있는가?
- [ ] 선정 QA가 QA 정의 문서와 번호 매핑 표로 정합하는가? (시나리오·bin 복제 없음)
- [ ] Driver 합계 수식이 맞고(FR+QA+C=N), 모든 driver가 DP/컴포넌트에 매핑되는가?

## 연계

- **architect-qa**: 4단계 선정 QA의 정량 bin 정의·개정·채점. Utility Tree
  행의 `[측정: …]`은 QA 정의 문서의 ★★★ bin과 일치해야 한다.
- **architect-dp**: 5단계 driver 중 "양립 불가 후보구조가 갈리는" 것이 DP
  발굴 단서가 된다 (DP 자격 기준은 architect-dp 참조).
- **architect-ppt**: 본 문서의 각 절이 슬라이드에 대응 — 1단계 stakeholder
  표 → P5 컬럼①, 2단계 FR/C + 3단계 use-case diagram → P6, 4단계 Utility
  Tree → P7, 5단계 driver 수렴 → P8. 수량 캡션(`[기능 a, QA 5, Constraint
  c, Drivers N종 선정]`)은 P5 컬럼②와 동일 문자열.
