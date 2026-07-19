/**
 * mcr_dp12_deck.build.js — MCR DP1·DP2 상세 덱 (DP당 2페이지 = 4장).
 *
 *   NODE_PATH=<pptxgenjs 위치> node docs/mcr_dp12_deck.build.js [out.pptx]
 *
 * 레이아웃(사용자 요청 v2):
 *  · 문제 정의 페이지 — 구조 설계도(문제 표현 그림)를 우측에 원본 비율 그대로 크게,
 *    좌측을 상(문제 정의)·하(설계 쟁점)로 나눠 텍스트 배치.
 *  · 후보구조 비교 페이지 — 구조 설계도를 크게(상단), 특징·장점·단점·Trade-off는
 *    아주 작은 비중의 "진짜 표"(addTable)로 하단에 — 편집 쉽게 박스 이어붙이지 않음.
 * 문제 그림 = 기존 SW 구조도 위에 문제를 표시한 아키텍처 그림(dpN_problem_arch).
 */
const path = require("path");
const fs = require("fs");
const A = require(path.join(__dirname, "../.claude/skills/architect-ppt/lib/architect_deck.js"));

const ASSET = (f) => path.join(__dirname, "mcr_assets/dp", f);
const G = "1B7A4B", R = "B3402A"; // QA 우위/열위 강조색
const { MARGIN, CONTENT_TOP, CONTENT_BOTTOM, PAGE, COLORS, FONT } = A;
const W = PAGE.w - 2 * MARGIN;

/** PNG 픽셀 크기 (헤더에서). */
function pngDim(f) {
  const b = fs.readFileSync(f);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
/** boxW×boxH 안에 이미지를 비율 유지·중앙 정렬로 넣기 → {x,y,w,h}. */
function fitContain(file, bx, by, boxW, boxH) {
  const d = pngDim(file), a = d.w / d.h;
  let w = boxW, h = boxW / a;
  if (h > boxH) { h = boxH; w = boxH * a; }
  return { x: bx + (boxW - w) / 2, y: by + (boxH - h) / 2, w, h };
}
/** 두 후보 QA 별점 → 갈리는 QA만 강조한 flat run 배열 (표 셀용). */
function qaCell(mine, other) {
  const runs = [];
  mine.forEach((q, i) => {
    const diff = q.v !== other[i].v;
    runs.push({ text: `QA${i + 1} ${q.s}`, options: diff ? { bold: true, color: q.v > other[i].v ? G : R } : {} });
    if (i < mine.length - 1) runs.push({ text: "  ·  ", options: { color: "9AA0A6" } });
  });
  return runs;
}
const q = (s, v) => ({ s, v });

/* ── 문제 정의 페이지: 좌(문제 정의/설계 쟁점 상하 분할) · 우(구조도 크게) ── */
function pageProblem(pptx, { title, page, total, problem, issues }) {
  const s = A.slide(pptx, { title, active: 2, band: "navy", page, total, titleSize: 22 });
  const H = CONTENT_BOTTOM - CONTENT_TOP;
  const leftW = W * 0.37, gap = 0.28;
  const rightX = MARGIN + leftW + gap, rightW = PAGE.w - MARGIN - rightX;

  // 좌측 상단: 문제 정의
  const pBlock = H * 0.42;
  let y = A.sectionHeader(s, { x: MARGIN, y: CONTENT_TOP, w: leftW, text: "문제 정의", color: "navy" });
  A.bulletList(s, { x: MARGIN + 0.05, y: y + 0.08, w: leftW - 0.1, h: CONTENT_TOP + pBlock - y - 0.1, items: problem.items, fontSize: 10.5 });

  // 좌측 하단: 설계 쟁점
  const iHeadY = CONTENT_TOP + pBlock + 0.06;
  let y2 = A.sectionHeader(s, { x: MARGIN, y: iHeadY, w: leftW, text: "설계 쟁점", color: "green" });
  const numbered = issues.map((it, i) => {
    const o = typeof it === "string" ? { text: it } : { ...it };
    return { ...o, text: `${i + 1}. ${o.text}`, bullet: false };
  });
  A.bulletList(s, { x: MARGIN + 0.05, y: y2 + 0.08, w: leftW - 0.1, h: CONTENT_BOTTOM - y2 - 0.1, items: numbered, fontSize: 10.5 });

  // 우측: 구조 설계도(문제 표현) — 원본 비율 유지·크게
  const box = fitContain(problem.image, rightX, CONTENT_TOP, rightW, H);
  s.addImage({ path: problem.image, x: box.x, y: box.y, w: box.w, h: box.h });
  return s;
}

/* ── 후보구조 비교 페이지: 상단 구조도 크게 · 하단 소형 편집용 표 ── */
function pageCompare(pptx, { title, page, total, candidates }) {
  const s = A.slide(pptx, { title, active: 2, band: "green", page, total, titleSize: 22 });
  const gap = 0.3, halfW = (W - gap) / 2;
  const halves = [MARGIN, MARGIN + halfW + gap];

  // 표(하단) 영역 예약
  const tableH = 1.62;
  const tableTop = CONTENT_BOTTOM - tableH;

  // 후보 이름 라벨 + 구조 설계도(크게, 비율 유지·중앙)
  const labelH = 0.30;
  const imgTop = CONTENT_TOP + labelH + 0.06;
  const imgBoxH = tableTop - imgTop - 0.12;
  candidates.forEach((c, i) => {
    const hx = halves[i];
    s.addText(c.name, { x: hx, y: CONTENT_TOP, w: halfW, h: labelH, fill: { color: COLORS.navy }, color: COLORS.white, bold: true, align: "center", valign: "middle", fontSize: 11, fontFace: FONT.head, margin: 0 });
    const box = fitContain(c.diagram, hx, imgTop, halfW, imgBoxH);
    s.addImage({ path: c.diagram, x: box.x, y: box.y, w: box.w, h: box.h });
  });

  // 하단 표: 구분 | 후보1 | 후보2  ×  특징·장점·단점·Trade-off
  const joinLines = (arr) => (arr || []).map((it) => (typeof it === "string" ? it : it.text)).join("  ·  ");
  const th = (t) => ({ text: t, options: { fill: { color: COLORS.greenDark || "3B6127" }, color: COLORS.white, bold: true, align: "center", valign: "middle", fontSize: 9, fontFace: FONT.head } });
  const lbl = (t) => ({ text: t, options: { fill: { color: COLORS.navy }, color: COLORS.white, bold: true, align: "center", valign: "middle", fontSize: 8.5, fontFace: FONT.head } });
  const cell = (v) => ({ text: v, options: { valign: "middle", align: "left", fontSize: 8, color: COLORS.ink, fontFace: FONT.body, margin: [1, 3, 1, 3] } });

  const rows = [
    [th("구분"), th(candidates[0].name), th(candidates[1].name)],
    [lbl("특징"), cell(joinLines(candidates[0].features)), cell(joinLines(candidates[1].features))],
    [lbl("장점"), cell(joinLines(candidates[0].pros)), cell(joinLines(candidates[1].pros))],
    [lbl("단점"), cell(joinLines(candidates[0].cons)), cell(joinLines(candidates[1].cons))],
    [lbl("Trade-off\n(QA 평가)"),
      { text: qaCell(candidates[0].qa, candidates[1].qa), options: { valign: "middle", align: "left", fontSize: 8, fontFace: FONT.body, margin: [1, 3, 1, 3] } },
      { text: qaCell(candidates[1].qa, candidates[0].qa), options: { valign: "middle", align: "left", fontSize: 8, fontFace: FONT.body, margin: [1, 3, 1, 3] } }],
  ];
  s.addTable(rows, {
    x: MARGIN, y: tableTop, w: W, colW: [1.0, (W - 1.0) / 2, (W - 1.0) / 2],
    rowH: [0.24, 0.30, 0.40, 0.40, 0.28],
    border: { type: "solid", color: COLORS.grayBorder, pt: 0.75 },
    valign: "middle", autoPage: false,
  });
  return s;
}

const DPS = [
  {
    id: "DP-01", name: "실행 스택 소싱",
    problem: {
      items: [
        { text: "핵심 결정 — 실행 스택(Inference·Memory Engine)을 외부 채택할지 자체 구현할지, 그 경계선을 어디에 둘 것인가", bold: true },
        { text: "우측 구조도 ①②③ = vLLM의 「KV = GPU HBM 상주」 가정이 만드는 3대 구조적 마찰점", color: R },
        "제3 압력 — LMCache가 KV-계층 표준 선점: 경쟁(자체)할지 편승(외부)할지",
      ],
      image: ASSET("dp1_problem_arch.png"),
    },
    issues: [
      "경계선의 위치 — 차별 가치(tier-aware 배치·비연속 KV 1급 관리·근접 연산)가 외부 확장 통로(vLLM 확장점·LMCache 훅) 안에서 표현 가능한가",
      "확장점 밖 수정 지점(scheduler tier 인지, block table 일반화)이 연구·제품 가치의 핵심인가 주변부인가",
      "감당 가능한 유지보수 모델 — plugin 추종 / fork rebase / 독립 코어 / KV-계층 백엔드 추종",
      { text: "(DP2·DP6 커플링) 채택안·변형이 정책 위치와 근접연산 통로의 실현 가능 집합을 제약", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — 외부 스택 활용형 (vLLM 생태계)",
        diagram: ASSET("dp1_c1.png"),
        features: ["Inference Engine = vLLM(무수정), KV 골격은 변형 A(MCR 자체)/B(LMCache 편승)로 소싱"],
        pros: ["생태계 무임승차(배칭·커널·모델)", "검증된 코어·현 자산 재사용", "초기 ≤6인월 — 리드타임 최단"],
        cons: ["scheduler tier 비인지 → co-scheduling 미회수", "비연속·압축 KV는 block table 밖 2급", "\"vLLM 애드온\" 인식 리스크"],
        qa: [q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★☆", 2), q("★★★", 3)],
      },
      {
        name: "후보 2 — 자체 구현형 (독립 framework)",
        diagram: ASSET("dp1_c2.png"),
        features: ["실행 스택 전 층 자체 구현 — scheduler·block table·executor가 tier topology를 1급 인지"],
        pros: ["placement×scheduling 진짜 co-design", "자사 HW 로드맵 무제약 수용", "아키텍처 주도권·IP 확보"],
        cons: ["재구현 수십 인월+ · baseline 도달 리스크", "미검증 실행 코어 수치 검증 부담", "신규 모델·기법 영구 추종"],
        qa: [q("★★★(도달★☆)", 3), q("★★★", 3), q("★☆☆", 1), q("★☆☆", 1), q("★☆☆", 1)],
      },
    ],
  },
  {
    id: "DP-02", name: "KV 배치·압축의 관리 주체",
    problem: {
      items: [
        { text: "핵심 결정 — 이종 tier 위 KV의 배치·압축·이동을 누가 결정하는가: 품질 예산의 집행 주체", bold: true },
        { text: "결정에 필요한 두 정보(요청 문맥·자원 상태)가 서로 다른 패키지에 있음 — 우측 구조도의 「?」", color: R },
        "요청 문맥 = orchestration만 앎 / 자원 상태 = memory engine만 신선하게 앎 (μs~ms)",
      ],
      image: ASSET("dp2_problem_arch.png"),
    },
    issues: [
      "품질 예산을 요청별로 차등 집행하려면 — 요청 문맥을 어느 레벨까지 내릴 것인가",
      "메모리 압박 스파이크 대응은 μs 반응 필요 — 어느 레벨까지 자율성을 줄 것인가",
      "Memory Engine의 독립 재사용성(타 엔진 이식·생태계 전략)을 policy 결합이 훼손하지 않는가",
      { text: "(DP1 커플링) 외부 스택에선 중앙 정책을 엔진 scheduler에 심을 수 없음 — 변형 B(LMCache)는 제약 최강", color: A.COLORS.navy },
    ],
    candidates: [
      {
        name: "후보 1 — Orchestration 중앙 정책",
        diagram: ASSET("dp2_c1.png"),
        features: ["Scheduling에 Placement·Compression Policy 신설 — Router가 목표 tier·압축·재사용 지시, Memory Engine은 집행"],
        pros: ["전역 최적화(quality-aware joint orch.)", "요청별 품질 예산 중앙 집행", "결정 로직 단일화·설명가능성"],
        cons: ["요청 단위 루프 → μs 스파이크에 늦음", "tier 상태 상시 보고 → 결합도↑", "Memory Engine이 수동 executor로 격하"],
        qa: [q("★★☆", 2), q("★★★", 3), q("★★★", 3), q("★★☆", 2), q("★★☆", 2)],
      },
      {
        name: "후보 2 — Memory Engine 자율 (hint)",
        diagram: ASSET("dp2_c2.png"),
        features: ["Cache Manager가 자체 정책(접근 온도·watermark) 내장 — Orchestration은 얇은 hint API만 (madvise 모델)"],
        pros: ["μs 즉시 반응 — 압박 스파이크 흡수", "얇은 인터페이스 — DP1 후보1과 정합", "Memory Engine 독립 이식성"],
        cons: ["문맥 부재 → 재사용 예정 KV 오강등", "품질 예산 로컬 집행 → 요청 간 편차·joint orch. 기여 소실"],
        qa: [q("★★★", 3), q("★★☆", 2), q("★★☆", 2), q("★★★", 3), q("★★★", 3)],
      },
    ],
  },
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, "mcr_dp12_deck.pptx");
  const pptx = A.newDeck();
  const TOTAL = DPS.length * 2;
  let page = 0;
  for (const dp of DPS) {
    page += 1;
    pageProblem(pptx, { title: `${dp.id}. ${dp.name} — 문제 정의`, page, total: TOTAL, problem: dp.problem, issues: dp.issues });
    page += 1;
    pageCompare(pptx, { title: `${dp.id}. ${dp.name} — 후보구조 비교`, page, total: TOTAL, candidates: dp.candidates });
  }
  await A.writeDeck(pptx, out);
  console.log("written:", out, `(${TOTAL} slides)`);
})();
