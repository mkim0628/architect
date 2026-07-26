# KV 캐시 최적 운용 (1단계) DP1-DP5 slide assets
# - diagrams/kv_dp{3,4,5}_candidates.png : md 문서 임베드용 2-panel 설계도
# - docs/mcr_assets/kvdp/dp{1..5}_problem.png, dp{1..5}_c{1,2}.png : PPT용
# Regenerate: python3 docs/mcr_assets/make_kv_dp_assets.py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os
import PIL.Image as I

NAVY = "#1F3864"; GREEN = "#4E7C3A"; RED = "#B3402A"; GRAY = "#9AA0A6"
CREAM = "#FFF2CC"; PANEL = "#F5F6F8"; ORANGE = "#ED7D31"; DGREEN = "#2C4A20"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "kvdp")
DIAG = os.path.normpath(os.path.join(HERE, "..", "..", "diagrams"))
os.makedirs(OUT, exist_ok=True)

def box(ax, x, y, w, h, text, fc=PANEL, ec=GRAY, fs=8.3, tc="#262626", bold=False, ls="-"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.015",
                                fc=fc, ec=ec, lw=1.4, linestyle=ls))
    ax.text(x + w/2, y + h/2, text, ha="center", va="center", fontsize=fs,
            color=tc, fontweight="bold" if bold else "normal")

def arrow(ax, x1, y1, x2, y2, color=GRAY, lw=1.6, style="-|>", ls="-"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                                 color=color, lw=lw, linestyle=ls, mutation_scale=13))

def newax(title, sub=None, subcolor=ORANGE, figsize=(5.8, 4.4)):
    fig, ax = plt.subplots(figsize=figsize, dpi=200)
    ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")
    ax.set_title(title, fontsize=10.5, color=NAVY, fontweight="bold")
    if sub:
        ax.text(5, 9.55, sub, fontsize=7.8, color=subcolor, ha="center",
                style="italic", fontweight="bold")
    return fig, ax

def two_panel(fname_combined, draw1, draw2, t1, s1, t2, s2, crop1=None, crop2=None):
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(11.6, 4.6), dpi=200)
    for ax, t, s in ((a1, t1, s1), (a2, t2, s2)):
        ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")
        ax.set_title(t, fontsize=10.5, color=NAVY, fontweight="bold")
        if s:
            ax.text(5, 9.55, s, fontsize=7.6, color=ORANGE, ha="center",
                    style="italic", fontweight="bold")
    draw1(a1); draw2(a2)
    plt.tight_layout()
    plt.savefig(fname_combined, bbox_inches="tight")
    plt.close(fig)
    if crop1 and crop2:
        img = I.open(fname_combined); w, h = img.size
        img.crop((0, 0, w//2, h)).save(crop1)
        img.crop((w//2, 0, w, h)).save(crop2)

def save_problem(fig, name):
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, name), bbox_inches="tight")
    plt.close(fig)

# ════════════════════════════════════════════════════════════════════
# DP1 — 실행 스택 소싱
# ════════════════════════════════════════════════════════════════════
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.6, 3.5), dpi=200)
for ax in (a1, a2): ax.axis("off"); ax.set_xlim(0, 10); ax.set_ylim(0, 10)
a1.set_title("(a) Two pressures on the sourcing boundary", fontsize=9.5, color=NAVY, fontweight="bold")
box(a1, 0.3, 5.6, 4.3, 3.4, "ADOPT (vLLM ecosystem)\nbatching / kernels / models\n2-week releases\n+ LMCache KV layer\n(CacheBlend inherited)", fc="#EAF1E7", ec=GREEN, fs=8, tc=DGREEN, bold=True)
box(a1, 5.4, 5.6, 4.3, 3.4, "BUILD (own runtime)\ngoal-mechanisms 1st-class:\nlayer-boundary selector hook\nper-request pruning point\nKV-aware scheduler hook", fc="#EDEFF4", ec=NAVY, fs=8, tc=NAVY, bold=True)
box(a1, 2.1, 2.2, 5.8, 1.7, "extension points cover them?\nconnector / attn backend / plugin\nvs. residual OUTSIDE (RFC needed)", fc=CREAM, ec="#7A5C2E", fs=8, bold=True)
arrow(a1, 2.4, 5.6, 4.0, 3.9, color=GREEN); arrow(a1, 7.6, 5.6, 6.0, 3.9, color=NAVY)
a1.text(5.0, 0.9, "cost model: <=6 man-months vs >24 (build) - one order of magnitude", fontsize=7.6, ha="center", color=RED)
a2.set_title("(b) Where the 3 mechanisms must live", fontsize=9.5, color=NAVY, fontweight="bold")
box(a2, 0.4, 7.4, 9.2, 1.4, "vLLM core (scheduler / block table / prefill loop)", fc=PANEL, ec=GRAY, fs=8.5)
box(a2, 0.5, 5.0, 2.8, 1.7, "selector hook\n(layer boundary)", fc="#FBE4E0", ec=RED, fs=7.8, tc=RED, bold=True)
box(a2, 3.6, 5.0, 2.8, 1.7, "KV-aware\nadmission", fc="#FBE4E0", ec=RED, fs=7.8, tc=RED, bold=True)
box(a2, 6.7, 5.0, 2.8, 1.7, "per-request\npruning point", fc="#FDEBDD", ec=ORANGE, fs=7.8, tc=ORANGE, bold=True)
for x in (1.9, 5.0, 8.1): arrow(a2, x, 6.7, x, 7.4, color=RED, ls="--")
a2.text(5.0, 4.2, "red: outside today's extension points -> RFC or own core", fontsize=7.8, ha="center", color=RED)
box(a2, 0.4, 1.6, 9.2, 1.6, "commodity tiers:  HBM | DRAM | NVMe SSD", fc="#EDEFF4", ec=NAVY, fs=8.5)
save_problem(fig, "dp1_problem.png")

def dp1c1(ax):
    box(ax, 0.3, 8.0, 9.4, 1.2, "MCR Inference Orchestration (outside vLLM)", fc="#EDEFF4", ec=NAVY, fs=8.3, bold=True)
    box(ax, 0.3, 4.6, 5.4, 2.8, "vLLM (Inference Engine, unmodified)\nextension points:\nKV connector | attn backend | plugin", fc=PANEL, ec=GRAY, fs=8)
    box(ax, 6.1, 4.6, 3.6, 2.8, "MCR Memory Engine\n(variant A: own skeleton)\n--- or ---\nLMCache (variant B)", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
    arrow(ax, 5.7, 6.0, 6.1, 6.0, color=ORANGE)
    arrow(ax, 5.0, 8.0, 5.0, 7.4)
    box(ax, 0.3, 1.2, 9.4, 1.5, "Tiered KV Store  [ HBM | DRAM | NVMe SSD ]", fc="#EDEFF4", ec=NAVY, fs=8.5)
    arrow(ax, 7.9, 4.6, 7.9, 2.7, color=ORANGE)
    ax.text(5.0, 0.4, "risk: selector hook & KV-aware admission sit outside extension points", fontsize=7.4, ha="center", color=RED)

def dp1c2(ax):
    box(ax, 0.3, 8.0, 9.4, 1.2, "MCR framework (own scheduler - KV-aware admission)", fc="#FDEBDD", ec=ORANGE, fs=8.3, bold=True)
    box(ax, 0.3, 4.6, 4.5, 2.8, "Execution core (own)\nbatching / chunked prefill\nlayer-boundary selector hook\n(FlashInfer / own kernels)", fc="#FDEBDD", ec=ORANGE, fs=7.8, bold=True)
    box(ax, 5.2, 4.6, 4.5, 2.8, "Memory Engine (own)\ntier-agnostic block table\nnon-contiguous chunk KV\n= 1st-class citizens", fc="#FDEBDD", ec=ORANGE, fs=7.8, bold=True)
    arrow(ax, 4.8, 6.0, 5.2, 6.0, color=ORANGE)
    arrow(ax, 5.0, 8.0, 5.0, 7.4, color=ORANGE)
    box(ax, 0.3, 1.2, 9.4, 1.5, "Tiered KV Store  [ HBM | DRAM | NVMe SSD ]", fc="#EDEFF4", ec=NAVY, fs=8.5)
    arrow(ax, 7.4, 4.6, 7.4, 2.7, color=ORANGE)
    ax.text(5.0, 0.4, "risk: re-implement vLLM's accumulated baseline (>24 man-months)", fontsize=7.4, ha="center", color=RED)

two_panel(os.path.join(OUT, "dp1_cands.png"), dp1c1, dp1c2,
          "C1  External stack (vLLM ecosystem)", "new: Memory Engine injected via extension points",
          "C2  Self-built (independent framework)", "new: entire stack owned - clean KV-first design",
          os.path.join(OUT, "dp1_c1.png"), os.path.join(OUT, "dp1_c2.png"))

# ════════════════════════════════════════════════════════════════════
# DP2 — 관리 주체
# ════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(9.6, 3.5), dpi=200)
ax.axis("off"); ax.set_xlim(0, 10); ax.set_ylim(0, 10)
ax.set_title("Information asymmetry: who decides placement / pruning / eviction / mediation?", fontsize=9.5, color=NAVY, fontweight="bold")
box(ax, 0.3, 6.2, 4.4, 2.9, "Orchestration knows\nREQUEST CONTEXT\nSLO class - reuse probability\nquality budget per request", fc="#EDEFF4", ec=NAVY, fs=8.2, tc=NAVY, bold=True)
box(ax, 5.3, 6.2, 4.4, 2.9, "Memory Engine knows\nRESOURCE STATE (fresh)\ntier occupancy - bandwidth\npressure spikes (us~ms)", fc="#EAF1E7", ec=GREEN, fs=8.2, tc=DGREEN, bold=True)
box(ax, 2.3, 3.0, 5.4, 1.9, "decisions needing BOTH:\nplacement - pruning budget - eviction\npromote/demote - restore vs recompute\npruning x reuse mediation", fc=CREAM, ec="#7A5C2E", fs=7.9, bold=True)
arrow(ax, 2.5, 6.2, 4.2, 4.9, color=NAVY); arrow(ax, 7.5, 6.2, 5.8, 4.9, color=GREEN)
ax.text(2.5, 1.6, "central policy: global optimum,\nbut request-granularity loop\nmisses us spikes", fontsize=7.7, ha="center", color=NAVY)
ax.text(7.5, 1.6, "autonomous: us reaction,\nbut context-blind demotion\nhurts reuse & quality", fontsize=7.7, ha="center", color=DGREEN)
ax.text(5.0, 0.3, "isomorphic: OS paging - kernel policy vs madvise hints vs full app control", fontsize=7.6, ha="center", color="#7F7F7F", style="italic")
save_problem(fig, "dp2_problem.png")

def dp2c1(ax):
    box(ax, 0.3, 7.2, 9.4, 2.0, "Orchestration / Scheduling\n+ KV Placement & Compression Policy (NEW - central)", fc="#FDEBDD", ec=ORANGE, fs=8.3, bold=True)
    box(ax, 0.3, 3.8, 9.4, 1.8, "Memory Engine = executor only (mechanism)", fc=PANEL, ec=GRAY, fs=8.5)
    arrow(ax, 3.0, 7.2, 3.0, 5.6, color=ORANGE, lw=2.4)
    ax.text(3.15, 6.4, "directives:\ntier/budget/evict", fontsize=7.3, color=ORANGE)
    arrow(ax, 7.0, 5.6, 7.0, 7.2, color=NAVY, lw=2.4)
    ax.text(7.15, 6.4, "state reports\n(continuous, wide)", fontsize=7.3, color=NAVY)
    box(ax, 0.3, 1.0, 9.4, 1.5, "Tiered KV Store  [ HBM | DRAM | SSD ]", fc="#EDEFF4", ec=NAVY, fs=8.5)
    arrow(ax, 5.0, 3.8, 5.0, 2.5)
    ax.text(5.0, 0.3, "risk: request-granularity loop late on us pressure spikes", fontsize=7.4, ha="center", color=RED)

def dp2c2(ax):
    box(ax, 0.3, 7.2, 9.4, 1.6, "Orchestration - thin HINT API only\n(pin - priority - total quality budget)", fc=PANEL, ec=GRAY, fs=8.3)
    box(ax, 0.3, 3.8, 9.4, 2.4, "Memory Engine / Cache Manager (autonomous - NEW policy inside)\ntemperature promote/demote - watermark pruning trigger\nlocal eviction + conservative reuse-tag rule", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
    arrow(ax, 5.0, 7.2, 5.0, 6.2, color=GRAY, lw=1.4, ls="--")
    ax.text(5.6, 6.6, "hints (thin)", fontsize=7.3, color=GRAY)
    box(ax, 0.3, 1.0, 9.4, 1.5, "Tiered KV Store  [ HBM | DRAM | SSD ]", fc="#EDEFF4", ec=NAVY, fs=8.5)
    arrow(ax, 5.0, 3.8, 5.0, 2.5, color=ORANGE)
    ax.text(5.0, 0.3, "risk: context-blind - demotes reusable KV, per-request budget impossible", fontsize=7.4, ha="center", color=RED)

two_panel(os.path.join(OUT, "dp2_cands.png"), dp2c1, dp2c2,
          "C1  Central policy (orchestration)", "new: central KV policy component - engine executes",
          "C2  Memory Engine autonomous (madvise model)", "new: local policies + thin hint API",
          os.path.join(OUT, "dp2_c1.png"), os.path.join(OUT, "dp2_c2.png"))

# ════════════════════════════════════════════════════════════════════
# DP3 — 재사용: 선택 연산의 실행 구조
# ════════════════════════════════════════════════════════════════════
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.6, 3.5), dpi=200)
for ax in (a1, a2): ax.axis("off"); ax.set_xlim(0, 10); ax.set_ylim(0, 10)
a1.set_title("(a) Non-contiguous reuse needs selective recompute", fontsize=9.5, color=NAVY, fontweight="bold")
for i, xx in enumerate([0.4, 2.4, 4.4]):
    box(a1, xx, 7.3, 1.8, 1.4, f"chunk KV {i+1}\n(stored)", fc="#EDEFF4", ec=NAVY, fs=7.6)
box(a1, 6.6, 7.3, 3.0, 1.4, "query\n(arrives now)", fc=CREAM, ec="#7A5C2E", fs=7.8, bold=True)
box(a1, 0.4, 4.4, 9.2, 1.6, "stitched context: cross-attention broken at boundaries\n-> recompute only the tokens that matter (10-15%, CacheBlend)", fc="#FBE4E0", ec=RED, fs=7.9, tc=RED, bold=True)
for xx in (1.3, 3.3, 5.3, 8.1): arrow(a1, xx, 7.3, xx, 6.0, color=GRAY)
a1.text(5.0, 3.0, "selection is query-aware -> must run ONLINE at request time", fontsize=8.2, ha="center", color=NAVY, fontweight="bold")
a1.text(5.0, 1.6, "TTFT 2.2-3.3x, quality delta 0.01-0.03 (B) - the prize if selection is right", fontsize=7.6, ha="center", color=DGREEN)
a2.set_title("(b) Open axis: WHERE / WHEN does selection run?", fontsize=9.5, color=NAVY, fontweight="bold")
box(a2, 3.1, 7.7, 3.8, 1.4, "selection\ncompute", fc=CREAM, ec="#7A5C2E", fs=8.5, bold=True)
box(a2, 0.4, 3.9, 4.3, 2.6, "C1 IN-ENGINE (exact)\nfused with prefill layer 1\nreal K/V deviation scores", fc="#EAF1E7", ec=GREEN, fs=7.9, tc=DGREEN, bold=True)
box(a2, 5.3, 3.9, 4.3, 2.6, "C2 PROXY (speculative)\nbefore prefill, off GPU\napprox attention scout", fc="#EDEFF4", ec=NAVY, fs=7.9, tc=NAVY, bold=True)
arrow(a2, 4.0, 7.7, 2.5, 6.5, color=GREEN); arrow(a2, 6.0, 7.7, 7.5, 6.5, color=NAVY)
a2.text(2.5, 2.9, "cost: engine-core wiring,\npeak GPU cycles", fontsize=7.5, ha="center", color=RED)
a2.text(7.5, 2.9, "cost: approximation error\n-> conservative ratio -> TTFT", fontsize=7.5, ha="center", color=RED)
a2.text(5.0, 1.2, "isomorphic: branch prediction / speculative execution", fontsize=7.8, ha="center", color="#7F7F7F", style="italic")
save_problem(fig, "dp3_problem.png")

def dp3c1(ax):
    box(ax, 0.3, 8.0, 9.4, 1.2, "request -> prefill starts immediately", fc=PANEL, ec=GRAY, fs=8.3)
    box(ax, 0.3, 5.4, 4.4, 1.9, "Layer 1: full pass\n+ FUSED selector\n(real deviation scores)", fc="#FDEBDD", ec=ORANGE, fs=7.9, bold=True)
    box(ax, 5.1, 5.4, 4.6, 1.9, "Layers 2..N:\nrecompute selected 10-15%\n(overlapped with loading)", fc="#EAF1E7", ec=GREEN, fs=7.9, tc=DGREEN, bold=True)
    arrow(ax, 4.7, 6.3, 5.1, 6.3, color=ORANGE)
    arrow(ax, 5.0, 8.0, 5.0, 7.3)
    box(ax, 0.3, 2.6, 9.4, 1.5, "hook location: ENGINE EXECUTION LOOP (layer boundary)", fc="#FBE4E0", ec=RED, fs=8.2, tc=RED, bold=True)
    arrow(ax, 2.5, 5.4, 2.5, 4.1, color=RED, ls="--")
    ax.text(5.0, 1.6, "exact selection (zero approx error) - literature-anchored TTFT 2.2-3.3x", fontsize=7.4, ha="center", color=DGREEN)
    ax.text(5.0, 0.7, "cost: core wiring (release chasing) + peak GPU cycles for selection", fontsize=7.4, ha="center", color=RED)

def dp3c2(ax):
    box(ax, 0.3, 8.0, 3.2, 1.2, "retrieval returns", fc=PANEL, ec=GRAY, fs=8)
    box(ax, 3.9, 7.7, 5.8, 1.8, "Proxy Selector (NEW - outside engine)\nreduced model / low-rank approx\non CPU / side stream", fc="#FDEBDD", ec=ORANGE, fs=7.9, bold=True)
    arrow(ax, 3.5, 8.6, 3.9, 8.6, color=ORANGE)
    box(ax, 3.9, 5.3, 5.8, 1.5, "plan fixed BEFORE prefill:\nrecompute set + loading order", fc=CREAM, ec="#7A5C2E", fs=7.9, bold=True)
    arrow(ax, 6.8, 7.7, 6.8, 6.8, color=ORANGE)
    box(ax, 0.3, 2.8, 9.4, 1.7, "prefill executes plan: load || recompute || prefetch\n(engine unmodified - max pipeline overlap)", fc="#EAF1E7", ec=GREEN, fs=8, tc=DGREEN, bold=True)
    arrow(ax, 6.8, 5.3, 6.8, 4.5, color=GREEN)
    ax.text(5.0, 1.6, "engine-free: swap proxy = swap algorithm (research track fit)", fontsize=7.4, ha="center", color=DGREEN)
    ax.text(5.0, 0.7, "cost: scout can be wrong -> quality risk or conservative recompute ratio", fontsize=7.4, ha="center", color=RED)

two_panel(os.path.join(DIAG, "kv_dp3_candidates.png"), dp3c1, dp3c2,
          "C1  In-engine fused selection (exact)", "selector hook inside the prefill loop",
          "C2  Lightweight proxy selection (speculative)", "independent component before prefill",
          os.path.join(OUT, "dp3_c1.png"), os.path.join(OUT, "dp3_c2.png"))

# ════════════════════════════════════════════════════════════════════
# DP4 — 압축: 집행 시점 x 자산 표현
# ════════════════════════════════════════════════════════════════════
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.6, 3.5), dpi=200)
for ax in (a1, a2): ax.axis("off"); ax.set_xlim(0, 10); ax.set_ylim(0, 10)
a1.set_title("(a) Pruning pays twice - but importance is query-dependent", fontsize=9.5, color=NAVY, fontweight="bold")
box(a1, 0.4, 7.2, 9.2, 1.5, "token pruning: budget 20% ~= 5x capacity AND per-token read cut\n(H2O full-cache parity, SnapKV 3.6x gen speed)", fc="#EAF1E7", ec=GREEN, fs=7.8, tc=DGREEN, bold=True)
box(a1, 0.4, 4.2, 4.3, 2.2, "importance judged by\nCURRENT query\n(SnapKV: query-aware)", fc="#EDEFF4", ec=NAVY, fs=8, tc=NAVY, bold=True)
box(a1, 5.3, 4.2, 4.3, 2.2, "KV persisted for\nFUTURE queries\n(reuse, FR-02)", fc="#EDEFF4", ec=NAVY, fs=8, tc=NAVY, bold=True)
box(a1, 2.4, 1.4, 5.2, 1.9, "pruning x reuse CONFLICT:\ntoken pruned today may be\ntomorrow's answer evidence", fc="#FBE4E0", ec=RED, fs=8, tc=RED, bold=True)
arrow(a1, 2.5, 4.2, 4.2, 3.3, color=NAVY); arrow(a1, 7.5, 4.2, 5.8, 3.3, color=NAVY)
a2.set_title("(b) Open axis: WHEN to prune x WHAT remains", fontsize=9.5, color=NAVY, fontweight="bold")
box(a2, 0.4, 5.4, 4.3, 3.0, "C1 EAGER, destructive\nprune once at prefill exit\npruned = ONLY copy\nirreversible", fc="#EAF1E7", ec=GREEN, fs=7.9, tc=DGREEN, bold=True)
box(a2, 5.3, 5.4, 4.3, 3.0, "C2 ADAPTIVE, reversible\noriginal demoted (kept)\n+ pruned views per request\n+ quality feedback", fc="#EDEFF4", ec=NAVY, fs=7.9, tc=NAVY, bold=True)
a2.text(2.5, 4.4, "max savings (QA1-QA4)\ngate risk (QA2)", fontsize=7.7, ha="center", color=RED)
a2.text(7.5, 4.4, "per-request bound (QA2)\ndual-copy + complexity cost", fontsize=7.7, ha="center", color=RED)
a2.text(5.0, 2.6, "isomorphic: destructive compaction  vs  tiering with derived views", fontsize=7.8, ha="center", color="#7F7F7F", style="italic")
a2.text(5.0, 1.4, "C-03 training-free: no retraining recovery - what is deleted is gone", fontsize=7.6, ha="center", color=RED)
save_problem(fig, "dp4_problem.png")

def dp4c1(ax):
    box(ax, 0.3, 8.0, 9.4, 1.2, "prefill done -> Prefill-exit Pruner (NEW, single hook)", fc="#FDEBDD", ec=ORANGE, fs=8.2, bold=True)
    box(ax, 0.3, 5.5, 9.4, 1.6, "PRUNED KV = the only copy (global budget, e.g. 20%)", fc="#EAF1E7", ec=GREEN, fs=8.4, tc=DGREEN, bold=True)
    arrow(ax, 5.0, 8.0, 5.0, 7.1, color=ORANGE)
    for xx, lab in ((1.4, "store /\ndemote"), (4.4, "persist\n(sessions)"), (7.4, "reuse\nload")):
        box(ax, xx, 3.0, 2.2, 1.6, lab, fc=PANEL, ec=GRAY, fs=7.8)
        arrow(ax, xx+1.1, 5.5, xx+1.1, 4.6)
    ax.text(5.0, 1.9, "every path lighter by the budget ratio - arithmetic 5x", fontsize=7.6, ha="center", color=DGREEN)
    ax.text(5.0, 0.9, "risk: irreversible - future query hitting pruned-away tokens has no recovery", fontsize=7.4, ha="center", color=RED)

def dp4c2(ax):
    box(ax, 0.3, 8.0, 9.4, 1.2, "Lifecycle Pruning Manager (NEW) + quality feedback loop (FR-07)", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
    box(ax, 0.3, 5.2, 4.4, 1.9, "UPPER tier:\npruned VIEWS per request\n(budget from SLO/quality)", fc="#EAF1E7", ec=GREEN, fs=7.8, tc=DGREEN, bold=True)
    box(ax, 5.3, 5.2, 4.4, 1.9, "LOWER tier:\nORIGINAL kept (demoted,\nnot destroyed)", fc="#EDEFF4", ec=NAVY, fs=7.8, tc=NAVY, bold=True)
    arrow(ax, 5.3, 6.1, 4.7, 6.1, color=ORANGE)
    ax.text(5.0, 6.5, "derive", fontsize=7.2, color=ORANGE, ha="center")
    box(ax, 0.3, 2.8, 9.4, 1.5, "KV Index: dual representation (original <-> derived views)", fc=CREAM, ec="#7A5C2E", fs=8.2, bold=True)
    arrow(ax, 2.5, 5.2, 2.5, 4.3); arrow(ax, 7.5, 5.2, 7.5, 4.3)
    ax.text(5.0, 1.7, "reversible: re-derive for any future query - per-request dF1 bound holds", fontsize=7.4, ha="center", color=DGREEN)
    ax.text(5.0, 0.8, "cost: dual copies eat lower-tier capacity + consistency management", fontsize=7.4, ha="center", color=RED)

two_panel(os.path.join(DIAG, "kv_dp4_candidates.png"), dp4c1, dp4c2,
          "C1  Fixed budget at entry - single copy (eager)", "one hook, destructive, maximum savings",
          "C2  Lifecycle-adaptive - dual representation", "original preserved, per-request derived views",
          os.path.join(OUT, "dp4_c1.png"), os.path.join(OUT, "dp4_c2.png"))

# ════════════════════════════════════════════════════════════════════
# DP5 — 스케줄링: locality vs load
# ════════════════════════════════════════════════════════════════════
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.6, 3.5), dpi=200)
for ax in (a1, a2): ax.axis("off"); ax.set_xlim(0, 10); ax.set_ylim(0, 10)
a1.set_title("(a) Today: KV-blind scheduling", fontsize=9.5, color=NAVY, fontweight="bold")
box(a1, 0.4, 7.4, 9.2, 1.3, "Router: load metrics only - scatters requests anywhere", fc=PANEL, ec=GRAY, fs=8.2)
for i, xx in enumerate([0.6, 3.9, 7.2]):
    has = "reusable KV HERE" if i == 1 else "no KV"
    col = GREEN if i == 1 else GRAY
    box(a1, xx, 4.6, 2.6, 1.8, f"instance {i+1}\n({has})", fc="#EAF1E7" if i == 1 else PANEL, ec=col, fs=7.8, bold=(i == 1))
    arrow(a1, 2.0 + i*2.6, 7.4, xx+1.3, 6.4, color=GRAY, ls="--")
a1.text(5.0, 3.4, "request lands away from its KV -> full re-prefill (reuse benefit lost)", fontsize=7.8, ha="center", color=RED)
a1.text(5.0, 2.2, "memory full? only preemption (drop/swap everything)", fontsize=7.8, ha="center", color=RED)
a2.set_title("(b) KV-aware = a head-on conflict", fontsize=9.5, color=NAVY, fontweight="bold")
box(a2, 0.4, 5.6, 4.3, 2.8, "LOCALITY pressure\nhits only happen where\nthe KV is (TTFT, QA3)\nbut popular KV =\nbusy instance", fc="#EAF1E7", ec=GREEN, fs=7.8, tc=DGREEN, bold=True)
box(a2, 5.3, 5.6, 4.3, 2.8, "BALANCE pressure\niso-latency throughput\nneeds even batches (QA1)\nbut moving GB-scale KV\nis expensive", fc="#EDEFF4", ec=NAVY, fs=7.8, tc=NAVY, bold=True)
box(a2, 2.3, 2.6, 5.4, 1.7, "wait for locality (pay latency)?\nor move/recompute KV (pay transfer)?", fc=CREAM, ec="#7A5C2E", fs=8.2, bold=True)
arrow(a2, 2.5, 5.6, 4.2, 4.3, color=GREEN); arrow(a2, 7.5, 5.6, 5.8, 4.3, color=NAVY)
a2.text(5.0, 1.2, "isomorphic: data locality vs load balancing (Hadoop delay scheduling, NUMA)", fontsize=7.4, ha="center", color="#7F7F7F", style="italic")
save_problem(fig, "dp5_problem.png")

def dp5c1(ax):
    box(ax, 0.3, 8.0, 9.4, 1.3, "KV-aware Router (NEW): queries KV Index -> affinity routing", fc="#FDEBDD", ec=ORANGE, fs=8.1, bold=True)
    box(ax, 0.4, 4.9, 2.7, 1.9, "instance 1\n(busy, HAS KV)", fc="#EAF1E7", ec=GREEN, fs=7.8, tc=DGREEN, bold=True)
    box(ax, 3.7, 4.9, 2.7, 1.9, "delay queue (NEW)\nbounded wait\nfor locality", fc=CREAM, ec="#7A5C2E", fs=7.6, bold=True)
    box(ax, 6.9, 4.9, 2.8, 1.9, "instance 2/3\n(idle, no KV)\nused only past\nthreshold", fc=PANEL, ec=GRAY, fs=7.4)
    arrow(ax, 1.7, 8.0, 1.7, 6.8, color=GREEN, lw=2.2)
    arrow(ax, 5.0, 8.0, 5.0, 6.8, color=ORANGE, ls="--")
    arrow(ax, 6.4, 5.8, 6.9, 5.8, color=GRAY, ls="--")
    box(ax, 0.3, 2.4, 9.4, 1.4, "KV Index (data plane) - read by control plane", fc="#EDEFF4", ec=NAVY, fs=8.2)
    arrow(ax, 8.6, 8.0, 8.6, 3.8, color=NAVY, ls="--")
    ax.text(5.0, 1.3, "hit rate max - reuse benefit intact / risk: hotspot + head-of-line wait", fontsize=7.4, ha="center", color=RED)

def dp5c2(ax):
    box(ax, 0.3, 8.0, 9.4, 1.3, "Router: load metrics + summary hints only (no Index coupling)", fc=PANEL, ec=GRAY, fs=8.1)
    for i, xx in enumerate([0.6, 3.9, 7.2]):
        box(ax, xx, 5.2, 2.6, 1.7, f"instance {i+1}\n(balanced batch)", fc="#EDEFF4", ec=NAVY, fs=7.7)
        arrow(ax, 2.0 + i*2.6, 8.0, xx+1.3, 6.9, color=NAVY)
    box(ax, 0.3, 2.7, 9.4, 1.6, "KV Transport (NEW): bring KV to the request\ntier/instance transfer - or recompute if cheaper (DP3 estimator)", fc="#FDEBDD", ec=ORANGE, fs=7.8, bold=True)
    arrow(ax, 5.0, 5.2, 5.0, 4.3, color=ORANGE)
    ax.text(5.0, 1.6, "even load: iso-latency throughput max, all capacity used", fontsize=7.4, ha="center", color=DGREEN)
    ax.text(5.0, 0.7, "risk: GB-scale moves + load-driven eviction blind to quality budget", fontsize=7.4, ha="center", color=RED)

two_panel(os.path.join(DIAG, "kv_dp5_candidates.png"), dp5c1, dp5c2,
          "C1  Locality-first (affinity + bounded wait)", "requests go to the KV",
          "C2  Load-first (+ KV transport / recompute)", "the KV comes to the request",
          os.path.join(OUT, "dp5_c1.png"), os.path.join(OUT, "dp5_c2.png"))

print("kv dp assets done ->", OUT, "and", DIAG)
