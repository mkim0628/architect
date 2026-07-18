#!/usr/bin/env python3
"""Evidence-backed charts for the MCR background deck (evidence-charts skill).

Every number here is registered in docs/chart_sources.md with its exact
location in the primary source — do not edit values without updating the
ledger. Style comes from the shared ExcelChart helper so all deck charts
match Excel's default look.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "../../.claude/skills/evidence-charts/scripts"))
from excelchart import ExcelChart


def bg_gap_evidence():
    # 배경 2/2 ④ — same HW, runtime alone decides throughput (ledger row 1)
    c = ExcelChart(
        "Same hardware, runtime only: reported max throughput gain",
        source="Kwon et al., SOSP'23 (vLLM), Abstract — arxiv.org/abs/2309.06180; "
               "Sheng et al., ICML'23 (FlexGen), §1 — arxiv.org/abs/2303.06865")
    c.column(["vLLM vs Orca /\nFasterTransformer\n(same latency)",
              "FlexGen vs ZeRO-Inf. /\nAccelerate\n(OPT-175B, 16GB T4, 4-bit)"],
             {"gain": [4, 100]}, value_labels=True,
             fmt="{:g}x", ylabel="Throughput gain (log scale)", ylog=True)
    c.save(os.path.join(HERE, "bg_gap_evidence.png"), w=5.6, h=3.4)


def ag_context_evidence():
    # 배경 1/2 ① 하단 — context windows grew 2K -> 10M in five years (ledger)
    c = ExcelChart(
        "Model context windows: 2K → 10M tokens in 5 years",
        source="OpenAI GPT-3 (arXiv 2005.14165); Anthropic Claude 2.1 (2023-11); "
               "Google Gemini 1.5 (2024-02); Meta Llama 4 (2025-04) — official announcements")
    cats = ["GPT-3\n(2020)", "Claude 2.1\n(2023)", "Gemini 1.5 Pro\n(2024)",
            "Llama 4 Scout\n(2025)"]
    vals = [2, 200, 1000, 10000]           # in K tokens
    c.column(cats, {"ctx": vals}, ylabel="Context window (K tokens, log)",
             ylog=True)
    for i, (v, lab) in enumerate(zip(vals, ["2K", "200K", "1M", "10M"])):
        c.ax.annotate(lab, (i, v), xytext=(0, 3), textcoords="offset points",
                      ha="center", va="bottom", fontsize=9, color="#595959")
    c.save(os.path.join(HERE, "ag_context_evidence.png"), w=5.6, h=3.2)


def bg_kv_evidence():
    # 배경 1/2 ② 상단 — KV cache grows with context x sessions past HBM (ledger)
    # KV/token = 2(K,V) x 80 layers x 8 KV heads x 128 head_dim x 2B (FP16)
    #          = 320 KB/token (Llama-2-70B config, GQA)
    kv_gib_per_ktok = 2 * 80 * 8 * 128 * 2 * 1024 / (1024 ** 3)
    x = [8, 16, 32, 64, 128]
    c = ExcelChart(
        "KV cache vs context length (Llama-2-70B, FP16, derived)",
        source="KV/token = 2·80·8·128·2B = 320KB — Llama-2-70B config "
               "(Touvron et al., arXiv 2307.09288; HF config.json); H100 80GB — NVIDIA")
    c.line(x, {f"{s} session{'s' if s > 1 else ''}":
               [round(kv_gib_per_ktok * xi * s, 1) for xi in x] for s in (1, 4, 8)},
           xlabel="Context length (K tokens)", ylabel="KV cache (GB)",
           markers=True)
    c.hline(80, "H100 HBM3 80GB")
    c.save(os.path.join(HERE, "bg_kv_evidence.png"), w=5.6, h=3.2)


def bg_offload_evidence():
    # 배경 1/2 ② 하단 — bandwidth drops ~10x+ per tier on the offload path
    c = ExcelChart(
        "Offload path: bandwidth falls ~10×+ per tier",
        source="NVIDIA H100 SXM (HBM3 3.35TB/s) — nvidia.com; DDR5-4800 × 8ch "
               "= 307GB/s (JEDEC 38.4GB/s/ch, derived); Samsung PM1743 Gen5 SSD "
               "13GB/s — Samsung Newsroom (2021-12)")
    c.bar(["GPU HBM3\n(H100 SXM)", "CPU DRAM\n(DDR5-4800 x 8ch)",
           "NVMe SSD\n(PCIe 5.0, PM1743)"],
          {"bw": [3350, 307, 13]}, value_labels=True, fmt="{:,.0f}",
          xlabel="Bandwidth (GB/s, log scale)", xlog=True)
    c.save(os.path.join(HERE, "bg_offload_evidence.png"), w=5.8, h=2.9)


if __name__ == "__main__":
    bg_gap_evidence()
    ag_context_evidence()
    bg_kv_evidence()
    bg_offload_evidence()
