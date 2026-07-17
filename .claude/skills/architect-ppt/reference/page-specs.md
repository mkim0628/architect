# Architect 과제 Deck — 페이지별 상세 스펙

출처 덱(*Architect 양성과정 개인과제*, 33p) 스크린샷에서 판독한 페이지별 정밀
스펙. 모든 좌표는 인치(16:9 = 13.333″ × 7.5″), 색상은 `lib/architect_deck.js`의
`COLORS` 토큰. 공통 크롬(밴드·내비·푸터)은 SKILL.md / design-tokens.md 참조.

## 챕터 ↔ 내비 스테퍼 매핑

| 챕터 (nav `active`) | 페이지 |
|---|---|
| 0 과제 개요 | 과제 배경 · 과제 필요성 · 과제 범위 · 과제 개요 |
| 1 요구사항 | Architecture Design Process · 요구사항 정제 · Utility Tree ASR 선정 · Architecture Driver 도출 |
| 2 설계 | 설계 Point 선정 · (DP 상세, 뷰 설계 등) |
| 3 검증 | (ATAM 등) |
| 4 결론 | (결론/성과) |

밴드 색은 챕터와 무관하게 **navy/green이 페이지 단위로 교대**한다(출처 덱 관찰:
6 navy → 7 green → 8 navy → 9 green → 10 navy). 연속 페이지가 같은 색이 되지
않게만 유지하면 된다.

---

## P1. 과제 배경 — `pageColumns` (band navy, active 0)

- **3단**, 각 단: `sectionHeader`(green) + 콘텐츠 2개(짧은 불릿 텍스트 + 매칭 이미지).
- 텍스트 영역은 슬롯 상단 30% (`textFrac 0.30`), 이미지는 나머지. 이미지 규칙은 SKILL.md 참조.

## P2. 과제 필요성 — `pageColumns` (band navy, active 0)

- **2단**, 나머지는 과제 배경과 동일 포맷.

## P3. 과제 범위 · 목적 — `pageColumns` + `images:false` (band navy, active 0)

- **3단 텍스트 전용**: 목적(green 헤더) / 범위 In Scope(navy) / 범위 외 Out of Scope(navy).
- In Scope는 "굵은 navy 소제목 + 들여쓴 – 하위 항목" 패턴.

## P4. 과제 개요 — `pageOverview` (band green, active 0)

- **2단**: 좌 `infoTable`(과제명·과제목표·참여인력·일정, labelW 1.7) / 우 Overall
  Architecture 이미지 — **사용자가 명시하기 전까지 공란**.

---

## P5. Architecture Design Process (band navy, active 1 요구사항)

전체 프로세스를 한 장에 요약하는 **4단 파이프라인** 페이지. 제목은 영문
"Architecture Design Process".

**레이아웃** — `columns(4, {gap:0.18})`, 각 단:

1. 상단 `chevronHeader`(h 0.42, 화살표(오각형) 배너) — 색 **green/navy 교대**:
   ① 아키텍처 구성 요소 도출(green) ② 아키텍처 드라이버 후보 선정(navy)
   ③ 설계 결정사항 선정 및 아키텍처 검증(green) ④ 최종 설계 및 구현(navy)
2. 그 아래 서브헤더 박스(흰 배경, 회색 테두리, "▪ 라벨" 좌정렬 bold 10pt)
3. 컬럼별 본문 (아래)

**컬럼 ① 아키텍처 구성 요소 도출** — 서브헤더 "▪ 요구사항 수집" 후
`specTable` (header `["Stakeholder","VOC 수집"]`, fontSize 8.5). 캐노니컬 행:

| Stakeholder | VOC |
|---|---|
| S.LSI 사업부 (AP SW 개발팀) | Mobile NPU 관련 요구사항 전달 |
| 메모리 사업부 (DRAM 설계팀) | HBM-PIM 관련 요구 사항 전달 |
| 기술원 (System 연구센터) | 분산 GPU 서버 관련 요구사항 전달 |
| 개발 임원 (랩장) | 타 과제/사업부와의 협력 관련 요구사항 전달 |
| 개발자 | 과제의 운영 및 유지보수에 대한 의견 전달 |
| 고객사 | 당사로부터 제품을 납품 받아 실제 시스템을 구축하는 외부 업체 |

(출처 덱은 사람 아이콘 포함 — 재현 시 아이콘 생략 가능, 또는 생성 이미지로 대체.)

**컬럼 ② 아키텍처 드라이버 후보 선정** — 서브헤더 2개("▪ 요구사항 도출",
"▪ 요구사항 분석"). Refinement/QAW 박스에서 기능적 요구 사항 / Quality
Attributes / Constraints 박스로 이어지는 소형 흐름도(작은 rect + 화살표, 또는
생성 이미지). 아래 캡션 `[기능 9, QA 5, Constraint 2, Drivers 16종 선정]`
(navy bold, 선정 숫자 강조). 그 아래 QA 미니 테이블(`specTable`, header
`["번호","QA","Refinement","중요도","난이도","우선순위"]`, fontSize 7.5) —
P7의 QA-01~11 행에서 Scenario 열만 뺀 축약본.

**컬럼 ③ 설계 결정사항 선정 및 아키텍처 검증** — 서브헤더 "▪ 후보 구조 선정 및
평가". 캡션 박스 `[시스템 분석 → Skeleton Architecture 도출]` → DP-01~05 후보
구조 썸네일(생성 이미지 or `panel` 공란) → 아래 화살표(`downArrow`) →
`[설계 결정 사항 5件 → 설계안 도출]` → **[ATAM]** 소형 프로세스 다이어그램
(Business Drivers/Quality Attributes/Scenarios → Analysis → Tradeoffs/
Sensitivity Points/Non-Risks/Risks → Risk Themes; 생성 이미지 권장).

**컬럼 ④ 최종 설계 및 구현** — 서브헤더 "▪ Architecture Design". 캡션
`[SEI 3 View Design]` 후 세로로 ①Module View ②Behavior View ③Deployment View
3개 미니 다이어그램(각각 번호 라벨 bold + 생성 이미지 or `panel`). Deployment
View에는 대상 시스템 라벨(예: "대규모 분산 학습 시스템", "Ondevice 추론 시스템").

## P6. 요구사항 정제 (band green, active 1)

- 밴드 우하단 `linkButton({label:"전체 수집된 요구사항 :"})` (백업 자료 점프 표기).
- **헤드라인** (y≈1.25, fontSize 18): `○ 수집한 요구사항 54건 → `**`정제 요구사항
  22건`**` 분석` — "정제 요구사항 N건"만 navy bold. 아래 들여쓴 서브라인
  (fontSize 13): `- 기능 요구 사항 9건, 품질 요구 사항 11건, 제약 사항 2건 도출`.
- **좌측 55%** (x MARGIN, w≈6.9):
  - `sectionHeader`(navy) "기능 요구사항" + `specTable`
    header `["번호","기능 요구사항","설명"]`, colW ≈ `[0.65,1.15,5.1]`, fontSize 8.5.
    설명 셀은 **핵심 키워드만 navy bold** run + 나머지 검정 (출처 덱 스타일).
  - 아래 `sectionHeader`(navy) "제약사항" + 같은 포맷 2행.
- **우측 45%** (x≈7.5, w≈5.5): `sectionHeader`(navy) "Use-case diagram" +
  `panel` 안에 use-case 다이어그램 **생성 이미지**. 구성: 중앙 상단 시스템명
  "통합 딥 러닝 컴파일러/런타임 (Universal Deep Learning Compiler/Runtime)",
  좌 액터 `Deep learning framework`, 우 액터 `User application`, UC 타원(크림
  `#F5E6C8` 채움 + 갈색 테두리) 2열 배치, `<<include>>`/`<<extend>>` 점선.

**캐노니컬 기능 요구사항 (FR)** — [태그]는 P8 태그바에도 재사용:

| 번호 | 태그 | 설명 (bold = navy 강조) |
|---|---|---|
| FR-01 | 시스템 지원 | **임베디드 시스템과 대규모 서버 시스템**에서 딥 러닝 모델을 실행하기 위한 바이너리를 생성할 수 있어야 하고, 이를 시스템 상에서 동작 시킬 수 있어야 한다. |
| FR-02 | 연산 장치 지원 | **NPU, PIM, GPU 등 다양한 하드웨어 가속기**에서 실행 가능한 바이너리를 생성할 수 있어야 한다. |
| FR-03 | 장치 간 연동 | **서로 다른 연산 장치를 사용**해서 딥 러닝 모델을 실행할 수 있어야 한다. |
| FR-04 | 모델 지원 | CNN, RNN 및 Transformer 기반 대규모 언어 모델 등 여러 **다양한 AI 응용**을 지원할 수 있어야 한다. |
| FR-05 | Ondevice 컴파일 | 딥 러닝 모델을 **실제로 실행할 시스템 상에서 컴파일**을 수행하고 바로 실행할 수 있어야 한다. |
| FR-06 | 학습/추론 지원 | 딥 러닝 모델의 **학습과 추론을 위한 바이너리를 생성**할 수 있어야 한다. |
| FR-07 | 병렬/분산 처리 | **두 개 이상의 연산 장치 또는 서버 노드를 동시에 활용**하여 딥 러닝 모델을 실행할 수 있어야 한다. |
| FR-08 | 메모리 관리 | 딥 러닝 모델 실행을 위해 필요한 메모리 크기보다 연산 장치의 **메모리가 작은 경우에도 모델을 실행**할 수 있어야 한다. |
| FR-09 | 다중 응용 실행 | **두 개 이상의 딥 러닝 모델을 동시에 실행**할 수 있어야 한다. |

**제약사항 (C)**:

| 번호 | 제약 사항 | 설명 |
|---|---|---|
| C-01 | 보안 | 당사 **핵심 HW IP 정보**가 컴파일러/런타임 사용자에게 노출되지 않아야 한다. |
| C-02 | 일정 준수 | 목표한 **개발 일정**을 준수해야 한다. |

**Use case 목록**: UC01 모델 변환 · UC02 모델 컴파일 · UC03 모델 최적화 ·
UC04 모델 학습 · UC05 모델 실행 · UC06 다중 응용 실행 · UC07 Ondevice 컴파일 ·
UC08 다중 장치 실행 · UC09 다중 서버 실행 · UC10 데이터 오프로딩.

## P7. Utility Tree 활용한 ASR 선정 (band navy, active 1)

- **전면 단일 `specTable`** (x MARGIN, w = 12.633):
  - header `["번호","QA","Refinement","Scenario","중요도","난이도","우선순위","선정"]`
  - colW ≈ `[0.65, 1.0, 1.25, 7.6, 0.6, 0.6, 0.55, 0.4]` (Scenario가 절대 우위)
  - fontSize 8.5 (Scenario 셀), 중요도/난이도/우선순위/선정은 `align:"center"`.
  - **Scenario 셀 = 2개 run**: 시나리오 문장(핵심 어구 navy bold) `breakLine` 후
    `[측정: …]` 라인 (fontSize 7.5, color 595959).
  - **선정된 행은 `highlightRows`로 cream(#FFF2CC) 하이라이트 + 선정 열 "O"**.

**캐노니컬 ASR 테이블** (선정 = QA-01·02·03·05·07, 하이라이트):

| 번호 | QA | Refinement | Scenario 요지 [측정] | 중요도 | 난이도 | 우선순위 | 선정 |
|---|---|---|---|---|---|---|---|
| QA-01 | Extensibility | 신규 장치 지원 용이성 | 신규/이종 HW 지원 시 **컴파일러 변경 최소화** [측정: 기능 추가/변경 ≤ 전체의 40%] | H | H | 3 | O |
| QA-02 | Efficiency | 자원의 효율적인 사용 | 동일 네트워크 수행 시 **필요 자원 최소화** [측정: 메모리 사용량 < 기존 프레임워크] | H | M | 4 | O |
| QA-03 | Performance | 빠른 추론/학습 시간 | 컴파일 최적화로 **타겟 장치/시스템 추론·학습 성능 향상** [측정: 실행 시간(ms) < 기존 프레임워크] | H | H | 1 | O |
| QA-04 | Usability | 컴파일러/런타임 사용성 | 도입·사용에 어려움이 없어야 함 [측정: 도입 MM < 4MM (4명×1달)] | M | H | 7 | |
| QA-05 | Portability | 프레임워크 이식성 | TF/PyTorch 등에 **이식이 쉽고 UX 유지** [측정: 프레임워크 코드 수정 MM < 2MM] | H | M | 5 | O |
| QA-06 | Fault tolerance | 장치/서버 실패 허용성 | 분산 학습 중 일부 실패에도 **전체 학습 지속** [측정: 허용 실패 < 전체의 5%] | M | H | 6 | |
| QA-07 | Reusability | 타겟 장치/시스템 간 코드 재사용성 | 서로 다른 타겟에서 **실행 코드 최대한 동일** [측정: 타겟 간 재사용성 > 70%] | H | H | 2 | O |
| QA-08 | Analyzability | 분석 용이성 | 개발·실행 중 정보 추출 용이 [측정: 디버깅/병목 분석 리소스 < 2명×3일] | M | M | 10 | |
| QA-09 | Performance | 빠른 컴파일 시간 | 컴파일 소요 시간이 길지 않아야 함 [측정: O0<1분, O1<3분, O2<사용자 설정] | M | H | 8 | |
| QA-10 | Configurability | 컴파일/실행 옵션 제공 | 목적에 맞는 다양한 옵션 제공 [측정: 옵션 변경 위한 Re-build 빈도 > 1회/달] | M | M | 11 | |
| QA-11 | Modifiability | 수정 용이성 | 고객/사용자가 고쳐 쓰기 수월 [측정: 추가/변경 필요 모듈 < 5개] | M | M | 9 | |

## P8. Architecture Driver 도출 (band green, active 1)

FR/QA/C 세 그룹이 중앙 **Architectural Drivers**(노란 타원)로 수렴하는 퍼널 페이지.

- **좌측 열** (x MARGIN, w≈4.5): 그룹 라벨 `| Functional Requirements`
  (ink bold 12pt, 좌측 세로바는 텍스트 "|" 또는 0.04″ rect) 아래 **FR-01~09
  `tagBar`(navy)** 9개, h 0.34, 간격 0.12. 형식: `FR-01 [시스템 지원] 다양한
  시스템 구조 지원` — 태그바용 축약 설명:
  FR-01 다양한 시스템 구조 지원 · FR-02 이기종 가속기 지원 · FR-03 이기종 장치 간
  협업 운용 지원 · FR-04 다양한 딥 러닝 모델 지원 · FR-05 대상 시스템 상에서
  컴파일 지원 · FR-06 딥 러닝 모델 학습/추론 지원 · FR-07 두 개 이상의 장치/
  시스템 동시 사용 · FR-08 다중 메모리 계층 활용 · FR-09 두 개 이상 모델 동시 실행
- **우상단** (x≈5.2, w≈4.5): `| Quality Attributes` + **선정 QA 5건 `tagBar`(green)**:
  QA-01 [Extensibility] 신규 장치 지원 용이성 · QA-02 [Efficiency] 자원의 효율적인
  사용 · QA-03 [Performance] 빠른 추론/학습 시간 · QA-05 [Portability] 프레임워크
  이식성 · QA-07 [Reusability] 타겟 장치/시스템 간 코드 재사용성
- **우하단** (x≈10.0, w≈3.0): `| Constraints` + **C-01, C-02 `tagBar`(brown)**:
  C-01 [보안] HW IP 정보 유출 금지 · C-02 [일정 준수] 목표 개발 일정 준수
- **중앙 수렴부** (y≈4.3): 노란 타원(`ellipse`, fill yellow, w≈2.4 h≈0.95) 텍스트
  "Architectural Drivers" (navy bold 13pt). 화살표 3개(`rightArrow`/`downArrow`/
  `leftArrow`)가 각 그룹 색(navy/green/brown)으로 타원을 향함.
- **하단**: 큰 `downArrow`(회색-녹색) + 산출물 인용구 —
  `"Universal Deep Learning Compiler/Runtime"` (ink bold 16-18pt, center).
  재사용 시 과제 산출물 이름으로 치환 (MCR이면 `"MCR (Memory-Centric Runtime)"`).

## P9. 설계 Point 선정 (band navy, active 2 설계)

모듈 다이어그램에 드라이버 배지를 오버레이하고, 우측에 DP 카드 5장을 쌓는 페이지.

- 밴드 우하단 `linkButton({label:"Context View/Module View :"})`.
- **좌측 레일** (x MARGIN, w≈2.1): 드라이버 인덱스 — 각 행 = `badge` + 흰 배경
  회색 테두리 라벨 박스(fontSize 9). 배지 색: **F1~F9 navy · Q1~Q7 green(진한
  greenDark) · C1~C2 brown**.
  F1 시스템 지원 · F2 연산 장치 지원 · F3 장치 간 연동 · F4 모델 지원 · F5
  Ondevice 컴파일 · F6 학습/추론 지원 · F7 병렬/분산 처리 · F8 메모리 관리 ·
  F9 다중 응용 실행 / Q1 Extensibility · Q2 Efficiency · Q3 Performance · Q5
  Portability · Q7 Reusability (선정 5건만; 필요시 Q4/Q6 등 추가) / C1 보안 ·
  C2 일정 준수
- **중앙** (x≈2.7, w≈6.4): 패키지/모듈 구조 다이어그램 — 2개 패키지(NN Compiler
  / NN Runtime, 각각 내부 모듈 박스: Front-end/Middle-end/Back-end,
  Interface/Scheduler/User driver 등), `<<executable binary>>` 점선 연결.
  **생성 이미지 권장** (배지·DP 하이라이트를 이미지에 포함), 또는 `panel` 위에
  `badge()`와 색 테두리 rect(DP 영역 하이라이트: 해당 DP 색, fill 없음)를 오버레이.
  하단 중앙 범례: `Legends:` + Package/Module 소형 박스 2개.
- **우측** (x≈9.3, w≈3.7): **`dpCard` 5장 세로 스택** (gap 0.15). 캐노니컬:

| ID (색) | 타이틀 | 본문 |
|---|---|---|
| DP-01 (cyan `00B0F0`) | 프레임워크에서의 실행 구조 | (1안) 프레임워크 기반 확장 설계 / (2안) 독립된 구조의 컴파일러/런타임 설계 / QA: Extensibility, Performance, Portability, Reusability |
| DP-02 (green `00B050`) | 스케줄링 최적화 시점 | (1안) 정적 스케줄링 기법 / (2안) 동적 스케줄링 기법 / QA: Efficiency, Performance |
| DP-03 (orange `ED7D31`) | 컴파일러 중간 표현 구조 | (1안) 시스템 구성 계층 별 중간 표현 정의 / (2안) 최적화 문제 별 중간 표현 정의 / QA: Extensibility, Performance, Reusability |
| DP-04 (magenta `E91E8C`) | 하드웨어 정보 구성 | (1안) 주요 장치 별 하드웨어 정보 구분 / (2안) 공통 HW 정보 기술 / QA: Extensibility, Portability, Reusability |
| DP-05 (purple `7030A0`) | 분산 서버 간의 동작 구조 | (1안) 동일 실행 방식 / (2안) Master-slave 실행 방식 / QA: Efficiency, Performance, Reusability |

- DP 카드 본문 규칙: "(1안)/(2안)" 줄은 ink, "QA: …" 줄은 navy. 각 카드의 ID 색은
  `COLORS.dp` 토큰과 다이어그램의 DP 하이라이트 색에 일치시킨다.

---

## P10–P11. DP 상세 (DP마다 2페이지 세트, active 2 설계)

P9(설계 Point 선정) 뒤에 **DP마다 두 장씩** 이어진다: DP-01 ①②, DP-02 ①②, ….
밴드 색은 전역 교대 규칙을 따른다(관례상 ① navy → ② green). 내용 출처는
architect-dp 스킬의 DP 문서(`docs/NN_design_points_*.md`) — PPT에는 요약
발췌만 싣고 정량 근거·QA 평가표 전문은 문서에 남긴다(필요 시 `linkButton`으로
백업 점프 표기).

### P10. DP 상세 ① — 문제 정의 · 설계 쟁점 — `pageDpProblem`

- 제목 관례: `DP-0N. {DP 이름} — 문제 정의`.
- **좌측 56%** — `sectionHeader`(navy) "문제 정의":
  - 상단 불릿(영역의 ~42%): DP 문서 문제 정의의 요약 3–4줄. 첫 줄 = 핵심 긴장
    한 문장(bold), 이후 **양방향 압력을 모두** 담는다 (한쪽 방향만 쓰지 않는다 —
    architect-dp 규칙과 동일).
  - 하단 그림(영역의 ~58%): **내용에 맞는 그림 필수** (`problem.image`).
    문제의 긴장이 보이는 다이어그램을 생성한다 — 두 압력이 마주보는 force
    다이어그램, 병목/미결 지점을 강조한 미니 구조도 등. 웹 이미지보다 생성
    우선(과제 고유 내용), 라벨은 영문 기술용어 위주. placeholder는 최후 수단.
- **우측 44%** — `sectionHeader`(green) "설계 쟁점": DP 문서의 쟁점을 번호
  리스트(1. 2. 3. …)로. 마지막 쟁점 = 타 DP 커플링(관례) — navy 강조 가능.

### P11. DP 상세 ② — 후보구조 비교 — `pageDpCompare`

- 제목 관례: `DP-0N. {DP 이름} — 후보구조 비교`.
- **전면 3열 비교 그리드**: 구분(labelW 1.05, navy 라벨) | 후보구조 1 | 후보구조 2
  (헤더 행은 greenDark + white bold, 후보 이름은 "후보 1 — {순수형 이름}" 형식).
- **행 구성 (위→아래)**:

| 행 | 기본 h | 내용 규칙 |
|---|---|---|
| 설계도 | 2.3″ | 후보별 설계도 **PNG 이미지** (contain). `diagrams/dpN_candidates.svg`의 해당 후보 패널을 크롭: 사본 SVG의 `viewBox`를 패널 영역으로 좁힌 뒤 `soffice --headless --convert-to png` (또는 cairosvg)로 변환. 없으면 미니 구조도 생성 |
| 특징 | 0.7″ | 구조 요약 1–2줄 — "어디에 무엇이 생기고 누가 담당하는가" |
| 장점 | 0.85″ | DP 문서 장점에서 2–3개 발췌 (QA표 가점과 대응되는 것 우선) |
| 단점 | 0.85″ | DP 문서 단점에서 2–3개 발췌 (QA표 감점과 대응되는 것 우선) |
| Trade-off | 0.55″ | 후보별 1줄 bold — "무엇을 얻고 무엇을 포기하는가" (검토 노트의 실질 결정 변수를 후보 관점으로 압축). 두 후보의 줄이 서로 거울상이 되게 |

- 행 높이 합은 5.5″ 이내 유지 (`rowH`로 조정). 셀 본문 fontSize 9.5, 넘치면
  발췌를 줄인다 — 전문을 욱여넣지 않는다.
- 장/단점 발췌와 Trade-off는 **DP 문서와 일관**해야 한다 (문서에 없는 주장 금지).

---

## 공통 세부 규칙 (신규 요소)

- **chevronHeader**: 프로세스 단계 배너 전용. 오각형(homePlate)이 오른쪽을
  가리키므로 왼→오 흐름에만 사용. 텍스트는 fontSize 11–13, 두 줄 금지(길면 줄여쓰기).
- **tagBar**: id는 bold, `[태그]`도 bold, 설명은 regular — 전부 white. 한 줄 유지
  (넘치면 fontSize 9 또는 설명 축약).
- **specTable**: 헤더 행은 greenDark 배경 + white bold. 본문 9pt 이하로 밀도
  유지. `highlightRows`는 "선정/강조" 의미로만 사용 (cream).
- **dpCard**: 헤더 = [ID 색 박스 0.72″ | gray70 타이틀 바]. 본문 h는 항목 수로
  자동, 카드 간 gap 0.15.
- **badge**: 지름 0.3″, white bold 9pt. 다이어그램 모듈 좌상단 모서리에 겹쳐 배치.
- **linkButton**: "이 뒤에 백업/상세 자료가 있음"을 알리는 점프 라벨. 밴드 안
  (white) 또는 밴드 바로 아래 (ink) 두 변형.
- **다이어그램 생성 가이드**: 웹 이미지 불가 시 matplotlib(참고:
  `docs/mcr_assets/make_assets.py`)로 생성. UML(use-case, module view)은 박스/
  타원/화살표 조합으로 충분. 라벨은 영문 기술용어 위주(한글 폰트 이슈 회피),
  팔레트는 COLORS 토큰 준수.
