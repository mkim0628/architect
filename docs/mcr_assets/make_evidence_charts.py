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


if __name__ == "__main__":
    bg_gap_evidence()
    bg_kv_evidence()
