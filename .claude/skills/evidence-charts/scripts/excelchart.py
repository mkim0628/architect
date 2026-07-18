#!/usr/bin/env python3
"""excelchart — matplotlib helper that mimics Excel's default chart look.

Why: deck charts must read as "그냥 엑셀에서 그린 차트" — Office default
palette/typography, horizontal-only gridlines, bottom legend, thin bars
(gap width 219%), and a mandatory Source footnote so every number on the
chart is traceable to the source ledger (docs/chart_sources.md).

Usage (from any script):
    import sys; sys.path.insert(0, "<this dir>")
    from excelchart import ExcelChart
    c = ExcelChart("Throughput vs. baseline (same GPU)",
                   source="Kwon et al., SOSP'23 (vLLM) — arxiv.org/abs/2309.06180")
    c.column(["Orca", "vLLM"], {"Norm. throughput": [1.0, 2.7]}, value_labels=True)
    c.save("bg_gap.png", w=6.6, h=3.0)

Every chart REQUIRES a non-empty `source=`; the constructor refuses to run
without one. Numbers passed in must appear verbatim in that source.
"""
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

# ---- Office default theme tokens ------------------------------------------
PALETTE = ["#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5", "#70AD47"]
TITLE_C = "#404040"   # chart title
TEXT_C = "#595959"    # axis/tick/legend text
GRID_C = "#D9D9D9"    # major gridlines
AXIS_C = "#BFBFBF"    # axis line
GAP_WIDTH = 2.19      # Excel default gap width 219% -> bar width 1/(1+2.19)
OVERLAP = -0.27       # Excel default series overlap -27%


def _pick_font():
    """Calibri if present, else its metric twin Carlito, else DejaVu Sans."""
    installed = {f.name for f in font_manager.fontManager.ttflist}
    for name in ("Calibri", "Carlito"):
        if name in installed:
            return name
    return "DejaVu Sans"


plt.rcParams.update({
    "font.family": _pick_font(),
    "font.size": 10,
    "axes.unicode_minus": False,
    "svg.fonttype": "none",
})


class ExcelChart:
    def __init__(self, title, source, subtitle=None):
        if not source or not str(source).strip():
            raise ValueError(
                "source= is required: every chart must cite where its numbers "
                "come from (see reference/source-playbook.md)")
        self.title, self.source, self.subtitle = title, source, subtitle
        self.fig, self.ax = plt.subplots()
        self._n_series = 0

    # ---- shared cosmetics --------------------------------------------------
    def _decorate(self, horizontal=False, legend=True):
        ax = self.ax
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
        for s in ("left", "bottom"):
            ax.spines[s].set_color(AXIS_C)
            ax.spines[s].set_linewidth(0.8)
        # Excel: gridlines only along the value axis
        ax.grid(axis="x" if horizontal else "y", color=GRID_C, linewidth=0.8)
        ax.set_axisbelow(True)
        ax.tick_params(colors=TEXT_C, labelsize=9, length=0)
        for lbl in ax.get_xticklabels() + ax.get_yticklabels():
            lbl.set_color(TEXT_C)
        ax.set_title(self.title, color=TITLE_C, fontsize=13, pad=14)
        if self.subtitle:
            self.ax.set_title(self.subtitle, loc="left", fontsize=9,
                              color=TEXT_C, style="italic", pad=2)
        if legend and self._n_series > 1:
            ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.12),
                      ncol=min(self._n_series, 4), frameon=False,
                      fontsize=9, labelcolor=TEXT_C)

    def _value_labels(self, rects, fmt="{:g}", horizontal=False):
        for r in rects:
            v = r.get_width() if horizontal else r.get_height()
            if horizontal:
                self.ax.annotate(fmt.format(v), (v, r.get_y() + r.get_height() / 2),
                                 xytext=(4, 0), textcoords="offset points",
                                 va="center", ha="left", fontsize=9, color=TEXT_C)
            else:
                self.ax.annotate(fmt.format(v), (r.get_x() + r.get_width() / 2, v),
                                 xytext=(0, 3), textcoords="offset points",
                                 va="bottom", ha="center", fontsize=9, color=TEXT_C)

    # ---- chart types -------------------------------------------------------
    def column(self, categories, series, value_labels=False, fmt="{:g}",
               ylabel=None, ylog=False, colors=None):
        """Clustered column chart. series = {name: [values]}"""
        self._xy_bars(categories, series, False, value_labels, fmt,
                      ylabel, ylog, colors)

    def bar(self, categories, series, value_labels=False, fmt="{:g}",
            xlabel=None, xlog=False, colors=None):
        """Clustered horizontal bar chart (first category at top, like Excel
        reads top-to-bottom after 'categories in reverse order')."""
        self._xy_bars(categories, series, True, value_labels, fmt,
                      xlabel, xlog, colors)

    def _xy_bars(self, categories, series, horizontal, value_labels, fmt,
                 vlabel, vlog, colors):
        n = len(series)
        self._n_series = n
        slot = 1.0 / (1 + GAP_WIDTH) * n / max(n - OVERLAP * (n - 1), 1)
        width = 1.0 / (1 + GAP_WIDTH) if n == 1 else slot
        idx = range(len(categories))
        for i, (name, vals) in enumerate(series.items()):
            off = (i - (n - 1) / 2) * width * (1 + (OVERLAP if n > 1 else 0))
            pos = [k + off for k in idx]
            color = (colors or PALETTE)[i % len(colors or PALETTE)]
            if horizontal:
                rects = self.ax.barh(pos, vals, height=width, label=name,
                                     color=color, zorder=3)
            else:
                rects = self.ax.bar(pos, vals, width=width, label=name,
                                    color=color, zorder=3)
            if value_labels:
                self._value_labels(rects, fmt, horizontal)
        if horizontal:
            self.ax.set_yticks(list(idx), categories)
            self.ax.invert_yaxis()
            if vlabel:
                self.ax.set_xlabel(vlabel, color=TEXT_C, fontsize=10)
            if vlog:
                self.ax.set_xscale("log")
        else:
            self.ax.set_xticks(list(idx), categories)
            if vlabel:
                self.ax.set_ylabel(vlabel, color=TEXT_C, fontsize=10)
            if vlog:
                self.ax.set_yscale("log")
        self._decorate(horizontal=horizontal)

    def stacked_column(self, categories, series, ylabel=None, colors=None,
                       value_labels=False, fmt="{:g}"):
        self._n_series = len(series)
        idx = list(range(len(categories)))
        bottom = [0.0] * len(categories)
        width = 1.0 / (1 + GAP_WIDTH / 2)   # Excel stacked default gap 100–150%
        for i, (name, vals) in enumerate(series.items()):
            rects = self.ax.bar(idx, vals, width=width, bottom=bottom,
                                label=name, zorder=3,
                                color=(colors or PALETTE)[i % len(colors or PALETTE)])
            if value_labels:
                for r, b in zip(rects, bottom):
                    self.ax.annotate(fmt.format(r.get_height()),
                                     (r.get_x() + r.get_width() / 2,
                                      b + r.get_height() / 2),
                                     va="center", ha="center", fontsize=9,
                                     color="white")
            bottom = [b + v for b, v in zip(bottom, vals)]
        self.ax.set_xticks(idx, categories)
        if ylabel:
            self.ax.set_ylabel(ylabel, color=TEXT_C, fontsize=10)
        self._decorate()

    def line(self, x, series, xlabel=None, ylabel=None, ylog=False,
             markers=False, colors=None):
        """Line chart. x = shared x values; series = {name: [y]}"""
        self._n_series = len(series)
        for i, (name, ys) in enumerate(series.items()):
            self.ax.plot(x, ys, label=name, linewidth=2.25, zorder=3,
                         marker="o" if markers else None, markersize=4,
                         color=(colors or PALETTE)[i % len(colors or PALETTE)])
        if xlabel:
            self.ax.set_xlabel(xlabel, color=TEXT_C, fontsize=10)
        if ylabel:
            self.ax.set_ylabel(ylabel, color=TEXT_C, fontsize=10)
        if ylog:
            self.ax.set_yscale("log")
        self._decorate()

    # ---- extras ------------------------------------------------------------
    def hline(self, y, label=None, color="#C00000"):
        """Reference line (e.g. 'HBM capacity'), Excel-style dashed."""
        self.ax.axhline(y, ls=(0, (4, 3)), lw=1.5, color=color, zorder=2)
        if label:
            self.ax.annotate(label, (1.0, y), xycoords=("axes fraction", "data"),
                             xytext=(-2, 4), textcoords="offset points",
                             ha="right", fontsize=9, color=color)

    def save(self, path, w=6.6, h=3.0, dpi=200):
        self.fig.set_size_inches(w, h)
        # Source footnote — below everything (negative y + bbox_inches="tight"
        # keeps it clear of xlabel/legend), small italic gray deck citation
        self.fig.text(0.01, -0.04, f"Source: {self.source}", fontsize=7.5,
                      style="italic", color="#7F7F7F", ha="left", va="top")
        self.fig.savefig(path, dpi=dpi, bbox_inches="tight", pad_inches=0.12,
                         facecolor="white")
        plt.close(self.fig)
        print(f"wrote {os.path.abspath(path)}")
