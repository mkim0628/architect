# DP-01 (Phase-1: KV 재사용성 제고) slide assets — problem diagram + candidate diagrams
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
# 1) Problem diagram: (a) prefix-only reuse fails + ephemeral  (b) restore-vs-recompute inversion
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9.2, 3.4), dpi=200)
for ax in (a1, a2):
    ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")

a1.set_title("(a) Prefix-only & ephemeral reuse", fontsize=10, color=NAVY, fontweight="bold")
a1.text(0.4, 8.9, "Cached KV (turn N)", fontsize=8, color="#262626")
for i, c in enumerate(["A", "B", "C"]):
    box(a1, 0.4 + i*1.5, 7.4, 1.25, 1.15, c, fc=CREAM, ec="#7A5C2E", fs=10, bold=True)
a1.text(0.4, 6.3, "Incoming (turn N+1, chunks reordered)", fontsize=8, color="#262626")
for i, c in enumerate(["B", "A", "D"]):
    box(a1, 0.4 + i*1.5, 4.8, 1.25, 1.15, c, fc="#FFFFFF", ec=GRAY, fs=10, bold=True)
box(a1, 6.0, 5.9, 3.6, 1.5, "prefix match\nHIT = 0", fc="#FBE4E0", ec=RED, fs=9.5, tc=RED, bold=True)
arrow(a1, 5.2, 6.6, 6.0, 6.6, color=RED)
box(a1, 0.4, 2.5, 5.3, 1.3, "request ends → KV discarded\n(ephemeral buffer)", fc="#FFFFFF", ec=GRAY, fs=8.5)
box(a1, 6.0, 2.5, 3.6, 1.3, "full re-prefill\n(TTFT-dominant)", fc="#FBE4E0", ec=RED, fs=9, tc=RED, bold=True)
arrow(a1, 5.7, 3.15, 6.0, 3.15, color=RED)
a1.text(5.0, 0.9, "tens of k tokens recomputed on every request", fontsize=8.5,
        ha="center", color=RED, style="italic")

a2.set_title("(b) Restore-vs-recompute inversion", fontsize=10, color=NAVY, fontweight="bold")
tiers = ["HBM", "DRAM", "SSD"]
restore = [0.6, 2.4, 7.6]     # illustrative restore time (bandwidth ladder ~10x)
recomp  = [4.0, 4.0, 4.0]     # recompute time (constant)
xs = [1.1, 4.1, 7.1]
for x, t, r in zip(xs, tiers, restore):
    a2.add_patch(plt.Rectangle((x, 1.6), 0.9, r, fc=NAVY, alpha=0.85))
    a2.add_patch(plt.Rectangle((x + 1.0, 1.6), 0.9, 4.0, fc=GRAY, alpha=0.7))
    a2.text(x + 0.95, 0.9, t, ha="center", fontsize=9, color="#262626", fontweight="bold")
a2.plot([0.6, 9.6], [5.6, 5.6], color=RED, lw=1.2, ls="--")
a2.text(8.9, 9.3, "restore", color=NAVY, fontsize=8.5, ha="right", fontweight="bold")
a2.text(8.9, 8.5, "recompute", color=GRAY, fontsize=8.5, ha="right", fontweight="bold")
box(a2, 5.6, 6.4, 4.1, 1.6, "SSD: restore > recompute\nno cost decision exists today", fc="#FBE4E0", ec=RED, fs=8.2, tc=RED, bold=True)
a2.text(5.0, 0.15, "bandwidth ladder ~10x per tier (illustrative)", fontsize=7.5, ha="center",
        color="#7F7F7F", style="italic")
plt.tight_layout()
plt.savefig(os.path.join(OUT, "dp1s1_problem.png"), bbox_inches="tight")
plt.close(fig)

# ─────────────────────────────────────────────────────────────────────
# 2) Candidate diagrams — same base layout, differences highlighted
def base(ax, title):
    ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")
    ax.set_title(title, fontsize=10.5, color=NAVY, fontweight="bold")
    box(ax, 0.3, 7.9, 3.0, 1.4, "Router /\nScheduler", fc=PANEL)
    box(ax, 0.3, 5.4, 3.0, 1.6, "Prefill\nPipeline", fc=PANEL)
    box(ax, 0.3, 0.7, 9.4, 1.6, "Tiered KV Store   [ HBM | DRAM | SSD ]", fc="#EDEFF4", ec=NAVY)
    arrow(ax, 1.8, 7.9, 1.8, 7.0)

fig, (c1, c2) = plt.subplots(1, 2, figsize=(11.6, 4.4), dpi=200)

# ── C1: prefix-conservative
base(c1, "C1  Prefix-exact / immediate-restore")
box(c1, 4.4, 5.4, 5.2, 3.0, "", fc="#FFFFFF", ec=NAVY)
c1.text(7.0, 8.0, "KV Index", fontsize=9.5, color=NAVY, fontweight="bold", ha="center")
box(c1, 4.8, 6.7, 4.4, 0.9, "Prefix (radix) tree\nexact-match HIT only", fc=CREAM, ec="#7A5C2E", fs=8)
box(c1, 4.8, 5.6, 4.4, 0.9, "session / user persistence", fc=PANEL, fs=8)
arrow(c1, 3.3, 6.2, 4.4, 6.6)
box(c1, 4.4, 3.2, 5.2, 1.3, "HIT => always restore\n(fixed rule, no estimator)", fc=PANEL, ec=GRAY, fs=8.5)
arrow(c1, 7.0, 5.4, 7.0, 4.5)
arrow(c1, 7.0, 3.2, 7.0, 2.3)
c1.text(5.0, 9.6, "no new components - module-local change", fontsize=8, color=GREEN,
        ha="center", style="italic", fontweight="bold")

# ── C2: non-prefix extended
base(c2, "C2  Content-addressed / selective-recompute / cost-decided")
box(c2, 4.4, 5.4, 5.2, 3.0, "", fc="#FFFFFF", ec=NAVY)
c2.text(7.0, 8.0, "KV Index", fontsize=9.5, color=NAVY, fontweight="bold", ha="center")
box(c2, 4.8, 6.7, 4.4, 0.9, "Content-addressed chunk index\nnon-prefix HIT + chunk dedup", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
box(c2, 4.8, 5.6, 4.4, 0.9, "session / user persistence", fc=PANEL, fs=8)
arrow(c2, 3.3, 6.2, 4.4, 6.6)
box(c2, 0.3, 3.2, 3.0, 1.5, "Selective\nrecompute (HKVD)", fc="#FDEBDD", ec=ORANGE, fs=8, bold=True)
arrow(c2, 1.8, 5.4, 1.8, 4.7)
box(c2, 4.4, 3.2, 5.2, 1.5, "Cost estimator\nrestore vs recompute (telemetry)", fc="#FDEBDD", ec=ORANGE, fs=8.5, bold=True)
arrow(c2, 7.0, 5.4, 7.0, 4.7)
arrow(c2, 7.0, 3.2, 7.0, 2.3)
arrow(c2, 3.3, 3.95, 4.4, 3.95, color=ORANGE, ls="--")
c2.text(5.0, 9.6, "new: chunk index + recompute path + estimator (highlighted)", fontsize=8,
        color=ORANGE, ha="center", style="italic", fontweight="bold")

plt.tight_layout()
plt.savefig(os.path.join(OUT, "dp1s1_candidates.png"), bbox_inches="tight")
plt.close(fig)

# split into two files for the compare-table cells
import PIL.Image as I
img = I.open(os.path.join(OUT, "dp1s1_candidates.png"))
w, h = img.size
img.crop((0, 0, w//2, h)).save(os.path.join(OUT, "dp1s1_c1.png"))
img.crop((w//2, 0, w, h)).save(os.path.join(OUT, "dp1s1_c2.png"))
print("assets done")
