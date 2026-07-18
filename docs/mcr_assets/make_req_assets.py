#!/usr/bin/env python3
"""Generate assets for the requirements-chapter deck (mcr_req_deck.build.js).
- req_usecase.png : diagrams/req_usecase_mcr.svg rendered with Korean fonts
- req_qa_chain.png: VOC -> quality statement -> metric -> quantitative-bin
  derivation chain, QA1 example (English labels; deck palette)."""
import os, re
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

NAVY = "#1F3864"; GREEN = "#4E7C3A"; YELLOW = "#FFC000"
ICE = "#CADCFC"; INK = "#262626"; GRAY = "#A6A6A6"; CREAM = "#FFF2CC"
HERE = os.path.dirname(os.path.abspath(__file__))
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 12})


def save(fig, name, w, h):
    fig.set_size_inches(w, h)
    fig.savefig(os.path.join(HERE, name), dpi=200, bbox_inches="tight",
                pad_inches=0.06, facecolor="white")
    plt.close(fig)


def req_usecase():
    import cairosvg
    src = open(os.path.join(HERE, "..", "..", "diagrams", "req_usecase_mcr.svg"),
               encoding="utf-8").read()
    # cairosvg does not glyph-fall-back to Hangul fonts; force NanumGothic.
    src = re.sub(r'font-family="[^"]*"', 'font-family="NanumGothic"', src)
    src = re.sub(r"font-family:[^;\"']*", "font-family:NanumGothic", src)
    cairosvg.svg2png(bytestring=src.encode("utf-8"),
                     write_to=os.path.join(HERE, "req_usecase.png"),
                     scale=2.0, background_color="white")


def req_qa_chain():
    fig, ax = plt.subplots()
    ax.set_xlim(0, 15.15); ax.set_ylim(0, 4.15); ax.axis("off")
    stages = [
        ("1. VOC", "who asks, why\nR-01 · R-07 · R-11:\nKV cache > HBM capacity,\nprove E2E gain vs baseline", NAVY),
        ("2. Quality statement", "what, how well\n\"maximize throughput\nwhile keeping the\nlatency SLO promise\"", "#2E4C7E"),
        ("3. Metric", "why this metric\ngoodput@SLO — SLO-\nviolating responses\ndon't count (DistServe)", GREEN),
        ("4. Quantitative bin", "why this number\n3-star: >= 1.5x vs HBM-only\nfloor of KIVI 2.35-3.47x (B),\n< 1.1x ~ noise (C)", "#3C5F2C"),
    ]
    bw, bh, gap = 3.45, 2.25, 0.35
    x0 = 0.15
    for i, (head, body, c) in enumerate(stages):
        x = x0 + i * (bw + gap)
        ax.add_patch(FancyBboxPatch((x, 0.55), bw, bh,
                     boxstyle="round,pad=0.02,rounding_size=0.08",
                     linewidth=1.6, edgecolor=c, facecolor="white"))
        ax.add_patch(FancyBboxPatch((x, 0.55 + bh - 0.5), bw, 0.5,
                     boxstyle="round,pad=0.02,rounding_size=0.08",
                     linewidth=1.6, edgecolor=c, facecolor=c))
        ax.text(x + bw / 2, 0.55 + bh - 0.25, head, ha="center", va="center",
                color="white", fontsize=10.5, fontweight="bold")
        lines = body.split("\n")
        ax.text(x + bw / 2, 0.55 + bh - 0.72, lines[0], ha="center", va="center",
                color=GRAY, fontsize=8.4, style="italic")
        ax.text(x + bw / 2, (0.55 + bh - 0.92) / 2 + 0.32, "\n".join(lines[1:]),
                ha="center", va="center", color=INK, fontsize=8.3)
        if i < len(stages) - 1:
            ax.add_patch(FancyArrowPatch((x + bw + 0.04, 0.55 + bh / 2 - 0.2),
                                         (x + bw + gap - 0.04, 0.55 + bh / 2 - 0.2),
                                         arrowstyle="-|>", mutation_scale=18,
                                         lw=2.6, color=YELLOW))
    ax.text(0.15, 3.4, "Derivation chain — QA1 Performance example (every QA follows the same 4 steps)",
            fontsize=11.5, color=INK, fontweight="bold")
    ax.text(0.15, 0.12, "evidence grades:  A own measurement · B literature/benchmark · C structural argument",
            fontsize=9, color=GRAY)
    save(fig, "req_qa_chain.png", 9.4, 2.6)


if __name__ == "__main__":
    req_usecase()
    req_qa_chain()
    print("assets written")
