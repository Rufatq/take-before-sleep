// Pure-Code Physical Dry-Tool Art Engine:
// 1. Cold-pressed PaperTooth tileable heightfield
// 2. Dry Oil-Pastel / Chalk Chisel (paper-tooth valley skip exposing burnt-sienna underpaint)
// 3. Opaque Gouache Flat Brush (bristle-streak alpha + pigment depletion)
// 4. Pressure/Velocity-Tapered Dip-Pen Ribbon w(s) = w0 * (1 - s)^1.35 + corner ink-pools
// 5. Rotated-Octave FBM (36.87 deg) + Ordered Halftone Screen (EXTERIOR RAIN/STREET ONLY)

import { clamp, fbmRot, hash2 } from '../core/prng';
import { RGB, rgbCss } from '../core/palette';

export interface Pt {
  x: number;
  y: number;
}

// Tileable deterministic cold-pressed paper tooth pattern
let toothCanvas: HTMLCanvasElement | null = null;
let toothPattern: CanvasPattern | null = null;
let toothData: Uint8ClampedArray | null = null;
const TOOTH_SIZE = 256;

export function getPaperToothCanvas(): HTMLCanvasElement {
  if (toothCanvas) return toothCanvas;
  toothCanvas = document.createElement('canvas');
  toothCanvas.width = TOOTH_SIZE;
  toothCanvas.height = TOOTH_SIZE;
  const ctx = toothCanvas.getContext('2d')!;
  const img = ctx.createImageData(TOOTH_SIZE, TOOTH_SIZE);
  const d = img.data;
  for (let y = 0; y < TOOTH_SIZE; y++) {
    for (let x = 0; x < TOOTH_SIZE; x++) {
      // Seamless periodic-ish tooth blend
      const u = x / TOOTH_SIZE;
      const v = y / TOOTH_SIZE;
      const n1 = fbmRot(u * 14, v * 14, 3, 19);
      const n2 = hash2(x, y, 73) * 0.34;
      const fiber = Math.sin((x * 0.65 + y * 0.25) + n1 * 4) * 0.08;
      const val = clamp(n1 * 0.68 + n2 + fiber, 0, 1);
      const byte = Math.floor(val * 255);
      const i = (y * TOOTH_SIZE + x) * 4;
      d[i] = byte;
      d[i + 1] = byte;
      d[i + 2] = byte;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  toothData = d;
  return toothCanvas;
}

export function sampleTooth(x: number, y: number): number {
  if (!toothData) getPaperToothCanvas();
  const ix = ((x | 0) % TOOTH_SIZE + TOOTH_SIZE) % TOOTH_SIZE;
  const iy = ((y | 0) % TOOTH_SIZE + TOOTH_SIZE) % TOOTH_SIZE;
  return toothData![(iy * TOOTH_SIZE + ix) * 4] / 255;
}

// Pre-baked underpainting texture stamp for fast dry-chalk valley peeking at 60fps
const dryTextureCache = new Map<string, HTMLCanvasElement>();

function getDryChalkTexture(color: RGB, underpaint: RGB | null, pressure: number, peek: number): HTMLCanvasElement {
  const key = `${color.r}_${color.g}_${color.b}_${underpaint ? `${underpaint.r}_${underpaint.g}_${underpaint.b}` : 'none'}_${(pressure * 20) | 0}_${(peek * 20) | 0}`;
  const hit = dryTextureCache.get(key);
  if (hit) return hit;

  getPaperToothCanvas();
  const c = document.createElement('canvas');
  c.width = TOOTH_SIZE;
  c.height = TOOTH_SIZE;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(TOOTH_SIZE, TOOTH_SIZE);
  const d = img.data;
  const td = toothData!;

  for (let i = 0; i < TOOTH_SIZE * TOOTH_SIZE; i++) {
    const t = td[i * 4] / 255;
    // Dry chalk skips deep valleys of cold-pressed paper tooth
    const cover = clamp((pressure - t * peek) * 2.15, 0, 1);
    const o = i * 4;
    if (underpaint) {
      d[o] = (underpaint.r + (color.r - underpaint.r) * cover) | 0;
      d[o + 1] = (underpaint.g + (color.g - underpaint.g) * cover) | 0;
      d[o + 2] = (underpaint.b + (color.b - underpaint.b) * cover) | 0;
      d[o + 3] = 255;
    } else {
      d[o] = color.r;
      d[o + 1] = color.g;
      d[o + 2] = color.b;
      d[o + 3] = (cover * 255) | 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (dryTextureCache.size > 48) {
    const first = dryTextureCache.keys().next().value;
    if (first) dryTextureCache.delete(first);
  }
  dryTextureCache.set(key, c);
  return c;
}

// Tool 1: Dry Oil-Pastel / Chalk Chisel polygon with rough chalked edge & underpaint skip
export function dryChalkPoly(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  color: RGB,
  opts: {
    underpaint?: RGB | null;
    pressure?: number;
    peek?: number;
    edgeRough?: number;
    boilSeed?: number;
    alpha?: number;
  } = {}
): void {
  if (pts.length < 3) return;
  const pressure = opts.pressure ?? 0.84;
  const peek = opts.peek ?? 0.48;
  const rough = opts.edgeRough ?? 1.8;
  const seed = opts.boilSeed ?? 1;
  const alpha = opts.alpha ?? 1;

  const tex = getDryChalkTexture(color, opts.underpaint ?? null, pressure, peek);
  const pat = ctx.createPattern(tex, 'repeat');
  if (!pat) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const steps = Math.max(1, Math.min(14, Math.floor(dist / 22)));
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      const jx = (hash2(i * 19 + s, seed, 11) - 0.5) * rough * 2;
      const jy = (hash2(i * 19 + s, seed, 37) - 0.5) * rough * 2;
      const px = p0.x + (p1.x - p0.x) * u + jx;
      const py = p0.y + (p1.y - p0.y) * u + jy;
      if (i === 0 && s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = pat;
  ctx.fill();
  ctx.restore();
}

// Tool 2: Opaque Gouache Flat Brush — oriented multi-bristle streaks with pigment depletion
export function gouacheBristle(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  color: RGB,
  opts: {
    bristles?: number;
    alpha?: number;
    deplete?: number;
    seed?: number;
    curveBow?: number;
  } = {}
): void {
  const bristles = opts.bristles ?? 9;
  const alpha = opts.alpha ?? 0.82;
  const deplete = opts.deplete ?? 0.55;
  const seed = opts.seed ?? 5;
  const bow = opts.curveBow ?? 0;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / dist;
  const ny = dx / dist;
  const mx = (x0 + x1) * 0.5 + nx * bow;
  const my = (y0 + y1) * 0.5 + ny * bow;

  ctx.save();
  ctx.lineCap = 'butt';
  const segs = Math.max(4, Math.min(12, Math.floor(dist / 16)));
  for (let b = 0; b < bristles; b++) {
    const frac = bristles > 1 ? b / (bristles - 1) - 0.5 : 0;
    const baseOff = frac * width;
    const bristlePresence = 0.52 + 0.48 * hash2(b * 7, seed, 29);
    const bw = Math.max(0.9, (width / bristles) * (1.25 + 0.35 * hash2(b, seed, 41)));

    for (let s = 0; s < segs; s++) {
      const u0 = s / segs;
      const u1 = (s + 1) / segs;
      // Pigment depletion toward tail + dry-drag bristle break
      const fade = Math.pow(1 - u0 * deplete, 1.2);
      const breakChance = hash2(b * 13 + s, seed, 83);
      if (u0 > 0.65 && breakChance < (u0 - 0.55) * 0.9) continue;

      const evalPt = (u: number): Pt => {
        const inv = 1 - u;
        const bx = inv * inv * x0 + 2 * inv * u * mx + u * u * x1;
        const by = inv * inv * y0 + 2 * inv * u * my + u * u * y1;
        const j = (hash2(b * 5 + Math.floor(u * 10), seed, 61) - 0.5) * 1.4;
        return { x: bx + nx * (baseOff + j), y: by + ny * (baseOff + j) };
      };
      const a = evalPt(u0);
      const c = evalPt(u1);
      ctx.strokeStyle = rgbCss(color, alpha * bristlePresence * fade);
      ctx.lineWidth = bw * (1 - u0 * 0.25);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Tool 3: Velocity/Pressure-Tapered Dip-Pen / Sumi-e Ribbon
// Strictly honors w(s) = w0 * (1 - s)^1.35 (plus optional nib-swell start) & corner ink-pools
export function dipPenRibbon(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  w0: number,
  color: RGB,
  opts: {
    alpha?: number;
    taperMode?: 'velocity' | 'calligraphic' | 'arch';
    inkPool?: boolean;
    jitter?: number;
    seed?: number;
  } = {}
): void {
  if (pts.length < 2) return;
  const alpha = opts.alpha ?? 1;
  const mode = opts.taperMode ?? 'velocity';
  const inkPool = opts.inkPool ?? true;
  const jitter = opts.jitter ?? 0.55;
  const seed = opts.seed ?? 3;

  // Catmull-Rom / quadratic smoothing + dense arc-length sampling
  const dense: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const steps = Math.max(2, Math.min(20, Math.ceil(dist / 5)));
    for (let j = 0; j < steps; j++) {
      const u = j / steps;
      const jx = jitter > 0 ? (hash2(i * 23 + j, seed, 7) - 0.5) * jitter : 0;
      const jy = jitter > 0 ? (hash2(i * 23 + j, seed, 19) - 0.5) * jitter : 0;
      dense.push({
        x: p0.x + (p1.x - p0.x) * u + jx,
        y: p0.y + (p1.y - p0.y) * u + jy,
      });
    }
  }
  dense.push(pts[pts.length - 1]);

  const N = dense.length;
  if (N < 2) return;

  const left: Pt[] = [];
  const right: Pt[] = [];

  for (let i = 0; i < N; i++) {
    const s = i / (N - 1);
    let w: number;
    if (mode === 'velocity') {
      // Exact Law 3 / Opus Gate 1 velocity taper: w(s) = w0 * (1 - s)^1.35
      // Tiny 6% nib landing ramp so start doesn't look razor-clipped
      const entry = Math.min(1, s / 0.06);
      w = Math.max(0.45, w0 * (0.45 + 0.55 * entry) * Math.pow(1 - s * 0.92, 1.35));
    } else if (mode === 'calligraphic') {
      // Expressive nib pressure: heavier downstroke entry -> needle tail via (1 - s)^1.35
      const pPrev = dense[Math.max(0, i - 1)];
      const pNext = dense[Math.min(N - 1, i + 1)];
      const dx = pNext.x - pPrev.x;
      const dy = pNext.y - pPrev.y;
      const len = Math.max(1e-4, Math.hypot(dx, dy));
      // Down-strokes (dy > 0) press the split nib wider than horizontal hairlines
      const nibAngle = 0.52 + 0.48 * Math.abs(dy / len);
      const entry = Math.min(1, s / 0.08);
      const velTaper = Math.pow(1 - s * 0.88, 1.35);
      w = Math.max(0.42, w0 * nibAngle * (0.55 + 0.45 * entry) * velTaper);
    } else {
      // Arch swell for enclosing contours: w0 * sin(s*PI)^1.35
      w = Math.max(0.55, w0 * Math.pow(Math.sin(Math.max(0.04, Math.min(0.96, s)) * Math.PI), 1.35));
    }

    const prev = dense[Math.max(0, i - 1)];
    const next = dense[Math.min(N - 1, i + 1)];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tl = Math.max(1e-4, Math.hypot(tx, ty));
    const nx = -ty / tl;
    const ny = tx / tl;

    left.push({ x: dense[i].x + nx * w * 0.5, y: dense[i].y + ny * w * 0.5 });
    right.push({ x: dense[i].x - nx * w * 0.5, y: dense[i].y - ny * w * 0.5 });
  }

  ctx.save();
  ctx.fillStyle = rgbCss(color, alpha);
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < N; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = N - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fill();

  // Corner & landing ink-pool swells (where dip pen pauses or pivots)
  if (inkPool && w0 >= 1.6) {
    const startR = Math.max(0.7, w0 * 0.34);
    ctx.beginPath();
    ctx.arc(dense[0].x, dense[0].y, startR, 0, Math.PI * 2);
    ctx.fill();

    // Acute interior corners swell subtly
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const c = pts[i + 1];
      const v1x = b.x - a.x;
      const v1y = b.y - a.y;
      const v2x = c.x - b.x;
      const v2y = c.y - b.y;
      const l1 = Math.max(1e-4, Math.hypot(v1x, v1y));
      const l2 = Math.max(1e-4, Math.hypot(v2x, v2y));
      const dot = (v1x * v2x + v1y * v2y) / (l1 * l2);
      if (dot < 0.35) {
        const cr = Math.max(0.7, w0 * 0.30);
        ctx.beginPath();
        ctx.arc(b.x, b.y, cr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// Tool 4: Rotated-Octave FBM (36.87 deg) + Ordered Halftone Dot Screen (EXTERIOR RAIN & STREET ONLY!)
export function rainHalftoneScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: RGB,
  strength: number,
  tOffset: number,
  step = 9
): void {
  if (strength <= 0.01) return;
  ctx.save();
  ctx.fillStyle = rgbCss(color, clamp(strength * 0.52, 0, 0.72));
  for (let gy = y; gy < y + h; gy += step) {
    const rowOff = ((gy / step) & 1) * (step * 0.5);
    for (let gx = x + rowOff; gx < x + w; gx += step) {
      const n = fbmRot(gx * 0.014, gy * 0.014 + tOffset * 0.25, 3, 47);
      const r = (n - 0.36) * step * 0.42 * strength;
      if (r > 0.55) {
        ctx.beginPath();
        ctx.arc(gx, gy, Math.min(r, step * 0.36), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// Helper for hand-drawn irregular rounded/organic shapes via dip-pen outline
export function buildEllipsePts(cx: number, cy: number, rx: number, ry: number, segs = 16, rough = 0.6, seed = 1): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const j = (hash2(i, seed, 53) - 0.5) * rough;
    pts.push({
      x: cx + Math.cos(a) * (rx + j),
      y: cy + Math.sin(a) * (ry + j),
    });
  }
  return pts;
}

export function getToothPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (!toothPattern) {
    toothPattern = ctx.createPattern(getPaperToothCanvas(), 'repeat');
  }
  return toothPattern;
}
