# 필요성 슬라이드 — 1단계 상용 tier 대역폭 계단(개략) 그림
# 정량 주장은 "~10×/계단 (자체 실측 A)"만 — 절대치 표기는 개략(대표 사양 자릿수)으로 한정.
# Regenerate: python3 docs/mcr_assets/make_nec_tier_ladder.py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os

NAVY = "#1F3864"; RED = "#B3402A"; GRAY = "#6B7A90"
OUT = os.path.dirname(os.path.abspath(__file__))

fig, ax = plt.subplots(figsize=(4.8, 2.3), dpi=200)
ax.set_xlim(0, 10); ax.set_ylim(0, 10); ax.axis("off")
ax.set_title("Bandwidth ladder: ~10x per tier (commodity)", fontsize=10, color=NAVY, fontweight="bold")

tiers = [("HBM",  0.6, 6.6, 8.8, "TB/s class"),
         ("DRAM", 1.9, 3.9, 6.0, "100s GB/s class"),
         ("NVMe SSD", 3.2, 1.2, 3.4, "GB/s class")]
for name, x, y, w, cls in tiers:
    ax.add_patch(plt.Rectangle((x, y), w, 2.2, fc="#EDEFF4", ec=NAVY, lw=1.4))
    ax.text(x + 0.25, y + 1.1, f"{name}   ({cls})", fontsize=9.5, color=NAVY,
            fontweight="bold", va="center")
for i in range(2):
    x = tiers[i][1] + 0.9
    y1, y2 = tiers[i][2], tiers[i + 1][2] + 2.2
    ax.annotate("", xy=(x + 0.9, y2), xytext=(x, y1),
                arrowprops=dict(arrowstyle="-|>", color=RED, lw=1.8))
    ax.text(x + 1.15, (y1 + y2) / 2, "~1/10x", fontsize=9, color=RED, fontweight="bold")
ax.text(5.0, 0.15, "restore from lower tier can lose to recompute (measured, A)",
        fontsize=8.2, color=GRAY, ha="center", style="italic")
plt.tight_layout()
plt.savefig(os.path.join(OUT, "nec_tier_ladder.png"), bbox_inches="tight")
print("nec_tier_ladder.png done")
