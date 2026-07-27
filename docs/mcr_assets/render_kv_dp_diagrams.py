# DP1–DP5 후보구조 설계도(diagrams/*.svg, 확정안 v2 패키지 기반)를 chromium으로
# 렌더하고 후보별 패널을 크롭해 PPT P11(후보구조 비교)의 설계도 셀 PNG를 만든다.
# Regenerate: python3 docs/mcr_assets/render_kv_dp_diagrams.py
import os, subprocess, glob
import PIL.Image as I

HERE = os.path.dirname(os.path.abspath(__file__))
DIAG = os.path.normpath(os.path.join(HERE, "..", "..", "diagrams"))
OUT = os.path.join(HERE, "kvdp")
os.makedirs(OUT, exist_ok=True)

def find_chromium():
    for pat in ("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell",
                "/opt/pw-browsers/chromium-*/chrome-linux/chrome"):
        hits = sorted(glob.glob(pat))
        if hits:
            return hits[-1]
    return "chromium"

CH = find_chromium()
S = 2  # device scale factor

# svg 파일명 → (viewBox W, H, 좌 패널 crop, 우 패널 crop, 출력 접두)
SPECS = {
    "kv_dp3_candidates.svg": (1400, 1010, (30, 66, 676, 872), (696, 66, 1372, 872), "dp3"),
    "kv_dp4_candidates.svg": (1400, 1010, (30, 66, 676, 872), (696, 66, 1372, 872), "dp4"),
    "kv_dp5_candidates.svg": (1400, 1010, (30, 66, 676, 872), (696, 66, 1372, 872), "dp5"),
    "dp1_candidates.svg":    (1400, 1000, (30, 66, 676, 964), (694, 66, 1372, 964), "dp1"),
    "dp2_candidates.svg":    (1400, 1080, (30, 66, 676, 840), (694, 66, 1372, 840), "dp2"),
}

for svg, (w, h, c1, c2, dp) in SPECS.items():
    full = os.path.join(OUT, f"_{dp}_full.png")
    subprocess.run([CH, "--headless", "--no-sandbox", "--disable-gpu",
                    f"--force-device-scale-factor={S}", f"--window-size={w},{h}",
                    f"--screenshot={full}", f"file://{os.path.join(DIAG, svg)}"],
                   check=True, capture_output=True)
    img = I.open(full)
    img.crop(tuple(v * S for v in c1)).save(os.path.join(OUT, f"{dp}_c1.png"))
    img.crop(tuple(v * S for v in c2)).save(os.path.join(OUT, f"{dp}_c2.png"))
    os.remove(full)
    print(dp, "panels cropped")

print("done ->", OUT)
