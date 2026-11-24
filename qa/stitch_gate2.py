#!/usr/bin/env python3
"""Stitch Post-Gate-2 Repaired Proof Sheet (1920x1080) with exact f06/f10/f12/f17 stamp choreo strip."""
import os
from PIL import Image

OUT = "/home/nirufu/code/Projects/take-before-sleep/qa/out/phase1"


def main():
    sheet = Image.new("RGB", (1920, 1080), (11, 10, 14))
    tl = Image.open(os.path.join(OUT, "still_02_composite_counter.png")).resize((960, 540), Image.LANCZOS)
    tr = Image.open(os.path.join(OUT, "still_05_3value_squint.png")).resize((960, 540), Image.LANCZOS)
    bl = Image.open(os.path.join(OUT, "still_06_vacuum_grid_gray50.png")).resize((960, 540), Image.LANCZOS)
    sheet.paste(tl, (0, 0))
    sheet.paste(tr, (960, 0))
    sheet.paste(bl, (0, 540))

    br = Image.new("RGB", (960, 540), (14, 13, 18))
    title_img = Image.open(os.path.join(OUT, "still_01_title.png"))
    dim_img = Image.open(os.path.join(OUT, "still_03_composite_dim.png"))

    # Full uncropped title crop (scaled slightly cleanly to fit 960px width) + 1:1 DIM visitor & dialogue crop
    crop_title = title_img.crop((80, 165, 1200, 345)).resize((960, 154), Image.LANCZOS)
    crop_dial = dim_img.crop((280, 355, 960, 455)) # 680x100 1:1
    crop_vis = dim_img.crop((470, 140, 750, 350)).resize((280, 210), Image.LANCZOS)
    br.paste(crop_title, (0, 0))
    br.paste(crop_dial, (0, 162))
    br.paste(crop_vis, (680, 154))

    # Stamp 60fps exact choreography strip: f06 (strike mid-air), f10 (EXACT contact + 1f invert + 7 spatter), f12 (hitstop), f17 (recoil)
    for i, fidx in enumerate([6, 10, 12, 17]):
        fp = os.path.join(OUT, "frames_c3", f"f_{fidx:04d}.png")
        if os.path.exists(fp):
            fi = Image.open(fp).crop((140, 480, 640, 720)).resize((240, 220), Image.LANCZOS)
            br.paste(fi, (i * 240, 315))

    sheet.paste(br, (960, 540))
    out_path = os.path.join(OUT, "gate2_repaired_sheet.png")
    sheet.save(out_path)
    print("WROTE:", out_path)


if __name__ == "__main__":
    main()
