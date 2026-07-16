#!/usr/bin/env python3
"""Generate content-matched diagrams/charts for the MCR deck.
English technical labels (authentic for this domain); deck palette.
Web image hosts are blocked in this environment, so visuals are generated
locally instead of fetched. Output: PNGs next to this script."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

NAVY="#1F3864"; NAVYL="#2E4C7E"; GREEN="#4E7C3A"; YELLOW="#FFC000"
ICE="#CADCFC"; INK="#262626"; GRAY="#A6A6A6"; LGRAY="#E9E9E9"; WHITE="#FFFFFF"
HERE=os.path.dirname(os.path.abspath(__file__))
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":13})

def save(fig, name, w, h):
    fig.set_size_inches(w, h); fig.savefig(os.path.join(HERE, name), dpi=200,
        bbox_inches="tight", pad_inches=0.06, facecolor="white"); plt.close(fig)

def box(ax, x, y, w, h, text, fc, ec, tc=WHITE, fs=13, bold=True, r=0.06):
    ax.add_patch(FancyBboxPatch((x,y), w, h, boxstyle=f"round,pad=0.01,rounding_size={r}",
        linewidth=1.6, edgecolor=ec, facecolor=fc))
    ax.text(x+w/2, y+h/2, text, ha="center", va="center", color=tc,
        fontsize=fs, fontweight="bold" if bold else "normal", wrap=True)

def arrow(ax, x0,y0,x1,y1, color=NAVY, lw=2.4, style="-|>", ms=16):
    ax.add_patch(FancyArrowPatch((x0,y0),(x1,y1), arrowstyle=style,
        mutation_scale=ms, lw=lw, color=color))

def blank(ax): ax.set_xlim(0,10); ax.set_ylim(0,4); ax.axis("off")

# 1. Decode dominates latency — stacked horizontal bar
def bg_decode():
    fig, ax = plt.subplots()
    ax.barh([0], [23], color=ICE, edgecolor="white");
    ax.barh([0], [77], left=[23], color=NAVY, edgecolor="white")
    ax.text(11.5,0,"Prefill\n~15–30%",ha="center",va="center",color=NAVY,fontsize=12,fontweight="bold")
    ax.text(61,0,"Decode  70–85% of end-to-end latency",ha="center",va="center",color="white",fontsize=13,fontweight="bold")
    ax.set_xlim(0,100); ax.set_ylim(-0.6,0.9); ax.axis("off")
    ax.text(0,0.7,"Decode dominates inference latency  (memory-bandwidth-bound)",fontsize=12.5,color=INK,fontweight="bold")
    save(fig,"bg_decode.png",6.6,2.2)

# 2. KV cache growth vs HBM capacity
def bg_kv():
    fig, ax = plt.subplots()
    x=[1,8,16,32,64,128]
    for mult,c,lab in [(1,ICE,"1 session"),(4,NAVYL,"4 sessions"),(9,NAVY,"16 sessions")]:
        ax.plot(x,[xi*mult*0.9 for xi in x],marker="o",color=c,lw=2.4,label=lab,markersize=4)
    ax.axhline(90,ls="--",color=GREEN,lw=2); ax.text(74,95,"HBM capacity",color=GREEN,fontsize=11,fontweight="bold")
    ax.set_xlabel("Context length (K tokens)",fontsize=11); ax.set_ylabel("KV cache size (GB)",fontsize=11)
    ax.set_title("KV cache grows with context × concurrent sessions",fontsize=12.5,color=INK,fontweight="bold",loc="left")
    ax.legend(fontsize=9,loc="upper left",frameon=False); ax.set_ylim(0,140)
    for s in ["top","right"]: ax.spines[s].set_visible(False)
    save(fig,"bg_kv.png",6.6,2.6)

# 3. Device portfolio — 5 boxes
def bg_devices():
    fig, ax = plt.subplots(); blank(ax)
    names=["PIM","PNM","Custom\nHBM","HBF","CXL\nMemory"]
    cols=[NAVY,NAVYL,GREEN,"#6B7F3A","#3C5F2C"]
    for i,(n,c) in enumerate(zip(names,cols)):
        box(ax,0.25+i*1.95,1.2,1.6,1.6,n,c,c,fs=13)
    ax.text(5,3.5,"Memory-centric device portfolio",ha="center",fontsize=13,color=INK,fontweight="bold")
    ax.text(5,0.7,"near-compute · bandwidth · capacity — complementary axes",ha="center",fontsize=11,color=GRAY)
    save(fig,"bg_devices.png",6.6,2.4)

# 4. Complementary axes
def bg_axes():
    fig, ax = plt.subplots()
    labs=["Near-compute (PIM/PNM)","Bandwidth (HBM/HBF)","Capacity (CXL/SSD)"]; vals=[0.9,0.75,0.95]; cols=[NAVY,NAVYL,GREEN]
    ax.barh(range(3),vals,color=cols,height=0.55)
    for i,l in enumerate(labs): ax.text(0.02,i,l,va="center",ha="left",color="white",fontsize=10,fontweight="bold")
    ax.set_xlim(0,1); ax.set_ylim(-0.6,2.6); ax.axis("off")
    ax.text(0,2.75,"Different strengths → new design space when combined",fontsize=12,color=INK,fontweight="bold")
    save(fig,"bg_axes.png",6.6,2.2)

# 5. Compute-centric -> memory-centric
def bg_shift():
    fig, ax = plt.subplots(); blank(ax)
    box(ax,0.3,1.0,3.5,2.0,"Compute-centric\ndata → compute",WHITE,NAVY,tc=NAVY,fs=13)
    arrow(ax,4.1,2.0,5.9,2.0,color=GREEN,lw=3,ms=22)
    box(ax,6.2,1.0,3.5,2.0,"Memory-centric\ncompute → data",GREEN,GREEN,fs=13)
    ax.text(5,3.55,"Von Neumann premise inverted (PIM/PNM)",ha="center",fontsize=12.5,color=INK,fontweight="bold")
    save(fig,"bg_shift.png",6.6,2.2)

# 6. Memory hierarchy 5 tiers
def bg_hierarchy():
    fig, ax = plt.subplots(); ax.set_xlim(0,10); ax.set_ylim(0,5.4); ax.axis("off")
    tiers=[("HBM",NAVY),("HBF",NAVYL),("DRAM","#5B6EA6"),("CXL Memory",GREEN),("SSD","#6B7F3A")]
    for i,(n,c) in enumerate(tiers):
        w=3.2+i*1.1; x=(10-w)/2; y=4.4-i*0.9
        box(ax,x,y,w,0.72,n,c,c,fs=12)
    arrow(ax,0.5,4.9,0.5,0.7,color=INK,lw=2,ms=14); ax.text(0.75,4.7,"Bandwidth ↑",fontsize=10,color=INK,rotation=90,va="top")
    arrow(ax,9.5,0.7,9.5,4.9,color=INK,lw=2,ms=14); ax.text(9.25,0.9,"Capacity ↑",fontsize=10,color=INK,rotation=90,va="bottom",ha="right")
    ax.text(5,5.15,"Deepening memory hierarchy (5+ tiers)",ha="center",fontsize=12.5,color=INK,fontweight="bold")
    save(fig,"bg_hierarchy.png",6.6,3.0)

# 7. Runtime architecture — layers
def nec_arch():
    fig, ax = plt.subplots(); ax.set_xlim(-0.2,10.2); ax.set_ylim(0,4.2); ax.axis("off")
    box(ax,0.5,3.1,9,0.8,"Application  /  LLM Serving",ICE,NAVY,tc=NAVY,fs=12.5)
    box(ax,0.5,1.5,9,1.3,"MCR Runtime  ·  Policy | Mechanism  ·  Topology Model",NAVY,NAVY,fs=10.5)
    box(ax,0.5,0.2,9,0.8,"Devices (PIM·PNM·HBF·CXL) — parameterized plug-in",GREEN,GREEN,fs=12)
    arrow(ax,5,3.05,5,2.85,color=GRAY,lw=2); arrow(ax,5,1.45,5,1.05,color=GRAY,lw=2)
    ax.text(0.5,4.05,"Heterogeneous memory as a first-class runtime concept",fontsize=11.5,color=INK,fontweight="bold")
    save(fig,"nec_arch.png",7.4,2.6)

# 8. Joint orchestration triangle
def nec_orch():
    fig, ax = plt.subplots(); ax.set_xlim(0,10); ax.set_ylim(0,4.8); ax.axis("off")
    pts={"Placement":(2,1.2),"Compression":(8,1.2),"Reuse":(5,3.3)}
    cols={"Placement":NAVY,"Compression":GREEN,"Reuse":NAVYL}
    labpos={"Placement":(2,0.35,"top"),"Compression":(8,0.35,"top"),"Reuse":(5,3.95,"bottom")}
    import itertools
    for a,b in itertools.combinations(pts,2):
        ax.plot([pts[a][0],pts[b][0]],[pts[a][1],pts[b][1]],color=GRAY,lw=1.6,zorder=1)
    for n,(x,y) in pts.items():
        ax.scatter([x],[y],s=2000,color=cols[n],zorder=2)
        lx,ly,va=labpos[n]; ax.text(lx,ly,n,ha="center",va=va,color=INK,fontsize=12,fontweight="bold",zorder=3)
    ax.text(5,2.0,"KV @ SLO",ha="center",va="center",color=INK,fontsize=11,fontweight="bold")
    ax.text(5,4.55,"Joint orchestration (not passive tiering)",ha="center",fontsize=12,color=INK,fontweight="bold")
    save(fig,"nec_orch.png",7.4,2.8)

# 9. Reference stack positioning
def nec_stack():
    fig, ax = plt.subplots(); ax.set_xlim(0,10); ax.set_ylim(0,4.2); ax.axis("off")
    box(ax,2.5,3.2,5,0.75,"Application (LLM serving)",ICE,NAVY,tc=NAVY,fs=12.5)
    box(ax,2.0,1.6,6,0.95,"MCR  =  Reference SW stack",YELLOW,GREEN,tc=NAVY,fs=13.5)
    box(ax,2.5,0.15,5,0.75,"Samsung memory devices",GREEN,GREEN,fs=12.5)
    arrow(ax,5,3.15,5,2.6,color=GRAY,lw=2,style="<|-|>"); arrow(ax,5,1.55,5,0.95,color=GRAY,lw=2,style="<|-|>")
    ax.text(0.2,4.05,"Connects application ↔ device",fontsize=12,color=INK,fontweight="bold")
    save(fig,"nec_stack.png",7.4,2.6)

# 10. E2E goodput vs baseline (target, illustrative)
def nec_e2e():
    fig, ax = plt.subplots()
    ax.bar([0],[1.0],color=GRAY,width=0.5); ax.bar([1],[1.8],color=NAVY,width=0.5)
    ax.text(0,1.03,"1.0",ha="center",fontsize=11,color=INK); ax.text(1,1.83,"target ▲",ha="center",fontsize=11,color=NAVY,fontweight="bold")
    ax.set_xticks([0,1]); ax.set_xticklabels(["GPU HBM\nbaseline","MCR\n(hetero tiers)"],fontsize=11)
    ax.set_ylabel("goodput@SLO (relative)",fontsize=11); ax.set_ylim(0,2.2)
    ax.set_title("E2E performance proof — target vs baseline (illustrative)",fontsize=11.5,color=INK,fontweight="bold",loc="left")
    for s in ["top","right"]: ax.spines[s].set_visible(False)
    save(fig,"nec_e2e.png",7.4,2.5)

# 11. Coupled decision problem created by the two solutions
def bg_decision():
    fig, ax = plt.subplots(); blank(ax)
    box(ax,0.25,1.5,4.3,1.8,"Compute placement\nops → near-memory?\n(PIM/PNM)",NAVY,NAVY,fs=10.5)
    box(ax,5.45,1.5,4.3,1.8,"Data placement\ntier? move? compress?\nrecompute?",GREEN,GREEN,fs=10.5)
    arrow(ax,4.65,2.4,5.35,2.4,color=INK,lw=2.6,style="<|-|>",ms=18)
    ax.text(5,3.75,"HW cannot answer these decisions — and they are coupled",ha="center",fontsize=12,color=INK,fontweight="bold")
    ax.text(5,0.85,"tiers × devices × requests → combinatorial space  ·  wrong policy < baseline",
            ha="center",fontsize=10.5,color=GRAY,fontweight="bold")
    save(fig,"bg_decision.png",6.6,2.4)

# 12. Same HW, runtime swap changes E2E performance — published results
#     vLLM (SOSP'23, arXiv:2309.06180): KV waste 60-80% -> <4%, throughput 2-4x @ same latency, same GPU
#     FlexGen (ICML'23, arXiv:2303.06865): same 16GB T4, offloading policy -> up to 100x max throughput
def bg_gap():
    fig,(a1,a2) = plt.subplots(1,2)
    fig.suptitle("Same HW — runtime alone changes E2E performance (published)",
                 fontsize=11.5,color=INK,fontweight="bold",x=0.02,ha="left")
    a1.bar([0,1],[30,96],color=[GRAY,NAVY],width=0.5)
    a1.text(0,33,"waste\n60–80%",ha="center",fontsize=8.5,color=INK,fontweight="bold")
    a1.text(1,88,"waste <4%",ha="center",fontsize=8.5,color="white",fontweight="bold")
    a1.set_xticks([0,1]); a1.set_xticklabels(["conventional\n(Orca et al.)","PagedAttention\nruntime"],fontsize=8)
    a1.set_ylim(0,108); a1.set_yticks([]); a1.set_ylabel("KV memory utilization",fontsize=8.5)
    a1.set_title("→ 2–4× throughput, same GPU\nvLLM, SOSP '23",fontsize=8.5,color=NAVY,loc="left")
    a2.bar([0,1],[1,100],color=[GRAY,GREEN],width=0.5)
    a2.set_yscale("log"); a2.set_ylim(0.5,300); a2.set_yticks([1,10,100]); a2.set_yticklabels(["1×","10×","100×"],fontsize=8)
    a2.text(1,110,"100×",ha="center",fontsize=9,color=GREEN,fontweight="bold")
    a2.set_xticks([0,1]); a2.set_xticklabels(["Accelerate /\nZeRO-Inf.","FlexGen\npolicy"],fontsize=8)
    a2.set_ylabel("max throughput (OPT-175B)",fontsize=8.5)
    a2.set_title("same single 16GB T4 GPU\nFlexGen, ICML '23",fontsize=8.5,color=GREEN,loc="left")
    for a in (a1,a2):
        for s in ["top","right"]: a.spines[s].set_visible(False)
    fig.subplots_adjust(wspace=0.45,top=0.68)
    save(fig,"bg_gap.png",6.6,2.6)

# 13. Missing realization layer between app and devices
def nec_missing():
    fig, ax = plt.subplots(); ax.set_xlim(-0.2,10.2); ax.set_ylim(0,4.2); ax.axis("off")
    box(ax,0.5,3.1,9,0.8,"Application  /  LLM Inference",ICE,NAVY,tc=NAVY,fs=12.5)
    ax.add_patch(FancyBboxPatch((0.5,1.5),9,1.3,boxstyle="round,pad=0.01,rounding_size=0.06",
        linewidth=2.0,edgecolor=GRAY,facecolor=WHITE,linestyle="--"))
    ax.text(5,2.15,"Reference SW stack — MISSING",ha="center",va="center",color=GRAY,fontsize=13,fontweight="bold")
    box(ax,0.5,0.2,9,0.8,"Memory device portfolio (PIM · CIM · CXL · Tiered)",GREEN,GREEN,fs=12)
    ax.plot([5,5],[3.05,2.85],ls=":",color=GRAY,lw=2); ax.plot([5,5],[1.45,1.05],ls=":",color=GRAY,lw=2)
    ax.text(0.5,4.05,"Device value cannot reach the application — realization layer absent",
            fontsize=11.5,color=INK,fontweight="bold")
    save(fig,"nec_missing.png",7.4,2.6)

# 14. Per-device unit demos exist; integrated E2E stack does not
def nec_demos():
    fig, ax = plt.subplots(); blank(ax)
    for i,n in enumerate(["PIM\ndemo","CXL\ndemo","Tiered\ndemo"]):
        box(ax,0.3+i*1.45,1.6,1.25,1.35,n,NAVYL,NAVYL,fs=10)
    ax.text(2.4,0.85,"unit demos — exist",ha="center",fontsize=10.5,color=NAVY,fontweight="bold")
    arrow(ax,4.85,2.3,5.55,2.3,color=GRAY,lw=2.2,ms=16)
    ax.add_patch(FancyBboxPatch((5.8,1.3),3.9,1.9,boxstyle="round,pad=0.01,rounding_size=0.06",
        linewidth=2.0,edgecolor=GRAY,facecolor=WHITE,linestyle="--"))
    ax.text(7.75,2.25,"Integrated E2E\nreference stack",ha="center",va="center",color=GRAY,fontsize=11.5,fontweight="bold")
    ax.text(7.75,0.85,"system-level — absent",ha="center",fontsize=10.5,color=GRAY,fontweight="bold")
    ax.text(5,3.75,"Unit demos ≠ system-level E2E proof",ha="center",fontsize=12,color=INK,fontweight="bold")
    save(fig,"nec_demos.png",6.6,2.4)

# 15. KV offload layers (LMCache) exist, but memory stays a passive backend
def nec_kvlayer():
    fig, ax = plt.subplots(); ax.set_xlim(0,10); ax.set_ylim(0,4.6); ax.axis("off")
    box(ax,0.3,3.55,6.4,0.7,"Inference engine (vLLM / SGLang)",ICE,NAVY,tc=NAVY,fs=11)
    box(ax,0.3,2.25,6.4,0.9,"KV cache layer (LMCache)\ndata movement only",NAVYL,NAVYL,fs=10)
    for i,n in enumerate(["CPU RAM","SSD / NVMe","Redis · S3"]):
        box(ax,0.3+i*2.2,0.75,2.0,1.1,n,GRAY,GRAY,fs=10)
    ax.text(3.5,0.3,"passive put/get commodity backends",ha="center",fontsize=9.5,color=GRAY,fontweight="bold")
    arrow(ax,3.5,3.5,3.5,3.2,color=GRAY,lw=2); arrow(ax,3.5,2.3,3.5,1.9,color=GRAY,lw=2)
    ax.add_patch(FancyBboxPatch((7.3,0.75),2.4,3.5,boxstyle="round,pad=0.01,rounding_size=0.06",
        linewidth=2.0,edgecolor=GRAY,facecolor=WHITE,linestyle="--"))
    ax.text(8.5,2.5,"PIM · HBF · CXL\ndevice tiers\n— no place\n(no topology,\nno near-compute)",
            ha="center",va="center",color=GRAY,fontsize=9.5,fontweight="bold")
    save(fig,"nec_kvlayer.png",6.6,2.7)

if __name__=="__main__":
    import sys
    ALL=[bg_decode,bg_kv,bg_devices,bg_axes,bg_shift,bg_hierarchy,nec_arch,nec_orch,nec_stack,nec_e2e,
         bg_decision,bg_gap,nec_missing,nec_demos,nec_kvlayer]
    names=sys.argv[1:]
    for f in ALL:
        if not names or f.__name__ in names:
            f(); print("wrote", f.__name__)
