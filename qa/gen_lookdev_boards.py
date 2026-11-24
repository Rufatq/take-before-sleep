#!/usr/bin/env python3
"""Procedural dry-brush lookdev board generator (Phase 0 fallback after Nano Banana 503)."""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = "/home/nirufu/code/Projects/night-hatch/docs/lookdev"
os.makedirs(OUT_DIR, exist_ok=True)


def hash2(x: float, y: float, seed: int = 13) -> float:
    n = math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
    return n - math.floor(n)


def vnoise(x: float, y: float, seed: int = 13) -> float:
    ix, iy = math.floor(x), math.floor(y)
    fx, fy = x - ix, y - iy
    ux, uy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = hash2(ix, iy, seed)
    b = hash2(ix + 1, iy, seed)
    c = hash2(ix, iy + 1, seed)
    d = hash2(ix + 1, iy + 1, seed)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy


def fbm_rot(x: float, y: float, octaves: int = 4, seed: int = 13) -> float:
    # 36.87 deg rotation matrix (0.8, -0.6; 0.6, 0.8)
    val = 0.0
    amp = 0.5
    px, py = x, y
    for i in range(octaves):
        val += amp * vnoise(px, py, seed + i * 17)
        nx = 0.8 * px - 0.6 * py
        ny = 0.6 * px + 0.8 * py
        px, py = nx * 2.03 + 11.7, ny * 2.03 + 5.3
        amp *= 0.5
    return val


def make_paper_tooth(w: int, h: int, seed: int = 7):
    # Cold-pressed coarse paper heightfield (0..1)
    tooth = Image.new("L", (w, h))
    px = tooth.load()
    # Downsample coarse field + fine fiber tooth for speed on 3.8GB laptop
    sw, sh = w // 2, h // 2
    small = Image.new("L", (sw, sh))
    spx = small.load()
    for y in range(sh):
        for x in range(sw):
            n1 = fbm_rot(x * 0.08, y * 0.08, 3, seed)
            n2 = hash2(x, y, seed + 91) * 0.35
            v = max(0.0, min(1.0, n1 * 0.72 + n2))
            spx[x, y] = int(v * 255)
    tooth = small.resize((w, h), Image.BILINEAR)
    return tooth


def dry_chalk_poly(img: Image.Image, tooth: Image.Image, pts, color, pressure=0.78, seed=1):
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.polygon(pts, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    mpx = mask.load()
    tpx = tooth.load()
    ipx = img.load()
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1 = max(0, int(min(xs)) - 2), min(w - 1, int(max(xs)) + 2)
    y0, y1 = max(0, int(min(ys)) - 2), min(h - 1, int(max(ys)) + 2)
    cr, cg, cb = color
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            m = mpx[x, y] / 255.0
            if m < 0.03:
                continue
            t = tpx[x, y] / 255.0
            # Paper-tooth skip: dark/chalk strokes skip valleys so warm underpainting peeks through
            skip = max(0.0, min(1.0, (pressure * m - t * 0.48) * 2.15))
            if skip <= 0.02:
                continue
            or_, og, ob = ipx[x, y]
            ipx[x, y] = (
                int(or_ + (cr - or_) * skip),
                int(og + (cg - og) * skip),
                int(ob + (cb - ob) * skip),
            )


def gouache_streak(img: Image.Image, tooth: Image.Image, x0, y0, x1, y1, width, color, bristles=9, alpha=0.85, seed=1):
    w, h = img.size
    dx, dy = x1 - x0, y1 - y0
    dist = max(1.0, math.hypot(dx, dy))
    nx, ny = -dy / dist, dx / dist
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    for b in range(bristles):
        f = (b / max(1, bristles - 1)) - 0.5
        off = f * width
        b_alpha = int(alpha * 255 * (0.55 + 0.45 * hash2(b, seed, 33)))
        steps = max(8, int(dist / 6))
        pts = []
        for s in range(steps + 1):
            u = s / steps
            jitter = (hash2(b * 3 + s, seed, 51) - 0.5) * 2.0
            px = x0 + dx * u + nx * (off + jitter)
            py = y0 + dy * u + ny * (off + jitter)
            pts.append((px, py))
        bw = max(1, int(width / bristles * 1.45))
        od.line(pts, fill=(color[0], color[1], color[2], b_alpha), width=bw)
    # Modulate with tooth lightly
    ov = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
    img.paste(ov)


def dip_pen_ribbon(draw: ImageDraw.ImageDraw, pts, w0=5.5, color=(11, 10, 14), ink_pool=True):
    """Pressure-tapered Bézier/polyline ribbon w(s) = w0 * sin(s*PI)^1.35 + corner pools."""
    if len(pts) < 2:
        return
    # Sample densely along segments
    dense = []
    segs = len(pts) - 1
    for i in range(segs):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        n = max(4, int(math.hypot(x1 - x0, y1 - y0) / 4))
        for j in range(n):
            u = j / n
            dense.append((x0 + (x1 - x0) * u, y0 + (y1 - y0) * u))
    dense.append(pts[-1])

    left, right = [], []
    N = len(dense)
    for i, (x, y) in enumerate(dense):
        s = i / max(1, N - 1)
        w = max(0.7, w0 * (math.sin(s * math.pi) ** 1.35))
        p_prev = dense[max(0, i - 1)]
        p_next = dense[min(N - 1, i + 1)]
        tx, ty = p_next[0] - p_prev[0], p_next[1] - p_prev[1]
        tl = max(1e-4, math.hypot(tx, ty))
        nx, ny = -ty / tl, tx / tl
        left.append((x + nx * w * 0.5, y + ny * w * 0.5))
        right.append((x - nx * w * 0.5, y - ny * w * 0.5))
    poly = left + list(reversed(right))
    draw.polygon(poly, fill=color)
    if ink_pool:
        for px, py in (pts[0], pts[-1]):
            r = max(1.2, w0 * 0.34)
            draw.ellipse((px - r, py - r, px + r, py + r), fill=color)


# Pure-code geometric hand-stroke glyphs (ZERO FONTS!)
STROKE_GLYPHS = {
    "A": [[(0.1, 1), (0.5, 0), (0.9, 1)], [(0.25, 0.65), (0.78, 0.6)]],
    "B": [[(0.15, 0), (0.15, 1)], [(0.15, 0.05), (0.75, 0.12), (0.72, 0.45), (0.15, 0.5)], [(0.15, 0.5), (0.85, 0.58), (0.78, 0.94), (0.15, 0.98)]],
    "C": [[(0.85, 0.18), (0.5, 0.02), (0.15, 0.25), (0.12, 0.78), (0.52, 0.98), (0.88, 0.82)]],
    "D": [[(0.15, 0), (0.15, 1)], [(0.15, 0.04), (0.72, 0.14), (0.88, 0.52), (0.68, 0.9), (0.15, 0.98)]],
    "E": [[(0.2, 0), (0.15, 1)], [(0.18, 0.06), (0.86, 0.04)], [(0.18, 0.5), (0.72, 0.48)], [(0.15, 0.96), (0.88, 0.94)]],
    "F": [[(0.2, 0), (0.15, 1)], [(0.18, 0.06), (0.86, 0.04)], [(0.18, 0.5), (0.72, 0.48)]],
    "G": [[(0.85, 0.18), (0.48, 0.02), (0.14, 0.28), (0.14, 0.78), (0.52, 0.98), (0.86, 0.8), (0.86, 0.52), (0.52, 0.52)]],
    "H": [[(0.16, 0), (0.14, 1)], [(0.84, 0), (0.82, 1)], [(0.15, 0.5), (0.83, 0.46)]],
    "I": [[(0.5, 0), (0.48, 1)], [(0.25, 0.04), (0.75, 0.04)], [(0.25, 0.96), (0.75, 0.96)]],
    "K": [[(0.16, 0), (0.14, 1)], [(0.84, 0.04), (0.18, 0.52), (0.88, 0.98)]],
    "L": [[(0.18, 0), (0.16, 0.98), (0.86, 0.95)]],
    "M": [[(0.12, 1), (0.16, 0.04), (0.5, 0.62), (0.84, 0.04), (0.88, 1)]],
    "N": [[(0.16, 1), (0.16, 0.04), (0.84, 0.96), (0.84, 0.04)]],
    "O": [[(0.5, 0.02), (0.14, 0.25), (0.14, 0.75), (0.5, 0.98), (0.86, 0.75), (0.86, 0.25), (0.5, 0.02)]],
    "P": [[(0.16, 0), (0.16, 1)], [(0.16, 0.06), (0.82, 0.12), (0.82, 0.48), (0.16, 0.54)]],
    "R": [[(0.16, 0), (0.16, 1)], [(0.16, 0.06), (0.8, 0.12), (0.8, 0.46), (0.16, 0.52)], [(0.42, 0.5), (0.88, 0.98)]],
    "S": [[(0.84, 0.14), (0.46, 0.02), (0.16, 0.2), (0.24, 0.44), (0.78, 0.58), (0.84, 0.84), (0.44, 0.98), (0.12, 0.86)]],
    "T": [[(0.08, 0.06), (0.92, 0.04)], [(0.5, 0.05), (0.48, 1)]],
    "U": [[(0.16, 0.04), (0.18, 0.82), (0.5, 0.98), (0.82, 0.82), (0.84, 0.04)]],
    "V": [[(0.12, 0.04), (0.5, 0.98), (0.88, 0.04)]],
    "W": [[(0.08, 0.04), (0.28, 0.98), (0.5, 0.36), (0.72, 0.98), (0.92, 0.04)]],
    "X": [[(0.14, 0.04), (0.86, 0.96)], [(0.86, 0.04), (0.14, 0.96)]],
    "Y": [[(0.14, 0.04), (0.5, 0.5), (0.86, 0.04)], [(0.5, 0.5), (0.48, 1)]],
    "Z": [[(0.14, 0.06), (0.86, 0.06), (0.14, 0.96), (0.88, 0.94)]],
    "0": [[(0.5, 0.04), (0.18, 0.28), (0.18, 0.74), (0.5, 0.96), (0.82, 0.74), (0.82, 0.28), (0.5, 0.04)], [(0.26, 0.76), (0.74, 0.24)]],
    "1": [[(0.28, 0.2), (0.52, 0.04), (0.5, 0.96)], [(0.24, 0.96), (0.78, 0.96)]],
    "2": [[(0.18, 0.22), (0.5, 0.04), (0.82, 0.22), (0.74, 0.48), (0.16, 0.96), (0.86, 0.94)]],
    "3": [[(0.18, 0.14), (0.52, 0.04), (0.8, 0.22), (0.48, 0.48), (0.84, 0.72), (0.5, 0.96), (0.16, 0.86)]],
    "4": [[(0.7, 0.96), (0.7, 0.04), (0.14, 0.66), (0.88, 0.64)]],
    "5": [[(0.82, 0.06), (0.2, 0.08), (0.18, 0.46), (0.64, 0.44), (0.84, 0.68), (0.54, 0.96), (0.16, 0.88)]],
    "6": [[(0.76, 0.1), (0.34, 0.06), (0.16, 0.56), (0.24, 0.88), (0.62, 0.96), (0.84, 0.72), (0.66, 0.46), (0.2, 0.54)]],
    "7": [[(0.14, 0.08), (0.86, 0.06), (0.38, 0.96)]],
    "8": [[(0.5, 0.48), (0.2, 0.24), (0.5, 0.04), (0.8, 0.24), (0.5, 0.48), (0.16, 0.74), (0.5, 0.96), (0.84, 0.74), (0.5, 0.48)]],
    "9": [[(0.82, 0.44), (0.46, 0.52), (0.18, 0.3), (0.48, 0.04), (0.82, 0.24), (0.78, 0.86), (0.4, 0.96)]],
    ":": [[(0.48, 0.26), (0.52, 0.32)], [(0.48, 0.72), (0.52, 0.78)]],
    "-": [[(0.18, 0.52), (0.82, 0.5)]],
    "/": [[(0.82, 0.06), (0.18, 0.94)]],
    ".": [[(0.45, 0.88), (0.55, 0.94)]],
    "#": [[(0.32, 0.08), (0.26, 0.92)], [(0.7, 0.08), (0.64, 0.92)], [(0.12, 0.36), (0.88, 0.34)], [(0.1, 0.66), (0.86, 0.64)]],
}


def draw_hand_text(draw: ImageDraw.ImageDraw, text: str, x: float, y: float, size: float, color, stroke_w=2.4, slant=0.06, seed=1):
    cx = x
    for idx, ch in enumerate(text.upper()):
        if ch == " ":
            cx += size * 0.45
            continue
        strokes = STROKE_GLYPHS.get(ch)
        if not strokes:
            cx += size * 0.5
            continue
        for s_i, st in enumerate(strokes):
            pts = []
            for p_i, (gx, gy) in enumerate(st):
                jx = (hash2(idx * 13 + s_i, p_i, seed) - 0.5) * size * 0.05
                jy = (hash2(idx * 7 + p_i, s_i, seed + 5) - 0.5) * size * 0.05
                px = cx + gx * size * 0.66 - gy * size * slant + jx
                py = y + gy * size + jy
                pts.append((px, py))
            dip_pen_ribbon(draw, pts, w0=stroke_w, color=color, ink_pool=(size > 20))
        cx += size * 0.74


def build_board_1(tooth):
    """LOOKDEV 01: Night Hatch Wallpaper Composition (960x540)."""
    w, h = 960, 540
    # Warm burnt-sienna underpainting base (#5a2e1a) so paper tooth breathes through dark washes
    img = Image.new("RGB", (w, h), (90, 46, 26))
    # Cold rain street outside glass (center-left to center-right)
    dry_chalk_poly(img, tooth, [(0, 0), (w, 0), (w, h), (0, h)], (12, 16, 24), pressure=0.92)
    dry_chalk_poly(img, tooth, [(140, 40), (800, 40), (800, 350), (140, 350)], (18, 28, 42), pressure=0.82)
    # Wet street perspective glow + distant cyan-emerald pharmacy cross bleed
    dry_chalk_poly(img, tooth, [(145, 225), (795, 225), (795, 345), (145, 345)], (25, 39, 54), pressure=0.72)
    # Pharmacy cross neon bleed in rain fog (muted verdigris-emerald, never loud cyberpunk neon)
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse((190, 75, 330, 215), fill=(46, 138, 122, 68))
    od.rectangle((244, 108, 276, 182), fill=(88, 194, 168, 115))
    od.rectangle((222, 130, 298, 160), fill=(88, 194, 168, 115))
    # Sodium streetlamp pool far right
    od.ellipse((595, 70, 735, 200), fill=(232, 152, 66, 75))
    od.ellipse((645, 110, 685, 150), fill=(248, 208, 136, 145))
    ov = ov.filter(ImageFilter.GaussianBlur(14))
    img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")

    # Lone rain-soaked silhouette outside the hatch (head + shoulders + hand near sill)
    dry_chalk_poly(img, tooth, [(360, 348), (382, 228), (432, 196), (506, 198), (548, 242), (566, 348)], (13, 15, 21), pressure=0.94)
    dry_chalk_poly(img, tooth, [(426, 198), (434, 140), (468, 120), (504, 142), (508, 196)], (15, 18, 25), pressure=0.92)
    # Grazing rim highlight on wet shoulder & collar from sodium streetlamp
    gouache_streak(img, tooth, 496, 136, 546, 232, 10, (196, 146, 86), bristles=7, alpha=0.68, seed=4)
    gouache_streak(img, tooth, 386, 226, 434, 198, 8, (86, 152, 142), bristles=6, alpha=0.55, seed=8)
    # Pale cold fingers near outer steel sill
    dry_chalk_poly(img, tooth, [(402, 338), (428, 326), (452, 336), (446, 348), (402, 348)], (186, 166, 146), pressure=0.76)

    # Diagonal rain streaks & condensation gouache smears across glass
    for i in range(42):
        rx = 155 + hash2(i, 1, 9) * 630
        ry = 45 + hash2(i, 2, 9) * 260
        rl = 18 + hash2(i, 3, 9) * 44
        gouache_streak(img, tooth, rx, ry, rx - rl * 0.25, ry + rl, 2.5, (148, 174, 194), bristles=3, alpha=0.28, seed=i)

    # Heavy interior dark oak frame around night hatch (4% velvet dark with warm underpainting skip)
    dry_chalk_poly(img, tooth, [(0, 0), (148, 0), (148, 540), (0, 540)], (14, 11, 13), pressure=0.86)
    dry_chalk_poly(img, tooth, [(792, 0), (960, 0), (960, 540), (792, 540)], (12, 10, 13), pressure=0.88)
    dry_chalk_poly(img, tooth, [(0, 0), (960, 0), (960, 48), (0, 48)], (11, 10, 13), pressure=0.90)
    # Counter slab & walnut sill
    dry_chalk_poly(img, tooth, [(0, 348), (960, 348), (960, 540), (0, 540)], (22, 16, 14), pressure=0.84)

    # Warm amber pool from brass desk lamp (left foreground) reaching toward glass & steel tray!
    lamp_ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lamp_ov)
    ld.polygon([(115, 290), (540, 360), (620, 540), (70, 540)], fill=(240, 164, 70, 112))
    ld.ellipse((140, 355, 550, 520), fill=(246, 184, 96, 85))
    # Subtle warm outward blade hitting wet sill (Anchor A optical metaphor)
    ld.polygon([(270, 348), (580, 348), (640, 305), (340, 315)], fill=(238, 158, 66, 52))
    lamp_ov = lamp_ov.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img.convert("RGBA"), lamp_ov).convert("RGB")

    # Recessed stainless-steel pass-through tray (Durchreiche)
    dry_chalk_poly(img, tooth, [(320, 354), (628, 354), (656, 444), (294, 444)], (92, 100, 108), pressure=0.84)
    gouache_streak(img, tooth, 314, 362, 622, 362, 7, (226, 206, 172), bristles=8, alpha=0.72, seed=12)
    # Bone-cream prescription paper sitting inside tray
    dry_chalk_poly(img, tooth, [(396, 376), (518, 372), (530, 424), (388, 428)], (235, 224, 204), pressure=0.92)

    # Brass hooded desk lamp left side
    dry_chalk_poly(img, tooth, [(54, 495), (126, 495), (118, 466), (62, 466)], (92, 60, 28), pressure=0.90)
    dry_chalk_poly(img, tooth, [(84, 260), (168, 278), (156, 316), (68, 296)], (188, 132, 54), pressure=0.92)
    gouache_streak(img, tooth, 92, 270, 160, 284, 7, (250, 222, 156), bristles=5, alpha=0.82, seed=15)

    # Amber apothecary bottles on right counter ledge
    for bx, bh, bw in [(694, 112, 44), (754, 92, 38), (806, 124, 46), (866, 98, 40)]:
        by = 468
        dry_chalk_poly(img, tooth, [(bx, by), (bx + bw, by), (bx + bw, by - bh), (bx, by - bh)], (96, 44, 18), pressure=0.88)
        dry_chalk_poly(img, tooth, [(bx + bw * 0.25, by - bh), (bx + bw * 0.75, by - bh), (bx + bw * 0.75, by - bh - 18), (bx + bw * 0.25, by - bh - 18)], (72, 32, 14), pressure=0.90)
        # Cream hand-label
        dry_chalk_poly(img, tooth, [(bx + 5, by - bh * 0.72), (bx + bw - 5, by - bh * 0.72), (bx + bw - 5, by - bh * 0.28), (bx + 5, by - bh * 0.28)], (232, 220, 198), pressure=0.88)
        gouache_streak(img, tooth, bx + 4, by - bh + 8, bx + 6, by - 8, 4, (244, 182, 92), bristles=3, alpha=0.72, seed=bx)

    # Circular brass intercom grille inset into glass (right of center)
    d = ImageDraw.Draw(img)
    cx, cy, r = 684, 232, 38
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(46, 36, 24), outline=(176, 132, 66), width=3)
    for ring in (12, 24):
        for a in range(0, 360, 45 if ring == 12 else 30):
            px = cx + math.cos(math.radians(a)) * ring
            py = cy + math.sin(math.radians(a)) * ring
            d.ellipse((px - 2.5, py - 2.5, px + 2.5, py + 2.5), fill=(11, 10, 14))

    # Dip-pen architectural contours
    dip_pen_ribbon(d, [(148, 48), (792, 48), (792, 348), (148, 348), (148, 48)], w0=5.2)
    dip_pen_ribbon(d, [(320, 354), (294, 444), (656, 444), (628, 354)], w0=4.5)
    dip_pen_ribbon(d, [(396, 376), (518, 372), (530, 424), (388, 428), (396, 376)], w0=2.6)
    # Hand-scrawled squiggle lines on prescription
    dip_pen_ribbon(d, [(406, 390), (434, 388), (456, 393), (492, 387)], w0=2.2, color=(34, 28, 26), ink_pool=False)
    dip_pen_ribbon(d, [(404, 408), (448, 405), (484, 410)], w0=2.0, color=(34, 28, 26), ink_pool=False)
    # Vermilion stamp mark on corner of counter
    d.ellipse((202, 434, 250, 476), fill=(184, 59, 40))
    dip_pen_ribbon(d, [(188, 446), (264, 444), (258, 482), (192, 480), (188, 446)], w0=3.4)

    draw_hand_text(d, "01 HATCH COMPOSITE", 22, 14, 18, (235, 224, 204), stroke_w=2.3, seed=1)
    img.save(os.path.join(OUT_DIR, "lookdev_01_hatch_composite.png"))
    return img


def build_board_2(tooth):
    """LOOKDEV 02: Pure-Code Dry-Tool Kit & Counter Dispensing Study (960x540)."""
    w, h = 960, 540
    img = Image.new("RGB", (w, h), (96, 52, 28))
    dry_chalk_poly(img, tooth, [(0, 0), (w, 0), (w, h), (0, h)], (24, 18, 16), pressure=0.88)

    # Top strip: 4 physical tool swatch cards on bone-cream paper
    d = ImageDraw.Draw(img)
    # 1. Dry Oil-Pastel / Chalk Chisel swatch
    dry_chalk_poly(img, tooth, [(28, 52), (240, 52), (236, 174), (24, 170)], (146, 82, 38), pressure=0.92)
    dry_chalk_poly(img, tooth, [(42, 72), (222, 64), (218, 158), (38, 154)], (14, 16, 22), pressure=0.72)
    # 2. Opaque Gouache Flat Brush swatch
    dry_chalk_poly(img, tooth, [(258, 52), (470, 52), (466, 174), (254, 170)], (22, 32, 44), pressure=0.90)
    gouache_streak(img, tooth, 272, 92, 452, 82, 22, (238, 172, 82), bristles=11, alpha=0.86, seed=21)
    gouache_streak(img, tooth, 276, 134, 448, 128, 16, (108, 172, 156), bristles=9, alpha=0.78, seed=22)
    # 3. Dip-Pen Tapered Ribbon swatch
    dry_chalk_poly(img, tooth, [(488, 52), (700, 52), (696, 174), (484, 170)], (235, 224, 204), pressure=0.94)
    d = ImageDraw.Draw(img)
    dip_pen_ribbon(d, [(506, 146), (558, 76), (620, 142), (682, 78)], w0=8.5, color=(11, 10, 14))
    dip_pen_ribbon(d, [(514, 156), (594, 124), (674, 152)], w0=4.2, color=(184, 59, 40))
    # 4. Rotated FBM + Ordered Halftone Screen swatch
    dry_chalk_poly(img, tooth, [(718, 52), (932, 52), (928, 174), (714, 170)], (20, 28, 40), pressure=0.92)
    d = ImageDraw.Draw(img)
    for gy in range(60, 166, 7):
        for gx in range(726, 922, 7):
            v = fbm_rot(gx * 0.025, gy * 0.025, 3, 44)
            r = v * 2.8
            if r > 0.7:
                d.ellipse((gx - r, gy - r, gx + r, gy + r), fill=(214, 186, 142))

    # Bottom half: Close-up Counter Dispensing Surface (grooved slate pill channel + amber bottle + paper fold + vermilion stamp)
    # Warm raking lamp gradient from upper-left
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse((40, 195, 640, 560), fill=(242, 168, 74, 78))
    ov = ov.filter(ImageFilter.GaussianBlur(24))
    img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")

    # Grooved dark slate pill counting channel
    dry_chalk_poly(img, tooth, [(110, 268), (520, 256), (546, 378), (84, 392)], (34, 42, 52), pressure=0.90)
    gouache_streak(img, tooth, 114, 276, 514, 264, 5, (148, 158, 168), bristles=5, alpha=0.65, seed=31)
    # Tumbling chalk-white & ochre tablets with warm rim highlights
    d = ImageDraw.Draw(img)
    pills = [(172, 314, 13, 8), (218, 336, 14, 8), (262, 304, 12, 8), (310, 326, 13, 8), (356, 344, 13, 8), (410, 312, 14, 8), (456, 334, 13, 8)]
    for px, py, rx, ry in pills:
        d.ellipse((px - rx + 4, py - ry + 6, px + rx + 4, py + ry + 6), fill=(11, 10, 14))
        d.ellipse((px - rx, py - ry, px + rx, py + ry), fill=(236, 226, 206), outline=(14, 12, 15), width=2)
        d.arc((px - rx + 2, py - ry + 1, px + rx - 2, py + ry - 1), 190, 340, fill=(252, 232, 178), width=2)

    # Waxed folded paper prescription wrap + vermilion rubber stamp seal
    dry_chalk_poly(img, tooth, [(592, 250), (886, 240), (904, 456), (576, 466)], (236, 224, 202), pressure=0.94)
    d = ImageDraw.Draw(img)
    dip_pen_ribbon(d, [(592, 250), (886, 240), (904, 456), (576, 466), (592, 250)], w0=4.2)
    dip_pen_ribbon(d, [(592, 250), (740, 340), (886, 240)], w0=2.8, color=(158, 142, 118))
    # Vermilion seal
    d.ellipse((748, 354, 842, 434), outline=(184, 59, 40), width=5)
    d.ellipse((758, 364, 832, 424), outline=(184, 59, 40), width=2)
    draw_hand_text(d, "03:14", 764, 384, 18, (184, 59, 40), stroke_w=2.4, seed=9)
    draw_hand_text(d, "2X VALERIAN", 614, 278, 17, (24, 20, 22), stroke_w=2.2, seed=4)
    draw_hand_text(d, "BEFORE SLEEP", 614, 310, 15, (72, 58, 48), stroke_w=1.8, seed=5)

    # Tool captions (100% pure code hand-drawn glyphs)
    draw_hand_text(d, "02 DRY-TOOL KIT + DISPENSE", 24, 14, 18, (235, 224, 204), stroke_w=2.3, seed=2)
    draw_hand_text(d, "DRY CHALK", 38, 184, 14, (235, 224, 204), stroke_w=1.9, seed=3)
    draw_hand_text(d, "GOUACHE", 268, 184, 14, (235, 224, 204), stroke_w=1.9, seed=4)
    draw_hand_text(d, "DIP-PEN", 498, 184, 14, (235, 224, 204), stroke_w=1.9, seed=5)
    draw_hand_text(d, "FBM HALFTONE", 726, 184, 14, (235, 224, 204), stroke_w=1.9, seed=6)
    img.save(os.path.join(OUT_DIR, "lookdev_02_counter_dispense.png"))
    return img


def build_board_3(tooth):
    """LOOKDEV 03: 3-Value Silhouette Squint + Glass Reflection Anomaly + Shattered-Ink UI Strata."""
    w, h = 960, 540
    img = Image.new("RGB", (w, h), (11, 10, 14))
    d = ImageDraw.Draw(img)

    # LEFT HALF (0..480): 3-Value Silhouette Squint Check (4% velvet dark, 50% midtone, 92% focal light)
    V_DARK = (11, 10, 14)
    V_MID = (116, 126, 136)
    V_LIGHT = (238, 224, 192)
    d.rectangle((0, 0, 476, 540), fill=V_DARK)
    # Hatch glass midtone plane
    d.rectangle((66, 56, 412, 336), fill=V_MID)
    # Stranger silhouette in velvet dark
    d.polygon([(176, 336), (192, 224), (242, 198), (296, 226), (312, 336)], fill=V_DARK)
    d.ellipse((212, 134, 272, 202), fill=V_DARK)
    # 92% focal amber-light pool on counter + prescription slip + lamp shade
    d.polygon([(46, 266), (112, 282), (102, 314), (36, 298)], fill=V_LIGHT)
    d.polygon([(156, 354), (336, 354), (354, 434), (138, 434)], fill=V_MID)
    d.polygon([(194, 370), (296, 366), (304, 416), (186, 420)], fill=V_LIGHT)
    # Right bottles silhouette
    for bx, bh in [(374, 88), (410, 74), (442, 98)]:
        d.rectangle((bx, 466 - bh, bx + 26, 466), fill=V_MID)
    draw_hand_text(d, "3-VALUE SQUINT", 22, 16, 18, V_LIGHT, stroke_w=2.2, seed=7)

    # RIGHT HALF (484..960): Shattered-Ink 5-Strata UI Collage + Reversed Bottles Reflection Study
    dry_chalk_poly(img, tooth, [(484, 0), (960, 0), (960, 540), (484, 540)], (18, 26, 38), pressure=0.92)
    # Subtle glass reflection of back shelves where ALL amber bottles face backward (blank glass backs, warm glow)
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.rectangle((520, 170, 920, 182), fill=(192, 146, 88, 70))
    for i, bx in enumerate(range(548, 880, 52)):
        bh = 62 + (i % 3) * 14
        od.rectangle((bx, 170 - bh, bx + 34, 170), fill=(168, 92, 42, 74), outline=(232, 174, 96, 95), width=2)
        # Warmth shimmer over latch
    od.ellipse((670, 210, 780, 265), fill=(242, 144, 62, 58))
    ov = ov.filter(ImageFilter.GaussianBlur(3))
    img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
    d = ImageDraw.Draw(img)

    # Shattered-Ink 5-Strata UI Collage (bottom-right)
    # Stratum 1: Torn diagonal black ink shard
    dry_chalk_poly(img, tooth, [(504, 336), (938, 294), (952, 488), (492, 514)], (11, 10, 14), pressure=0.96)
    # Stratum 2: Deckle bone-cream prescription strip tilted sharply
    dry_chalk_poly(img, tooth, [(526, 354), (912, 326), (918, 434), (520, 456)], (235, 224, 204), pressure=0.94)
    # Stratum 3: Vermilion slashed stamp accent
    dry_chalk_poly(img, tooth, [(828, 314), (934, 304), (924, 366), (822, 374)], (184, 59, 40), pressure=0.92)
    d = ImageDraw.Draw(img)
    dip_pen_ribbon(d, [(504, 336), (938, 294)], w0=5.5, color=(235, 224, 204))
    dip_pen_ribbon(d, [(520, 456), (918, 434)], w0=4.5, color=(11, 10, 14))
    draw_hand_text(d, "REVERSED BOTTLES", 510, 16, 18, (235, 224, 204), stroke_w=2.2, seed=8)
    draw_hand_text(d, "INTERCOM: ON", 544, 364, 20, (11, 10, 14), stroke_w=2.6, seed=9)
    draw_hand_text(d, "ALL LABELS FACE WALL", 544, 404, 15, (72, 48, 38), stroke_w=1.9, seed=10)
    draw_hand_text(d, "WARM", 838, 328, 17, (235, 224, 204), stroke_w=2.2, seed=11)

    img.save(os.path.join(OUT_DIR, "lookdev_03_strata_anomaly.png"))
    return img


def build_palette_card(tooth):
    """Board 4: Locked Palette & Value-Ramp Calibration Card (960x540)."""
    w, h = 960, 540
    img = Image.new("RGB", (w, h), (16, 15, 19))
    d = ImageDraw.Draw(img)
    swatches = [
        ("VELVET DARK", "#0B0A0E", (11, 10, 14)),
        ("RAIN INDIGO", "#131F2E", (19, 31, 46)),
        ("UNDERPAINT", "#5A2E1A", (90, 46, 26)),
        ("STEEL TRAY", "#5C646C", (92, 100, 108)),
        ("VERDIGRIS", "#3E8C7C", (62, 140, 124)),
        ("SODIUM LAMP", "#EEA646", (238, 166, 70)),
        ("BONE PAPER", "#EBE0CC", (235, 224, 204)),
        ("WAX STAMP", "#B83B28", (184, 59, 40)),
    ]
    draw_hand_text(d, "04 LOCKED COLOR KEY + VALUE FLOOR", 26, 20, 18, (235, 224, 204), stroke_w=2.3, seed=12)
    for i, (name, hx, rgb) in enumerate(swatches):
        col = i % 4
        row = i // 4
        x0 = 36 + col * 228
        y0 = 84 + row * 214
        dry_chalk_poly(img, tooth, [(x0, y0), (x0 + 202, y0), (x0 + 202, y0 + 132), (x0, y0 + 132)], rgb, pressure=0.95)
        d = ImageDraw.Draw(img)
        dip_pen_ribbon(d, [(x0, y0), (x0 + 202, y0), (x0 + 202, y0 + 132), (x0, y0 + 132), (x0, y0)], w0=3.2, color=(235, 224, 204))
        draw_hand_text(d, name, x0 + 4, y0 + 144, 15, (235, 224, 204), stroke_w=2.0, seed=20 + i)
        draw_hand_text(d, hx, x0 + 4, y0 + 168, 13, (176, 168, 154), stroke_w=1.7, seed=40 + i)
    return img


def main():
    tooth = make_paper_tooth(960, 540, seed=17)
    b1 = build_board_1(tooth)
    b2 = build_board_2(tooth)
    b3 = build_board_3(tooth)
    b4 = build_palette_card(tooth)

    sheet = Image.new("RGB", (1920, 1080), (11, 10, 14))
    sheet.paste(b1, (0, 0))
    sheet.paste(b2, (960, 0))
    sheet.paste(b3, (0, 540))
    sheet.paste(b4, (960, 540))
    out = os.path.join(OUT_DIR, "gate1_contact_sheet.png")
    sheet.save(out)
    print("WROTE:", out)


if __name__ == "__main__":
    main()
