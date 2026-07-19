// Regenerate: NODE_PATH="$(npm root -g)" node docs/ppt/mcr_req_deck.build.js
// 요구사항 챕터 덱 (mcr_deck.pptx P1–P4 배경~개요의 후속):
//   본문 5–9: 5 요구사항 수집 · 6 요구사항 정제 · 7 요구사항 → QA 도출(내용) ·
//             8 Utility Tree 활용한 ASR 선정 · 9 선정 QA 정의·평가 기준
//   부록 26–33: 26 부록 A VOC 전량 · 27 부록 B 도출 방법론(SEI 5단계) ·
//               28–33 부록 C QA별 평가 기준 상세 (QA1·2·3·4·6·5 — 우선순위 순)
// 내용 출처: docs/md/00_requirements_analysis.md · 00_qa_derivation.md · 00_qa_definitions.md
// 이미지: docs/ppt/mcr_assets/make_req_assets.py 로 생성 (웹 차단 환경 — 로컬 생성).
const path = require("path");
const A = require(path.join(__dirname, "..", "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));

const pptx = A.newDeck();
const OUT = process.argv[2] || path.join(__dirname, "mcr_req_deck.pptx");
const navy = A.COLORS.navy;
const green = A.COLORS.green;
const gray = "595959";
const img = (n) => path.join(__dirname, "mcr_assets", n);

// 표 셀에서 핵심 어구만 navy bold로 강조하는 run 배열 헬퍼
// parts: ["일반 ", ["강조"], " 일반"] — 배열 원소는 bold+navy
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
  A.linkButton(s, { label: "원시 요구사항(VOC) R-01~R-23 전량 : 부록 A (p.26)", w: 5.2 });
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
      [{ text: "문헌·업계 벤치마크 조사", bold: true }, "KIVI · CacheBlend · SGLang · vLLM · SmartANNS · MLPerf · KVQuant — QA 정량 bin의 문헌 앵커"],
      [{ text: "upstream 로드맵·릴리스 분석", bold: true }, { text: em([["vLLM 정규 릴리스 2주 케이던스"], " (근거 B) — QA4·QA5 bin 근거"], 9.5) }],
      [{ text: "유사 시스템 분석", bold: true }, "LMCache 등 KV offloading 계층 — DP1 후보 발굴"],
    ],
  });
}

// ───────────────── 6. 요구사항 정제 (green) ─────────────────
{
  const s = A.slide(pptx, { title: "요구사항 정제", active: 1, band: "green", page: 6 });
  A.linkButton(s, { label: "품질 분류분 10건은 Utility Tree로(P8)", w: 4.6 });
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

// ───────────────── 7. 요구사항 → QA 도출 — 내용 빌드업 (navy) ─────────────────
// 절차가 아니라 내용: 요구사항(VOC·실측·문헌)에 무엇이 있었고 그것이 어느 QA로
// 귀결되는가. 방법론(SEI 5단계·체인)은 부록 B로 이동.
{
  const s = A.slide(pptx, { title: "요구사항 → QA 도출", active: 1, band: "navy", page: 7 });
  A.linkButton(s, { label: "도출 방법론(SEI 5단계·도출 체인) : 부록 B (p.27)", w: 5.0 });
  headline(s, {
    y: A.CONTENT_TOP - 0.04,
    main: [
      { text: "○ 요구사항이 말하는 것(VOC) + 실측·문헌이 보태는 근거 → ", options: { fontSize: 14.5, color: A.COLORS.ink } },
      { text: "품질 요구 6건으로 귀결", options: { fontSize: 14.5, bold: true, color: navy } },
      { text: "  (근거 등급: A 자체 실측 · B 문헌 · C 구조 논증)", options: { fontSize: 10.5, color: gray } },
    ],
  });
  const voc = (parts) => ({ text: em(parts, 8) });
  const ev = (parts) => ({ text: em(parts, 8) });
  const qaCell = (no, name, sub) => ({ text: [
    { text: `${no} ${name}`, options: { bold: true, color: green === "4E7C3A" ? navy : navy, fontSize: 8.7 } },
    { text: "", options: { breakLine: true } },
    { text: sub, options: { fontSize: 7.5, color: gray } },
  ] });
  A.specTable(s, {
    x: A.MARGIN, y: A.CONTENT_TOP + 0.42, w: A.PAGE.w - 2 * A.MARGIN,
    colW: [5.35, 4.9, 2.38], fontSize: 8, headerFontSize: 9,
    header: ["요구사항이 말하는 것 — VOC (누가 · 무엇을)", "실측·문헌이 보태는 것 (왜 QA가 되는가)", "귀결 QA"],
    rows: [
      [voc([["R-01 개발팀"], " 「컨텍스트 폭증으로 KV cache가 HBM 용량을 넘는다」 · ", ["R-09 사업부"], " 「PIM/PNM 연산의 효용성을 E2E에서 테스트」 — ", ["RAG retrieval 가속 수요"], " · ", ["R-11 임원"], " 「baseline 대비 E2E 정량 입증」"]),
       ev([["prefill 축(TTFT)"], ": KV 재사용·retrieval 가속 — CacheBlend TTFT 2.2–3.3×↓(B) · SmartANNS 검색 QPS ≤10.7×(B, SSD-PIM·ADR-001, ", ["일반 런타임과의 차별 축"], ") // ", ["decode 축(throughput)"], ": tier 확장·압축 batch — KIVI 2.35–3.47×·vLLM 2–4×(B), decode 대기 70–85%(A)"]),
       qaCell("QA1", "Performance", "baseline 대비 TTFT·throughput 모두 ≥2× — 최종 판정 지표")],
      [voc([["R-06 User"], " 「압축·재사용 때문에 답변 품질이 떨어지면 쓸 수 없다 — ", ["품질 저하의 상한을 보장"], "해달라」"]),
       ev(["압축(양자화·eviction)은 본질적으로 lossy(C) — 품질은 올리는 목표가 아니라 ", ["지키는 제약(gate)"], ": bound 위반 시 성능·용량 수치가 무효 · KIVI ≤2%p·H2O 예산 20% 동등(B) — near-lossless 운용이 실재"]),
       qaCell("QA2", "Accuracy", "ΔF1 bound — QA1·QA3 수치의 유효 전제(gate)")],
      [voc([["R-02 MCAS"], " 「시뮬레이션으로 예측한 이종 메모리 효과가 실측에서 재현되는지 — ", ["같은 HBM으로 동시 컨텍스트를 얼마나 더 수용"], "하는지 정량으로」 · ", ["R-01 개발팀"], " (HBM 용량 병목)"]),
       ev(["KV 산식(C): Llama-2-70B 기준 32k 컨텍스트 1세션 ≈ 10.5 GB — ", ["용량이 동시성(=처리율)의 상한"], " · vLLM: KV 낭비 60–80%→<4%(B) · FlexGen: offloading 정책만으로 100×(B) — 메모리 관리가 성능을 가름"]),
       qaCell("QA3", "Resource Efficiency", "유효 KV 용량 — 이종 tier 도입의 존재 이유")],
      [voc([["R-17 개발팀"], " 「tier 조합을 바꿔가며 실험 — ", ["신규 tier 등록이 쉬워야"], "」 · ", ["R-21 User"], " 「MLA·hybrid attention 등 ", ["KV 구조가 바뀌는 신모델을 곧바로 서빙"], "」"]),
       ev(["사업부 로드맵(HBM4/CMM-DC/HBF)이 과제 기간 중에도 갱신(A) · MLA: KV 93.3% 축소 — KV 정의 자체가 변경(B) · linear attention hybrid 상용 배치(B) — ", ["변화 주기가 구조 결정의 수명보다 짧다"]]),
       qaCell("QA4", "Modifiability", "신규 디바이스·KV 구조 변화의 모듈 교체 수용")],
      [voc([["R-23 개발팀"], " 「vLLM이 유일한 선택지가 아니다 — SGLang 등 대안 부상, ", ["framework를 갈아탈 때의 비용이 통제"], "되도록 종속을 관리해야」"]),
       ev(["SGLang(B): RadixAttention 기반 vLLM 동급 이상 처리율 — ", ["실존하는 교체 후보"], " · 교체 비용 미통제 시 framework 종속이 MCR 고유 자산(Memory Engine·정책)의 수명을 좌우(C)"]),
       qaCell("QA6", "Adaptability", "framework 교체 — 어댑터 격리·전환 공수")],
      [voc([["R-12 임원"], " 「과제 종료 후에도 ", ["소수 인력으로 지속 유지"], " — 상시 전담팀 불가」 · ", ["R-08 사업부"], " 「자체 레퍼런스 스택을 고객에 제공」 · ", ["R-13 개발팀"], " 「vLLM 추종 비용」"]),
       ev([["vLLM 정규 릴리스 2주 간격(B)"], " — 구조 선택(DP1: plugin vs 독립)에 따라 추종 비용이 ", ["수 인월 vs 수십 인월+(A)"], "로 한 자릿수 이상 갈림 — 유지되지 않는 스택은 제공물이 못 된다"]),
       qaCell("QA5", "Maintainability", "초기 구축 인월 · 연간 유지 FTE")],
    ],
  });
  s.addText([
    { text: "품질성 발화 10건 전량은 Utility Tree(P8)에서 (중요도, 난이도) 평가 — ", options: { fontSize: 9, color: gray } },
    { text: "위 6건이 상위 우선순위로 선정", options: { fontSize: 9, bold: true, color: navy } },
    { text: ", 미선정 4건(Availability·Security·Interoperability·Scalability)의 사유는 P8 하단 기록", options: { fontSize: 9, color: gray } },
  ], { x: A.MARGIN, y: A.CONTENT_BOTTOM - 0.3, w: A.PAGE.w - 2 * A.MARGIN, h: 0.3, margin: 0, valign: "middle", fontFace: A.FONT.body });
}

// ───────────────── 8. Utility Tree 활용한 ASR 선정 (green) ─────────────────
{
  const s = A.slide(pptx, { title: "Utility Tree 활용한 ASR 선정", active: 1, band: "green", page: 8 });
  A.linkButton(s, { label: "QA별 평가 기준 상세 : 부록 C (p.28~33)", w: 4.6 });
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
  // 선정 QA 셀: 이름 + 평가 기준 상세 페이지 점프 표기
  const qaSel = (name, pg) => ({ text: [
    { text: name, options: { bold: true, fontSize: 8 } },
    { text: "", options: { breakLine: true } },
    { text: `기준 p.${pg} ▶`, options: { bold: true, color: navy, fontSize: 6.8 } },
  ] });
  A.specTable(s, {
    x: A.MARGIN, y: A.CONTENT_TOP + 0.42, w: A.PAGE.w - 2 * A.MARGIN,
    colW: [0.6, 1.32, 2.0, 6.39, 0.6, 0.6, 0.7, 0.42], fontSize: 8, headerFontSize: 8.5,
    header: ["번호", "QA", "Refinement", "Scenario  [측정: 지표 + baseline]", "중요도", "난이도", "우선순위", "선정"],
    highlightRows: [0, 1, 2, 3, 4, 5],
    rows: [
      [C("QA-01"), qaSel("Performance", 28), "prefill·decode 2단 성능 (baseline 대비 TTFT · throughput)", sc(["retrieval(SSD-PIM 가속) 포함 E2E — ", ["TTFT(prefill: 재사용·검색)"], " · ", ["throughput(decode: tier·압축)"], " 2지표"], "[측정: TTFT·throughput 모두 ≥2× → ★★★ · throughput은 iso-latency(TPOT p99 ≤ baseline) 판정·곡선 병행 — baseline = GPU HBM 단일 tier(순증분 분리)]"), C("H"), C("H"), C("1"), C("O", 1)],
      [C("QA-02"), qaSel("Accuracy", 29), "압축·재사용 품질 저하 bound — QA-01·03의 전제(gate)", sc(["압축(양자화·토큰 eviction)·재사용 활성화 상태로 long-context 벤치(LongBench) 수행 — ", ["품질은 지키는 제약, bound 위반 시 성능·용량 수치 무효"]], "[측정: 비압축(FP16 KV)·비재사용 대비 ΔF1(%p) · 보조 ΔPPL · bound 집행 단위(요청별/전역) 판정]"), C("H"), C("M"), C("2"), C("O", 1)],
      [C("QA-03"), qaSel("Resource Efficiency", 30), "유효 KV 용량 (원본 환산 동시 수용량)", sc([["QA-02 품질 bound를 지키는 조건"], "에서 동시 수용 KV 총량을 원본 환산으로 측정"], "[측정: Σ_tier(용량×평균 압축률×KV 가용 비율) ÷ 물리 HBM 용량 — baseline = HBM 단일·비압축(1.0×)]"), C("H"), C("H"), C("3"), C("O", 1)],
      [C("QA-04"), qaSel("Modifiability", 31), "신규 디바이스·KV 구조 변화 수용성", sc(["신규 tier(HBM4/CMM-DC/HBF) 추가와 ", ["KV 구조 영향 모델 변화(GQA·MLA·linear attention)"], " 수용 실험"], "[측정: 신규/변경 모듈 수 · 코어 변경 LOC 비율 · IF 시그니처 변경 건수 · 수용 리드타임 — baseline = 현행 코드베이스]"), C("M"), C("H"), C("4"), C("O", 1)],
      [C("QA-05"), qaSel("Adaptability", 32), "서빙 framework 교체 적응성 (vLLM → SGLang 등)", sc(["framework 교체 시 ", ["Memory Engine·정책 계층 보존"], ", 결합부만 교체되는지 판정"], "[측정: 변경 코드 비율(%) · 전환 공수(인월) — baseline = 현 framework(vLLM) 결합 구조]"), C("M"), C("H"), C("5"), C("O", 1)],
      [C("QA-06"), qaSel("Maintainability", 33), "개발·운영 비용 (지속 유지 가능성)", sc(["초기 구축부터 지속 유지까지 비용 산정 — ", ["구조 선택(DP1)이 비용을 한 자릿수 이상 가름"]], "[측정: 초기 구축 인월(E2E 벤치 완주 기준) · 연간 유지보수 FTE — baseline = DP1 후보별 비용 모델]"), C("M"), C("M"), C("6"), C("O", 1)],
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
  A.linkButton(s, { label: "QA별 bin·근거 상세 : 부록 C (p.28~33)", w: 4.2 });
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
      qa("1", "QA1", "Performance (추론 성능)", "prefill·decode 2단 성능 — retrieval(SSD-PIM 가속) 포함 E2E: TTFT(prefill) · throughput(decode)", "① TTFT 단축 배율 — 평균 판정·p99 병행 · ② throughput 배율 — iso-latency(TPOT p99 ≤ baseline)·곡선 병행 — baseline = GPU HBM 단일 tier", "TTFT·throughput 모두 ≥ 2×  (★★☆ 둘 다 ≥1.5×·한쪽 2× 미달 · ★☆☆ 한쪽 <1.5×)", "H / H"),
      qa("2", "QA2", "Accuracy (응답 품질)", "압축·재사용 품질 저하 bound — QA1·QA3 수치의 유효 전제(gate)", "ΔF1(%p, LongBench) · 보조 ΔPPL(Wikitext-2) — baseline = 비압축(FP16 KV)·비재사용", "ΔF1 ≤ 1%p · 요청별 bound 집행  (★★☆ ≤ 2%p·전역)", "H / M"),
      qa("3", "QA3", "Resource Efficiency (메모리 효율)", "유효 KV 용량 — 원본 환산 동시 수용량 (QA2 bound 준수 조건에서만 인정)", "Σ_tier(용량×압축률×가용 비율) ÷ 물리 HBM — baseline = HBM 단일·비압축(1.0×)", "≥ 3×  (★★☆ 1.5–3× · ★☆☆ < 1.5×)", "H / H"),
      qa("4", "QA4", "Modifiability (확장성·진화성)", "신규 메모리 디바이스·KV 구조 변화 (GQA·MLA·linear attention) 수용 용이성", "신규/변경 모듈 수 · 코어 변경 LOC 비율 · 공개 IF 시그니처 변경 건수 · 수용 리드타임", "어댑터 모듈 ≤ 1 · 코어 LOC 0 · 시그니처 0건 · ≤ upstream + 2주", "M / H"),
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
       { text: "KIVI(압축 2.35–3.47×) · CacheBlend(RAG 재사용 2.8–5×) · SGLang(prefix 재사용 ≤6.4×·대안 framework) · vLLM(paging 2–4×·2주 릴리스) · SmartANNS(near-storage 검색 ≤10.7×) · MLPerf(99% 정확도) · KVQuant(ΔPPL) · H2O·SnapKV(eviction) · LongBench(F1) + 사내 40% 기준(A) · decode 대기 70–85%(A)", options: { fontSize: 8.5 } }],
    ],
  });
}

// ═════════════════ 부록 (p.26~33) ═════════════════

// ───────────────── 26. 부록 A. 수집 원시 요구사항(VOC) (navy) ─────────────────
{
  const s = A.slide(pptx, { title: "부록 A. 수집 원시 요구사항 (VOC)", active: 1, band: "navy", page: 26, titleSize: 26 });
  A.linkButton(s, { label: "본문: 요구사항 수집 (p.5) · 정제 (p.6)", w: 4.2 });
  headline(s, {
    y: A.CONTENT_TOP - 0.04,
    main: [
      { text: "○ 원시 요구사항 R-01~R-23 전량 ", options: { fontSize: 14, color: A.COLORS.ink } },
      { text: "(R-14 결번 — 유효 22건)", options: { fontSize: 14, bold: true, color: navy } },
      { text: " — 정제 결과(FR/QA/C) 매핑 포함", options: { fontSize: 14, color: A.COLORS.ink } },
    ],
  });
  const vr = (no, src, txt, out) => [
    { text: no, align: "center", fontSize: 7.5 },
    { text: src, bold: true, fontSize: 7.5 },
    { text: txt, fontSize: 7.5 },
    { text: out, align: "center", fontSize: 7.5, color: navy, bold: true },
  ];
  const half = (A.PAGE.w - 2 * A.MARGIN - 0.25) / 2;
  const colW = [0.5, 1.05, half - 0.5 - 1.05 - 1.05, 1.05];
  const top = A.CONTENT_TOP + 0.4;
  A.specTable(s, {
    x: A.MARGIN, y: top, w: half, colW, fontSize: 7.5, headerFontSize: 8,
    header: ["번호", "출처", "내용 (요지)", "정제 결과"],
    rows: [
      vr("R-01", "MCR 개발팀", "컨텍스트 폭증으로 KV cache가 HBM 용량을 넘어선다 — 타겟 메모리로 풀리는지가 효용성 입증의 핵심", "QA-01·03"),
      vr("R-02", "MCAS 팀", "시뮬레이션 예측 효과가 실측에서 재현되는지 — 같은 HBM으로 동시 컨텍스트 수용량을 정량으로", "QA-03,\nFR-02·03"),
      vr("R-03", "User", "수십 k 토큰 RAG 프롬프트를 매 요청 re-prefill — 같은 문서 chunk의 KV를 재사용하고 싶다", "FR-01·04"),
      vr("R-04", "User", "multiturn 세션이 이어질 때마다 이전 턴 컨텍스트 복원 비용이 크다", "FR-01·04"),
      vr("R-05", "User", "agent가 세션을 넘는 장기 기억 요구 — KV가 세션·사용자 단위로 영속하는 자산이어야", "FR-04"),
      vr("R-06", "User", "압축·재사용 때문에 답변 품질이 떨어지면 쓸 수 없다 — 품질 저하의 상한을 보장해달라", "QA-02"),
      vr("R-07", "메모리 사업부", "E2E 관점에서 당사 제품의 가치를 확인할 수 있어야 — 그래야 고객도 신뢰한다", "QA-01·03"),
      vr("R-08", "메모리 사업부", "자체 레퍼런스 스택을 가지고 있으면 고객에 제공할 수 있다", "FR-01,\nQA-06"),
      vr("R-09", "메모리 사업부", "PIM/PNM 연산의 효용성을 E2E에서 테스트하고 싶다", "FR-07"),
      vr("R-10", "메모리 사업부", "디바이스 HW 스펙은 변경 불가 — 주어진 스펙(대역폭·용량·지연)을 전제로 설계하라", "C-01"),
      vr("R-11", "개발 임원", "GPU HBM 단일 tier baseline 대비 개선을 E2E 정량으로 입증 — 대표 워크로드 벤치 완주", "QA-01,\nFR-01·05"),
      vr("R-12", "개발 임원", "과제 종료 후에도 소수 인력으로 지속 유지 가능해야 — 상시 전담팀 불가", "QA-06"),
    ],
  });
  A.specTable(s, {
    x: A.MARGIN + half + 0.25, y: top, w: half, colW, fontSize: 7.5, headerFontSize: 8,
    header: ["번호", "출처", "내용 (요지)", "정제 결과"],
    rows: [
      vr("R-13", "MCR 개발팀", "vLLM은 2주마다 릴리스 — 구조에 따라 추종 비용이 수십 인월로 갈린다", "QA-06·04"),
      vr("R-14", "—", "(결번 — v0.4 삭제: 자체 KV 압축·재사용 알고리즘 개발이 과제 범위이므로 '기존 기법 채용' 제약 불성립)", "—"),
      vr("R-15", "고객사", "기존 서빙 API·생태계(vLLM 호환)와의 호환성이 도입의 전제 조건", "QA-09"),
      vr("R-16", "MCR 개발팀", "기존 KV 계층에 없는 요청별 SLO·품질 예산 기반 정책이 차별점 — 요청마다 배치·압축·재사용 차등", "FR-06"),
      vr("R-17", "MCR 개발팀", "tier 조합·P/D 구성을 바꿔가며 실험 — 신규 tier 등록 용이 + 고정 노드 내 role 자동 재배분", "FR-05·08·09,\nQA-04"),
      vr("R-18", "MCAS 팀", "tier 디바이스 장애로 영속 KV 유실 시 세션이 깨지지 않고 복구되어야", "QA-07"),
      vr("R-19", "고객사", "멀티테넌트에서 사용자 간 KV 재사용이 프롬프트 유출 통로가 되지 않도록 격리 보장", "QA-08"),
      vr("R-20", "고객사", "클러스터 규모를 늘릴 때 노드 추가만으로 선형에 가깝게 확장", "QA-10"),
      vr("R-21", "User", "MLA·hybrid attention 등 KV 구조가 바뀌는 신모델이 나오면 곧바로 서빙하고 싶다", "QA-04"),
      vr("R-22", "개발 임원", "모델 학습 지원은 이번 과제 범위가 아니다 — 추론 서빙에 집중", "범위 판정"),
      vr("R-23", "MCR 개발팀", "vLLM이 유일한 선택지가 아니다 — framework를 갈아탈 때의 비용이 통제되도록 종속 관리", "QA-05"),
    ],
  });
}

// ───────────────── 27. 부록 B. QA 도출 방법론 (green) ─────────────────
{
  const s = A.slide(pptx, { title: "부록 B. QA 도출 방법론 — SEI 5단계", active: 1, band: "green", page: 27, titleSize: 26 });
  A.linkButton(s, { label: "본문: 요구사항 → QA 도출 (p.7)", w: 3.8 });
  headline(s, {
    y: A.CONTENT_TOP - 0.02,
    main: [
      { text: "○ SEI 계열 표준 5단계: ", options: { fontSize: 15, color: A.COLORS.ink } },
      { text: "품질 발화 10건 → 시나리오화 → Utility Tree → QA 6건 선정·정량화", options: { fontSize: 15, bold: true, color: navy } },
    ],
  });
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
  const cy = py + 0.42 + 0.06 + 1.62 + 0.18;
  const yb = A.sectionHeader(s, { x: A.MARGIN, y: cy, w: A.PAGE.w - 2 * A.MARGIN, text: "QA별 도출 체인 — VOC에서 정량 bin까지 4단", color: "navy", h: 0.32, fontSize: 12.5 });
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

// ───────────────── 28–33. 부록 C. QA별 평가 기준 상세 ─────────────────
// 내용 출처: docs/md/00_qa_definitions.md (v0.7) — 정의·측정·baseline·bin·bin 근거 발췌.
const QA_DETAIL = [
  {
    page: 28, band: "navy", no: "QA1", name: "Performance", kor: "추론 성능 (TTFT · throughput)",
    prio: "우선순위 1 (목표)", imp: "H", diff: "H",
    role: "과제 최종 판정 지표 — 미달 시 나머지 QA가 우수해도 무의미",
    def: [
      [["정의 — 왜 2지표: "], "추론은 ", ["prefill(첫 토큰까지) · decode(생성 지속)"], " 2단계로 나뉘고 MCR 최적화가 각 단계에 1:1 대응 — 합성 지표로 뭉치면 어느 단계 개선인지 흐려지므로 분리 측정"],
      [["① TTFT (prefill 축): "], "KV 재사용·retrieval 가속이 줄이는 첫 토큰 지연 — baseline 대비 단축 배율. ", ["평균 기준 판정 · p99 병행"], " (재사용 hit/miss 이질성 — 꼬리는 cold 요청 지배)"],
      [["② throughput (decode 축): "], "tier 확장·압축의 batch 확대로 오르는 생성 처리량 — baseline 대비 배율. ", ["iso-latency(TPOT p99 ≤ baseline) 판정 · 곡선 병행"], " (지연 팔아 산 처리량 배제, vLLM SOSP'23 방법론)"],
      [["Baseline: "], "동일 HW·동일 실행 구성의 ", ["GPU HBM 단일 tier"], " — 순증분 분리 측정. P/D 분리는 실험 변수(양쪽 동일 적용). goodput@SLO는 상용화 단계 승격(절대 SLO는 연구 테스트베드서 취약)"],
    ],
    bins: [["★★★", "TTFT ≥ 2× 그리고 throughput ≥ 2× (둘 다 충족)"], ["★★☆", "두 지표 모두 ≥ 1.5×, 한쪽이라도 2× 미달"], ["★☆☆", "어느 한 지표라도 < 1.5×"]],
    evid: [
      [["① TTFT 2× (prefill): "], "CacheBlend RAG 재사용 ", ["TTFT 2.2–3.3×↓(B, EuroSys'25 Best Paper)"], " · SGLang prefix 재계산 제거(B) · 검색 SmartANNS ", ["QPS ≤10.7×(B, SSD-PIM·ADR-001)"], " → 2×는 CacheBlend 하단 2.2×의 보수 반올림(C)"],
      [["② throughput 2× (decode): "], "KIVI batch 4×로 ", ["처리율 2.35–3.47×(B)"], " · vLLM paging ", ["2–4×(B)"], " → tier 확장이 batch를 더 키우므로 단독 하단 2× 요구(C)"],
      [["AND로 묶는 이유: "], "한쪽만 좋으면 한 단계만 최적화한 것 — MCR 가치는 prefill·decode 결합이므로 둘 다 2× 요구(C). 구 지연 가드 1.5×(임의 배수)는 폐기, iso-latency로 대체(v0.9)"],
    ],
  },
  {
    page: 29, band: "green", no: "QA2", name: "Accuracy", kor: "응답 품질 (bound)",
    prio: "우선순위 2 (gate)", imp: "H", diff: "M",
    role: "QA1·QA3 수치의 유효 전제 — bound 위반 시 성능·용량 수치 무효",
    def: [
      [["정의: "], "압축(양자화·토큰 eviction)·재사용으로 인한 ", ["품질 저하의 상한 보장"], " — 품질은 올리는 목표가 아니라 지키는 제약"],
      [["측정: "], "주지표 ", ["ΔF1(%p)"], " — LongBench QA 태스크군 공식 지표(B), 부분 일치를 반영해 저하에 민감 · 보조 ΔPPL(Wikitext-2, 선행 신호)"],
      [["Baseline: "], "동일 모델·동일 벤치의 ", ["비압축(FP16 KV)·비재사용"], " — 품질의 이론적 상한이므로 ΔF1이 곧 압축·재사용의 품질 비용"],
      [["판정 축 추가: "], "bound의 집행 단위 — 요청별(차등) vs 전역"],
    ],
    bins: [["★★★", "ΔF1 ≤ 1%p (보조 ΔPPL ≤ 0.1) · 요청별 bound 집행"], ["★★☆", "ΔF1 ≤ 2%p · 전역 bound만 보장"], ["★☆☆", "ΔF1 > 2%p 또는 bound 자체를 보장 못 함"]],
    evid: [
      ["2%p = 최대 압축단(2-bit) ", ["KIVI의 LongBench 실측 저하 상한(B)"]],
      ["1%p = ", ["MLPerf 99% 트랙(B)보다 완화, KIVI 상한보다 엄격한 중간 경계(C)"], " — KIVI 평균 저하는 Δ0.25점(B)이라 도달 가능 · LongBench 표본 오차(≈0.5점)와 같은 자릿수(C) · 사내 기준 1%p 계승(A)"],
      ["eviction도 동일 bound: H2O KV 예산 20% 동등 성능(B) · SnapKV 92% 압축 negligible(B)"],
      ["요청별 집행 조건: K>V sensitivity(B) — 압축 대상 선택이 품질을 좌우(C)"],
    ],
  },
  {
    page: 30, band: "navy", no: "QA3", name: "Resource Efficiency", kor: "메모리 효율 (유효 KV 용량)",
    prio: "우선순위 3 (수단)", imp: "H", diff: "H",
    role: "HBM당 수용 컨텍스트가 비용 구조 결정 — 이종 tier 도입의 존재 이유",
    def: [
      [["정의: "], "원본(비압축) 환산으로 동시 수용 가능한 KV 총량의 물리 HBM 용량 대비 배율 — ", ["QA2 품질 bound를 지키는 조건에서만 인정"]],
      [["측정: "], "Σ_tier(tier 용량 × 평균 압축률 × KV 가용 비율) ÷ 물리 HBM 용량 · 보조: tier 활용률, 압축률 분포"],
      [["Baseline: "], ["HBM 단일 tier·비압축 = 1.0×"], " — HBM이 희소 자원이라 분모를 HBM으로 고정"],
      [["병목의 크기: "], "Llama-2-70B 기준 토큰당 ≈ 320 KB → 32k 컨텍스트 1세션 ≈ 10.5 GB — 용량이 동시성(=처리율)의 상한(C)"],
    ],
    bins: [["★★★", "유효 KV 용량 ≥ 3×"], ["★★☆", "1.5× – 3×"], ["★☆☆", "< 1.5× (압축 단독 대비 열위)"]],
    evid: [
      ["압축 단독 도달선 1.5×: ", ["KIVI 2-bit peak memory 2.6× 절감·batch 4×(B)"], " — 압축만 잘 써도 도달"],
      ["tier 결합 상단: ", ["FlexGen offloading 정책만으로 최대 100×(B)"], " · vLLM: KV 낭비 60–80% → <4%(B)"],
      ["∴ tier+압축을 결합하는 MCR은 ", ["3×를 상위 bin"], "으로 요구 — 1.5× 미만이면 이종 tier 도입의 존재 이유 미달(C)"],
    ],
  },
  {
    page: 31, band: "green", no: "QA4", name: "Modifiability", kor: "확장성·진화성",
    prio: "우선순위 4", imp: "M", diff: "H",
    role: "코어/모듈 경계는 되돌리기 어려운 초기 결정 — 중장기 생존성 좌우",
    def: [
      [["정의: "], "신규 메모리 디바이스(HBM4/CMM-DC/HBF)와 ", ["KV 구조 영향 모델 변화"], "(GQA/MQA · MLA · sliding-window · linear attention 계열)의 수용 비용"],
      [["측정 (a) tier 추가: "], "신규/변경 모듈 수 · 코어 변경 LOC 비율(%) · 공개 IF(KV Locator·CompressionOp) 시그니처 변경 건수 · 기능 변경 비율"],
      [["측정 (b) 모델 변화: "], "수용 리드타임 (upstream 공개 시점 기준) — baseline = 현행 코드베이스"],
      [["코어/모듈 판별: "], "수정 시 다른 모듈들을 재검증해야 하면 코어, 그 부품만 재검증하면 모듈 (시그니처 변경은 항상 코어)"],
    ],
    bins: [["★★★", "tier 추가 = topology 파라미터 등록 + 어댑터 모듈 ≤ 1 · 코어 변경 LOC 0 · 시그니처 변경 0건 · 모델 변화 수용 ≤ upstream + 2주"], ["★★☆", "코어 변경(또는 기능 변경) ≤ 전체의 40% · 하위호환 시그니처 변경만 · ≤ upstream + 1분기"], ["★☆☆", "코어 변경 > 40% · 비호환 시그니처 변경 · 수용 > 1분기 (만성 지연)"]],
    evid: [
      ["40% = ", ["Architect 과제 원본 덱 QA-01의 사내 측정 기준 계승(A)"]],
      ["upstream + 2주 = ", ["vLLM 정규 릴리스 2주 간격(B)"], " — 한 릴리스 주기 내 추종 = 실질 동시 지원"],
      ["1분기 초과 ≈ 릴리스 6회 누락 → 생태계 대비 만성 열세(C)"],
      ["모델 변화의 실재: MLA — KV 93.3% 축소(B) · linear attention — KV를 고정 크기 상태로 대체(B), MiniMax-01 상용 배치(B)"],
    ],
  },
  {
    page: 32, band: "navy", no: "QA6", name: "Adaptability", kor: "framework 적응성",
    prio: "우선순위 5", imp: "M", diff: "H",
    role: "framework 종속 리스크 통제 — 산출물(레퍼런스 스택)의 수명 좌우",
    def: [
      [["정의: "], "서빙 framework 교체(vLLM → SGLang 등) 시 ", ["MCR 고유 자산(Memory Engine · 배치·압축·재사용 정책)을 보존"], "하는 능력"],
      [["측정: "], "① framework 결합 코드 비율(%) — 정적 분석 ② 교체 시 코어(Memory Engine·정책·공개 IF) 변경 LOC ③ 전환 공수(인월) — 파일럿 포팅 또는 견적"],
      [["Baseline: "], "현 framework(vLLM) 결합 구조 — ", ["교체 비용이 곧 종속 위험의 크기"]],
      [["F 평가 시: "], "결합부 정적 분석 결과를 근거로 제시"],
    ],
    bins: [["★★★", "결합 코드가 어댑터 계층에 격리(≤ 전체의 10%) · 교체 시 코어 변경 0 · 전환 ≤ 3인월"], ["★★☆", "교체 시 코어 변경 ≤ 전체의 40% · 전환 ≤ 1분기"], ["★☆☆", "사실상 전면 재작성(> 40%) 또는 전환 > 1분기"]],
    evid: [
      ["10%·3인월 = ", ["ports-and-adapters 성립 시 결합부가 인터페이스 구현 계층에 국한된다는 구조 논증(C)"], " + plugin형 초기 구축 '수 인월'(A)에서 포팅은 그 이하라는 추정(C)"],
      ["40% = 사내 기준(A, QA4와 동일 계승)"],
      ["대안의 실재: ", ["SGLang — RadixAttention 기반, vLLM 동급 이상 처리율 보고(B)"]],
    ],
  },
  {
    page: 33, band: "green", no: "QA5", name: "Maintainability", kor: "유지보수성",
    prio: "우선순위 6", imp: "M", diff: "M",
    role: "지속 가능성 좌우 — DP1(plugin vs 독립) 선택이 비용을 한 자릿수 이상 가름",
    def: [
      [["정의: "], "초기 구축(", ["대표 워크로드 E2E 벤치 완주"], "까지) + 지속 유지보수 비용 (구 Affordability — ISO/IEC 25010 어휘로 개칭)"],
      [["측정: "], "초기 구축 인월(person-month) · 연간 유지보수 FTE — upstream 추종(rebase, 2주 주기)·회귀 검증 포함"],
      [["Baseline: "], "DP1 후보별 비용 모델(02 문서 실측 표현) — ", ["plugin형 '초기 수 인월' vs 독립형 '초기 수십 인월+, 상시 유지 인력'(A)"]],
    ],
    bins: [["★★★", "초기 ≤ 6인월 · 유지 ≤ 0.5 FTE"], ["★★☆", "초기 ≤ 24인월 · 유지 ≤ 2 FTE"], ["★☆☆", "초기 > 24인월 또는 유지 > 2 FTE (상시 전담팀)"]],
    evid: [
      ["경계 수치 = 02 문서의 실측 표현(A)을 bin으로 수치화"],
      ["0.5 FTE = plugin 경계 유지 시 2주 릴리스 주기당 ~수일의 추종 비용(C)"],
      ["2 FTE = fork rebase 비용이 6–12개월 후 급증한다는 관찰(02 §DP1, C)에서 fork/독립 유지의 하한"],
    ],
  },
];

QA_DETAIL.forEach((q, idx) => {
  const s = A.slide(pptx, { title: `부록 C-${idx + 1}. ${q.no} ${q.kor}`, active: 1, band: q.band, page: q.page, titleSize: 24 });
  A.linkButton(s, { label: "본문: Utility Tree (p.8) · QA 정의 (p.9)", w: 4.2 });
  headline(s, {
    y: A.CONTENT_TOP - 0.04,
    main: [
      { text: `○ ${q.no} ${q.name} — `, options: { fontSize: 14, bold: true, color: navy } },
      { text: q.role, options: { fontSize: 13, color: A.COLORS.ink } },
      { text: `   [중요도 ${q.imp} · 난이도 ${q.diff} · ${q.prio}]`, options: { fontSize: 10.5, bold: true, color: gray } },
    ],
  });
  const top = A.CONTENT_TOP + 0.5;
  // 좌: 정의·측정·baseline
  const Lx = A.MARGIN, Lw = 6.55;
  const ly = A.sectionHeader(s, { x: Lx, y: top, w: Lw, text: "정의 · 측정 · Baseline", color: "navy" });
  A.bulletList(s, {
    x: Lx + 0.05, y: ly + 0.12, w: Lw - 0.1, h: A.CONTENT_BOTTOM - ly - 0.15, fontSize: 10,
    items: q.def.map((parts) => em(parts, 10)),
  });
  // 우: 별점 bin 표 + bin 근거
  const Rx = Lx + Lw + 0.25, Rw = A.PAGE.w - A.MARGIN - Rx;
  const ry = A.sectionHeader(s, { x: Rx, y: top, w: Rw, text: "별점 정량 bin", color: "green" });
  A.specTable(s, {
    x: Rx, y: ry + 0.1, w: Rw, colW: [0.85, Rw - 0.85], fontSize: 9, headerFontSize: 9.5,
    header: ["별점", "기준"],
    highlightRows: [0],
    rows: q.bins.map(([star, crit]) => [
      { text: star, align: "center", bold: true, color: navy },
      { text: crit, fontSize: 9 },
    ]),
  });
  const binH = 0.28 + q.bins.reduce((h, [, crit]) => h + (crit.length > 55 ? 0.62 : crit.length > 30 ? 0.45 : 0.3), 0);
  const ey = A.sectionHeader(s, { x: Rx, y: ry + 0.1 + binH + 0.22, w: Rw, text: "bin 근거 (A 실측 · B 문헌 · C 논증)", color: "green" });
  A.bulletList(s, {
    x: Rx + 0.05, y: ey + 0.1, w: Rw - 0.1, h: A.CONTENT_BOTTOM - ey - 0.12, fontSize: 9,
    items: q.evid.map((parts) => em(parts, 9)),
  });
});

A.writeDeck(pptx, OUT).then((f) => console.log("wrote", f));
