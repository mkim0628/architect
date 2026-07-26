// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/mcr_requirements_kv.build.js
// 요구사항 챕터 5장 (구 mcr_requirements_2 덱 양식 승계 — 1단계·v1.6 개정 반영)
//   P5 요구사항 수집 (stakeholder + 방법) / P6 요구사항 정제 (FR·C + UC diagram)
//   P7 대표 워크로드 시나리오별 QA 도출 (v1.6 신설 — 요구사항→QA 방향)
//   P8 Utility Tree ASR 선정 (채점 입력 = 시나리오·VOC — 목표 문장 참조 금지)
//   P25 부록 A 원시 요구사항(VOC) R-01~R-24
// 근거: docs/00_requirements_analysis.md v1.6 · 00_qa_definitions.md v1.6
const path = require("path");
const A = require(path.join(__dirname, "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const C = A.COLORS, F = A.FONT;
const pptx = A.newDeck();
const TOPY = A.CONTENT_TOP;

// ── P5. 요구사항 수집 ────────────────────────────────────────────────
{
  const s = A.slide(pptx, { title: "요구사항 수집", active: 1, band: "navy", page: 5 });
  s.addText([
    { text: "○ ", options: { color: C.navy, bold: true } },
    { text: "Stakeholder 인터뷰·QAW + 자체 실측·문헌 조사 병행 → 원시 요구사항 24건(결번 1, 유효 23건) 수집", options: { bold: true, color: C.ink } },
    { text: "  — 서비스 운영 조직은 stakeholder 아님(연구 과제): 서빙 SLO·워크로드 요구는 문헌·자체 실측으로 대체 수집", options: { color: C.gray70, fontSize: 9 } },
  ], { x: A.MARGIN, y: TOPY - 0.02, w: 12.3, h: 0.3, fontSize: 10.5, fontFace: F.body, valign: "middle" });
  let y = A.sectionHeader(s, { x: A.MARGIN, y: TOPY + 0.34, w: 7.1, text: "주요 Stakeholder 및 역할", color: "navy" });
  A.specTable(s, {
    x: A.MARGIN, y: y + 0.08, w: 7.1, colW: [1.7, 5.4], fontSize: 8,
    header: ["Stakeholder", "역할 · 주요 관심사"],
    rows: [
      ["메모리 사업부", "과제 발주 일원 — memory-centric 제품군 로드맵. E2E 제품 가치·근접연산 실증은 2단계 배정(R-07·09), 1단계엔 tier 추상화 접속점 보존 요구"],
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
    { text: "수집 24건(유효 23건) → 기능 요구사항 7건 · 품질 요구(QA 후보) 11건 · 제약사항 3건 · 범위 판정 1건 · 2단계 배정 2건(R-07·09)", options: { bold: true, color: C.ink } },
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
  s.addImage({ path: path.join(__dirname, "mcr_assets", "req_usecase_mcr.png"), x: 8.1, y: TOPY + 0.84, w: 4.73, h: 4.73 * 760 / 1080 });
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
    ["R-07", "메모리 사업부", "E2E 관점의 자사 제품 가치 확인", "2단계 배정"],
    ["R-08", "메모리 사업부", "자체 레퍼런스 스택 보유 → 고객 제공", "FR-01 (QA-06 미선정)"],
    ["R-09", "메모리 사업부", "PIM/PNM 연산 효용성의 E2E 테스트", "2단계 배정"],
    ["R-10", "메모리 사업부", "디바이스 HW 스펙 변경 불가 — 주어진 스펙 전제", "C-01"],
    ["R-11", "개발 임원", "GPU HBM 단일 tier baseline 대비 E2E 정량 입증·벤치 완주", "QA-01·03, FR-01·06"],
    ["R-12", "개발 임원", "종료 후 소수 인력 유지 가능 — 상시 전담팀 불가", "(QA-06 미선정 — DP1 비용 모델)"],
  ];
  const rows2 = [
    ["R-13", "MCR 개발팀", "vLLM 2주 릴리스 — 구조에 따라 추종 비용이 수십 인월로 갈림", "QA-05 (QA-06 미선정)"],
    ["R-14", "—", "(결번 — 자체 압축·재사용 알고리즘 개발이 과제 범위)", "—"],
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

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_requirements_kv.pptx")).then(() => console.log("written"));
