// Regenerate: NODE_PATH="$(npm root -g)" node docs/mcr_req_deck.build.js
// 요구사항 챕터 덱 (mcr_deck.pptx P1–P4 배경~개요의 후속, 페이지 5–9):
//   5 요구사항 수집 · 6 요구사항 정제 · 7 요구사항 → QA 도출 과정 ·
//   8 Utility Tree 활용한 ASR 선정 · 9 선정 QA 정의·평가 기준
// 내용 출처: docs/00_requirements_analysis.md · 00_qa_derivation.md · 00_qa_definitions.md
// 이미지: docs/mcr_assets/make_req_assets.py 로 생성 (웹 차단 환경 — 로컬 생성).
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_req_deck.pptx");
const navy = A.COLORS.navy;
const gray = "595959";
const img = (n) => path.join(__dirname, "mcr_assets", n);

// 표 셀에서 핵심 어구만 navy bold로 강조하는 run 배열 헬퍼
// parts: ["일반 ", ["강조", true], " 일반"] — 배열 원소는 bold+navy
const em = (parts, fontSize) => parts.map((p) => Array.isArray(p)
  ? { text: p[0], options: { bold: true, color: navy, fontSize } }
  : { text: p, options: { fontSize } });

// 헤드라인: "○ …" 큰 줄 + 들여쓴 "- …" 서브 줄
function headline(s, { y, main, sub }) {
  s.addText(main, { x: A.MARGIN, y, w: A.PAGE.w - 2 * A.MARGIN, h: 0.38, margin: 0, fontFace: A.FONT.head, valign: "middle", align: "left" });
  if (sub) s.addText(sub, { x: A.MARGIN + 0.35, y: y + 0.38, w: A.PAGE.w - 2 * A.MARGIN - 0.35, h: 0.28, margin: 0, fontFace: A.FONT.body, valign: "middle", align: "left" });
}

// ───────────────── 5. 요구사항 수집 (navy) ─────────────────
{
  const s = A.slide(pptx, { title: "요구사항 수집", active: 1, band: "navy", page: 5 });
  A.linkButton(s, { label: "원시 요구사항(VOC) R-01~R-23 전량 : 분석 문서 부록 A" , w: 5.2 });
  headline(s, {
    y: A.CONTENT_TOP - 0.02,
    main: [
      { text: "○ ", options: { fontSize: 16, bold: true, color: navy } },
      { text: "Stakeholder 인터뷰·QAW", options: { fontSize: 15, bold: true, color: navy } },
      { text: " + 자체 실측·문헌 조사 병행 → 원시 요구사항 ", options: { fontSize: 15, color: A.COLORS.ink } },
      { text: "23건(유효 22건)", options: { fontSize: 15, bold: true, color: navy } },
      { text: " 수집", options: { fontSize: 15, color: A.COLORS.ink } },
    ],
    sub: [{ text: "- 연구 과제 성격상 서비스 운영 조직은 stakeholder 아님 — 서빙 SLO·워크로드 요구는 업계 벤치마크·문헌 + 자체 실측으로 대체 수집", options: { fontSize: 11, color: gray } }],
  });
  const top = A.CONTENT_TOP + 0.78;
  // 좌: Stakeholder 표
  const Lx = A.MARGIN, Lw = 7.35;
  let y = A.sectionHeader(s, { x: Lx, y: top, w: Lw, text: "주요 Stakeholder 및 역할", color: "navy" });
  A.specTable(s, {
    x: Lx, y: y + 0.08, w: Lw, colW: [2.15, 5.2], fontSize: 9.5,
    header: ["Stakeholder", "역할 · 주요 관심사"],
    rows: [
      [{ text: "메모리 사업부\n(제품기획·디바이스 설계)", bold: true }, { text: em(["과제 발주 — memory-centric 제품군 로드맵 보유. ", ["E2E 관점의 제품 가치 입증"], " · 고객 제공 레퍼런스 스택 확보"], 9.5) }],
      [{ text: "Memory-centric AI\nSystem (MCAS) 팀", bold: true }, { text: em(["타겟 메모리 시스템 성능의 ", ["시뮬레이션·예측"], " — 예측치가 실측(MCR)에서 재현되는지, tier 조합별 효용 정량화"], 9.5) }],
      [{ text: "User", bold: true }, { text: em(["public LLM 응용·모델의 사용자 — ", ["대표 워크로드(long-context RAG · multiturn · agent)"], " 요구 특성 제공"], 9.5) }],
      [{ text: "개발 임원 (랩장)", bold: true }, { text: em(["과제 승인·자원 배정 — 타겟 메모리 ", ["효용성의 E2E 정량 입증"], "(baseline 대비) · 일정 · 지속 유지 가능성"], 9.5) }],
      [{ text: "MCR 개발팀", bold: true }, { text: em(["런타임 개발·유지보수, 자체 벤치 실측 — 개발 비용, ", ["upstream framework 추종·교체 부담"], ", 코어/모듈 경계"], 9.5) }],
      [{ text: "고객사 (잠재)", bold: true }, { text: em(["레퍼런스 스택으로 시스템을 구축할 외부 수요처 — 생태계 호환·실측 증거·확장성 (도입 전제 조건만 수집)"], 9.5) }],
      [{ text: "(간접) 오픈소스\n커뮤니티", bold: true }, { text: em(["vLLM·SGLang·LMCache 등 진화 주체 — 요구는 없으나 ", ["릴리스 주기·인터페이스 변화가 제약"], "으로 작용"], 9.5) }],
    ],
  });
  // 우: 수집 방법 표
  const Rx = Lx + Lw + 0.25, Rw = A.PAGE.w - A.MARGIN - Rx;
  y = A.sectionHeader(s, { x: Rx, y: top, w: Rw, text: "요구사항 수집 방법", color: "navy" });
  A.specTable(s, {
    x: Rx, y: y + 0.08, w: Rw, colW: [2.05, Rw - 2.05], fontSize: 9.5,
    header: ["방법", "산출"],
    rows: [
      [{ text: "Stakeholder 인터뷰·VOC 접수", bold: true }, "원시 요구사항 R-01~R-23 (부록 A)"],
      [{ text: "QAW (Quality Attribute Workshop)", bold: true }, "품질 요구의 시나리오화 — Utility Tree의 시나리오 행"],
      [{ text: "자체 벤치마크 실측", bold: true }, { text: em([["decode 대기 70–85%"], " (근거 A) — QA1 baseline 정의"], 9.5) }],
      [{ text: "문헌·업계 벤치마크 조사", bold: true }, "MLPerf · DistServe · KIVI · KVQuant · vLLM · FlexGen — QA 정량 bin의 SLO 앵커"],
      [{ text: "upstream 로드맵·릴리스 분석", bold: true }, { text: em([["vLLM 정규 릴리스 2주 케이던스"], " (근거 B) — QA4·QA5 bin 근거"], 9.5) }],
      [{ text: "유사 시스템 분석", bold: true }, "LMCache 등 KV offloading 계층 — DP1 후보 발굴"],
    ],
  });
}

// ───────────────── 6. 요구사항 정제 (green) ─────────────────
{
  const s = A.slide(pptx, { title: "요구사항 정제", active: 1, band: "green", page: 6 });
  A.linkButton(s, { label: "품질 분류분 10건은 Utility Tree로(P8)" , w: 4.6 });
  headline(s, {
    y: A.CONTENT_TOP - 0.02,
    main: [
      { text: "○ 수집 요구사항 23건(유효 22건) → ", options: { fontSize: 15, color: A.COLORS.ink } },
      { text: "기능 요구사항 9건 · 품질 요구(QA 후보) 10건 · 제약사항 2건", options: { fontSize: 15, bold: true, color: navy } },
      { text: " 정제", options: { fontSize: 15, color: A.COLORS.ink } },
    ],
    sub: [{ text: "- 정제 규칙: ① 중복 병합 ② 검증 가능한 문장으로 재기술 ③ 기능(FR)/품질(QA 후보)/제약(C) 3분류 ④ 범위 밖 기각(사유 기록)", options: { fontSize: 11, color: gray } }],
  });
  const top = A.CONTENT_TOP + 0.78;
  // 좌: FR + C 표
  const Lx = A.MARGIN, Lw = 7.55;
  let y = A.sectionHeader(s, { x: Lx, y: top, w: Lw, text: "기능 요구사항 (FR)", color: "navy", h: 0.3, fontSize: 12 });
  const fr = (no, tag, parts) => [{ text: no, align: "center", fontSize: 8 }, { text: tag, bold: true, fontSize: 8 }, { text: em(parts, 8) }];
  A.specTable(s, {
    x: Lx, y: y + 0.06, w: Lw, colW: [0.55, 1.18, 5.82], fontSize: 8,
    header: ["번호", "태그", "설명"],
    rows: [
      fr("FR-01", "워크로드 서빙", [["long-context RAG · multiturn · agent"], " 요청을 admission→retrieval→배칭→실행→응답으로 E2E 처리"]),
      fr("FR-02", "이종 tier KV 배치", ["KV를 GPU HBM 밖 ", ["이종 tier(CXL·DRAM·HBF·SSD)"], "에 두고 디바이스 특성 인지 ", ["배치·이동(승격/강등)"]]),
      fr("FR-03", "KV 압축", [["양자화·토큰 eviction 등 압축"], "을 KV에 적용·해제 (자체 압축 알고리즘 개발 포함)"]),
      fr("FR-04", "KV 영속·재사용", ["KV를 ", ["세션·사용자 단위로 영속화"], "하고 ", ["재사용"]]),
      fr("FR-05", "P/D 분리 실행", [["prefill/decode 분리"], " 구성에서 인스턴스 간 KV 전송 포함 추론 실행"]),
      fr("FR-06", "요청별 SLO 정책", [["요청별 SLO·품질 예산"], " 기준으로 배치×압축×재사용 수준 차등 조율"]),
      fr("FR-07", "근접연산 오프로드", [["PIM/PNM으로 연산 오프로드"], " (예: 압축 연산, RAG 검색) 실행"]),
      fr("FR-08", "디바이스 plug-in", ["신규 메모리 디바이스를 ", ["Tier Topology Model 파라미터로 등록"], "해 지원"]),
      fr("FR-09", "모니터링·P/D 조정", ["HW·SLO telemetry 수집, ", ["고정 N 내 P/D 비율(a:b) 자동 조정"], " (N 조정은 범위 외)"]),
    ],
  });
  y = A.sectionHeader(s, { x: Lx, y: top + 2.9, w: Lw, text: "제약사항 (C)", color: "navy", h: 0.3, fontSize: 12 });
  A.specTable(s, {
    x: Lx, y: y + 0.06, w: Lw, colW: [0.55, 1.18, 5.82], fontSize: 8,
    header: ["번호", "제약사항", "설명"],
    rows: [
      fr("C-01", "디바이스 불변", ["메모리 디바이스 ", ["HW 설계는 변경 불가"], " — Tier Topology Model 파라미터(대역폭·용량·지연)로만 취급"]),
      fr("C-02", "Transformer 모델 한정", ["최적화 대상은 ", ["KV cache를 갖는 Transformer 기반 모델"], " — 압축·재사용이 KV cache 전제, ", ["탈Transformer(순수 SSM 등)는 범위 외"]]),
    ],
  });
  // 우: use-case diagram
  const Rx = Lx + Lw + 0.25, Rw = A.PAGE.w - A.MARGIN - Rx;
  y = A.sectionHeader(s, { x: Rx, y: top, w: Rw, text: "시스템 경계 · Use-case (UC-01~11)", color: "navy", h: 0.3, fontSize: 12 });
  const ih = A.CONTENT_BOTTOM - y - 0.42;
  s.addImage({ path: img("req_usecase.png"), x: Rx, y: y + 0.06, w: Rw, h: ih, sizing: { type: "contain", w: Rw, h: ih } });
  s.addText([
    { text: "전 FR이 ≥ 1개 UC에 매핑 ✓", options: { bold: true, color: navy, fontSize: 9.5 } },
    { text: "  (FR 기반 UC 11건 — 서빙 3 · KV 관리 3 · P/D 1 · 정책 1 · 오프로드 1 · plug-in 1 · 모니터링 1)", options: { color: gray, fontSize: 8.5 } },
  ], { x: Rx, y: A.CONTENT_BOTTOM - 0.32, w: Rw, h: 0.3, margin: 0, valign: "middle", fontFace: A.FONT.body });
}

// ───────────────── 7. 요구사항 → QA 도출 과정 (navy) ─────────────────
{
  const s = A.slide(pptx, { title: "요구사항 → QA 도출 과정", active: 1, band: "navy", page: 7 });
  headline(s, {
    y: A.CONTENT_TOP - 0.02,
    main: [
      { text: "○ SEI 계열 표준 5단계: ", options: { fontSize: 15, color: A.COLORS.ink } },
      { text: "품질 발화 10건 → 시나리오화 → Utility Tree → QA 6건 선정·정량화", options: { fontSize: 15, bold: true, color: navy } },
    ],
  });
  // 5단계 chevron 파이프라인
  const steps = [
    { t: "① 분류", body: "VOC 22건을 기능(FR) /\n품질(QA 후보) / 제약(C)\n으로 3분류", ref: "SEI QAW\n(CMU/SEI-2003-TR-016)" },
    { t: "② 시나리오화", body: "품질 발화를 자극→환경→\n응답→응답 측정 구조의\n검증 가능 시나리오로 재기술", ref: "6-part QA Scenario\n(SW Arch. in Practice)" },
    { t: "③ 명명", body: "시나리오를 표준 품질속성\n어휘로 명명 (Performance,\nModifiability, …)", ref: "ISO/IEC 25010\n+ SAiP 분류" },
    { t: "④ 우선순위", body: "시나리오마다 (사업 중요도,\n달성 난이도) 2축 평가 —\n역할(목표>gate>수단) tie-break", ref: "ATAM Utility Tree\n(CMU/SEI-2000-TR-004)" },
    { t: "⑤ 선정·정량화", body: "상위 6건을 ASR로 선정,\n[측정]을 문헌 앵커 기반\n정량 bin으로 정제", ref: "bin 경계마다 근거\nA(실측)/B(문헌)/C(논증)" },
  ];
  const boxes = A.columns(5, { gap: 0.18 });
  const py = A.CONTENT_TOP + 0.52;
  steps.forEach((st, i) => {
    const { x, w } = boxes[i];
    const by = A.chevronHeader(s, { x, y: py, w, text: st.t, color: i % 2 ? "navy" : "green", fontSize: 12 });
    A.panel(s, { x, y: by + 0.06, w, h: 1.62, fill: A.COLORS.white });
    s.addText(st.body, { x: x + 0.08, y: by + 0.1, w: w - 0.16, h: 1.0, margin: 0, fontFace: A.FONT.body, fontSize: 8.6, color: A.COLORS.ink, valign: "top", align: "left" });
    s.addText(st.ref, { x: x + 0.08, y: by + 1.12, w: w - 0.16, h: 0.5, margin: 0, fontFace: A.FONT.body, fontSize: 8, color: navy, bold: true, valign: "bottom", align: "left" });
  });
  // 하단: 도출 체인 (좌 원칙 불릿 + 우 체인 그림)
  const cy = py + 0.42 + 0.06 + 1.62 + 0.18;
  const yb = A.sectionHeader(s, { x: A.MARGIN, y: cy, w: A.PAGE.w - 2 * A.MARGIN, text: "QA별 도출 체인 — VOC에서 정량 bin까지 4단", color: "green", h: 0.32, fontSize: 12.5 });
  const Lw2 = 4.55;
  A.bulletList(s, {
    x: A.MARGIN + 0.05, y: yb + 0.12, w: Lw2 - 0.1, h: A.CONTENT_BOTTOM - yb - 0.15, fontSize: 9.5,
    items: [
      [{ text: "판별 질문: ", options: { bold: true, color: navy, fontSize: 9.5 } },
       { text: "무엇을 할 수 있어야(기능) / 얼마나 잘(품질) / 선택지를 지우는가(제약)", options: { fontSize: 9.5 } }],
      [{ text: "핵심 원칙: ", options: { bold: true, color: navy, fontSize: 9.5 } },
       { text: "\"빠르면 좋겠다\"는 QA가 아니다 — 측정 가능한 response measure가 붙은 시나리오만 Utility Tree에 올림", options: { fontSize: 9.5 } }],
      [{ text: "모든 행에 [측정: 지표+baseline]이 있고, 그 수치마다 출처(A/B/C 등급)가 있다", options: { fontSize: 9.5 } }],
    ],
  });
  const Rx2 = A.MARGIN + Lw2 + 0.2, Rw2 = A.PAGE.w - A.MARGIN - Rx2;
  const ih2 = A.CONTENT_BOTTOM - yb - 0.16;
  s.addImage({ path: img("req_qa_chain.png"), x: Rx2, y: yb + 0.1, w: Rw2, h: ih2, sizing: { type: "contain", w: Rw2, h: ih2 } });
}

// ───────────────── 8. Utility Tree 활용한 ASR 선정 (green) ─────────────────
{
  const s = A.slide(pptx, { title: "Utility Tree 활용한 ASR 선정", active: 1, band: "green", page: 8 });
  A.linkButton(s, { label: "도출 논리·bin 근거 전문 : QA 도출/정의 문서", w: 4.6 });
  headline(s, {
    y: A.CONTENT_TOP - 0.04,
    main: [
      { text: "○ QA 후보 10건을 (중요도, 난이도) 2축 평가 → 상위 ", options: { fontSize: 14.5, color: A.COLORS.ink } },
      { text: "6건을 ASR로 선정", options: { fontSize: 14.5, bold: true, color: navy } },
      { text: "  (우선순위: 중요도 → 역할(목표>gate>수단) → 난이도 → 과제 본질 축)", options: { fontSize: 10.5, color: gray } },
    ],
  });
  const sc = (main, meas) => ({ text: [
    ...main.map((p) => Array.isArray(p)
      ? { text: p[0], options: { bold: true, color: navy, fontSize: 8 } }
      : { text: p, options: { fontSize: 8 } }),
    { text: "", options: { breakLine: true } },
    { text: meas, options: { fontSize: 7.3, color: gray } },
  ] });
  const C = (t, b) => ({ text: t, align: "center", bold: !!b });
  A.specTable(s, {
    x: A.MARGIN, y: A.CONTENT_TOP + 0.42, w: A.PAGE.w - 2 * A.MARGIN,
    colW: [0.6, 1.32, 2.0, 6.39, 0.6, 0.6, 0.7, 0.42], fontSize: 8, headerFontSize: 8.5,
    header: ["번호", "QA", "Refinement", "Scenario  [측정: 지표 + baseline]", "중요도", "난이도", "우선순위", "선정"],
    highlightRows: [0, 1, 2, 3, 4, 5],
    rows: [
      [C("QA-01"), { text: "Performance", bold: true }, "SLO 유지 하 최대 처리율 (goodput@SLO)", sc([["표준 SLO(TTFT p99 ≤ 450ms · TPOT p99 ≤ 200ms) attainment ≥ 90%"], "를 유지하는 최대 처리율 — 대표 워크로드, 동일 HW·동일 실행 구성"], "[측정: baseline 대비 goodput@SLO 배율 — baseline = GPU HBM 단일 tier(타겟 메모리 순증분 분리 측정)]"), C("H"), C("H"), C("1"), C("O", 1)],
      [C("QA-02"), { text: "Accuracy", bold: true }, "압축·재사용 품질 저하 bound — QA-01·03의 전제(gate)", sc(["압축(양자화·토큰 eviction)·재사용 활성화 상태로 long-context 벤치(LongBench) 수행 — ", ["품질은 지키는 제약, bound 위반 시 성능·용량 수치 무효"]], "[측정: 비압축(FP16 KV)·비재사용 대비 ΔF1(%p) · 보조 ΔPPL · bound 집행 단위(요청별/전역) 판정]"), C("H"), C("M"), C("2"), C("O", 1)],
      [C("QA-03"), { text: "Resource Efficiency", bold: true }, "유효 KV 용량 (원본 환산 동시 수용량)", sc([["QA-02 품질 bound를 지키는 조건"], "에서 동시 수용 KV 총량을 원본 환산으로 측정"], "[측정: Σ_tier(용량×평균 압축률×KV 가용 비율) ÷ 물리 HBM 용량 — baseline = HBM 단일·비압축(1.0×)]"), C("H"), C("H"), C("3"), C("O", 1)],
      [C("QA-04"), { text: "Modifiability", bold: true }, "신규 디바이스·KV 구조 변화 수용성", sc(["신규 tier(HBM4/CMM-DC/HBF) 추가와 ", ["KV 구조 영향 모델 변화(GQA·MLA·linear attention)"], " 수용 실험"], "[측정: 신규/변경 모듈 수 · 코어 변경 LOC 비율 · IF 시그니처 변경 건수 · 수용 리드타임 — baseline = 현행 코드베이스]"), C("M"), C("H"), C("4"), C("O", 1)],
      [C("QA-05"), { text: "Adaptability", bold: true }, "서빙 framework 교체 적응성 (vLLM → SGLang 등)", sc(["framework 교체 시 ", ["Memory Engine·정책 계층 보존"], ", 결합부만 교체되는지 판정"], "[측정: 변경 코드 비율(%) · 전환 공수(인월) — baseline = 현 framework(vLLM) 결합 구조]"), C("M"), C("H"), C("5"), C("O", 1)],
      [C("QA-06"), { text: "Maintainability", bold: true }, "개발·운영 비용 (지속 유지 가능성)", sc(["초기 구축부터 지속 유지까지 비용 산정 — ", ["구조 선택(DP1)이 비용을 한 자릿수 이상 가름"]], "[측정: 초기 구축 인월(E2E 벤치 완주 기준) · 연간 유지보수 FTE — baseline = DP1 후보별 비용 모델]"), C("M"), C("M"), C("6"), C("O", 1)],
      [C("QA-07"), "Availability", "영속 KV 자산의 유실 복구", sc(["노드 장애로 영속 KV 일부 유실 시 재계산(re-prefill)으로 세션 복구"], "[측정: 세션 손실 건수 · 복구 비용(goodput 저하) — baseline = 무장애 운전]"), C("M"), C("M"), C("7"), C("")],
      [C("QA-08"), "Security", "사용자 간 KV 재사용 격리", sc(["타 사용자 요청의 내 KV 블록 재사용 시도 차단"], "[측정: cross-user KV 재사용 발생 건수(목표 0) — 재사용 범위 = 사용자/세션 내]"), C("M"), C("M"), C("8"), C("")],
      [C("QA-09"), "Interoperability", "기존 서빙 생태계 호환", sc(["vLLM 기반 스택 조직이 응용 수정 없이 MCR로 전환"], "[측정: 서빙 API 호환 여부 · 응용 코드 수정 건수]"), C("M"), C("M"), C("9"), C("")],
      [C("QA-10"), "Scalability", "클러스터 수평 확장", sc(["노드 추가 시 goodput이 선형에 가깝게 확장"], "[측정: N노드 goodput ÷ (N × 단일 노드 goodput) — baseline = 단일 노드]"), C("L"), C("H"), C("10"), C("")],
    ],
  });
  // 하단: 미선정 4건 탈락 논거 (전건 기록)
  s.addText([
    { text: "미선정 사유(전건 기록)  ", options: { bold: true, color: navy, fontSize: 8.5 } },
    { text: "Availability — KV는 재계산 가능한 파생 데이터, 유실은 성능 문제로 환원(QA-01에 흡수) · Security — 실증 단계 재사용 범위를 사용자/세션 내로 한정(정책 제약으로 완화) · Interoperability — 독립 QA가 아닌 DP1의 결정 변수로 흡수 · Scalability — 고정 N 테스트베드 전제로 N 조정이 범위 외(중요도 L)", options: { fontSize: 8, color: gray } },
  ], { x: A.MARGIN, y: A.CONTENT_BOTTOM - 0.42, w: A.PAGE.w - 2 * A.MARGIN, h: 0.44, margin: 0, valign: "middle", fontFace: A.FONT.body });
}

// ───────────────── 9. 선정 QA 정의·평가 기준 (navy) ─────────────────
{
  const s = A.slide(pptx, { title: "선정 QA 정의 및 평가 기준", active: 1, band: "navy", page: 9 });
  A.linkButton(s, { label: "정량 bin·근거 전문 : QA 정의 문서(v0.7)", w: 4.2 });
  headline(s, {
    y: A.CONTENT_TOP - 0.04,
    main: [
      { text: "○ 선정 QA 6건의 정의·측정·정량 bin — ", options: { fontSize: 14.5, color: A.COLORS.ink } },
      { text: "별점(★)은 문헌 앵커 기반 정량 bin으로만 판정", options: { fontSize: 14.5, bold: true, color: navy } },
      { text: "  (QA1~QA4는 번호 = 우선순위)", options: { fontSize: 10.5, color: gray } },
    ],
  });
  const C = (t, b) => ({ text: t, align: "center", bold: !!b });
  const qa = (pr, no, name, ref, meas, bin, hd) => [
    C(pr, 1),
    { text: [{ text: no + "\n", options: { bold: true, color: navy, fontSize: 9.5 } }, { text: name, options: { bold: true, fontSize: 9.5 } }] },
    { text: ref, fontSize: 9 },
    { text: meas, fontSize: 9 },
    { text: [{ text: bin, options: { bold: true, color: navy, fontSize: 9 } }] },
    C(hd),
  ];
  A.specTable(s, {
    x: A.MARGIN, y: A.CONTENT_TOP + 0.42, w: A.PAGE.w - 2 * A.MARGIN,
    colW: [0.72, 1.55, 2.6, 3.75, 3.11, 0.9], fontSize: 9, headerFontSize: 9.5,
    header: ["우선순위", "QA", "Refinement", "측정 지표 · baseline", "★★★ 기준 (정량 bin)", "중요도/난이도"],
    rows: [
      qa("1", "QA1", "Performance (추론 성능)", "SLO 유지 하 최대 처리율 (goodput@SLO) — TTFT p99 ≤ 450ms · TPOT p99 ≤ 200ms · attainment ≥ 90%", "baseline 대비 goodput@SLO 배율 — baseline = 동일 HW의 GPU HBM 단일 tier 구성 (타겟 메모리 순증분 분리)", "≥ 1.5×  (★★☆ 1.1–1.5× · ★☆☆ < 1.1×)", "H / H"),
      qa("2", "QA2", "Accuracy (응답 품질)", "압축·재사용 품질 저하 bound — QA1·QA3 수치의 유효 전제(gate)", "ΔF1(%p, LongBench) · 보조 ΔPPL(Wikitext-2) — baseline = 비압축(FP16 KV)·비재사용", "ΔF1 ≤ 1%p · 요청별 bound 집행  (★★☆ ≤ 2%p·전역)", "H / M"),
      qa("3", "QA3", "Resource Efficiency (메모리 효율)", "유효 KV 용량 — 원본 환산 동시 수용량 (QA2 bound 준수 조건에서만 인정)", "Σ_tier(용량×압축률×가용 비율) ÷ 물리 HBM — baseline = HBM 단일·비압축(1.0×)", "≥ 3×  (★★☆ 1.5–3× · ★☆☆ < 1.5×)", "H / H"),
      qa("4", "QA4", "Modifiability (확장성·진화성)", "신규 메모리 디바이스·KV 구조 변화(GQA·MLA·linear attention) 수용 용이성", "신규/변경 모듈 수 · 코어 변경 LOC 비율 · 공개 IF 시그니처 변경 건수 · 수용 리드타임", "어댑터 모듈 ≤ 1 · 코어 LOC 0 · 시그니처 0건 · ≤ upstream + 2주", "M / H"),
      qa("5", "QA6", "Adaptability (framework 적응성)", "서빙 framework 교체(vLLM → SGLang 등) 수용 비용 — 종속 위험의 크기", "framework 결합 코드 비율(%) · 교체 시 코어 변경 LOC · 전환 공수(인월)", "결합 코드 어댑터 격리(≤ 10%) · 코어 변경 0 · 전환 ≤ 3인월", "M / H"),
      qa("6", "QA5", "Maintainability (유지보수성)", "초기 구축(E2E 벤치 완주) + 지속 유지보수 비용 — DP1 선택이 한 자릿수 이상 가름", "초기 구축 인월(person-month) · 연간 유지보수 FTE(rebase·추종·회귀 검증 포함)", "초기 ≤ 6인월 · 유지 ≤ 0.5 FTE  (★☆☆ > 24인월/2 FTE)", "M / M"),
    ],
  });
  // 하단: 별점 공통 규칙 + 문헌 앵커
  A.bulletList(s, {
    x: A.MARGIN + 0.05, y: A.CONTENT_BOTTOM - 0.95, w: A.PAGE.w - 2 * A.MARGIN - 0.1, h: 0.95, fontSize: 8.5,
    items: [
      [{ text: "별점 공통 규칙: ", options: { bold: true, color: navy, fontSize: 8.5 } },
       { text: "3단계(★★★/★★☆/★☆☆) — bin 판정 근거 없는 별점 무효 · 근거 등급 A(자체 실측)/B(문헌)/C(구조 논증) 병기 · F(forecast)/M(measured) 표기 · 설계 상한과 도달 리스크 분리 표기", options: { fontSize: 8.5 } }],
      [{ text: "bin 앵커 문헌: ", options: { bold: true, color: navy, fontSize: 8.5 } },
       { text: "MLPerf(SLO·99% 정확도) · DistServe(goodput 정의) · KIVI(2-bit 실측) · KVQuant(ΔPPL) · H2O·SnapKV(eviction) · LongBench(F1) · vLLM RELEASE(2주) · SGLang(대안 framework) + 사내 40% 기준(A) · 자체 실측 decode 대기 70–85%(A)", options: { fontSize: 8.5 } }],
    ],
  });
}

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
