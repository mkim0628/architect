# KV 캐시 최적 운용 (1단계) DP1-DP5 slide assets
# - docs/mcr_assets/kvdp/dp{1..5}_problem.png : PPT P10(문제 정의)용
# 후보구조 설계도(dpN_c1/c2.png)는 diagrams/*.svg에서 render_kv_dp_diagrams.py로 크롭 생성
# Regenerate: python3 docs/mcr_assets/make_kv_dp_assets.py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

NAVY = "#1F3864"; GREEN = "#4E7C3A"; RED = "#B3402A"; GRAY = "#9AA0A6"
CREAM = "#FFF2CC"; PANEL = "#F5F6F8"; ORANGE = "#ED7D31"; DGREEN = "#2C4A20"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "kvdp")
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




print("kv dp problem assets done ->", OUT)
