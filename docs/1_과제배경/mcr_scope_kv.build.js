// Regenerate: NODE_PATH=<dir-with-pptxgenjs> node docs/1_과제배경/mcr_scope_kv.build.js
// 과제 범위 1장 (세로 2단)
//   좌측: 전체 AI SW 스택 — 본 과제(추론 서빙 런타임) 영역 강조
//   우측: 그 영역 확대 = MCR 전체 구조도(확정안 v2) 위에 1단계(KV 캐시 최적 운용) 범위 표시
//        — 자사 computable memory(CXL/CMM·PIM·PNM/HBF)·근접연산 활용부는 2단계(범위 외)로 해칭
// 자산: docs/mcr_assets/scope_ai_stack.svg(.png) · scope_mcr_stage1.svg(.png — mcr_package_diagram_v2 파생)
const path = require("path");
const A = require(path.join(__dirname, "..", "..", ".claude", "skills", "architect-ppt", "lib", "architect_deck"));
const C = A.COLORS, F = A.FONT;
const img = f => path.join(__dirname, "..", "mcr_assets", f);

const pptx = A.newDeck();
const s = A.slide(pptx, { title: "과제 범위", active: 0, band: "green", page: 3 });

const H_Y = A.CONTENT_TOP;
const TOP = H_Y + 0.34 + 0.10;
const BOTTOM = A.CONTENT_BOTTOM;
const HAVAIL = BOTTOM - TOP;

// 좌측: AI SW 스택 (700×900)
const LX = A.MARGIN, LH = HAVAIL, LWimg = LH * (700 / 900);
A.sectionHeader(s, { x: LX, y: H_Y, w: 4.45, text: "① 전체 AI SW 스택 — 본 과제 = 추론 서빙 런타임 계층", color: "navy", fontSize: 11.5 });
s.addImage({ path: img("scope_ai_stack.png"), x: LX + (4.45 - LWimg) / 2, y: TOP, w: LWimg, h: LH });

// 우측: MCR 구조도 + 1단계 범위 (1400×1360)
const RH = HAVAIL, RWimg = RH * (1400 / 1360);
const RX = 13.333 - A.MARGIN - RWimg - 0.05;
A.sectionHeader(s, { x: RX, y: H_Y, w: RWimg, text: "② 런타임 확대: MCR 전체 구조(확정안 v2)와 1단계 범위", color: "green", fontSize: 11.5 });
s.addImage({ path: img("scope_mcr_stage1.png"), x: RX, y: TOP, w: RWimg, h: RH });

// 가운데 확대 화살표
const AX = LX + 4.45 + 0.10, AW = RX - AX - 0.10;
s.addShape("rightArrow", { x: AX, y: TOP + HAVAIL * 0.42 - 0.16, w: AW, h: 0.32, fill: { color: C.grayArrow }, line: { type: "none" } });
s.addText("확대", { x: AX - 0.05, y: TOP + HAVAIL * 0.42 - 0.52, w: AW + 0.1, h: 0.3, align: "center", fontFace: F.head, fontSize: 10, bold: true, color: C.gray70 });

A.writeDeck(pptx, process.argv[2] || path.join(__dirname, "mcr_scope_kv.pptx")).then(() => console.log("written"));
