#!/usr/bin/env python3
"""Stitch 6 multi-scene stills into ONE crisp 3x2 Opus Gate 4 Final Proof Contact Sheet."""

from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('/home/nirufu/code/Projects/take-before-sleep/qa/out/phase3')

TILES = [
    ('01_title.png', '01 TITLE  |  02:10 NIGHT HATCH'),
    ('02_hatch_nadia_dim.png', '02 HATCH  |  NIGHT III NADIA (DIM + FINGERTIPS)'),
    ('03_counter_camphor.png', '03 COUNTER  |  NIGHT III MAREN (CAMPHOR + EXTRA COIN)'),
    ('04_inspect_halvorsen.png', '04 INSPECT  |  NIGHT II DR. HALVORSEN (DOCTOR HAND)'),
    ('05_anomaly_rearrangement.png', '05 ANOMALY  |  NIGHT III 03:04 LOST MINUTES (UNCORKED + WET STAMP)'),
    ('06_dawn_packet.png', '06 DAWN  |  NIGHT IV HALVORSEN UNSTAMPED PACKET'),
]

TW, TH = 768, 432
PAD = 18
LABEL_H = 26
COLS, ROWS = 3, 2

W = COLS * TW + (COLS + 1) * PAD
H = ROWS * (TH + LABEL_H) + (ROWS + 1) * PAD

sheet = Image.new('RGB', (W, H), (14, 13, 18))
draw = ImageDraw.Draw(sheet)

for idx, (fname, caption) in enumerate(TILES):
    r, c = divmod(idx, COLS)
    x = PAD + c * (TW + PAD)
    y = PAD + r * (TH + LABEL_H + PAD)
    draw.rectangle([x, y, x + TW, y + LABEL_H], fill=(24, 22, 28))
    draw.text((x + 10, y + 7), caption, fill=(232, 213, 168))
    im = Image.open(OUT / fname).convert('RGB').resize((TW, TH), Image.Resampling.LANCZOS)
    sheet.paste(im, (x, y + LABEL_H))
    draw.rectangle([x, y, x + TW, y + LABEL_H + TH], outline=(76, 68, 56), width=1)

dest = OUT / 'gate4_final_sheet.png'
sheet.save(dest, optimize=True)
print(f'Wrote {dest} ({W}x{H})')
