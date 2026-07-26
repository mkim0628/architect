// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/2_요구사항/mcr_requirements_kv.build.js
// 요구사항 챕터 5장 (구 mcr_requirements_2 덱 양식 승계 — 1단계·v1.6 개정 반영)
//   P5 요구사항 수집 (stakeholder + 방법) / P6 요구사항 정제 (FR·C + UC diagram)
//   P7 대표 워크로드 시나리오별 QA 도출 (v1.6 신설 — 요구사항→QA 방향)
//   P8 Utility Tree ASR 선정 (채점 입력 = 시나리오·VOC — 목표 문장 참조 금지)
//   P25 부록 A 원시 요구사항(VOC) R-01~R-24
// 근거: docs/00_requirements_analysis.md v1.6 · 00_qa_definitions.md v1.6
const path = require("path");
const A = require(path.join(__dirname, "..", "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const C = A.COLORS, F = A.FONT;
const pptx = A.newDeck();
const TOPY = A.CONTENT_TOP;

// ── P5. 요구사항 수집 ────────────────────────────────────────────────
{
  const s = A.slide(pptx, { title: "요구사항 수집", active: 1, band: "navy", page: 5 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "Stakeholder 인터뷰·QAW + 자체 실측·문헌 조사 병행 → 원시 요구사항 24건(결번 2 — R-09·R-14, 유효 22건) 수집", options: { bold: true, color: C.ink } },
    { text: "  — 서비스 운영 조직은 stakeholder 아님(연구 과제): 서빙 SLO·워크로드 요구는 문헌·자체 실측으로 대체 수집", options: { color: C.gray70, fontSize: 9 } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  let y = A.sectionHeader(s, { x: A.MARGIN, y: TOPY + 0.34, w: 7.1, text: "주요 Stakeholder 및 역할", color: "navy" });
  A.specTable(s, {
    x: A.MARGIN, y: y + 0.08, w: 7.1, colW: [1.7, 5.4], fontSize: 8,
    header: ["Stakeholder", "역할 · 주요 관심사"],
    rows: [
      ["메모리 사업부", "과제 발주 일원 — 메모리 제품 로드맵. 현 과제 관심사: KV 운용 계층 성립·tier 추상화 접속점 보존(R-07)·레퍼런스 스택(R-08)·디바이스 불변(R-10). 구 과제 VOC(자사 디바이스 E2E 실증)는 2단계로 이관(R-09 결번)"],
      [{ text: "MCAS 팀", bold: true }, "타겟 메모리 시스템 성능의 시뮬레이션·예측 — 예측치의 실측 재현(R-02), tier 조합별 효용 정량화"],
      [{ text: "User", bold: true }, "public LLM 응용·모델 사용자 — 대표 워크로드(RAG·multiturn·agent)의 요구 특성 제공: 장문 비용·세션 기억·품질 유지"],
      ["개발 임원 (랩장)", "과제 승인·자원 배정, 목표 재정의(R-24) 주체 — KV 최적 운용 효용성의 E2E 정량 입증(baseline 대비)"],
      ["MCR 개발팀", "런타임 개발·유지보수·자체 실측 — 개발 비용, upstream 추종·교체 부담, 코어/모듈 경계"],
      ["고객사 (잠재)", "레퍼런스 스택 수요처 — 생태계 호환·실측 증거·확장성 (도입 전제 조건만 수집)"],
      ["(간접) 오픈소스 커뮤니티", "vLLM·SGLang·LMCache 진화 주체 — 릴리스 주기·인터페이스 변화가 제약으로 작용"],
    ],
  });
  let y2 = A.sectionHeader(s, { x: 7.85, y: TOPY + 0.34, w: 4.98, text: "요구사항 수집 방법", color: "green" });
  A.specTable(s, {
    x: 7.85, y: y2 + 0.08, w: 4.98, colW: [2.1, 2.88], fontSize: 8,
    header: ["방법", "산출"],
    rows: [
      ["Stakeholder 인터뷰·VOC", "원시 요구사항 R-01~R-24 (부록 A)"],
      ["QAW", "품질 요구의 시나리오화 — §4.1·Utility Tree 행"],
      ["자체 벤치마크 실측", "decode 대기 70–85% (A) — QA1·QA3 baseline"],
      ["문헌·업계 벤치 조사", "CacheBlend·H2O·SnapKV·KIVI·vLLM·SGLang·MLPerf·LongBench (B)"],
      ["upstream 릴리스 분석", "vLLM 2주 케이던스 (B) — QA5 bin·DP1 비용 모델"],
      ["유사 시스템 분석", "LMCache 등 KV offloading 계층 (B) — DP1 후보 발굴"],
    ],
  });
  A.linkButton(s, { label: "원시 요구사항(VOC) R-01~R-24 전량 : 부록 A (p.25)", inBand: true });
}

// ── P6. 요구사항 정제 ────────────────────────────────────────────────
{
  const s = A.slide(pptx, { title: "요구사항 정제", active: 1, band: "green", page: 6 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "수집 24건(유효 22건) → 기능 요구사항 7건 · 품질 요구(QA 후보) 11건 · 제약사항 3건 · 범위 판정 1건", options: { bold: true, color: C.ink } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  let y = A.sectionHeader(s, { x: A.MARGIN, y: TOPY + 0.34, w: 7.35, text: "기능 요구사항 (FR) — 목표 3축 대응 재편 (v1.0)", color: "green" });
  A.specTable(s, {
    x: A.MARGIN, y: y + 0.08, w: 7.35, colW: [0.75, 1.45, 5.15], fontSize: 7.6,
    header: ["번호", "태그", "설명 (요지)"],
    rows: [
      ["FR-01", "워크로드 서빙", "대표 워크로드(long-context RAG·multiturn·agent memory) E2E 처리 — retrieval은 외부 컴포넌트"],
      [{ text: "FR-02", bold: true }, "KV 재사용", "세션·사용자 영속 + prefix 넘어 비접두(chunk) 재사용 + 복원 vs 재계산 비용 판단"],
      [{ text: "FR-03", bold: true }, "KV 압축(pruning)", "중요도 기반 토큰 pruning 주 기법(양자화 조합) — 요청별 품질 예산 차등 적용"],
      ["FR-04", "KV tier 배치", "HBM 밖 tier(DRAM·SSD — 1단계 commodity)에 배치·승격/강등 — 2단계 디바이스 접속점"],
      [{ text: "FR-05", bold: true }, "KV 인지 스케줄링", "cache-hit/locality 인지 admission·라우팅 + KV 공간 확보(압축/강등/축출 선택) + SLO 차등"],
      ["FR-06", "P/D 분리 실행", "prefill/decode 분리 구성의 인스턴스 간 KV 전송 포함 실행 (실험 변수)"],
      ["FR-07", "KV telemetry", "KV 관측 지표 수집 → 정책 피드백 + 고정 N 내 P/D 비율 자동 조정"],
    ],
  });
  const fy = 4.62;
  A.sectionHeader(s, { x: A.MARGIN, y: fy, w: 7.35, text: "제약사항 (C)", color: "navy" });
  A.specTable(s, {
    x: A.MARGIN, y: fy + 0.42, w: 7.35, colW: [0.75, 1.9, 4.7], fontSize: 7.6,
    header: ["번호", "제약사항", "설명 (요지)"],
    rows: [
      ["C-01", "디바이스 불변", "메모리 HW 설계 변경 불가 — tier는 파라미터(대역폭·용량·지연)로만 취급"],
      ["C-02", "Transformer 한정", "최적화 대상은 KV cache 보유 모델 — 탈Transformer는 전제 불성립으로 범위 외"],
      ["C-03", "training-free", "정확도 유지는 재학습·모델 변경 없이 — 압축·재사용은 런타임 계층 기법으로 한정"],
    ],
  });
  A.sectionHeader(s, { x: 8.1, y: TOPY + 0.34, w: 4.73, text: "시스템 경계 · Use Case (UC-01~10)", color: "navy" });
  s.addImage({ path: path.join(__dirname, "..", "mcr_assets", "req_usecase_mcr.png"), x: 8.1, y: TOPY + 0.84, w: 4.73, h: 4.73 * 760 / 1080 });
  s.addText("전 FR이 ≥1개 UC에 매핑 ✓ — 서빙 3 · 재사용 2 · 압축 1 · 배치 1 · 스케줄링 2(KV 공간 확보 포함) · P/D 1 · telemetry 1", {
    x: 8.1, y: TOPY + 0.9 + 4.73 * 760 / 1080, w: 4.73, h: 0.5, fontSize: 8, fontFace: F.body, color: C.gray70, valign: "top" });
}

// ── P7. 대표 워크로드 시나리오별 QA 도출 ─────────────────────────────
{
  const s = A.slide(pptx, { title: "시나리오 기반 QA 도출 — 요구사항이 우선순위의 원천", active: 1, band: "navy", page: 7 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "대표 워크로드 시나리오의 정량 관찰(A 실측·B 문헌·C 논증) → 필요 기능(FR) → 귀결 QA", options: { bold: true, color: C.ink } },
    { text: "  — QA와 우선순위는 요구사항에서 도출하고, 과제 목표의 정량치(Exit Criteria)는 선정 QA bin에서 역정의 (v1.6)", options: { color: "B3402A", fontSize: 9, bold: true } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  A.specTable(s, {
    x: A.MARGIN, y: TOPY + 0.4, w: 12.33, colW: [6.53, 2.6, 3.2], fontSize: 8,
    header: ["대표 워크로드 시나리오 — 정량 관찰", "필요 기능 (FR)", "귀결 QA"],
    rows: [
      ["long-context RAG — 수십 k 토큰을 매 요청 전체 re-prefill(R-03). chunk KV 재사용(비접두+선택 재계산) 시 TTFT 2.2–3.3×↓ (CacheBlend, B)", "KV 재사용 (FR-02)", { text: "QA-03 TTFT", bold: true }],
      ["multiturn / agent memory — 턴·세션마다 컨텍스트 복원 비용(R-04·05). prefix 재사용(SGLang, B) + 복원 vs 재계산 역전 구간(tier 계단 ~10×, A)", "KV 재사용·tier 배치 (FR-02·04)", { text: "QA-03 TTFT · QA-04", bold: true }],
      ["KV 용량 병목 — 32k 1세션 ≈ 10.5 GB로 HBM 초과(R-01, C). pruning 예산 20% = 산술 5× (H2O, B) · MCAS 예측의 실측 재현 요구(R-02)", "KV 압축·tier 배치 (FR-03·04)", { text: "QA-04 유효 KV 용량 · QA-01", bold: true }],
      ["decode 지배 — decode 대기가 E2E의 70–85% (자체 실측 A, R-01), memory-BW-bound. pruning 읽기량 절감·paging 2–4× (vLLM, B)", "KV 압축 (FR-03)", { text: "QA-01 Throughput", bold: true }],
      ["KV-blind 스케줄링 — locality 비인지 라우팅·포화 시 preemption뿐(R-16): 재사용·압축 이득이 처리량으로 전환 안 됨 (C)", "KV 인지 스케줄링 (FR-05)", { text: "QA-01 Throughput", bold: true }],
      ["품질 우려 — \"품질이 떨어지면 쓸 수 없다\"(R-06). near-lossless 실재: LongBench ≤2%p (KIVI, B) · 예산 20% 동등 (H2O, B)", "요청별 차등 압축 (FR-03)", { text: "QA-02 품질 bound (gate)", bold: true }],
      ["유지·진화 — vLLM 2주 릴리스(R-13, B) · tier 조합 실험 반복(R-17) · MLA·linear attention 신모델 즉시 서빙(R-21, B)", "tier 추상화·telemetry (FR-04·07)", { text: "QA-05 확장성·진화성", bold: true }],
    ],
  });
  s.addText("시나리오의 측정 가능한 정량 효과가 곧 QA의 존재 근거 — 모든 [측정]에 출처 등급(A/B/C)이 붙는다. retrieval 가속(SSD-PIM) 행은 2단계 이관으로 제외(R-09와 함께 2단계 분석에서 복원).", {
    x: A.MARGIN, y: A.CONTENT_BOTTOM - 0.35, w: 12.33, h: 0.35, fontSize: 8.5, fontFace: F.body, color: C.gray70, valign: "middle" });
}

// ── P8. Utility Tree ASR 선정 ────────────────────────────────────────
{
  const s = A.slide(pptx, { title: "Utility Tree 활용한 ASR 선정", active: 1, band: "green", page: 8 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "QA 후보 11건을 rubric 2축 평가 → 상위 5건 ASR 선정", options: { bold: true, color: C.ink } },
    { text: "  (우선순위: ① 중요도[I1 핵심 시나리오 직결성·I2 파급·I3 VOC 대체 불가] → ② 난이도 → ③ 잔여 동률 역할 — 채점 입력은 시나리오·VOC뿐, 목표 문장 참조 금지)", options: { color: "B3402A", fontSize: 8.6, bold: true } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  A.specTable(s, {
    x: A.MARGIN, y: TOPY + 0.4, w: 12.33, colW: [0.72, 1.55, 2.5, 4.9, 0.85, 0.75, 0.56, 0.5], fontSize: 7.3,
    header: ["번호", "QA", "Refinement", "Scenario  [측정: 지표 + baseline]", "중요도", "난이도", "우선", "선정"],
    highlightRows: [0, 1, 2, 3, 4],
    rows: [
      ["QA-01", "Perf. — Throughput", "decode 성능 — throughput 배율 (압축·tier·스케줄링 축)", "생성 처리량 배율 — iso-latency(TPOT p99 ≤ baseline) 판정·곡선 병행, ablation으로 순기여 분리 [측정: ≥2× → ★★★]", { text: "H (6 최고)", bold: true }, "H (5)", "1", { text: "O", bold: true, align: "center" }],
      ["QA-02", "Accuracy", "품질 저하 bound — 전 수치의 유효 전제(gate)", "압축·재사용 활성 상태로 LongBench — baseline(비압축 FP16·비재사용) 대비 ΔF1, 집행 단위(요청별/전역) 판정 [측정: ≤1%p·요청별 → ★★★]", "H (5)", { text: "H (6 최고)", bold: true }, "2", { text: "O", bold: true, align: "center" }],
      ["QA-03", "Perf. — TTFT", "prefill 성능 — TTFT 단축 배율 (재사용 축)", "RAG·multiturn·agent E2E 첫 토큰 시간 — 평균 판정·p99 병행, baseline = GPU HBM 단일 tier [측정: ≥2× → ★★★]", "H (5)", "M (3)", "3", { text: "O", bold: true, align: "center" }],
      ["QA-04", "Resource Efficiency", "유효 KV 용량 (원본 환산 동시 수용량)", "QA-02 bound 준수 조건에서 Σ_tier(용량×압축률×가용) ÷ HBM [측정: ≥3× → ★★★] — 기전 입증(R-02 재현 검증)", "H (5)", "M (3)", "4", { text: "O", bold: true, align: "center" }],
      ["QA-05", "Modifiability", "KV 구조 변화·신규 tier 수용 (framework 격리 대리 측정)", "MLA·linear attention 수용 + tier 조합 변경 [측정: 어댑터 ≤1·코어 LOC 0·시그니처 0·≤upstream+2주 → ★★★]", "M (3)", "H (5)", "5", { text: "O", bold: true, align: "center" }],
      ["QA-06", "Maintainability", "개발·운영 비용", "초기 구축 인월·연간 유지 FTE [측정: ≤6인월·≤0.5 FTE] — v1.5 미선정: critical 요구 아님, bin은 DP1 비용 모델로 보존", "M (2)", "M (2)", "6", ""],
      ["QA-07", "Availability", "영속 KV 유실 복구", "노드 장애 시 재계산으로 세션 복구 — 유실이 성능 문제로 환원되어 QA-01·03에 흡수", "M", "M", "7", ""],
      ["QA-08", "Security", "사용자 간 KV 재사용 격리", "cross-user 재사용 차단 — 실증 단계는 사용자/세션 내 한정 정책으로 완화", "M", "M", "8", ""],
      ["QA-09", "Interoperability", "기존 서빙 생태계 호환", "응용 수정 없는 전환 — DP1(실행 스택 소싱)의 결정 변수로 흡수", "M", "M", "9", ""],
      ["QA-10", "Adaptability", "framework 교체 적응성", "교체 시 코어 보존 — QA-05가 대리 측정(코어 LOC·시그니처), 노출 시점은 2단계", "L", "H", "10", ""],
      ["QA-11", "Scalability", "클러스터 수평 확장", "노드 추가 선형 확장 — 고정 N 테스트베드 전제로 범위 외", "L", "H", "11", ""],
    ],
  });
  s.addText("잔여 동률(QA-03·04 — 5·3 완전 동률)은 역할로 판정: QA-03은 RAG·multiturn·agent 시나리오의 사용자 체감 최종 판정, QA-04는 그 기전(용량) — 시나리오 최종 판정 지표 > 수단·기전. 미선정 6건 전건 사유 기록(요구사항 분석 §4.3).", {
    x: A.MARGIN, y: A.CONTENT_BOTTOM - 0.35, w: 12.33, h: 0.35, fontSize: 8.3, fontFace: F.body, color: C.gray70, valign: "middle" });
  A.linkButton(s, { label: "QA별 정량 bin·근거 상세 : 00_qa_definitions.md v1.6", inBand: true });
}

// ── P25. 부록 A VOC ──────────────────────────────────────────────────
{
  const s = A.slide(pptx, { title: "부록 A. 수집 원시 요구사항 (VOC)", active: 1, band: "navy", page: 25 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "원시 요구사항 R-01~R-24 전량 (R-14 결번 — 유효 23건) — 정제 결과(FR/QA/C) 매핑 포함", options: { bold: true, color: C.ink } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  const rows1 = [
    ["R-01", "MCR 개발팀", "KV cache가 HBM 용량을 넘어선다 — 병목 해소가 효용성 입증의 핵심", "QA-01·03·04"],
    ["R-02", "MCAS 팀", "시뮬레이션 예측의 실측 재현 — 동시 컨텍스트 수용량 정량화", "QA-04, FR-03·04"],
    ["R-03", "User", "수십 k 토큰 RAG를 매 요청 re-prefill — chunk KV 재사용 요구", "FR-01·02"],
    ["R-04", "User", "multiturn 턴마다 이전 컨텍스트 복원 비용이 크다", "FR-01·02"],
    ["R-05", "User", "agent의 세션 넘는 장기 기억 — KV의 영속 자산화", "FR-02"],
    ["R-06", "User", "압축·재사용으로 품질 저하 시 사용 불가 — 상한 보장 요구", "QA-02, FR-03"],
    ["R-07", "메모리 사업부", "(v1.7 재수집) KV 운용 계층 = 자사 메모리 확장(2단계)의 전제 — tier 추상화 접속점 보존", "QA-05, FR-04"],
    ["R-08", "메모리 사업부", "자체 레퍼런스 스택 보유 → 고객 제공", "FR-01 (QA-06 미선정)"],
    ["R-09", "—", "(결번 — v1.7. 구 과제 VOC[PIM/PNM E2E 테스트]: 2단계 과제 VOC 등록부로 이관)", "—"],
    ["R-10", "메모리 사업부", "디바이스 HW 스펙 변경 불가 — 주어진 스펙 전제", "C-01"],
    ["R-11", "개발 임원", "GPU HBM 단일 tier baseline 대비 E2E 정량 입증·벤치 완주", "QA-01·03, FR-01·06"],
    ["R-12", "개발 임원", "종료 후 소수 인력 유지 가능 — 상시 전담팀 불가", "(QA-06 미선정 — DP1 비용 모델)"],
  ];
  const rows2 = [
    ["R-13", "MCR 개발팀", "vLLM 2주 릴리스 — 구조에 따라 추종 비용이 수십 인월로 갈림", "QA-05 (QA-06 미선정)"],
    ["R-14", "—", "(결번 — v0.4. 자체 압축·재사용 알고리즘 개발이 과제 범위)", "—"],
    ["R-15", "고객사", "기존 서빙 API·생태계 호환이 도입 전제", "QA-09 (미선정 — DP1 흡수)"],
    ["R-16", "MCR 개발팀", "요청별 SLO·품질 예산 기반 정책이 차별점 — 요청별 차등", "FR-03·05"],
    ["R-17", "MCR 개발팀", "tier 조합·P/D 구성 실험 반복 — 등록 용이·자동 재배분", "FR-04·06·07, QA-05"],
    ["R-18", "MCAS 팀", "tier 장애로 영속 KV 유실 시 세션 복구", "QA-07 (미선정 — 성능 환원)"],
    ["R-19", "고객사", "멀티테넌트 사용자 간 KV 재사용 격리", "QA-08 (미선정 — 정책 완화)"],
    ["R-20", "고객사", "노드 추가만으로 선형 확장", "QA-11 (미선정 — 범위 외)"],
    ["R-21", "User", "MLA 등 KV 구조 변화 신모델의 즉시 서빙", "QA-05"],
    ["R-22", "개발 임원", "모델 학습 지원은 범위 외 — 추론 서빙 집중", "범위 판정"],
    ["R-23", "MCR 개발팀", "framework 교체 비용 통제 — 종속 관리", "QA-10 (미선정 — QA-05 대리)"],
    ["R-24", "과제 발주 (v1.0)", "범위를 KV 캐시 최적 운용으로 특정 — 재사용·압축·KV 인지 스케줄링, 자사 디바이스는 2단계", "범위·FR-02·03·05, C-03"],
  ];
  const colW = [0.55, 1.05, 3.35, 1.13];
  A.specTable(s, { x: A.MARGIN, y: TOPY + 0.4, w: 6.08, colW, fontSize: 7, header: ["번호", "출처", "내용 (요지)", "정제 결과"], rows: rows1 });
  A.specTable(s, { x: 6.75, y: TOPY + 0.4, w: 6.08, colW, fontSize: 7, header: ["번호", "출처", "내용 (요지)", "정제 결과"], rows: rows2 });
  A.linkButton(s, { label: "본문: 요구사항 수집 (p.5) · 정제 (p.6) · 시나리오 QA 도출 (p.7)", inBand: true });
}

// ── P26. 부록 B. QA 우선순위 산정 기준 (rubric) ──────────────────────
{
  const s = A.slide(pptx, { title: "부록 B. QA 우선순위 산정 기준 — 등급 변별 rubric", active: 1, band: "green", page: 26 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "우선순위 = ① 중요도(rubric) → ② 난이도(rubric) → ③ 잔여 동률만 역할(시나리오 최종 판정 > gate > 수단·기전)", options: { bold: true, color: C.ink } },
    { text: "   채점 입력은 대표 워크로드 시나리오(p.7)·VOC(부록 A)뿐 — 과제 목표 문장은 참조하지 않는다(v1.6). 각 축 3기준 × 0/1/2점, H ≥ 5 · M 2–4 · L ≤ 1", options: { color: "B3402A", fontSize: 8.8, bold: true } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.34, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  const ty = TOPY + 0.44;
  A.sectionHeader(s, { x: A.MARGIN, y: ty, w: 6.05, text: "중요도 — 미달 시 과제에 주는 타격", color: "navy" });
  A.specTable(s, {
    x: A.MARGIN, y: ty + 0.42, w: 6.05, colW: [1.55, 4.5], fontSize: 7.8,
    header: ["세부 기준", "2점 / 1점 / 0점"],
    rows: [
      [{ text: "I1 핵심 시나리오\n직결성", bold: true }, "2 = 핵심 워크로드 시나리오를 단독/관통 판정 · 1 = 시나리오의 조건·기전을 정량 · 0 = 판정 무관  (v1.6: 구 \"목표 직결성\" 재정의)"],
      [{ text: "I2 파급 범위", bold: true }, "2 = 타 QA 수치 무효화(gate) 또는 복수 시나리오 요구 실패 · 1 = 단일 시나리오군 실패·산출물 수명 훼손 · 0 = 없음"],
      [{ text: "I3 VOC 대체\n불가성", bold: true }, "2 = 전용 VOC 존재·타 지표로 대체 불가 · 1 = 부분 대체 가능 · 0 = 간접"],
    ],
  });
  A.sectionHeader(s, { x: 6.8, y: ty, w: 6.05, text: "난이도 — ★★★ 도달의 설계 부담", color: "green" });
  A.specTable(s, {
    x: 6.8, y: ty + 0.42, w: 6.05, colW: [1.55, 4.5], fontSize: 7.8,
    header: ["세부 기준", "2점 / 1점 / 0점"],
    rows: [
      [{ text: "D1 신규 설계\n필요성", bold: true }, "2 = ★★★ 핵심 경로가 문헌 공백 · 1 = 일부 축만 신규 · 0 = 문헌 재현+조합"],
      [{ text: "D2 동시 충족 폭", bold: true }, "2 = 3중 이상 결합 충족 · 1 = 2중 · 0 = 단일"],
      [{ text: "D3 회복·가역성", bold: true }, "2 = 불가역 초기 결정·회복 수단 부재 · 1 = 조정 가능하나 고비용 · 0 = 반복 조정 가능"],
    ],
  });
  const cy = ty + 2.5;
  A.sectionHeader(s, { x: A.MARGIN, y: cy, w: 12.33, text: "채점표 — 점수가 곧 우선순위의 근거 (전 셀에 시나리오·VOC 앵커)", color: "navy" });
  A.specTable(s, {
    x: A.MARGIN, y: cy + 0.42, w: 12.33, colW: [1.5, 4.25, 3.7, 0.95, 1.93], fontSize: 7.6,
    highlightRows: [0, 1, 2, 3, 4],
    header: ["QA", "중요도 I1·I2·I3 → 등급", "난이도 D1·D2·D3 → 등급", "우선", "동률 해소"],
    rows: [
      [{ text: "QA1 Throughput", bold: true }, "2(용량·decode·스케줄링 시나리오 관통 판정)·2(복수 요구 실패)·2(R-01·11·16) = 6 → H 최고", "2(KV 공간 확보 정책 — 문헌 공백)·2(iso-latency×3메커니즘)·1 = 5 → H", "1", "중요도 단독 최고 — 규칙 ①만으로 1위"],
      [{ text: "QA2 Accuracy", bold: true }, "1(시나리오 품질 조건절)·2(gate — 전 수치 무효)·2(R-06) = 5 → H", "2(요청별 bound·3중 추적 — 문헌 공백)·2(3영향원×전 워크로드)·2(training-free) = 6 → H 최고", "2", "5점 동률군 — 난이도 최고로 선순위"],
      [{ text: "QA3 TTFT", bold: true }, "2(RAG·multiturn·agent 시나리오 판정)·1(시나리오군 실패)·2(R-03·04·05) = 5 → H", "1(agent 축만 신규 — 2/3 문헌 재현)·1·1 = 3 → M", "3", "QA4와 완전 동률(5·3) — 역할: 시나리오 최종 판정 > 기전"],
      [{ text: "QA4 유효 KV 용량", bold: true }, "2(용량 시나리오 공동 판정 — 기전 입증, R-02)·1·2(R-02) = 5 → H", "1(보수 pruning 제약 하 정책만 신규)·2(3중 제약)·0(운용 튜닝) = 3 → M", "4", "〃 — 기전(수단) 측"],
      [{ text: "QA5 확장성·진화성", bold: true }, "0·1(수명·2단계 접속점)·2(R-07·13·17·21) = 3 → M", "2(MLA·linear attention 경계 — 문헌 무해답)·1·2(공개 IF 불가역) = 5 → H", "5", "M그룹 단독 선정"],
    ],
  });
  s.addText("gate(QA2)가 시나리오 최종 판정(QA3)보다 앞서는 것은 우대가 아니라 rubric 점수의 귀결 — gate의 파급은 I2=2로 중요도에 반영, 동률군 순서는 ATAM 표준대로 난이도가 가른다. H/H는 QA1(중요도 최고)·QA2(난이도 최고) 2건뿐 — 축이 서로 다르다.", {
    x: A.MARGIN, y: A.CONTENT_BOTTOM - 0.38, w: 12.33, h: 0.38, fontSize: 8.4, fontFace: F.body, color: C.gray70, valign: "middle" });
}

// ── P27–31. 부록 C-1~5. QA별 평가 기준 ───────────────────────────────
function qaDetailPage({ page, band, title, headline, tag, defs, bins, evidence }) {
  const s = A.slide(pptx, { title, active: 1, band, page });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: headline, options: { bold: true, color: C.ink } },
    { text: "   " + tag, options: { color: C.navy, fontSize: 9, bold: true } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  const ty = TOPY + 0.4;
  A.sectionHeader(s, { x: A.MARGIN, y: ty, w: 7.15, text: "정의 · 측정 · Baseline", color: "navy" });
  A.bulletList(s, { x: A.MARGIN + 0.05, y: ty + 0.5, w: 7.05, h: 3.4, items: defs.map(d => (typeof d === "string" ? { text: d, fontSize: 9 } : { ...d, fontSize: 9 })) });
  A.sectionHeader(s, { x: 7.9, y: ty, w: 4.93, text: "별점 정량 bin", color: "green" });
  A.specTable(s, { x: 7.9, y: ty + 0.5, w: 4.93, colW: [0.85, 4.08], fontSize: 8.6, header: ["별점", "기준"], rows: bins });
  const ey = 5.05;
  A.sectionHeader(s, { x: A.MARGIN, y: ey, w: 12.33, text: "bin 근거 (A 자체 실측 · B 문헌 · C 구조 논증)", color: "navy" });
  s.addText(evidence.map(t => ({ text: t, options: { bullet: { characterCode: "25C6", indent: 8 }, fontSize: 8.8, fontFace: F.body, color: C.ink, breakLine: true, paraSpaceAfter: 4 } })),
    { x: A.MARGIN + 0.05, y: ey + 0.5, w: 12.23, h: A.CONTENT_BOTTOM - ey - 0.55, valign: "top" });
}

qaDetailPage({
  page: 27, band: "navy", title: "부록 C-1. QA1 Throughput (decode 성능)",
  headline: "QA1 — 용량·decode·스케줄링 시나리오의 관통 판정 지표: 이득이 시스템 처리량으로 전환되는가",
  tag: "[중요도 H(6 최고) · 난이도 H(5) · 우선순위 1]",
  defs: [
    { text: "정의: baseline 대비 생성 처리량 배율 (decode 축)", bold: true },
    "압축(중요도 기반 pruning 주 기법)·tier 확장이 KV 가용 용량을 키워 batch를 확대 — pruning은 토큰 수를 줄여 매 토큰 읽기량·attention 연산량까지 동시 절감",
    "KV 인지 스케줄링이 그 이득을 시스템 처리량으로 전환 (KV-blind면 전환 안 됨 — R-16)",
    { text: "측정: iso-latency 판정 — TPOT p99 ≤ baseline 운영점에서 배율 판정 (vLLM SOSP'23 방법론 B), throughput–latency 곡선 병행 (지연을 팔아 처리량을 산 구성 배제)", bold: true },
    "Baseline: 동일 HW · GPU HBM 단일 tier (QA3와 공유) — 순증분 분리",
    "ablation: 압축 off / KV-blind 스케줄링 대비 증분으로 순기여 분리 · 보조: decode wait 비중(자체 실측 70–85% A)·batch 분포",
  ],
  bins: [
    [{ text: "★★★", align: "center" }, "≥ 2× (iso-latency 판정)"],
    [{ text: "★★☆", align: "center" }, "1.5× – 2×"],
    [{ text: "★☆☆", align: "center" }, "< 1.5× 또는 iso-latency 조건 미충족"],
  ],
  evidence: [
    "pruning(주 기법): SnapKV — 프롬프트 KV 92% 축소로 생성 3.6×·메모리 8.2× (B) · H2O — KV 예산 20%로 처리량 3×(vs FlexGen)~29× (B, offloading baseline 대비 참고 상한)",
    "paging·양자화(조합): vLLM PagedAttention — 관리만으로 2–4× (B) · KIVI 2-bit — batch 4×로 처리율 2.35–3.47× (B)",
    "단독 기법 실측 하단이 모두 2×를 넘으므로 결합 시스템에 2×를 하한으로 요구 (C) — 1.5×는 단독 기법 도달선이라 ★★☆",
  ],
});
qaDetailPage({
  page: 28, band: "green", title: "부록 C-2. QA2 응답 품질 (bound · gate)",
  headline: "QA2 — 전 성능·용량 수치의 유효 전제(gate): bound 위반 시 QA1·3·4 수치 무효",
  tag: "[중요도 H(5) · 난이도 H(6 최고) · 우선순위 2]",
  defs: [
    { text: "정의: 압축·재사용·축출 선택으로 인한 품질 저하의 상한 보장 — 품질은 올리는 목표가 아니라 지키는 전제 (R-06)", bold: true },
    "품질 영향원 3중: ① 요청별 차등 압축 ② 비접두 재사용의 선택 재계산 ③ 스케줄링의 축출/강등 — 통합 추적 필요 (난이도 H의 근거)",
    { text: "측정: 주지표 ΔF1(%p) — LongBench QA 태스크군 공식 지표, 부분 일치 반영으로 저하에 민감 · 보조 ΔPPL(Wikitext-2, 선행 신호)", bold: true },
    "Baseline: 동일 모델·동일 벤치의 비압축(FP16 KV)·비재사용 — 품질의 이론적 상한이므로 ΔF1이 곧 압축·재사용의 품질 비용",
    "판정 축 추가: bound의 집행 단위 — 요청별(차등) vs 전역 · C-03(training-free)으로 재학습 회복 배제 — 런타임 구조로만 보장",
  ],
  bins: [
    [{ text: "★★★", align: "center" }, "ΔF1 ≤ 1%p (보조 ΔPPL ≤ 0.1) · 요청별 bound 집행"],
    [{ text: "★★☆", align: "center" }, "ΔF1 ≤ 2%p · 전역 bound만 보장"],
    [{ text: "★☆☆", align: "center" }, "ΔF1 > 2%p 또는 bound 자체를 보장 못 함"],
  ],
  evidence: [
    "2%p = 최대 압축단(2-bit) KIVI의 LongBench 실측 저하 상한 (B) — 극한 압축도 이 안이어야 함",
    "1%p = MLPerf 99% 트랙(B)보다 완화·KIVI 상한보다 엄격한 중간 경계 (C) — KIVI 평균 저하 Δ0.25점(B)이라 도달 가능 · LongBench 표본 오차 ≈0.5점과 같은 자릿수 (C) · 사내 기준 1%p 계승 (A)",
    "eviction도 동일 bound: H2O 예산 20% 동등 성능 (B) · SnapKV 92% 압축 negligible (B)",
    "요청별 집행 조건: 토큰 중요도는 쿼리 의존(SnapKV B)인데 재사용 KV는 미래 쿼리용 영속 — pruning×재사용 충돌(등재 쟁점)로 요청별 차등 집행 가능 여부가 bound 보장성을 가름 (C)",
  ],
});
qaDetailPage({
  page: 29, band: "navy", title: "부록 C-3. QA3 TTFT (prefill 성능)",
  headline: "QA3 — RAG·multiturn·agent 시나리오의 사용자 체감 판정 지표: 다시 만들지 않기의 효과",
  tag: "[중요도 H(5) · 난이도 M(3) · 우선순위 3]",
  defs: [
    { text: "정의: baseline 대비 TTFT 단축 배율 (prefill 축) — KV 재사용(prefix·비접두)·복원 vs 재계산 판단의 효과 축", bold: true },
    "대표 워크로드 3종을 동일 HW·동일 실행 구성에서 E2E 서빙 (retrieval은 외부 컴포넌트 — 양쪽 동일 적용)",
    { text: "측정: 워크로드 평균 기준 판정 · p99 분포 병행 — 재사용 hit/miss 이질성으로 꼬리는 cache-miss cold 요청이 지배 (평균 = 재사용 실효, p99 = cold-path)", bold: true },
    "Baseline: 동일 HW · GPU HBM 단일 tier (QA1과 공유) — 현행 표준 스택의 최선이므로 순증분 분리",
    "ablation: 재사용 off 대비 증분 · 보조: cache hit rate (중간 지표)",
  ],
  bins: [
    [{ text: "★★★", align: "center" }, "TTFT 단축 배율 ≥ 2×"],
    [{ text: "★★☆", align: "center" }, "1.5× – 2×"],
    [{ text: "★☆☆", align: "center" }, "< 1.5×"],
  ],
  evidence: [
    "CacheBlend (EuroSys'25 Best Paper) — RAG KV 재사용 + 선택 재계산(HKVD 10–15%)으로 TTFT 2.2–3.3× 단축, 품질 저하 F1/Rouge-L 0.01–0.03 (B)",
    "SGLang RadixAttention — prefix 재사용으로 prefill 재계산 제거 (B)",
    "2× = CacheBlend 하단 2.2×의 보수 반올림 (C) — prefix+비접두 결합·복원 판단을 갖춘 시스템의 하한. 1.5×는 단일 기법 부분 적용 도달선 (C)",
  ],
});
qaDetailPage({
  page: 30, band: "green", title: "부록 C-4. QA4 유효 KV 용량 (메모리 효율)",
  headline: "QA4 — 용량 시나리오의 공동 판정(기전 입증): 병목을 풀어서 올랐는가 (R-02 재현 검증)",
  tag: "[중요도 H(5) · 난이도 M(3) · 우선순위 4]",
  defs: [
    { text: "정의: 원본(비압축) 환산으로 동시 수용 가능한 KV 총량의 물리 HBM 대비 배율 — QA2 품질 bound를 지키는 조건에서만 인정", bold: true },
    "등가 표현: 동시 수용 가능한 컨텍스트 토큰 수의 배율 — \"몇 토큰어치를 서빙할 수 있나\"",
    { text: "측정: Σ_tier(tier 용량 × 평균 압축률 × KV 가용 비율) ÷ 물리 HBM 용량 — pruning은 압축률 = 토큰 보존률의 역수(예산 20% = 5×)로 동일 산입", bold: true },
    "분모가 HBM인 이유: HBM이 희소 자원 — \"HBM 한 장당 수용 컨텍스트\"가 비용 구조 결정",
    "Baseline: HBM 단일 tier·비압축 = 정의상 1.0× · 보조: tier 활용률·압축률 분포",
    "throughput으로 환원되지 않는 독립 가치: 수용 가능성(admit 여부) · 재사용 보관량→hit rate(→QA3) · 비용/검증(R-02)",
  ],
  bins: [
    [{ text: "★★★", align: "center" }, "유효 KV 용량 ≥ 3×"],
    [{ text: "★★☆", align: "center" }, "1.5× – 3×"],
    [{ text: "★☆☆", align: "center" }, "< 1.5× (압축 단독 대비 열위)"],
  ],
  evidence: [
    "압축 단독 도달선: KIVI 2-bit — peak memory 2.6× 절감·batch 4×를 near-lossless로 입증 (B) — 압축만 잘 써도 1.5×",
    "pruning 산술: H2O 예산 20% = 5× (B) — 도달선이 문헌화 (난이도 M의 근거)",
    "∴ tier 오프로딩과 압축을 함께 쓰는 시스템은 3×를 상위 bin으로 요구 (C) — 1.5× 미만이면 tier 도입의 존재 이유 미달 (C)",
  ],
});
qaDetailPage({
  page: 31, band: "navy", title: "부록 C-5. QA5 확장성·진화성 (Modifiability)",
  headline: "QA5 — KV 구조 변화·신규 tier 수용 비용: 코어/모듈 경계는 되돌리기 어려운 초기 결정",
  tag: "[중요도 M(3) · 난이도 H(5) · 우선순위 5]",
  defs: [
    { text: "정의: 신규 메모리 tier와 KV 구조 영향 모델 변화(GQA/MQA·MLA·sliding-window·linear attention 계열)의 수용 비용 — framework 결합 격리를 코어/모듈 지표로 대리 측정", bold: true },
    "(a) tier 추가: 1단계 commodity 조합 변경 + 2단계 디바이스 파라미터 대입 사전 검증(R-07 접속점 보존) — 신규/변경 모듈 수 · 코어 변경 LOC 비율 · 공개 IF(KV Locator·CompressionOp) 시그니처 변경 건수",
    "(b) 모델 변화: 수용 리드타임 (upstream 공개 시점 기준) — MLA는 KV 정의 변경, linear attention은 고정 크기 상태로 KV 대체",
    "코어/모듈 판별: 수정 시 다른 모듈 재검증 필요하면 코어, 그 부품만 재검증이면 모듈 (시그니처 변경은 항상 코어)",
    "Baseline: 현행 코드베이스",
  ],
  bins: [
    [{ text: "★★★", align: "center" }, "tier 추가 = 파라미터 등록 + 어댑터 ≤ 1 · 코어 LOC 0 · 시그니처 0건 · 수용 ≤ upstream + 2주"],
    [{ text: "★★☆", align: "center" }, "코어 변경 ≤ 40% · 하위호환 시그니처만 · ≤ upstream + 1분기"],
    [{ text: "★☆☆", align: "center" }, "코어 > 40% · 비호환 시그니처 · 수용 > 1분기 (만성 지연)"],
  ],
  evidence: [
    "40% = Architect 과제 원본 덱 QA-01의 사내 측정 기준 계승 (A)",
    "upstream + 2주 = vLLM 정규 릴리스 2주 간격 (B) — 한 릴리스 주기 내 추종 = 실질 동시 지원 · 1분기 초과 ≈ 릴리스 6회 누락 → 만성 열세 (C)",
    "모델 변화의 실재: MLA — latent KV로 KV 정의 자체 변경 (B) · linear attention — KV를 고정 크기 순환 상태로 대체, MiniMax-01 상용 배치 (B)",
  ],
});

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_requirements_kv.pptx")).then(() => console.log("written"));
