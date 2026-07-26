# DP-01 (KV 재사용성 제고 — non-contiguous 재사용 개선) slide assets
# baseline = CacheBlend. 후보 = 사전 가공형(store-time) vs 요청 적응형(read-time)
# Regenerate: python3 docs/mcr_assets/make_dp1s1_assets.py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

NAVY = "#1F3864"; GREEN = "#4E7C3A"; RED = "#B3402A"; GRAY = "#9AA0A6"
CREAM = "#FFF2CC"; PANEL = "#F5F6F8"; ORANGE = "#ED7D31"
OUT = os.path.dirname(os.path.abspath(__file__))

def box(ax, x, y, w, h, text, fc=PANEL, ec=GRAY, fs=8.5, tc="#262626", bold=False, ls="-"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.015",
                                fc=fc, ec=ec, lw=1.4, linestyle=ls))
    ax.text(x + w/2, y + h/2, text, ha="center", va="center", fontsize=fs,
            color=tc, fontweight="bold" if bold else "normal")

def arrow(ax, x1, y1, x2, y2, color=GRAY, lw=1.6, style="-|>", ls="-"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                                 color=color, lw=lw, linestyle=ls, mutation_scale=14))

# ─────────────────────────────────────────────────────────────────────
# 1) Problem diagram
#    (a) TTFT breakdown: full re-prefill vs CacheBlend baseline (residual floor)
#    (b) the open design axis: when to spend the residual work (store-time vs read-time)
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.6, 3.4), dpi=200)
for ax in (a1, a2):
    ax.axis("off")

a1.set_xlim(0, 10); a1.set_ylim(0, 10)
a1.set_title("(a) TTFT after adopting CacheBlend: a residual floor remains",
             fontsize=9.5, color=NAVY, fontweight="bold")
# bar 1: full re-prefill
a1.add_patch(plt.Rectangle((0.6, 7.3), 8.6, 1.5, fc=GRAY, alpha=0.75))
a1.text(0.6, 9.1, "full re-prefill (no reuse)  = 1.0x", fontsize=8.5, color="#262626")
# bar 2: CacheBlend baseline decomposition (~0.35 of full)
segs = [("load chunk KV (I/O)", 1.6, NAVY), ("selective recompute 10-15% (fixed)", 1.4, RED), ("misc", 0.4, GRAY)]
x = 0.6
a1.text(0.6, 6.3, "CacheBlend baseline  = 0.30-0.45x  (TTFT 2.2-3.3x, B)", fontsize=8.5, color="#262626")
for label, w, c in segs:
    a1.add_patch(plt.Rectangle((x, 4.5), w, 1.5, fc=c, alpha=0.85))
    x += w
a1.text(0.6, 4.0, "I/O: worse on lower tiers", fontsize=7.2, color=NAVY, ha="left")
a1.text(0.6, 3.4, "recompute: fixed ratio, on the critical path", fontsize=7.2, color=RED, ha="left")
box(a1, 5.7, 2.6, 4.1, 2.0, "residual floor:\nrecompute + load I/O\nstay ONLINE", fc="#FBE4E0", ec=RED, fs=8.5, tc=RED, bold=True)
arrow(a1, 4.2, 5.0, 6.4, 4.6, color=RED)
a1.text(5.0, 0.7, "blind to per-request quality budget (QA2) · coverage request-scoped —\nsession/user persistence left passive",
        fontsize=7.8, ha="center", color="#262626")

a2.set_xlim(0, 10); a2.set_ylim(0, 10)
a2.set_title("(b) Open design axis: WHEN to spend the residual work",
             fontsize=9.5, color=NAVY, fontweight="bold")
box(a2, 3.0, 7.6, 4.0, 1.5, "residual work\n(blend + place)", fc=CREAM, ec="#7A5C2E", fs=9, bold=True)
box(a2, 0.4, 3.6, 4.2, 2.6, "C1  STORE-TIME (eager)\npre-blend on idle,\nwarm upper tiers\n-> online = pure load", fc="#EAF1E7", ec=GREEN, fs=8.3, tc="#2C4A20", bold=True)
box(a2, 5.4, 3.6, 4.2, 2.6, "C2  READ-TIME (lazy)\nrecompute only what\nthe request needs\n(quality budget)", fc="#EDEFF4", ec=NAVY, fs=8.3, tc=NAVY, bold=True)
arrow(a2, 4.2, 7.6, 2.5, 6.2, color=GREEN)
arrow(a2, 5.8, 7.6, 7.5, 6.2, color=NAVY)
a2.text(2.5, 2.6, "risk: wasted precompute,\nstale fused copies", fontsize=7.6, ha="center", color=RED)
a2.text(7.5, 2.6, "risk: TTFT floor stays\non the critical path", fontsize=7.6, ha="center", color=RED)
a2.text(5.0, 0.9, "classic eager-vs-lazy: undecidable without workload predictability",
        fontsize=8, ha="center", color="#7F7F7F", style="italic")

plt.tight_layout()
plt.savefig(os.path.join(OUT, "dp1s1_problem.png"), bbox_inches="tight")
plt.close(fig)

# ─────────────────────────────────────────────────────────────────────
# 2) Candidate diagrams — 공통 전제(비접두 chunk index + tiered store) 위에
#    각 후보가 신설하는 컴포넌트를 강조
def base(ax, title, sub, subcolor):
    ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")
    ax.set_title(title, fontsize=10.5, color=NAVY, fontweight="bold")
    ax.text(5.0, 9.55, sub, fontsize=8, color=subcolor, ha="center", style="italic", fontweight="bold")
    box(ax, 0.3, 7.6, 3.0, 1.4, "Router /\nScheduler", fc=PANEL)
    box(ax, 0.3, 5.2, 3.0, 1.6, "Prefill\nPipeline", fc=PANEL)
    box(ax, 4.4, 6.4, 5.2, 2.4, "", fc="#FFFFFF", ec=NAVY)
    ax.text(7.0, 8.45, "Chunk KV Index (non-contiguous, dedup)", fontsize=8.2,
            color=NAVY, fontweight="bold", ha="center")
    box(ax, 4.7, 6.6, 4.6, 1.4, "content-addressed chunks\n+ session/user persistence", fc=PANEL, fs=8)
    box(ax, 0.3, 0.7, 9.4, 1.5, "Tiered KV Store   [ HBM | DRAM | SSD ]", fc="#EDEFF4", ec=NAVY)
    arrow(ax, 1.8, 7.6, 1.8, 6.8)
    arrow(ax, 3.3, 6.0, 4.4, 6.9)

fig, (c1, c2) = plt.subplots(1, 2, figsize=(11.6, 4.6), dpi=200)

# ── C1: store-time pre-blending
base(c1, "C1  Store-time pre-blend (eager)", "new: background refiner + popularity predictor + warm path", ORANGE)
box(c1, 4.4, 3.6, 5.2, 1.9, "Background KV Refiner\npre-blend hot combos on idle\n(recompute done OFF the request path)", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
box(c1, 0.3, 3.6, 3.4, 1.9, "Popularity /\nCombo Predictor", fc="#FDEBDD", ec=ORANGE, fs=8.5, bold=True)
arrow(c1, 3.7, 4.55, 4.4, 4.55, color=ORANGE, ls="--")
arrow(c1, 7.0, 6.4, 7.0, 5.5)
arrow(c1, 7.0, 3.6, 7.0, 2.2, color=ORANGE)           # fused KV -> warm upper tier
c1.text(7.35, 2.8, "warm fused KV\nto upper tier", fontsize=7.4, color=ORANGE)
arrow(c1, 1.8, 5.2, 1.8, 2.2)
c1.text(2.1, 3.0, "online HIT =\npure load (no recompute)", fontsize=7.6, color=GREEN, fontweight="bold")

# ── C2: read-time adaptive recompute
base(c2, "C2  Read-time adaptive recompute (lazy)", "new: quality-budget controller + load-recompute pipelining", ORANGE)
box(c2, 4.4, 3.6, 5.2, 1.9, "Quality-budget Recompute Controller\nper-request ratio from SLO/budget\n(raw chunks stored as-is)", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
box(c2, 0.3, 3.6, 3.4, 1.9, "Load-Recompute\nPipelining\n(overlap I/O & GPU)", fc="#FDEBDD", ec=ORANGE, fs=8.5, bold=True)
arrow(c2, 4.4, 4.55, 3.7, 4.55, color=ORANGE, ls="--")
arrow(c2, 7.0, 6.4, 7.0, 5.5)
arrow(c2, 1.8, 5.2, 1.8, 4.0)   # hmm keep visual simple
arrow(c2, 1.9, 3.6, 1.9, 2.2)
c2.text(2.3, 2.9, "online HIT = load ∥ recompute\n(budgeted, per request)", fontsize=7.6, color=NAVY, fontweight="bold")

plt.tight_layout()
plt.savefig(os.path.join(OUT, "dp1s1_candidates.png"), bbox_inches="tight")
plt.close(fig)

import PIL.Image as I
img = I.open(os.path.join(OUT, "dp1s1_candidates.png"))
w, h = img.size
img.crop((0, 0, w//2, h)).save(os.path.join(OUT, "dp1s1_c1.png"))
img.crop((w//2, 0, w, h)).save(os.path.join(OUT, "dp1s1_c2.png"))
print("assets done")
