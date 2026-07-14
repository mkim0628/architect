/**
 * Example: 요구사항/설계 chapter pages (P5–P9) with canonical source-deck content.
 * Run:  node examples/build_req_design.js   (writes assets/architect_req_design.pptx)
 * Full page specs: ../reference/page-specs.md
 */
const path = require("path");
const A = require("./../lib/architect_deck");

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "..", "assets", "architect_req_design.pptx");
const navy = A.COLORS.navy;

// ── P5. Architecture Design Process (navy, active 1) ────────────────────────
{
  const s = A.slide(pptx, { title: "Architecture Design Process", active: 1, band: "navy", page: 5 });
  const cols = A.columns(4, { gap: 0.18 });
  const heads = [
    ["아키텍처 구성 요소 도출", "green"], ["아키텍처 드라이버 후보 선정", "navy"],
    ["설계 결정사항 선정 및 아키텍처 검증", "green"], ["최종 설계 및 구현", "navy"],
  ];
  const sub = (x, w, y, text) => {
    s.addShape("rect", { x, y, w, h: 0.3, fill: { color: A.COLORS.white }, line: { color: A.COLORS.grayBorder, width: 0.75 } });
    s.addText("▪ " + text, { x: x + 0.08, y, w: w - 0.16, h: 0.3, valign: "middle", bold: true, fontSize: 10, color: A.COLORS.ink, margin: 0, fontFace: A.FONT.body });
  };
  cols.forEach((c, i) => A.chevronHeader(s, { x: c.x, y: A.CONTENT_TOP, w: c.w, text: heads[i][0], color: heads[i][1], fontSize: 10.5 }));
  const top = A.CONTENT_TOP + 0.42 + 0.12;

  // ① Stakeholder/VOC
  sub(cols[0].x, cols[0].w, top, "요구사항 수집");
  A.specTable(s, { x: cols[0].x, y: top + 0.42, w: cols[0].w, colW: [1.15, cols[0].w - 1.15],
    header: ["Stakeholder", "VOC 수집"], fontSize: 8,
    rows: [
      ["S.LSI 사업부\n(AP SW 개발팀)", "Mobile NPU 관련 요구사항 전달"],
      ["메모리 사업부\n(DRAM 설계팀)", "HBM-PIM 관련 요구 사항 전달"],
      ["기술원\n(System 연구센터)", "분산 GPU 서버 관련 요구사항 전달"],
      ["개발 임원 (랩장)", "타 과제/사업부와의 협력 관련 요구사항 전달"],
      ["개발자", "과제의 운영 및 유지보수에 대한 의견 전달"],
      ["고객사", "당사로부터 제품을 납품 받아 실제 시스템을 구축하는 외부 업체"],
    ] });

  // ② refinement flow + mini QA table
  sub(cols[1].x, cols[1].w, top, "요구사항 도출 · 분석");
  A.placeholder(s, { x: cols[1].x, y: top + 0.42, w: cols[1].w, h: 1.1, label: "[ Refinement/QAW → FR·QA·Constraints 흐름도 ]" });
  s.addText("[ 기능 9, QA 5, Constraint 2, Drivers 16종 선정 ]", { x: cols[1].x, y: top + 1.6, w: cols[1].w, h: 0.26, align: "center", bold: true, color: navy, fontSize: 9, fontFace: A.FONT.body });
  A.specTable(s, { x: cols[1].x, y: top + 1.95, w: cols[1].w, colW: [0.55, 0.85, cols[1].w - 2.3, 0.3, 0.3, 0.3],
    header: ["번호", "QA", "Refinement", "중", "난", "우"], fontSize: 7,
    rows: [
      ["QA-01", "Extensibility", "신규 장치 지원 용이성", { text: "H", align: "center" }, { text: "H", align: "center" }, { text: "3", align: "center" }],
      ["QA-02", "Efficiency", "자원의 효율적인 사용", { text: "H", align: "center" }, { text: "M", align: "center" }, { text: "4", align: "center" }],
      ["QA-03", "Performance", "빠른 추론/학습 시간", { text: "H", align: "center" }, { text: "H", align: "center" }, { text: "1", align: "center" }],
      ["QA-05", "Portability", "프레임워크 이식성", { text: "H", align: "center" }, { text: "M", align: "center" }, { text: "5", align: "center" }],
      ["QA-07", "Reusability", "타겟 간 코드 재사용성", { text: "H", align: "center" }, { text: "H", align: "center" }, { text: "2", align: "center" }],
    ] });

  // ③ DP candidates + ATAM
  sub(cols[2].x, cols[2].w, top, "후보 구조 선정 및 평가");
  s.addText("[ 시스템 분석 → Skeleton Architecture 도출 ]", { x: cols[2].x, y: top + 0.42, w: cols[2].w, h: 0.24, align: "center", bold: true, fontSize: 8.5, color: A.COLORS.ink, fontFace: A.FONT.body });
  A.placeholder(s, { x: cols[2].x, y: top + 0.72, w: cols[2].w, h: 1.7, label: "[ DP-01~05 후보 구조 ]" });
  s.addText("[ 설계 결정 사항 5件 → 설계안 도출 ]", { x: cols[2].x, y: top + 2.5, w: cols[2].w, h: 0.24, align: "center", bold: true, fontSize: 8.5, color: A.COLORS.ink, fontFace: A.FONT.body });
  A.placeholder(s, { x: cols[2].x, y: top + 2.8, w: cols[2].w, h: 1.9, label: "[ ATAM 프로세스 ]" });

  // ④ SEI 3 views
  sub(cols[3].x, cols[3].w, top, "Architecture Design");
  s.addText("[ SEI 3 View Design ]", { x: cols[3].x, y: top + 0.42, w: cols[3].w, h: 0.24, align: "center", bold: true, fontSize: 9, color: navy, fontFace: A.FONT.body });
  ["① Module View", "② Behavior View", "③ Deployment View"].forEach((v, i) => {
    const vy = top + 0.72 + i * 1.36;
    s.addText(v, { x: cols[3].x, y: vy, w: cols[3].w, h: 0.22, bold: true, fontSize: 8.5, color: A.COLORS.ink, margin: 0, fontFace: A.FONT.body });
    A.placeholder(s, { x: cols[3].x, y: vy + 0.24, w: cols[3].w, h: 1.02, label: "" });
  });
}

// ── P6. 요구사항 정제 (green, active 1) ─────────────────────────────────────
{
  const s = A.slide(pptx, { title: "요구사항 정제", active: 1, band: "green", page: 6 });
  A.linkButton(s, { label: "전체 수집된 요구사항 :" });
  s.addText([
    { text: "○ 수집한 요구사항 54건 → ", options: { bold: true, color: A.COLORS.ink, fontSize: 17 } },
    { text: "정제 요구사항 22건", options: { bold: true, color: navy, fontSize: 17 } },
    { text: " 분석", options: { bold: true, color: A.COLORS.ink, fontSize: 17 } },
  ], { x: A.MARGIN, y: A.BAND_H + 0.1, w: 9, h: 0.35, margin: 0, fontFace: A.FONT.head });
  s.addText("-  기능 요구 사항 9건, 품질 요구 사항 11건, 제약 사항 2건 도출", { x: A.MARGIN + 0.35, y: A.BAND_H + 0.48, w: 9, h: 0.28, fontSize: 12.5, color: A.COLORS.ink, margin: 0, fontFace: A.FONT.body });

  const top = A.BAND_H + 0.9, LX = A.MARGIN, LW = 6.9, RX = 7.5, RW = A.PAGE.w - A.MARGIN - RX;
  const kw = (t, rest) => [{ text: t, options: { bold: true, color: navy, fontSize: 8.5 } }, { text: rest, options: { color: A.COLORS.ink, fontSize: 8.5 } }];
  A.sectionHeader(s, { x: LX, y: top, w: LW, text: "기능 요구사항", color: "navy" });
  A.specTable(s, { x: LX, y: top + 0.4, w: LW, colW: [0.62, 1.15, LW - 1.77],
    header: ["번호", "기능 요구사항", "설명"], fontSize: 8,
    rows: [
      ["FR-01", "시스템 지원", { text: kw("임베디드 시스템과 대규모 서버 시스템", "에서 딥 러닝 모델 실행 바이너리 생성·구동") }],
      ["FR-02", "연산 장치 지원", { text: kw("NPU, PIM, GPU 등 다양한 하드웨어 가속기", "에서 실행 가능한 바이너리 생성") }],
      ["FR-03", "장치 간 연동", { text: kw("서로 다른 연산 장치를 사용", "해서 딥 러닝 모델 실행") }],
      ["FR-04", "모델 지원", { text: kw("다양한 AI 응용", " 지원 (CNN, RNN, Transformer 기반 LLM 등)") }],
      ["FR-05", "Ondevice 컴파일", { text: kw("실제로 실행할 시스템 상에서 컴파일", " 수행 후 바로 실행") }],
      ["FR-06", "학습/추론 지원", { text: kw("학습과 추론을 위한 바이너리 생성", "") }],
      ["FR-07", "병렬/분산 처리", { text: kw("두 개 이상의 연산 장치/서버 노드 동시 활용", "하여 모델 실행") }],
      ["FR-08", "메모리 관리", { text: kw("메모리가 작은 경우에도 모델 실행", " 가능 (필요 메모리 > 장치 메모리)") }],
      ["FR-09", "다중 응용 실행", { text: kw("두 개 이상의 딥 러닝 모델 동시 실행", "") }],
    ] });
  A.sectionHeader(s, { x: LX, y: top + 4.05, w: LW, text: "제약사항", color: "navy" });
  A.specTable(s, { x: LX, y: top + 4.45, w: LW, colW: [0.62, 1.15, LW - 1.77],
    header: ["번호", "제약 사항", "설명"], fontSize: 8,
    rows: [
      ["C-01", "보안", { text: kw("당사 핵심 HW IP 정보", "가 컴파일러/런타임 사용자에게 노출되지 않아야 한다.") }],
      ["C-02", "일정 준수", { text: kw("목표한 개발 일정", "을 준수해야 한다.") }],
    ] });
  A.sectionHeader(s, { x: RX, y: top, w: RW, text: "Use-case diagram", color: "navy" });
  A.placeholder(s, { x: RX, y: top + 0.4, w: RW, h: A.CONTENT_BOTTOM - top - 0.4, label: "[ Use-case diagram: UC01~UC10 · 액터 2 ]" });
}

// ── P7. Utility Tree 활용한 ASR 선정 (navy, active 1) ───────────────────────
{
  const s = A.slide(pptx, { title: "Utility Tree 활용한 ASR 선정", active: 1, band: "navy", page: 7 });
  const W = A.PAGE.w - 2 * A.MARGIN;
  const scen = (main, meas) => ({ text: [
    { text: main, options: { color: A.COLORS.ink, fontSize: 8.2, breakLine: true } },
    { text: "[측정: " + meas + "]", options: { color: "595959", fontSize: 7.4 } },
  ] });
  const C = (t) => ({ text: t, align: "center" });
  A.specTable(s, { x: A.MARGIN, y: A.CONTENT_TOP, w: W,
    colW: [0.62, 1.0, 1.25, W - 0.62 - 1.0 - 1.25 - 0.6 - 0.6 - 0.55 - 0.42, 0.6, 0.6, 0.55, 0.42],
    header: ["번호", "QA", "Refinement", "Scenario", "중요도", "난이도", "우선순위", "선정"],
    fontSize: 8, highlightRows: [0, 1, 2, 4, 6],
    rows: [
      ["QA-01", "Extensibility", "신규 장치 지원 용이성", scen("신규/이종 하드웨어 지원 시 컴파일러의 변경 사항이 최소화 되어야 한다.", "신규 장치 지원 시 기능 추가/변경 ≤ 전체 기능의 40%"), C("H"), C("H"), C("3"), C("O")],
      ["QA-02", "Efficiency", "자원의 효율적인 사용", scen("동일한 뉴럴 네트워크를 수행할 때 필요한 자원의 양을 최소화할 수 있어야 한다.", "통합 컴파일러/런타임 메모리 사용량 < 기존 프레임워크"), C("H"), C("M"), C("4"), C("O")],
      ["QA-03", "Performance", "빠른 추론/학습 시간", scen("컴파일 최적화로 바이너리를 생성·실행하여 타겟 장치/시스템 상에서 추론/학습 성능을 향상시킨다.", "실행 시간(ms) < 기존 프레임워크 실행 시간(ms)"), C("H"), C("H"), C("1"), C("O")],
      ["QA-04", "Usability", "컴파일러/런타임 사용성", scen("컴파일러와 런타임을 사용하는 데에 어려움이 없어야 한다.", "기존 환경 도입에 필요한 MM < 4MM (4명×1달)"), C("M"), C("H"), C("7"), C("")],
      ["QA-05", "Portability", "프레임워크 이식성", scen("TensorFlow, PyTorch 등 딥 러닝 프레임워크에 이식이 쉽고 기존 사용자 경험을 크게 해치지 않아야 한다.", "프레임워크 코드 수정에 드는 MM < 2MM"), C("H"), C("M"), C("5"), C("O")],
      ["QA-06", "Fault tolerance", "장치/서버 실패 허용성", scen("분산 학습 중 특정 장치/서버 문제에도 전체 학습이 계속 실행 가능해야 한다.", "정상 동작 가능한 장치/시스템 실패 < 전체의 5%"), C("M"), C("H"), C("6"), C("")],
      ["QA-07", "Reusability", "타겟 장치/시스템 간 코드 재사용성", scen("동일 모델/기능을 서로 다른 타겟에서 컴파일·실행할 때 실제로 실행되는 코드가 최대한 같아야 한다.", "타겟 장치 간 구현의 재사용성 > 70%"), C("H"), C("H"), C("2"), C("O")],
      ["QA-08", "Analyzability", "분석 용이성", scen("개발·실행 과정에서 필요한 정보를 추출하기 용이해야 한다.", "디버깅·성능 병목 분석 리소스 < 2명×3일"), C("M"), C("M"), C("10"), C("")],
      ["QA-09", "Performance", "빠른 컴파일 시간", scen("컴파일 소요 시간이 길지 않아야 한다.", "O0 < 1분, O1 < 3분, O2 < 사용자 설정 시간"), C("M"), C("H"), C("8"), C("")],
      ["QA-10", "Configurability", "컴파일/실행 옵션 제공", scen("목적에 맞게 실행하기 위한 다양한 옵션을 제공해야 한다.", "옵션 변경 위한 Re-build 필요 빈도 > 1회/달"), C("M"), C("M"), C("11"), C("")],
      ["QA-11", "Modifiability", "수정 용이성", scen("고객/사용자가 원하는 대로 고쳐서 사용하기 수월해야 한다.", "추가/변경이 필요한 모듈 수 < 5개"), C("M"), C("M"), C("9"), C("")],
    ] });
}

// ── P8. Architecture Driver 도출 (green, active 1) ──────────────────────────
{
  const s = A.slide(pptx, { title: "Architecture Driver 도출", active: 1, band: "green", page: 8 });
  const groupLabel = (x, y, t) => s.addText("| " + t, { x, y, w: 4.5, h: 0.28, bold: true, fontSize: 12, color: A.COLORS.ink, margin: 0, fontFace: A.FONT.head });
  const frs = [["FR-01","시스템 지원","다양한 시스템 구조 지원"],["FR-02","연산 장치 지원","이기종 가속기 지원"],["FR-03","장치 간 연동","이기종 장치 간 협업 운용 지원"],["FR-04","모델 지원","다양한 딥 러닝 모델 지원"],["FR-05","Ondevice 컴파일","대상 시스템 상에서 컴파일 지원"],["FR-06","학습/추론 지원","딥 러닝 모델 학습/추론 지원"],["FR-07","병렬/분산 처리","두 개 이상의 장치/시스템 동시 사용"],["FR-08","메모리 관리","다중 메모리 계층 활용"],["FR-09","다중 응용 실행","두 개 이상 모델 동시 실행"]];
  groupLabel(A.MARGIN, A.CONTENT_TOP, "Functional Requirements");
  frs.forEach(([id, tag, txt], i) => A.tagBar(s, { x: A.MARGIN, y: A.CONTENT_TOP + 0.36 + i * 0.46, w: 4.5, id, tag, text: txt, color: "navy" }));

  const qas = [["QA-01","Extensibility","신규 장치 지원 용이성"],["QA-02","Efficiency","자원의 효율적인 사용"],["QA-03","Performance","빠른 추론/학습 시간"],["QA-05","Portability","프레임워크 이식성"],["QA-07","Reusability","타겟 장치/시스템 간 코드 재사용성"]];
  groupLabel(5.25, A.CONTENT_TOP, "Quality Attributes");
  qas.forEach(([id, tag, txt], i) => A.tagBar(s, { x: 5.25, y: A.CONTENT_TOP + 0.36 + i * 0.46, w: 4.4, id, tag, text: txt, color: "green" }));

  groupLabel(10.0, A.CONTENT_TOP + 2.9, "Constraints");
  [["C-01","보안","HW IP 정보 유출 금지"],["C-02","일정 준수","목표 개발 일정 준수"]].forEach(([id, tag, txt], i) =>
    A.tagBar(s, { x: 10.0, y: A.CONTENT_TOP + 3.26 + i * 0.46, w: 2.95, id, tag, text: txt, color: "brown", fontSize: 9 }));

  // 수렴부: 화살표 3개 → 노란 타원 → 아래 화살표 → 산출물
  const ex = 6.4, ey = 4.7, ew = 2.5, eh = 0.95;
  s.addShape("rightArrow", { x: ex - 0.85, y: ey + eh / 2 - 0.18, w: 0.7, h: 0.36, fill: { color: navy }, line: { type: "none" } });
  s.addShape("downArrow", { x: ex + ew / 2 - 0.18, y: ey - 0.85, w: 0.36, h: 0.7, fill: { color: A.COLORS.green }, line: { type: "none" } });
  s.addShape("leftArrow", { x: ex + ew + 0.15, y: ey + eh / 2 - 0.18, w: 0.7, h: 0.36, fill: { color: A.COLORS.brown }, line: { type: "none" } });
  s.addShape("ellipse", { x: ex, y: ey, w: ew, h: eh, fill: { color: A.COLORS.yellow }, line: { color: "BF9000", width: 1 } });
  s.addText("Architectural\nDrivers", { x: ex, y: ey, w: ew, h: eh, align: "center", valign: "middle", bold: true, color: navy, fontSize: 13, margin: 0, fontFace: A.FONT.head });
  s.addShape("downArrow", { x: ex + ew / 2 - 0.3, y: ey + eh + 0.08, w: 0.6, h: 0.55, fill: { color: "A9C48E" }, line: { type: "none" } });
  s.addText("“Universal Deep Learning Compiler/Runtime”", { x: 2.5, y: ey + eh + 0.68, w: 8.3, h: 0.4, align: "center", bold: true, fontSize: 16, color: A.COLORS.ink, fontFace: A.FONT.head });
}

// ── P9. 설계 Point 선정 (navy, active 2) ────────────────────────────────────
{
  const s = A.slide(pptx, { title: "설계 Point 선정", active: 2, band: "navy", page: 9 });
  A.linkButton(s, { label: "Context View/Module View :" });
  // 좌측 드라이버 레일
  const rail = [
    ...[["F1","시스템 지원"],["F2","연산 장치 지원"],["F3","장치 간 연동"],["F4","모델 지원"],["F5","Ondevice 컴파일"],["F6","학습/추론 지원"],["F7","병렬/분산 처리"],["F8","메모리 관리"],["F9","다중 응용 실행"]].map(r => [...r, A.COLORS.navy]),
    ...[["Q1","Extensibility"],["Q2","Efficiency"],["Q3","Performance"],["Q5","Portability"],["Q7","Reusability"]].map(r => [...r, A.COLORS.greenDark]),
    ...[["C1","보안"],["C2","일정 준수"]].map(r => [...r, A.COLORS.brown]),
  ];
  rail.forEach(([id, label, color], i) => {
    const ry = A.CONTENT_TOP + i * 0.365;
    A.badge(s, { x: A.MARGIN, y: ry, d: 0.3, text: id, color });
    s.addShape("rect", { x: A.MARGIN + 0.38, y: ry + 0.005, w: 1.65, h: 0.29, fill: { color: A.COLORS.white }, line: { color: A.COLORS.grayBorder, width: 0.75 } });
    s.addText(label, { x: A.MARGIN + 0.44, y: ry + 0.005, w: 1.55, h: 0.29, valign: "middle", fontSize: 8.5, color: A.COLORS.ink, margin: 0, fontFace: A.FONT.body });
  });
  // 중앙 모듈 다이어그램 (생성 이미지 or 공란 + 배지 오버레이)
  A.placeholder(s, { x: 2.7, y: A.CONTENT_TOP, w: 6.35, h: A.CONTENT_BOTTOM - A.CONTENT_TOP - 0.4, label: "[ NN Compiler / NN Runtime 모듈 다이어그램 + F/Q/C 배지 + DP 하이라이트 ]" });
  s.addText("Legends:", { x: 5.0, y: A.CONTENT_BOTTOM - 0.32, w: 0.9, h: 0.26, bold: true, fontSize: 9, color: A.COLORS.ink, margin: 0, fontFace: A.FONT.body });
  s.addShape("rect", { x: 5.95, y: A.CONTENT_BOTTOM - 0.3, w: 0.95, h: 0.22, fill: { color: "DCE6F1" }, line: { color: A.COLORS.grayBorder, width: 0.75 } });
  s.addText("Package", { x: 5.95, y: A.CONTENT_BOTTOM - 0.3, w: 0.95, h: 0.22, align: "center", valign: "middle", fontSize: 8, margin: 0, fontFace: A.FONT.body });
  s.addShape("rect", { x: 7.0, y: A.CONTENT_BOTTOM - 0.3, w: 0.95, h: 0.22, fill: { color: A.COLORS.white }, line: { color: A.COLORS.grayBorder, width: 0.75 } });
  s.addText("Module", { x: 7.0, y: A.CONTENT_BOTTOM - 0.3, w: 0.95, h: 0.22, align: "center", valign: "middle", fontSize: 8, margin: 0, fontFace: A.FONT.body });
  // 우측 DP 카드 5장
  const cards = [
    ["DP-01", "프레임워크에서의 실행 구조", ["(1안) 프레임워크 기반 확장 설계", "(2안) 독립된 구조의 컴파일러/런타임 설계", { text: "QA: Extensibility, Performance, Portability, Reusability", color: navy }]],
    ["DP-02", "스케줄링 최적화 시점", ["(1안) 정적 스케줄링 기법", "(2안) 동적 스케줄링 기법", { text: "QA: Efficiency, Performance", color: navy }]],
    ["DP-03", "컴파일러 중간 표현 구조", ["(1안) 시스템 구성 계층 별 중간 표현 정의", "(2안) 최적화 문제 별 중간 표현 정의", { text: "QA: Extensibility, Performance, Reusability", color: navy }]],
    ["DP-04", "하드웨어 정보 구성", ["(1안) 주요 장치 별 하드웨어 정보 구분", "(2안) 공통 HW 정보 기술", { text: "QA: Extensibility, Portability, Reusability", color: navy }]],
    ["DP-05", "분산 서버 간의 동작 구조", ["(1안) 동일 실행 방식", "(2안) Master-slave 실행 방식", { text: "QA: Efficiency, Performance, Reusability", color: navy }]],
  ];
  let cy = A.CONTENT_TOP;
  cards.forEach(([id, title, items]) => { cy = A.dpCard(s, { x: 9.25, y: cy, w: 3.73, id, title, items }) + 0.14; });
}

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
